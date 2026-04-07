<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    :title="title || '选择设备'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        :entity="DeviceEntity"
        :init-data="initData"
        @search="handleSearch"
        @reset="handleReset"
      >
      </IlisFormSearch>
      <div class="flex gap-3 w-full">
        <IlisTable
          class="flex-1 w-0"
          row-key="id"
          :loading="loading"
          :entity="DeviceEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :field-list="DeviceEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
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
import { getDeviceList, getDeviceListByIds } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { BaseSelectorView } from '../UI'

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
  isCacheSelect: props.isCacheSelect,
  payload: props?.payload,
  immediate: !props.unImmediate,
})

async function init() {
  if (props.checkedRows?.length) {
    selectedRowKeys.value = props.checkedRows.map(d => d.id)
    const { data } = await getDeviceListByIds(selectedRowKeys.value as string[])
    selectedRows.value = data
  }
}

init()

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
