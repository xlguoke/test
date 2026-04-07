<template>
  <IlisContainer app-id="common_hum_task_ledger">
    <BaseSpinWrapper :spinning="loading">
      <IlisFormSearch
        :entity="ListEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #departId="{ data }">
          <BaseSelectDepart
            v-model="data.departId"
            placeholder="请选择所属部门"
            @change="nextTick(() => handleSearch(data))"
          />
        </template>
      </IlisFormSearch>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :entity="ListEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :table-width="1400"
          :pagination="getPagination()"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" size="small" @click="handleDetail(record as PageListData)">
                记录详情
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { PageListData } from './api'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { BaseSpinWrapper } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { pageListApi } from './api'
import LedgerRecord from './components/LedgerRecord.vue'
import { ListEntity } from './taskLedgerEntity'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks<PageListData>({
  api: pageListApi,
})

function handleDetail(row: PageListData) {
  AnyDialogHelper.showModel(LedgerRecord, row)
}
</script>

<style>

</style>
