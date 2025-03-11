<template>
  <HtModal
    v-model:open="showDialog"
    tiled-level
    :after-close="onClosed"
    @ok="onConfirm(selectedRows);showDialog = false"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="EquipmentInventoryPlanEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <IlisTable
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :entity="EquipmentInventoryPlanEntity"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
      >
        <template #bodyCell="{ column }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button>xx</a-button>
          </template>
        </template>
      </IlisTable>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import { getCheckSendPage } from '../equipment/check/checkSend/api'
import { EquipmentInventoryPlanEntity } from './EquipmentInventoryPlanEntity'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
/** 带参数的弹窗props */
const props = defineProps<IDialogPropsParam<EquipmentInventoryPlanEntity[], any>>()

// /** 不带参数的弹窗props */
// const props = defineProps<IDialogProps<EquipmentInventoryPlanEntity[]>>()

const {
  loading,
  dataSource,
  selectedRows,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<EquipmentInventoryPlanEntity>({
  api: getCheckSendPage,
  sizeKey: 'rows',
})

const showDialog = ref(false)

// console.log('弹窗收到的参数：', props.param)
function keep() {
  return props
}
keep()
onMounted(() => {
  showDialog.value = true
})
</script>

<style>

</style>
