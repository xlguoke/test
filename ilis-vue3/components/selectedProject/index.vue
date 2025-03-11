<template>
  <ht-modal
    v-model:open="visible"
    :title="title"
    width="70%"
    @cancel="cancel"
    @ok="ok"
  >
    <IlisFormSearch
      :entity="ProjectEntity"
      @search="handleSearch"
      @reset="handleReset"
    />
    <div ref="tableBoxRef" class="h-[60vh] mt-2">
      <IlisTable
        row-key="id"
        :entity="ProjectEntity"
        :data-source="dataSource"
        :loading="loading"
        :table-height="tableHeight"
        :row-selection="getRowSelection({
          type: multiple ? 'checkbox' : 'radio',
        })"
        :pagination="getPagination()"
        :custom-row="getCustomRow"
      />
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import { cloneDeep } from '@unovis/ts'
import { type ProjectData, getPageListApi } from './api'
import { ProjectEntity } from '.'
import { useTableHooks } from '~/hooks/useTableHooks'

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: '选择工程项目',
  },
  multiple: Boolean,
  /**
   * # 查询时额外携带的参数
   */
  payload: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:open', 'cancel', 'ok'])

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
  handleSearch,
  getCustomRow,
  getPagination,
  getRowSelection,
} = useTableHooks<ProjectData>({
  api: getPageListApi,
  immediate: false,
  payload: props.payload,
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
