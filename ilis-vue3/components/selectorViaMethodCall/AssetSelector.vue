<!-- 资产选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择资产'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        :entity="EquipmentAssetEntity"
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
          :entity="EquipmentAssetEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow"
          :field-list="EquipmentAssetEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
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
import { message } from 'ant-design-vue'
import { IlisFormSearch, IlisTable } from '../ilisComponent'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import type { IOption } from '~/interface/IOption'
import { EquipmentAssetEntity } from '~/views/equipment/asset/EquipmentAssetEntity'
import { getEquipmentAssetList } from '~/views/equipment/asset/api'

const props = defineProps<IDialogPropsSelector<EquipmentAssetEntity>>()

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
} = useTableHooks<EquipmentAssetEntity>({
  api: getEquipmentAssetList,
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
    return message.warning('请选择设备')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
