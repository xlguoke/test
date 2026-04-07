<!-- 检校计划选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择检校计划'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        v-if="EquipmentCheckPlanEntity.getSearchFileldList()?.length"
        :entity="EquipmentCheckPlanEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #departId="{ data }">
          <BaseSelectDepart v-model="data.departId" placeholder="请选择" />
        </template>
      </IlisFormSearch>
      <div class="flex gap-3 w-full">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          table-height="55vh"
          :loading="loading"
          :entity="EquipmentCheckPlanEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
          :field-list="EquipmentCheckPlanEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
          @change="handleSortChange"
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
import { useTableHooks } from '~/hooks/useTableHooks'
import { getCheckPlanList } from '~/views/equipment/check/plan/api'
import { EquipmentCheckPlanEntity } from '~/views/equipment/check/plan/EquipmentCheckPlanEntity'

const props = defineProps<IDialogPropsSelector<EquipmentCheckPlanEntity>>()

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
  handleSortChange,
} = useTableHooks<EquipmentCheckPlanEntity>({
  api: getCheckPlanList,
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
    return message.warning('请选择检校计划')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
