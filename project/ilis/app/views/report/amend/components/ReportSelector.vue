<template>
  <ht-modal
    v-model:open="internalOpen"
    title="选择需要更正的报告"
    width="1000px"
    fixed-height
    :loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="h-full flex flex-col gap-3 w-full">
      <a-alert>
        <template #message>
          1. 只能选择已批准及之后状态的报告；<br>
          2. 每份报告只能申请一次（已申请的报告将不会显示）；
        </template>
      </a-alert>
      <IlisFormSearch
        :entity="WaitAmendReportEntity"
        @search="customSearch"
        @reset="handleReset"
      >
      </IlisFormSearch>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="reportId"
          :table-height="tableHeight"
          :entity="WaitAmendReportEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: 'radio',
          })"
          :custom-row="getCustomRow()"
          @change="handleSortChange"
        >
        </IlisTable>
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getWaitAmendReportApi } from '../api'
import { WaitAmendReportEntity } from '../ReportAmendEntity'

const props = defineProps<IDialogPropsParam<WaitAmendReportEntity, { reportId: string }>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
  getRowSelection,
  getCustomRow,
} = useTableHooks<WaitAmendReportEntity>({
  api: getWaitAmendReportApi,
  responseDataTransform: (res) => {
    return {
      rows: res.rows.map((d: any) => {
        for (const k in d) {
          if (!d[k])
            d[k] = ''
        }
        d.id = d.reportId
        return d
      }),
      total: res.total,
    }
  },
})

onMounted(() => {
  if (props.param && props.param.reportId) {
    selectedRowKeys.value = [props.param.reportId]
  }
})

function customSearch(query: any) {
  if (query.issueDate && query.issueDate.length) {
    query.issueDateStart = query.issueDate[0]
    query.issueDateEnd = query.issueDate[1]
  }
  else {
    query.issueDateStart = query.issueDateEnd = ''
  }
  delete query.issueDate
  handleSearch(query)
}

/**
 * # 确认
 */
function handleConfirm() {
  if (selectedRows.value.length === 0) {
    message.warn('请选择需要更正的报告！')
    return
  }
  const row: any = selectedRows.value[0]
  delete row.id
  props.onConfirm(row)
  internalOpen.value = false
}
</script>
