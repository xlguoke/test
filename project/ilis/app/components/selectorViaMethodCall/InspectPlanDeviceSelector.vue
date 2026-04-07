<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    :title="title || '选择期间核查计划设备'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <IlisTable
      class=" w-full"
      row-key="id"
      :loading="loading"
      :entity="EquipmentInspectDeviceEntity"
      :data-source="dataSource"
      :pagination="getPagination()"
      :row-selection="getRowSelection({
        type: multiple ? 'checkbox' : 'radio',
      })"
      :table-height="tableHeight"
      :custom-row="getCustomRow()"
      :field-list="EquipmentInspectDeviceEntity.getTableFieldList()?.filter(i => !['operation'].includes(i))"
      @change="handleSortChange"
    >
    </IlisTable>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getEquipmentInspectPlanEqDetail } from '~/views/equipment/inspect/plan/api'
import { EquipmentInspectDeviceEntity } from '~/views/equipment/inspect/plan/EquipmentInspectDeviceEntity'

const props = defineProps<IDialogPropsSelector<EquipmentInspectDeviceEntity>>()

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
  handleSortChange,
} = useTableHooks<EquipmentInspectDeviceEntity>({
  api: getEquipmentInspectPlanEqDetail,
  isPagination: false,
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
    return message.warning('请选择期间核查计划设备')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}
</script>
