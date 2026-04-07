<!-- 资产选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择合同'"
    :after-close="onClosed"
    fixed-height
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full h-full">
      <IlisFormSearch
        :entity="ContractSelectorEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #departId="{ data }">
          <BaseSelectDepart v-model="data.departId" placeholder="请选择" />
        </template>
      </IlisFormSearch>
      <div ref="tableBoxRef" class="flex gap-3 w-full flex-1 h-0">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :table-height="tableHeight"
          :loading="loading"
          :entity="ContractSelectorEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
        >
        </IlisTable>
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          :data="AnyDataTransformHelper.recordListToOptions(selectedRows, ['name', 'id'])"
          @remove-item="handleRemoveItem"
          @remove-all="selectedRows = [];selectedRowKeys = [];"
        />
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { message } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { getContractList } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { ContractSelectorEntity } from './entity/contractSelectorEntity'

const props = defineProps<IDialogPropsSelector<ContractSelectorEntity>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  tableBoxRef,
  tableHeight,
} = useTableHooks<ContractSelectorEntity>({
  api: getContractList,
  sizeKey: 'rows',
  payload: props.payload,
  isCacheSelect: props.isCacheSelect,
})

if (props.checkedRows) {
  selectedRows.value = props.checkedRows
  selectedRowKeys.value = props.checkedRows.map(d => d.id)
}

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择合同')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
