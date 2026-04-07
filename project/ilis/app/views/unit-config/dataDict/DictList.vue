<template>
  <IlisContainer app-id="data-dict">
    <BaseSpinWrapper :spinning="loading">
      <HtDrag fixed-width="right">
        <HtDragItem>
          <div class="h-full overflow-hidden flex flex-col gap-2">
            <IlisFormSearch
              :entity="DictListEntity"
              @search="handleSearch"
              @reset="handleReset"
            />
            <div ref="tableBoxRef" class="flex-1 h-0">
              <IlisTable
                :entity="DictListEntity"
                :data-source="dataSource"
                :table-height="tableHeight"
                :pagination="getPagination()"
                @change="handleSortChange"
              >
                <template #bodyCell="{ record, column }">
                  <template v-if="column.dataIndex === 'action'">
                    <a-button type="link" size="small" @click="showTypeList(record as DictListEntity)">
                      查看类型
                    </a-button>
                  </template>
                </template>
              </IlisTable>
            </div>
          </div>
        </HtDragItem>
        <HtDragItem :width="!!selectedDict ? '48%' : '0'">
          <DictDetail v-if="selectedDict" :dict="selectedDict" />
        </HtDragItem>
      </HtDrag>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { useTableHooks } from '~/hooks/useTableHooks'
import { OrderType } from '~/interface/ITableHookConfig'
import { dictListApi } from './api'
import DictDetail from './components/DictDetail.vue'
import { DictListEntity } from './DataDictEntity.ts'

const sortQuery = ref<{ sort: string, order: OrderType }>({
  sort: 'createDate',
  order: OrderType.DESC,
})

const selectedDict = ref<DictListEntity>()

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getList,
  getPagination,
} = useTableHooks({
  api: dictListApi,
  query: sortQuery,
})

function handleSortChange(_pagination: any, _filters: any, sorter: any) {
  let { order, field } = sorter
  if (!order) {
    field = 'createDate'
    order = 'descend'
  }
  const desc = order === 'descend' ? OrderType.DESC : OrderType.ASC
  sortQuery.value = {
    sort: order ? field : '',
    order: desc,
  }
  getList()
}

function showTypeList(row: DictListEntity) {
  selectedDict.value = row
}
</script>

<style>

</style>
