<template>
  <HtModal
    v-model:open="visible"
    title="选择标准物质"
    :width="1200"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="flex flex-col gap-4">
      <IlisFormSearch
        :entity="StandardMaterialLedgerEntity"
        :field-list="['keyword']"
        @search="handleSearch"
        @reset="handleReset"
      />

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          bordered
          :loading="loading"
          :entity="StandardMaterialLedgerEntity"
          :field-list="tableFieldList"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="
            getRowSelection({
              type: 'radio',
            })"
          :custom-row="getCustomRow()"
          :table-height="tableHeight"
        />
      </div>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getStandardMaterialLedgerList } from '~/views/equipment/material/standard-material-ledger/api'
import { StandardMaterialLedgerEntity } from '~/views/equipment/material/standard-material-ledger/entity/StandardMaterialLedgerEntity'

// 单选，选择的结果是一个标准物物质实体对象
const props = defineProps<IDialogPropsParam<any, Record<string, any>>>()

const visible = ref(true)

const tableFieldList = computed(() => StandardMaterialLedgerEntity.getTableFieldList().filter(field => !['priorityWeight', 'operation', 'unit', 'unitPrice', 'standardValue'].includes(field)))

const {
  loading,
  tableHeight,
  tableBoxRef,
  dataSource,
  selectedRows,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
} = useTableHooks<StandardMaterialLedgerEntity>({
  api: getStandardMaterialLedgerList,
  beforeSearch(params) {
    const formattedParams = params.sort
      ? {
          ...params,
          sort: `${params.sort},${params.order}`,
        }
      : params
    delete formattedParams.order
    delete formattedParams.orderBy
    return formattedParams
  },
  responseDataTransform(data) {
    return {
      rows: data.content || [],
      total: data.totalElements || 0,
    }
  },
  pageKey: 'pageNumber',
  sizeKey: 'pageSize',
})

function handleOk() {
  if (!selectedRows.value.length) {
    message.warning('请选择一个标准物质')
    return
  }

  props.onConfirm([...selectedRows.value])
  visible.value = false
}

function handleCancel() {
  visible.value = false
}
</script>
