<template>
  <div>
    <a-modal
      v-model:open="open"
      title="手工巡查"
      width="80%"
      :mask-closable="false"
      destroy-on-close
      :confirm-loading="submitLoading"
      centered
      @cancel="cancel"
    >
      <a-space class="my-4">
        <a-tree-select
          v-model:value="selectedLabIds"
          class="w-[280px]"
          :tree-data="labTreeData"
          tree-checkable
          tree-default-expand-all
          placeholder="功能室"
          :max-tag-count="2"
        >
          <template #maxTagPlaceholder>
            <span :title="labTags.map(i => i.name).join(',')">+ {{ labTags.length }} ...</span>
          </template>
        </a-tree-select>
      </a-space>

      <a-table
        row-key="id"
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="false"
        :scroll="{ y: 320 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'minTemperature'">
            {{ record.minTemperature }} ~ {{ record.maxTemperature }}
          </template>
          <template v-if="column.dataIndex === 'minHumidity'">
            {{ record.minHumidity }} ~ {{ record.maxHumidity }}
          </template>
          <template v-if="column.dataIndex === 'recordDate'">
            <a-date-picker
              v-model:value="record.recordDate"
              show-time
              :disabled="!HUMITURE_MANAGE_UPDATE"
              :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS"
            />
          </template>
          <template v-if="column.dataIndex === 'tem'">
            <a-input-number v-model:value="record.tem" :disabled="!HUMITURE_MANAGE_UPDATE" @change="checkTemStatus(record)"></a-input-number>
          </template>
          <template v-if="column.dataIndex === 'hum'">
            <a-input-number v-model:value="record.hum" :disabled="!HUMITURE_MANAGE_UPDATE" @change="checkHumStatus(record)"></a-input-number>
          </template>
          <template v-if="column.dataIndex === 'temStatus'">
            <span v-if="record.temStatus === MStatus.超标 || record.temStatus === MStatus.过低" class="text-red-500">超标</span>
            <span v-else-if="record.temStatus === MStatus.正常">正常</span>
            <span v-else>-</span>
          </template>
          <template v-if="column.dataIndex === 'humStatus'">
            <span v-if="record.humStatus === MStatus.超标 || record.humStatus === MStatus.过低" class="text-red-500">超标</span>
            <span v-else-if="record.humStatus === MStatus.正常">正常</span>
            <span v-else>-</span>
          </template>
        </template>
      </a-table>

      <template #footer>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit">
          确定
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { getLaboratoryData } from '~/api/laboratory.ts'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import {
  CreateHumitureRecordEntity,
  createHumitureRecord,
} from '~/views/common/humiture/record/api/createHumitureRecord.ts'
import { MStatus, Type } from '~/views/common/humiture/record'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import type { TsSubCmdItem } from '~/views/common/humiture/display/iotDataRequest.ts'
import { IotDataRequest } from '~/views/common/humiture/display/iotDataRequest.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '巡查时间', dataIndex: 'recordDate', width: 180 },
  { title: '功能室', dataIndex: 'name', width: 180 },
  { title: '标准温度（℃）', dataIndex: 'minTemperature', width: 180 },
  { title: '巡查温度（℃）', dataIndex: 'tem', width: 180 },
  { title: '温度状态', dataIndex: 'temStatus', width: 180 },
  { title: '标准湿度（%RH）', dataIndex: 'minHumidity', width: 180 },
  { title: '巡查湿度（%RH）', dataIndex: 'hum', width: 180 },
  { title: '湿度状态', dataIndex: 'humStatus', width: 180 },
]

const open = computed(() => props.open)

const loading = ref(false)

const submitLoading = ref(false)

const selectedLabIds = ref<string[]>([])

const dataSource = ref<ViewLaboratoryDataEntity[]>([])

const list = computed(() => dataSource.value.filter(i => selectedLabIds.value.includes(i.id)))

const labTreeData = ref([])

const iotDataRequest = new IotDataRequest()

const HUMITURE_MANAGE_UPDATE = ref(false)

