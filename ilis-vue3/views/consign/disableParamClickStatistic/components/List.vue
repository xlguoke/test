<template>
  <div class="flex flex-col h-full">
    <ListSearch @search="search" @reset="reset" />

    <div class="mt-4 mb-4">
      <a-button class="flex items-center" :icon="h(ExportOutlined)" @click="exportRecord">
        导出记录
      </a-button>
    </div>

    <div ref="tableBoxRef" class="flex-1 overflow-auto">
      <a-table
        bordered
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ x: 1200, y: tableHeight }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'clickTime'">
            {{ text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { ExportOutlined } from '@ant-design/icons-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { OrderType } from '../'
import { pageListApi, paramClickExport } from '../api'
import type { DataSource, Query } from '../api'
import ListSearch from './ListSearch.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'

const columns: ColumnType[] = [
  { title: '序号', dataIndex: 'index', width: '85px', align: 'center' },
  { title: '参数名称', dataIndex: 'paramName', width: '150' },
  { title: '样品层级', dataIndex: 'sampleName', width: '150' },
  { title: '资质类型', dataIndex: 'qualification', width: '150' },
  { title: '委托人', dataIndex: 'sampleSender', width: '150' },
  { title: '委托单位', dataIndex: 'consignUnit', width: '150' },
  { title: '点击时间', dataIndex: 'clickTime', sorter: true, width: '150px' },
]

const { tableHeight, tableBoxRef } = useTableHeight()
const query = ref<Query>({
  clickTimeStart: undefined,
  clickTimeEnd: undefined,
  order: undefined,
  q: '',
  sort: undefined,
})

const {
  page,
  size,
  loading,
  dataSource,
  getList,
  getPagination,
  handleSearch,
  handleReset,
} = useTableHooks<DataSource>({
  api: pageListApi,
  query,
  totalKey: 'count',
})

function search(data: Query) {
  query.value.q = data.q
  query.value.clickTimeStart = data.clickTimeStart
  query.value.clickTimeEnd = data.clickTimeEnd
  handleSearch()
}

function reset(data: Query) {
  query.value = data
  handleReset()
}

// 排序
function handleTableChange(_pagination: any, _filters: any, sorter: any) {
  const { order, field } = sorter
  const desc = order === 'descend' ? OrderType.DESC : OrderType.ASC
  query.value.sort = order ? field : ''
  query.value.order = order ? desc : ''
  getList()
}

// 导出记录
async function exportRecord() {
  const res = await paramClickExport({
    ...query.value,
    page: page.value,
    size: size.value,
  } as Query)

  downloader.excute(res.data, '禁用参数点击统计记录.xlsx')
}
</script>

<style scoped>

</style>
