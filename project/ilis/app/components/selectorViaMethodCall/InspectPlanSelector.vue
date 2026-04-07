<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    :title="title || '选择期间核查计划'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        :entity="EquipmentInspectPlanEntity"
        :init-data="initData"
        @search="handleSearch"
        @reset="handleReset"
      >
      </IlisFormSearch>
      <div class="flex gap-3 w-full">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :loading="loading"
          :entity="EquipmentInspectPlanEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          @change="handleSortChange"
        >
        </IlisTable>
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          empty-text="未选择期间核查计划"
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
import { useTableHooks } from '~/hooks/useTableHooks'
import { getEquipmentInspectPlanList } from '~/views/equipment/inspect/plan/api'
import { EquipmentInspectPlanEntity } from '~/views/equipment/inspect/plan/EquipmentInspectPlanEntity'
import { BaseSelectorView } from '../UI'

const props = defineProps<IDialogPropsSelector<EquipmentInspectPlanEntity>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleSortChange,
} = useTableHooks<EquipmentInspectPlanEntity>({
  api: getEquipmentInspectPlanList,
  sizeKey: 'rows',
  isCacheSelect: props.isCacheSelect,
  payload: props?.payload,
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
    return message.warning('请选择期间核查计划')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
