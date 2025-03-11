<template>
  <a-flex class="h-full" vertical>
    <a-space>
      <a-button v-permission="'humiture_display_open'" type="primary" @click="onOneTouch">
        一键开启
      </a-button>
      <a-button
        v-permission="'humiture_display_close'"
        type="primary"
        :loading="closeLoading"
        @click="onOneClose"
      >
        一键关闭
      </a-button>
      <a-button v-permission="'humiture_display_timer'" type="primary" @click="setCreateTimerVisible(true)">
        定时设置
      </a-button>
      <a-button v-permission="'humiture_display_res'" type="primary" @click="setCreateResVisible(true)">
        预约温湿度
      </a-button>
    </a-space>

    <a-row :gutter="16" class="mt-4 flex-1">
      <a-col span="12">
        <TempHumInfo
          type="tem"
          :data-source="dataSource"
          :iot-data="iotData"
          :status-data="statusData"
        />
      </a-col>
      <a-col span="12">
        <TempHumInfo
          type="hum"
          :data-source="dataSource"
          :iot-data="iotData"
          :status-data="statusData"
        />
      </a-col>
    </a-row>

    <!-- 一键开启 -->
    <OneTouch v-model:open="oneTouchVisible" :data-source="editDataSource" @on-save="onOneTouchCallback" />

    <!-- 风险验证 -->
    <RiskVerification ref="RiskVerificationRef" content="出于风险考虑，请将滑块移动到最右侧控制设备关闭" />

    <!-- 预约温湿度 -->
    <CreateForm v-model:open="createResVisible" :default-lab-id="dataSource.id" />

    <!-- 新增定时设置 -->
    <CreateTimerForm v-model:open="createTimerVisible" :default-lab-id="dataSource.id" />
  </a-flex>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { message } from 'ant-design-vue'
import TempHumInfo from './TempHumInfo.vue'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { IotControllType, IotStatusType } from '~/views/common/humiture/display'
import { humitureControll } from '~/views/common/humiture/display/api.ts'
import OneTouch from '~/views/common/humiture/display/components/OneTouch.vue'
import RiskVerification from '~/components/RiskVerification.vue'
import CreateForm from '~/views/common/humiture/res/components/CreateForm.vue'
import { IotDataRequest } from '~/views/common/humiture/display/iotDataRequest.ts'
import CreateTimerForm from '~/views/common/humiture/timer/components/CreateForm.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { getIots } from '~/views/common/humiture/displayDetails/api.ts'

const props = defineProps({
  dataSource: {
    type: Object as PropType<ViewLaboratoryDataEntity>,
    default: () => {},
  },
  statusData: {
    type: Object,
    default: () => {},
  },
})

// const refreshDetail = inject('refreshDetail')

const oneTouchVisible = ref(false)

const [createResVisible, setCreateResVisible] = useStateHooks(false)

const [createTimerVisible, setCreateTimerVisible] = useStateHooks(false)

const editDataSource = ref({})

const RiskVerificationRef = ref()

const dataSource = computed(() => (props.dataSource || {}))

const statusData = computed(() => props.statusData || {})

const iotDataRequest = new IotDataRequest()

const iotData = ref([])

const closeLoading = ref(false)

watch(() => dataSource, (data) => {
  if (data.value && data.value.id) {
    getDeviceData()
  }
}, { immediate: true, deep: true })

// 获取设备
async function getDeviceData() {
  if (iotData.value.length > 0) {
    return
  }

  const res = await getIots(dataSource.value.labIotEq.iotEqId)
  const devices = res.data.filter(i => i.type === '温湿度').map(i => ({
    id: i.to.id,
    key: i.toName,
    tem: null,
    hum: null,
  }))
  iotData.value = devices

  iotDataRequest.listenDataUpdate(devices.map((i, index) => ({
    entityType: 'DEVICE',
    entityId: i.id,
    cmdId: index,
  })), (res) => {
    const data = res.data

    if (data.temperature) {
      iotData.value[res.subscriptionId].tem = data.temperature[0][1]
    }

    if (data.humidity) {
      iotData.value[res.subscriptionId].hum = data.humidity[0][1]
    }
  })
}

function onOneTouch() {
  editDataSource.value = { ...dataSource.value }
  oneTouchVisible.value = true
}

function onOneTouchCallback(res: any) {
  if (res.code !== 20010 && res.data > 0) {
    statusData.value.temIotStatus = true
    statusData.value.humIotStatus = true
  }
}

function onOneClose() {
  RiskVerificationRef.value.open(async () => {
    closeLoading.value = true
    const res = await humitureControll(dataSource.value.id, IotControllType.所有, IotStatusType.关).finally(() => {
      closeLoading.value = false
    })
    // refreshDetail()

    if (res.code !== 20010 && res.data > 0) {
      message.success('保存成功！')
      statusData.value.temIotStatus = false
      statusData.value.humIotStatus = false
    }
    else {
      message.warn('操作失败！')
    }
  })
}
</script>
