<template>
  <HtModal
    v-model:open="visible"
    title="解析成功记录"
    width="900px"
    :confirm-loading="loading"
    :after-close="onClosed"
    hide-confirm
    fixed-height
  >
    <div class="h-full flex flex-col gap-2">
      <IlisFormSearch
        :entity="AnalysisRecordEntity"
        @reset="handleReset"
        @search="customSearch"
      ></IlisFormSearch>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="AnalysisRecordEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'attachmentSize'">
              {{ formatSize(text) }}
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              解析成功
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnalysisRecordEntity } from '../analysisRecordEntity.ts'
import { ocrAiBillPager } from '../api.ts'

defineProps<IDialogPropsParam<null, null>>()

const visible = ref(true)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<any>({
  api: ocrAiBillPager,
})

function customSearch(q: any) {
  if (q.time && q.time[1]) {
    q.timeStart = `${q.time[0]} 00:00:00`
    q.timeEnd = `${q.time[1]} 23:59:59`
  }
  delete q.time
  handleSearch(q)
}

function formatSize(n: number) {
  return n ? `${(n / 1024).toFixed(2)}KB` : '0KB'
}
</script>
