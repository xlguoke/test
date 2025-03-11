<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择设备'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="DeviceEntity"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #eqDepartId="{ data }">
          <BaseSelectDepart v-model="data.eqDepartId" />
        </template>
      </IlisFormSearch>
      <IlisTable
        row-key="id"
        :loading="loading"
        :entity="DeviceEntity"
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
import { IlisFormSearch, IlisTable } from '../ilisComponent'
import { BaseSelectDepart } from '../UI'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { getDeviceList } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'

const props = defineProps<IDialogPropsSelector<DeviceEntity>>()

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
} = useTableHooks<DeviceEntity>({
  api: getDeviceList,
  sizeKey: 'rows',
  payload: props.customParams?.payload,
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
