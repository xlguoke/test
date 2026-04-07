<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.laboratoryId"
        allow-clear
        style="width: 240px;"
        placeholder="功能室"
        :options="laboratoryOptions"
      />
      <a-range-picker v-model:value="queryDate" show-time class="w-full" :value-format="EDateFormatType.YYYY_MM_DD_HH_MM_SS" />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'content'">
            {{ `当前温度${record.tem}℃，湿度${record.hum}%rh，试验人员${record.taskUser}，任务编号${record.testTaskCode}，检测参数${record.testParamName}，${record.mark === 'PARAM' ? '参数' : '功能室'}要求温度${record.standardMinTem}℃-${record.standardMaxTem}℃，要求湿度${record.standardMinHum}%rh-${record.standardMaxHum}%rh。${getOverText(record.type)}` }}
          </template>
          <template v-if="column.dataIndex === 'recordDate'">
            {{ record.recordDate ? dayjs(record.recordDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { GetHumitureOverRecordListQuery } from '~/views/common/humiture/overRecord/api/getHumitureOverRecordList.ts'
import type { HumitureRecordDataItem } from '~/views/common/humiture/record/api/getHumitureRecordList.ts'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { HumOverType } from '~/views/common/humiture/overRecord'
import { getHumitureOverRecordList } from '~/views/common/humiture/overRecord/api/getHumitureOverRecordList.ts'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: '85px', align: 'center' },
  { title: '功能室', dataIndex: 'laboratoryName', width: '220px' },
  { title: '提醒内容', dataIndex: 'content' },
  { title: '发送时间', dataIndex: 'recordDate', width: '220px' },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const queryForm = ref<GetHumitureOverRecordListQuery>({})

const [queryDate] = useDateRangePickerHooks((val) => {
  queryForm.value.startDate = val[0] || ''
  queryForm.value.endDate = val[1] || ''
}, EDateFormatType.YYYY_MM_DD_HH_MM_SS)

const { laboratoryOptions } = useLaboratoryOptionsHook()

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureRecordDataItem>({
  api: getHumitureOverRecordList,
  query: queryForm,
})

function getOverText(type: HumOverType) {
  if (type === HumOverType.湿度) {
    return '湿度已超标请及时处理！'
  }
  else if (type === HumOverType.温度) {
    return '温度已超标请及时处理！'
  }
  else if (type === HumOverType.全部) {
    return '温湿度已超标请及时处理！'
  }
  return ''
}

function onReset() {
  queryDate.value = []
  queryForm.value.laboratoryId = undefined
  queryForm.value.startDate = undefined
  queryForm.value.endDate = undefined
  handleSearch()
}
</script>
