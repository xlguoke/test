<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="选择检校计划"
    :after-close="onClosed"
    ok-text="确认下载"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
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
            type: 'radio',
          })"
          :custom-row="getCustomRow()"
          :field-list="EquipmentCheckPlanEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
          @change="handleSortChange"
        >
        </IlisTable>
      </div>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getCheckPlanList } from '../../plan/api'
import { EquipmentCheckPlanEntity } from '../../plan/EquipmentCheckPlanEntity'

defineProps<IDialogProps<null>>()

const internalOpen = ref(true)

const {
  loading,
  dataSource,
  selectedRows,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSortChange,
} = useTableHooks<EquipmentCheckPlanEntity>({
  api: getCheckPlanList,
  sizeKey: 'rows',
})

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择计划')
  }
  window.open(`/ilis2/checkController?downloadCheckPlanTemp=&checkPlanId=${selectedRows.value?.[0]?.id}`)
  internalOpen.value = false
}
</script>
