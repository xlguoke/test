<template>
  <HtModal
    v-model:open="visible"
    title="温湿度记录"
    width="80%"
    hide-confirm
    fixed-height
    :loading="loading"
    :after-close="onClosed"
  >
    <div class="flex flex-col h-full gap-2">
      <a-alert>
        <template #message>
          <span v-if="param.testTaskCode">任务编号：{{ param.testTaskCode }}；</span>
          <span v-if="param.testObjectCode">样品编号：{{ param.testObjectCode }}；</span>
          <span v-if="param.sampleName">样品名称：{{ param.sampleName }}；</span>
        </template>
      </a-alert>

      <IlisFormSearch
        :entity="LedgerRecordEntity"
        @search="onSearch"
        @reset="handleReset"
      />

      <!-- HtButtonGroup -->
      <div>
        <a-button @click="handleExport(`rest/humiture/ledger/${param.id}/export`)">
          导出
        </a-button>
      </div>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          :entity="LedgerRecordEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :pagination="getPagination()"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'minTemperature'">
              <span v-if="!text || !record.maxTemperature">--</span>
              <span v-else>{{ text }}-{{ record.maxTemperature }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'minHumidity'">
              <span v-if="!text || !record.maxHumidity">--</span>
              <span v-else>{{ text }}-{{ record.maxHumidity }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'recordTime'">
              {{ text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
            <template v-else-if="column.dataIndex === 'tem' || column.dataIndex === 'hum'">
              <span :class="`${showStatus(record as LedgerRecordEntity, column.dataIndex) ? 'text-red-500' : ''}`">{{ text || '--' }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <span :class="`${text === '异常' ? 'text-red-500' : ''}`">{{ text }}</span>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { ListEntity } from '../taskLedgerEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import { recordDetailApi } from '../api.ts'
import { LedgerRecordEntity } from '../taskLedgerEntity.ts'

const props = defineProps<IDialogPropsParam<null, ListEntity>>()

const visible = ref(true)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
  handleExport,
} = useTableHooks<LedgerRecordEntity>({
  api: recordDetailApi,
  payload: {
    taskId: props.param.id,
  },
})

function showStatus(row: LedgerRecordEntity, column: 'tem' | 'hum') {
  if (!row[column])
    return false
  if (column === 'tem') {
    if (!row.maxTemperature || !row.minTemperature)
      return false
    return row[column] > row.maxTemperature || row[column] < row.minTemperature
  }
  if (!row.maxHumidity || !row.minHumidity)
    return false
  return row[column] > row.maxHumidity || row[column] < row.minHumidity
}

function onSearch(query: Record<string, any>) {
  if (query.timeRange && query.timeRange.length) {
    query.startDate = query.timeRange[0]
    query.endDate = query.timeRange[1]
  }
  else {
    query.startDate = ''
    query.endDate = ''
  }
  delete query.timeRange
  handleSearch(query)
}
</script>
