<template>
  <a-card class="h-full" :body-style="{ height: '100%' }">
    <a-flex class="h-full" vertical>
      <a-flex align="center" justify="space-between">
        <div>
          <p>{{ typeName }}</p>
          <p class="mt-4">
            {{ standardInfo }}
          </p>
        </div>
        <a-space>
          <a-button
            v-if="showOpenBtn"
            v-permission="'humiture_display_open'"
            type="primary"
            :loading="openLoading"
            @click="onOpen"
          >
            开启
          </a-button>
          <a-button
            v-if="!showOpenBtn"
            v-permission="'humiture_display_close'"
            :loading="closeLoading"
            @click="onClose"
          >
            关闭
          </a-button>
        </a-space>
      </a-flex>
      <a-flex align="center" justify="space-between" class="mt-4">
        <div>
          当前{{ typeName }}：{{ val }}{{ unit }}
          <a-tag v-if="status === '超标'" color="#f50" class="ml-2">
            {{ status }}
          </a-tag>
        </div>
        <a-space v-if="!showOpenBtn" v-permission="'humiture_display_setting'">
          <a-input-number v-model:value="settingFormState.min" :placeholder="`最小${typeName}`" />
          ~
          <a-input-number v-model:value="settingFormState.max" :placeholder="`最大${typeName}`" />
          <a-button type="primary" :loading="settingLoading" @click="onSetting">
            设置
          </a-button>
        </a-space>
      </a-flex>

      <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
        <a-table
          row-key="id"
          bordered
          :columns="columns"
          :data-source="iotData"
          :scroll="{ y: tableHeight }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'value'">
              <span v-if="typeName === '温度'">{{ record.tem }}</span>
              <span v-else>{{ record.hum }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-flex>

    <!-- 风险验证 -->
    <RiskVerification ref="RiskVerificationRef" content="出于风险考虑，请将滑块移动到最右侧控制设备关闭" />
  </a-card>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { message } from 'ant-design-vue'
import { useTableHeight } from '~/hooks/useTableHeight'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { IotControllType, IotStatusType } from '~/views/common/humiture/display'
import { humitureControll } from '~/views/common/humiture/display/api.ts'
import type { HumitureSetParams } from '~/views/common/humiture/displayDetails/api.ts'
import { humitureSet } from '~/views/common/humiture/displayDetails/api.ts'
import RiskVerification from '~/components/RiskVerification.vue'

const props = defineProps({
  type: {
    type: String as PropType<'tem' | 'hum'>,
    default: '',
  },
  dataSource: {
    type: Object as PropType<ViewLaboratoryDataEntity>,
    default: () => {},
  },
  statusData: {
    type: Object,
    default: () => {},
  },
  iotData: {
    type: Array as PropType<any>,
    default: () => {},
  },
})

// const refreshDetail = inject('refreshDetail')

const settingFormState = ref({
  min: null,
  max: null,
})

const settingLoading = ref(false)

const openLoading = ref(false)

const closeLoading = ref(false)

const { tableHeight, tableBoxRef } = useTableHeight()

const dataSource = computed(() => props.dataSource)

const statusData = computed(() => props.statusData)

const iotData = computed(() => props.iotData)

const typeName = computed(() => props.type === 'tem' ? '温度' : '湿度')

const unit = computed(() => props.type === 'tem' ? '℃' : '%RH')

const RiskVerificationRef = ref()

const standardInfo = computed(() => {
  if (props.type === 'tem') {
    return `标准温度区间：${dataSource.value?.minTemperature || '-'}℃ ~ ${dataSource.value?.maxTemperature || '-'}℃`
  }
  else {
    return `标准湿度区间：${dataSource.value?.minHumidity || '-'}%RH ~ ${dataSource.value?.maxHumidity || '-'}%RH`
  }
})

const showOpenBtn = computed(() => {
  if (statusData.value) {
    if (props.type === 'tem') {
      return !statusData.value.temIotStatus
    }

    if (props.type === 'hum') {
      return !statusData.value.humIotStatus
    }
  }

  return false
})

const val = computed(() => {
  const data = (iotData.value || []).filter(i => isDefined(i[props.type]))
  const total: number = data.reduce((sum, item) => (sum + Number.parseFloat(item[props.type])), 0)

  if (!data.length) {
    return '-'
  }

  return total / data.length
})

const status = computed(() => {
  if (val.value) {
    if (props.type === 'tem') {
      if (val.value >= dataSource.value?.minTemperature && val.value <= dataSource.value?.maxTemperature) {
        return '达标'
      }
      else {
        return '超标'
      }
    }
    else {
      if (val.value >= dataSource.value?.minHumidity && val.value <= dataSource.value?.maxHumidity) {
        return '达标'
      }
      else {
        return '超标'
      }
    }
  }
  else {
    return ''
  }
})

const columns: ColumnType[] = [
  { title: '设备名称', dataIndex: 'key', width: '40%' },
  { title: `${typeName.value === '温度' ? '温度数值(℃)' : '湿度数值(%RH)'}`, dataIndex: 'value', width: '30%' },
]

async function onOpen() {
  openLoading.value = true
  const res = await humitureControll(dataSource.value.id, props.type === 'tem' ? IotControllType.温度 : IotControllType.湿度, IotStatusType.开).finally(() => {
    openLoading.value = false
  })
  // refreshDetail()

  if (res.code !== 20010 && res.data > 0) {
    message.success('操作成功！')

    if (props.type === 'tem') {
      statusData.value.temIotStatus = true
    }
    else {
      statusData.value.humIotStatus = true
    }
  }
  else {
    message.warn('操作失败！')
  }
}

async function onClose() {
  RiskVerificationRef.value.open(async () => {
    closeLoading.value = true
    const res = await humitureControll(dataSource.value.id, props.type === 'tem' ? IotControllType.温度 : IotControllType.湿度, IotStatusType.关).finally(() => {
      closeLoading.value = false
    })
    // refreshDetail()
    if (res.code !== 20010 && res.data > 0) {
      message.success('操作成功！')

      if (props.type === 'tem') {
        statusData.value.temIotStatus = false
      }
      else {
        statusData.value.humIotStatus = false
      }
    }
    else {
      message.warn('操作失败！')
    }
  })
}

async function onSetting() {
  if (settingFormState.value.min === null || settingFormState.value.max === null) {
    message.warn('请输入最小和最大值后点击再继续操作！')
    return
  }

  if (settingFormState.value.max < settingFormState.value.min) {
    message.warn('最大值不能小于最小值，请确认输入内容！')
    return
  }

  const data: HumitureSetParams = {
    laboratoryId: dataSource.value.id,
    iotEqId: dataSource.value.labIotEq.iotEqId,
    type: props.type,
  }

  if (props.type === 'tem') {
    data.minTem = settingFormState.value.min
    data.maxTem = settingFormState.value.max
  }
  else {
    data.minHum = settingFormState.value.min
    data.maxHum = settingFormState.value.max
  }

  settingLoading.value = true
  await humitureSet(data).finally(() => {
    settingLoading.value = false
  })

  message.success('操作成功！')
}
</script>
