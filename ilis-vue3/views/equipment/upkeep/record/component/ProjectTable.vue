<template>
  <a-table
    :key="formState.quickQry"
    bordered
    row-key="typeCode"
    :loading="loading"
    :columns="columns"
    :pagination="false"
    :data-source="dataSource"
    :custom-row="getCustomRow"
    :row-selection="
      getRowSelection({
        type: multiple ? 'checkbox' : 'radio',
      })"
    :scroll="{ y: '60vh' }"
  />
</template>

<script lang="ts" setup>
import { getDictByCode } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDictByBackend } from '~/interface/IDictByBackend'

const props = defineProps<{
  multiple?: boolean
  checkedRows?: IDictByBackend[]
}>()

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getRowSelection,
  getCustomRow,
} = useTableHooks<any>({
  api: () => getDictByCode('eqUpkeepProject'),
  responseDataTransform: (data) => {
    data.forEach((item: any) => {
      item.id = item.typeCode
    })
    return {
      rows: data,
    }
  },
})

if (props.checkedRows?.length) {
  selectedRows.value = props.checkedRows
  selectedRowKeys.value = props.checkedRows.map(d => d.typeCode)
}

const formState = ref({
  quickQry: '',
})

const columns = [
  {
    title: '保养项目',
    dataIndex: 'typeName',
    key: 'typeName',
  },
]

function getData() {
  return selectedRows.value
}

defineExpose({
  getData,
})
</script>
