<template>
  <IlisContainer app-id="common_hum_book">
    <BaseSpinWrapper :spinning="loading">
      <IlisFormSearch
        :entity="BookListEntity"
        @search="handleSearch"
        @reset="handleReset"
      />

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :entity="BookListEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :pagination="getPagination()"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" size="small" @click="handleDetail(record as BookListEntity)">
                采集详情
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { BaseSpinWrapper } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getHumitureBookPage } from './api'
import { BookListEntity } from './bookEntity'
import AddEdit from './component/AddEdit.vue'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
} = useTableHooks<BookListEntity>({
  api: getHumitureBookPage,
})

function handleDetail(row: BookListEntity) {
  AnyDialogHelper.showModel(AddEdit, row)
}
</script>

<style>

</style>
