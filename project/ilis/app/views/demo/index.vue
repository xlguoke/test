<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentInventoryPlanEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <div>
        <a-button @click="handleOpen">
          打开弹窗
        </a-button>
      </div>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentInventoryPlanEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button>xx</a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getCheckSendPage } from '../equipment/check/checkSend/api'
import DialogDemo from './DialogDemo.vue'
import { EquipmentInventoryPlanEntity } from './EquipmentInventoryPlanEntity'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<EquipmentInventoryPlanEntity>({
  api: getCheckSendPage,
  sizeKey: 'rows',
})

async function handleOpen() {
  const res = await AnyDialogHelper.showModel(DialogDemo, dataSource.value)
  return res
  // console.log('弹窗返回值：', res)
}
</script>

<style>

</style>
