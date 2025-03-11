<!-- 设备保养计划选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择计划'"
    ok-text="下一步"
    @cancel="internalOpen = false"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisTable
        row-key="id"
        :loading="loading"
        :entity="EquipmentUpkeepPlanEntity"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection({
          type: multiple ? 'checkbox' : 'radio',
        })"
        :field-list="['sn', 'name', 'count', 'type', 'planYear', 'explains', 'creator', 'createDate']"
        :field-order="['sn', 'name', 'count', 'type', 'planYear', 'explains', 'creator', 'createDate']"
        :table-height="tableHeight"
        :custom-row="getCustomRow"
        @change="handleSortChange"
      />
    </a-space>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { EquipmentUpkeepPlanEntity, EquipmentUpkeepPlanStatus } from '~/views/equipment/upkeep/plan/EquipmentUpkeepPlanEntity'
import { getEquipmentUpkeepPlanList } from '~/views/equipment/upkeep/plan/api'

const props = defineProps<IDialogPropsSelector<EquipmentUpkeepPlanEntity>>()

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
} = useTableHooks<EquipmentUpkeepPlanEntity>({
  api: getEquipmentUpkeepPlanList,
  sizeKey: 'rows',
  payload: {
    status: EquipmentUpkeepPlanStatus.APPROVE_SUCCESS,
  },
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
    return message.warning('请选择计划')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}
</script>
