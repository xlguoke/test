<!-- 化学品选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择化学品'"
    fixed-height
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <BaseSpinWrapper>
      <IlisFormSearch
        :entity="ChemicalSelectorEntity"
        :init-data="initData"
        @search="handleSearch"
        @reset="handleReset"
      />
      <div ref="tableBoxRef" class="flex gap-2 w-full flex-1 h-0">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :table-height="tableHeight"
          resizable
          :loading="loading"
          :entity="ChemicalSelectorEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
          @change="handleSortChange"
        />
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          :data="AnyDataTransformHelper.recordListToOptions(selectedRows, ['name', 'id'])"
          @remove-item="handleRemoveItem"
          @remove-all="selectedRows = [];selectedRowKeys = []"
        />
      </div>
    </BaseSpinWrapper>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import { ChemicalSelectorEntity } from './entity/ChemicalSelectorEntity'

const props = defineProps<IDialogPropsSelector<ChemicalSelectorEntity>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
} = useTableHooks<ChemicalSelectorEntity>({
  api: q => IlisApiHelper.get('/rest/chemical/inventory/paginationByCategory', q),
  payload: props.payload,
  isCacheSelect: props.isCacheSelect,
  immediate: !props.unImmediate,
  totalKey: 'count',
})

if (props.checkedRows) {
  selectedRows.value = cloneDeep(props.checkedRows)
  selectedRowKeys.value = props.checkedRows.map(d => d.id)
}

/** # 确认 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择化学品')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
