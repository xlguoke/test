<template>
  <IlisTable
    row-key="id"
    :loading="loading"
    :entity="DeviceEntity"
    :data-source="dataSource"
    :pagination="false"
    :row-selection="getRowSelection()"
    :custom-row="getCustomRow"
    :field-list="DeviceEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
    @change="handleSortChange"
  />
</template>

<script lang="ts" setup>
import { useTableHooks } from '~/hooks/useTableHooks'
import { getSubDeviceList } from '~/api/common'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'

const props = defineProps<{
  mainDevice: DeviceEntity
  isSelectAll: boolean
}>()

const emits = defineEmits<{
  (e: 'change', data: { id: string, value: DeviceEntity[] }): void
}>()

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getRowSelection,
  getCustomRow,
  handleSortChange,
} = useTableHooks<DeviceEntity>({
  api: () => getSubDeviceList(props.mainDevice.id),
  responseDataTransform: (res) => {
    return {
      rows: res,
      total: res.length,
    }
  },
})

watchEffect(() => {
  if (props.isSelectAll) {
    selectedRows.value = [...dataSource.value]
    selectedRowKeys.value = dataSource.value.map(item => item.id)
  }
  else {
    selectedRows.value = []
    selectedRowKeys.value = []
  }
})

watch(() => selectedRows.value, () => {
  emits('change', { id: props.mainDevice?.id, value: selectedRows.value })
}, {
  deep: true,
})
</script>
