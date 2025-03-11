<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择设备'"
    @cancel="internalOpen = false"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="UpkeepPlanDeviceSelectorEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #departId="{ data }">
          <BaseSelectDepart
            v-model="data.departId"
            @change="nextTick(() => handleSearch(data))"
          ></BaseSelectDepart>
        </template>
      </IlisFormSearch>
      <IlisTable
        row-key="id"
        :loading="loading"
        :entity="UpkeepPlanDeviceSelectorEntity"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection({
          type: multiple ? 'checkbox' : 'radio',
        })"
        :table-height="tableHeight"
        :custom-row="getCustomRow"
        @change="handleSortChange"
      />
    </a-space>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { getEquipmentSelectList } from '../api'
import { UpkeepPlanDeviceSelectorEntity } from '../UpkeepPlanDeviceSelectorEntity'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { BaseSelectDepart } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps<IDialogPropsSelector<UpkeepPlanDeviceSelectorEntity>>()

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
} = useTableHooks<UpkeepPlanDeviceSelectorEntity>({
  api: getEquipmentSelectList,
  sizeKey: 'rows',
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
</script>
