<template>
  <HtModal
    v-model:open="internalOpen"
    title="选择盘点计划"
    width="70vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    ok-text="下一步"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="EquipmentInventoryPlanEntity"
        :table-height="tableHeight"
        :pagination="getPagination()"
        :row-selection="getRowSelection({
          type: 'radio',
        })"
        :field-list="EquipmentInventoryPlanEntity.getTableFieldList().filter(item => !['operation', 'status'].includes(item))"
        :custom-row="getCustomRow"
      />
    </a-space>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentInventoryPlanEntity, EquipmentInventoryPlanStatus } from '../../plan/EquipmentInventoryPlanEntity'
import { getEquipmentInventoryPlanList } from '../../plan/api'
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps<IDialogProps<any>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
} = useTableHooks<EquipmentInventoryPlanEntity>({
  api: getEquipmentInventoryPlanList,
  payload: {
    status: EquipmentInventoryPlanStatus.APPROVE_SUCCESS,
    inventoryQuery: 1,
  },
})
/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择')
  }
  internalOpen.value = false
  props.onConfirm(selectedRows.value[0])
}
</script>
