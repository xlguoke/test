<template>
  <div class="h-full flex flex-col">
    <ListSearch status="pending" @search="search" @reset="reset" />

    <a-space class="mt-1">
      <a-button
        v-permission="'videoApplication::audit'"
        class="flex items-center"
        :icon="h(AuditOutlined)"
        @click="batchAudit"
      >
        批量审核
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="mt-1 flex-1 overflow-auto">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'videoType'">
            {{ renderVideoType(text) }}
          </template>
          <template v-else-if="column.dataIndex === 'applicationDate'">
            {{ useDateFormat(text, 'YYYY-MM-DD') }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="detailRow(record.id)">
              详情
            </a-button>
            <a-button
              v-permission="'videoApplication::audit'"
              type="link"
              size="small"
              @click="auditRow(record.id)"
            >
              审核
            </a-button>
          </template>
          <template v-else>
            {{ text || '--' }}
          </template>
        </template>
      </a-table>
    </div>

    <Detail :id="editId" v-model:show="detailVisible" title="申请详情" />
    <Audit v-model:show="auditVisible" :ids="auditIds" @ok="okAudit" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { AuditOutlined } from '@ant-design/icons-vue'
import { useDateFormat } from '@vueuse/core'
import { OrderType, VIDEO_TYPE_DICT } from '../'
import { pageListApi } from '../api'
import type { DataSource, Query } from '../api'
import ListSearch from './ListSearch.vue'
import Detail from './Detail.vue'
import Audit from './Audit.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { useTableHeight } from '~/hooks/useTableHeight'

const columns = [
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
    title: '操作',
    dataIndex: 'action',
    width: 150,
  },
]

const { tableHeight, tableBoxRef } = useTableHeight()
const query = ref<Query>({
  queryType: true,
})
const {
  loading,
  dataSource,
  selectedRowKeys,
  selectedRows,
  getList,
  getRowSelection,
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

// 排序
function handleTableChange(_pagination: any, _filters: any, sorter: any) {
  const { order, field } = sorter
  if (!field)
    return
  query.value.sort = field
  query.value.order = order === 'descend' ? OrderType.DESC : OrderType.ASC
  getList()
}

function renderVideoType(type: string) {
  if (!type)
    return '--'
  const types = type.split(',')
  const typeNames = types.map(type => VIDEO_TYPE_DICT.getLabelByKey(type))
  return typeNames.join('、')
}

// 详情
const detailVisible = ref(false)
const editId = ref('')

function detailRow(id: string) {
  editId.value = id
  detailVisible.value = true
}

// 审核
const auditIds = ref<string[]>([])
const auditVisible = ref(false)

function auditRow(id: string) {
  auditIds.value = [id]
  auditVisible.value = true
}

// 批量审核
function batchAudit() {
  if (selectedRowKeys.value.length === 0) {
    return message.warning('请选择要审核的数据')
  }
  auditIds.value = selectedRowKeys.value as string[]
  auditVisible.value = true
}

// 审核完成
function okAudit() {
  getList()
  selectedRowKeys.value = []
  selectedRows.value = []
}
</script>

<style>

</style>
