<!-- 资产选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    :title="title || '选择任务'"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="flex flex-col gap-3 w-full ">
      <IlisFormSearch
        :entity="TaskEntity"
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
          :entity="TaskEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
          :custom-row="getCustomRow()"
          :field-list="TaskEntity.getTableFieldList()?.filter(item => !['operation'].includes(item))"
          @change="handleSortChange"
        >
        </IlisTable>
        <BaseSelectorView
          v-if="multiple && isCacheSelect"
          :data="AnyDataTransformHelper.recordListToOptions(selectedRows, ['testTaskCode', 'id'])"
          empty-text="未选择任务"
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
import { getTestTaskList } from '~/api/test/test-task/index'
import { useTableHooks } from '~/hooks/useTableHooks'
import { TaskEntity } from '~/views/task/TaskEntity'

const props = defineProps<IDialogPropsSelector<TaskEntity>>()

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
} = useTableHooks<TaskEntity>({
  api: getTestTaskList,
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
    return message.warning('请选择任务')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function handleRemoveItem(row: IOption) {
  selectedRows.value = selectedRows.value.filter(item => item.id !== row.value)
  selectedRowKeys.value = selectedRowKeys.value.filter(item => item !== row.value)
}
</script>
