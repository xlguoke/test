<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-form :model="formState" class="pt-4" :label-col="{ style: { width: '75px' } }">
        <a-row :gutter="16">
          <a-col span="6">
            <a-form-item label="开始时间" name="recordStartDate" :rules="[{ required: true, message: '请选择时间！' }]">
              {{ formState.recordStartDate }}
            </a-form-item>
          </a-col>
          <a-col span="6">
            <a-form-item label="结束时间" name="recordEndDate" :rules="[{ required: true, message: '请选择时间！' }]">
              {{ formState.recordEndDate }}
            </a-form-item>
          </a-col>
          <a-col span="6">
            <a-form-item label="功能室" name="laboratoryId" :rules="[{ required: true, message: '请选择功能室！' }]">
              {{ formState.laboratoryName }}
            </a-form-item>
          </a-col>
          <a-col span="6">
            <a-form-item label="台账名称" required>
              {{ ledgerName }}
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :scroll="{ y: 320 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'recordDate'">
            {{ record.recordDate ? dayjs(record.recordDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'temStatus'">
            {{ MStatusDict.getLabelByKey(record.temStatus) }}
          </template>
          <template v-if="column.dataIndex === 'humStatus'">
            {{ MStatusDict.getLabelByKey(record.humStatus) }}
          </template>
        </template>
      </a-table>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import dayjs from 'dayjs'
import type { ColumnType } from 'ant-design-vue/es/table'
import { MStatusDict } from '~/views/common/humiture/record'
import { getHumitureLedgerDetail } from '~/views/common/humiture/ledger/api/getHumitureLedgerDetail.ts'
import type { HumitureRecordListParams } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '巡查时间', dataIndex: 'recordDate', width: 180 },
  { title: '功能室', dataIndex: 'laboratoryName', width: 180 },
  { title: '标准温度（℃）', dataIndex: 'standardTem', width: 180 },
  { title: '巡查温度（℃）', dataIndex: 'tem', width: 180 },
  { title: '温度状态', dataIndex: 'temStatus', width: 180 },
  { title: '标准湿度（%RH）', dataIndex: 'standardHum', width: 180 },
  { title: '巡查湿度（%RH）', dataIndex: 'hum', width: 180 },
  { title: '湿度状态', dataIndex: 'humStatus', width: 180 },
]

const pathParams = new URLSearchParams(location.search)

const displayId = pathParams.get('businessKey')

const ledgerName = ref('')

const formState = ref<HumitureRecordListParams>({})

const dataSource = ref([])

async function onLoadDetail() {
  if (displayId) {
    const res = await getHumitureLedgerDetail(displayId)
    const data = res.data

    formState.value.recordStartDate = data.ledgerStartDate ? dayjs(data.ledgerStartDate).format('YYYY-MM-DD') : ''
    formState.value.recordEndDate = data.ledgerEndDate ? dayjs(data.ledgerEndDate).format('YYYY-MM-DD') : ''
    formState.value.laboratoryName = data.laboratoryName

    ledgerName.value = data.name
    dataSource.value = data.recordList
  }
}

onLoadDetail()
</script>