const labTags = computed(() => {
  const ids = selectedLabIds.value.filter((i, index) => index > 1)
  const data = ids.map(i => (dataSource.value.find(j => j.id === i) || {}))
  return data
})

watch(open, async (val) => {
  if (!val) {
    cancel()
  }
  else {
    HUMITURE_MANAGE_UPDATE.value = await getBusinessParam('HUMITURE_MANAGE_UPDATE')

    await getList()
    listenIotData()
  }
})

async function getList() {
  loading.value = true
  const res = await getLaboratoryData().finally(() => {
    loading.value = false
  })
  const rows = res.data.obj.rows as ViewLaboratoryDataEntity[]

  labTreeData.value = [{
    label: '全选',
    value: 'all',
    expand: true,
    children: rows.map(item => ({
      label: item.name,
      value: item.id,
    })),
  }]

  rows.forEach((item) => {
    item.recordDate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  })

  selectedLabIds.value = rows.map(i => i.id)
  dataSource.value = rows.map((i, index) => ({
    ...i,
    index,
  }))
}

// 获取物联网设备数据
function listenIotData() {
  const lData: TsSubCmdItem[] = []

  dataSource.value.forEach((item) => {
    if (item.iotEqId && item.index !== undefined) {
      lData.push({
        entityType: 'DEVICE',
        entityId: item.iotEqId,
        cmdId: item.index,
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }

  iotDataRequest.listenDataUpdate(lData, (res) => {
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity

    dataSource.value.forEach((item) => {
      if (res.subscriptionId === item.index) {
        if ((item.tem === null || item.tem === undefined) && temperature && temperature.length > 0) {
          item.tem = Number.parseFloat(temperature[0][1])
        }

        if ((item.hum === null || item.hum === undefined) && humidity && humidity.length > 0) {
          item.hum = Number.parseFloat(humidity[0][1])
        }
      }

      checkTemStatus(item)
      checkHumStatus(item)
    })
  })
}

function submitBeforeCheck(cb) {
  if (HUMITURE_MANAGE_UPDATE.value && list.value.some(i => !isDefined(i.tem) || !isDefined(i.hum))) {
    Modal.confirm({
      title: '提示',
      content: '存在未填写巡查温度或巡查湿度的数据，是否继续提交？',
      onOk: () => {
        cb()
      },
    })
  }
  else {
    cb()
  }
}

async function onSubmit() {
  submitBeforeCheck(async () => {
    const formData: CreateHumitureRecordEntity[] = []

    list.value.forEach((item) => {
      const data = new CreateHumitureRecordEntity()
      data.hum = item.hum
      data.humStatus = item.humStatus
      data.laboratoryId = item.id
      data.recordDate = item.recordDate
      data.tem = item.tem
      data.temStatus = item.temStatus
      data.type = Type.手动

      formData.push(data)
    })

    submitLoading.value = true
    await createHumitureRecord(formData).finally(() => {
      submitLoading.value = false
    })
    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

function checkTemStatus(item: ViewLaboratoryDataEntity) {
  if (item.tem !== undefined && isDefined(item.minTemperature) && isDefined(item.maxTemperature)) {
    if (item.tem < item.minTemperature) {
      item.temStatus = MStatus.过低
    }
    else if (item.tem > item.maxTemperature) {
      item.temStatus = MStatus.超标
    }
    else {
      item.temStatus = MStatus.正常
    }
  }
  else {
    item.temStatus = undefined
  }
}

function checkHumStatus(item: ViewLaboratoryDataEntity) {
  if (item.hum !== undefined && isDefined(item.minHumidity) && isDefined(item.maxHumidity)) {
    if (item.hum < item.minHumidity) {
      item.humStatus = MStatus.过低
    }
    else if (item.hum > item.maxHumidity) {
      item.humStatus = MStatus.超标
    }
    else {
      item.humStatus = MStatus.正常
    }
  }
  else {
    item.humStatus = undefined
  }
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
}
</script>
