<template>
  <IlisContainer app-id="report_seal_history">
    <div class=" flex flex-col h-full gap-3">
      <IlisFormSearch
        :entity="ReportSealEntity"
        :field-list="formSearchFiledList"
        :init-data="initQuery"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button type="primary" @click="addSealRegistration()">
          新增用印登记
        </a-button>
        <a-button :loading="loading" @click="exportHistory()">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :table-height="tableHeight"
          :entity="ReportSealEntity"
          :row-selection="getRowSelection()"
          :pagination="getPagination()"
          :selected-row-keys="selectedRowKeys"
          :field-list="tableFiledList"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'generateQrCode'">
              <span>{{ `${record.generateQrCode ? '是' : '否'}` }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'remark'">
              <span>{{ `${record.remark ? record.remark : ''}` }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'stamps'">
              {{ showStamps(record.stamps) }}
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <a-button type="link" danger @click="handleDelete(record)">
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { deleteSealHistory, exportReportSealHistory, getReportSealHistoryList } from './api'
import add from './components/add.vue'
import { ReportSealEntity } from './reportSealEntity'

interface Stamp {
  sealId: string
  sealName: string
}

// 初始化时间范围查询条件
const initQuery = ref(new ReportSealEntity())
const defaultDataRange = [
  dayjs().subtract(3, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
]
initQuery.value.registerTimeRange = defaultDataRange
const {
  loading,
  dataSource,
  selectedRowKeys,
  tableBoxRef,
  tableHeight,
  handleReset: originalHandleReset,
  handleSearch,
  getPagination,
  getRowSelection,
  handleReloadTable,
} = useTableHooks<ReportSealEntity>({
  api: getReportSealHistoryList,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.total,
    }
  },
})

// 自定义handleReset方法，确保重置时恢复默认时间范围
function handleReset() {
  // 调用原始的handleReset方法
  originalHandleReset({
    registerTimeRange: [...defaultDataRange],
  })
  initQuery.value.registerTimeRange = [...defaultDataRange]
}

const tableFiledList = ReportSealEntity.getTableFieldList().filter(field => !['repetitive'].includes(field))

const formSearchFiledList = ReportSealEntity.getSearchFileldList().filter((field) => {
  return field !== 'repetitive'
})
// 登记历史导出
async function exportHistory() {
  loading.value = true
  const startTime = initQuery.value.registerTimeRange?.[0] ? dayjs(initQuery.value.registerTimeRange?.[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
  const endTime = initQuery.value.registerTimeRange?.[1] ? dayjs(initQuery.value.registerTimeRange?.[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
  const res = await exportReportSealHistory(startTime, endTime).finally(() => {
    loading.value = false
  })
  // 直接创建一个a标签来下载文件
  const url = window.URL.createObjectURL(res.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '用印登记记录.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  message.success('操作成功')
  handleSearch()
}
async function handleDelete(record: any) {
  const result = await new Promise((resolve) => {
    Modal.confirm({
      title: '删除提示',
      content: '确定删除该条记录吗？',
      onOk: async () => {
        resolve(true)
      },
      onCancel: () => {
        resolve(false)
      },
    })
  })
  if (result) {
    loading.value = true
    const id = record.id || ''
    try {
      await deleteSealHistory(id)
      message.success('操作成功')
      handleReloadTable()
    }
    catch (error) {
      console.error('删除出错:', error)
    }
    finally {
      loading.value = false
    }
  }
}
function showStamps(list: Stamp[]) {
  return list?.map(item => item.sealName).join('、') || '--'
}
// 新增用印登记
async function addSealRegistration() {
  await AnyDialogHelper.showModel(add)
  handleReloadTable()
}
</script>

<style lang="less">
</style>
