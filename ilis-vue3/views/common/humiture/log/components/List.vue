<template>
  <div class="flex flex-col" style="height: calc(100% + 16px)">
    <a-space>
      <a-select
        v-model:value="queryForm.laboratoryId"
        style="width: 240px;"
        allow-clear
        placeholder="请选择功能室"
        :options="laboratoryOptions"
      />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
      <a-button @click="ilisAdvancedQuery.open()">
        高级查询
      </a-button>
      <a-checkbox v-model:checked="queryForm.reqStatus" class="ml-4" @change="handleSearch()">
        只查看控制失败的
      </a-checkbox>
    </a-space>

    <!-- 高级查询 -->
    <AdvancedQuery :entity="ilisAdvancedQuery" />

    <div ref="tableBoxRef" class="flex-1 overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
      >
        <template #bodyCell="{ record, column, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'createDate'">
            {{ record.createDate ? dayjs(record.createDate).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'commandWay'">
            <template v-if="record.commandWay === CommandWayType.定时">
              定时
            </template>
            <template v-if="record.commandWay === CommandWayType.立刻">
              立刻
            </template>
            <template v-if="record.commandWay === CommandWayType.预约">
              预约
            </template>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import type { HumitureLogDataItem, HumitureLogListParams } from '../api'
import { getHumitureLogList } from '../api'
import { AdvancedQueryConfigs, CommandWayType } from '../index.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useLaboratoryOptionsHook } from '~/hooks/options/useLaboratoryOptionsHook.ts'
import AdvancedQuery from '~/components/IlisAdvancedQuery/AdvancedQuery.vue'
import { IlisAdvancedQuery } from '~/components/IlisAdvancedQuery'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: 85, align: 'center' },
  { title: '控制时间', dataIndex: 'createDate', width: '15%' },
  { title: '功能室', dataIndex: 'laboratoryName', width: '15%' },
  { title: '控制方式', dataIndex: 'commandWay', width: '10%' },
  { title: '操作人', dataIndex: 'operator', width: '10%' },
  { title: '控制内容', dataIndex: 'content', width: '20%' },
  { title: '控制结果', dataIndex: 'reqStatus', width: '10%', customRender: ({ text }) => (text === 'SUCCESS' ? '成功' : '失败') },
  { title: '备注', dataIndex: 'remark', width: '15%', customRender: ({ text }) => (text === '[]' ? '' : text) },
]

const { tableHeight, tableBoxRef } = useTableHeight()

const { laboratoryOptions } = useLaboratoryOptionsHook({ isIotLab: 1 })

const queryForm = ref<HumitureLogListParams>({
  commandWay: undefined,
  conEndDate: undefined,
  conStartDate: undefined,
  laboratoryId: undefined,
  operator: undefined,
  reqStatus: undefined,
})

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
} = useTableHooks<HumitureLogDataItem>({
  api: getHumitureLogList,
  query: queryForm,
})

const ilisAdvancedQuery = reactive(new IlisAdvancedQuery<HumitureLogListParams>({
  configs: AdvancedQueryConfigs,
  queryParams: queryForm.value,
  onQuery: () => {
    handleSearch()
  },
})) as IlisAdvancedQuery<HumitureLogListParams>

function onReset() {
  queryForm.value = {
    commandWay: undefined,
    conEndDate: undefined,
    conStartDate: undefined,
    laboratoryId: undefined,
    operator: undefined,
    reqStatus: undefined,
  }
  ilisAdvancedQuery.queryParams = queryForm.value
  ilisAdvancedQuery.updateQueryTags()
  handleSearch()
}
</script>
