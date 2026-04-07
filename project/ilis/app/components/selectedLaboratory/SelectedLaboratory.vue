<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    width="70%"
    @cancel="cancel"
    @ok="ok"
  >
    <div ref="tableBoxRef" class="min-h-[60vh]">
      <a-table
        row-key="id"
        :columns="columns"
        :loading="loading"
        :data-source="dataSource"
        :scroll="{ y: tableHeight }"
        :row-selection="getRowSelection({
          type: multiple ? 'checkbox' : 'radio',
        })"
        :pagination="getPagination()"
        :custom-row="getCustomRow()"
      ></a-table>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { LaboratoryList } from './api'
import { cloneDeep } from '@unovis/ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getPageListApi } from './api'

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: '选择功能室',
  },
  multiple: Boolean,
})

const emit = defineEmits(['update:open', 'cancel', 'ok'])

const columns = [
  { title: '功能室名称', dataIndex: 'name' },
  { title: '基础功能', dataIndex: 'basicFuncDesc' },
  { title: '试验室责任人', dataIndex: 'labDutyPerson' },
  { title: '设备数量', dataIndex: 'equAmount' },
  { title: '备注', dataIndex: 'remark' },
]
const visible = ref(false)

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  selectedRows,
  selectedRowKeys,
  initTableHeight,
  handleReset,
  getCustomRow,
  getPagination,
  getRowSelection,
} = useTableHooks<LaboratoryList>({
  api: getPageListApi,
  immediate: false,
  responseDataTransform(res) {
    return {
      rows: res.obj.rows,
      total: res.obj.count,
    }
  },
})

watch(() => props.open, (val) => {
  visible.value = val
  if (val) {
    handleReset()
    nextTick(() => {
      initTableHeight()
    })
  }
})

function cancel() {
  visible.value = false
  emit('update:open', false)
  emit('cancel')
  selectedRowKeys.value = []
  selectedRows.value = []
}

function ok() {
  const list = cloneDeep(selectedRows.value)
  emit('ok', list)
}
</script>

<style>

</style>
