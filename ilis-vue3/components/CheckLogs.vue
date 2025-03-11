<template>
  <ht-modal
    v-model:open="logVisible"
    centered
    width="80%"
    title="查看日志"
    :keyboard="false"
    :mask-closable="false"
  >
    <a-table
      class="mt-4"
      row-key="id"
      bordered
      :loading="loading"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :scroll="{ y: 420 }"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'content'">
          <p v-html="record.content"></p>
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button @click="handleCancel()">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang="ts">
import type { ColumnType } from 'ant-design-vue/es/table'
import dayjs from 'dayjs'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { GetProcessLogListParams, ProcessLogDataItem } from '~/api/log.ts'
import { getProcessLogList } from '~/api/log.ts'

const columns: ColumnType[] = [
  {
    title: '内容',
    dataIndex: 'content',
  },
  {
    title: '处理意见',
    dataIndex: 'opinion',
    ellipsis: true,
  },
  {
    title: '对象编号',
    dataIndex: 'objectSn',
    width: 180,
  },
  {
    title: '处理人',
    dataIndex: 'createName',
    width: 120,
  },
  {
    title: '处理时间',
    dataIndex: 'createDate',
    width: 150,
    customRender: ({ text }) => {
      return (text ? dayjs(text).format('YYYY/MM/DD HH:mm:ss') : '')
    },
  },
]

const logVisible = ref(false)

const {
  loading,
  dataSource,
  handleSearch,
} = useTableHooks<ProcessLogDataItem>({
  api: getProcessLogList,
  immediate: false,
  sizeKey: 'rows',
})

/**
 * # 取消
 */
function handleCancel() {
  logVisible.value = false
  dataSource.value = []
}

// 获取列表
function open(params: GetProcessLogListParams) {
  logVisible.value = true
  handleSearch(params)
}

defineExpose({
  open,
})
</script>
