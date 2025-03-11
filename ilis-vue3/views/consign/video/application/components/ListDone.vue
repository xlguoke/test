<template>
  <div class="h-full flex flex-col">
    <ListSearch status="done" @search="search" @reset="reset" />

    <div ref="tableBoxRef" class="mt-1 flex-1 overflow-auto">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.dataIndex === 'videoType'">
            {{ renderVideoType(text) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            {{ AUDIT_STATUS_DICT.getLabelByKey(text) }}
          </template>
          <template v-else-if="['applicationDate', 'reviewerDate'].includes(`${column.dataIndex}`)">
            {{ text ? useDateFormat(text, 'YYYY-MM-DD') : '--' }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="detailRow(record.id)">
              详情
            </a-button>
          </template>
          <template v-else>
            {{ text || '--' }}
          </template>
        </template>
      </a-table>
    </div>
    <Detail
      :id="editId"
      v-model:show="detailVisible"
      title="审核详情"
      show-type="audit"
    />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { pageListApi } from '../api'
import { AUDIT_STATUS_DICT, OrderType, VIDEO_TYPE_DICT } from '../'
import type { DataSource, Query } from '../api'
import ListSearch from './ListSearch.vue'
import Detail from './Detail.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
  },
  {
    title: '申请人',
    dataIndex: 'applicant',
  },
  {
    title: '视频类型',
    dataIndex: 'videoType',
  },
  {
    title: '申请日期',
    dataIndex: 'applicationDate',
    sorter: true,
  },
  {
    title: '审核日期',
    dataIndex: 'reviewerDate',
    sorter: true,
  },
  {
    title: '审核人',
    dataIndex: 'reviewer',
  },
  {
    title: '审核结果',
    dataIndex: 'status',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 80,
  },
]

const { tableHeight, tableBoxRef } = useTableHeight()
const query = ref<Query>({
  queryType: false,
})
const {
  loading,
  dataSource,
  getList,
  getPagination,
  handleSearch,
  handleReset,
} = useTableHooks<DataSource>({
  api: pageListApi,
  sizeKey: 'rows',
  query,
})

function search(data: Query) {
  query.value = data
  handleSearch()
}

function reset(data: Query) {
  query.value = data
  handleReset()
}

// 详情
const editId = ref('')
const detailVisible = ref(false)
function detailRow(id: string) {
  editId.value = id
  detailVisible.value = true
}

function renderVideoType(type: string) {
  if (!type)
    return '--'
  const types = type.split(',')
  const typeNames = types.map(type => VIDEO_TYPE_DICT.getLabelByKey(type))
  return typeNames.join('、')
}

// 排序
function handleTableChange(_pagination: any, _filters: any, sorter: any) {
  const { order, field } = sorter
  if (!field)
    return
  query.value.sort = field
  query.value.order = order === 'descend' ? OrderType.DESC : OrderType.ASC
  getList()
}
</script>

<style>

</style>
