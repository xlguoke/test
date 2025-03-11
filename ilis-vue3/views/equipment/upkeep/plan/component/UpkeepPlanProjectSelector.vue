<template>
  <!-- 部门选择器 -->
  <ht-modal
    v-model:open="internalOpen"
    :title="title || '保养项目'"
    width="600px"
    @ok="handleConfirm"
    @cancel="internalOpen = false"
  >
    <div class="min-h-[50vh]">
      <a-space direction="vertical" style="width: 100%;">
        <a-table
          :key="formState.quickQry"
          v-model:expanded-row-keys="expandedKeys"
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
      </a-space>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { getDictByCode } from '~/api/common'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDictByBackend } from '~/interface/IDictByBackend'

const props = defineProps<IDialogPropsSelector<IDictByBackend>>()

const expandedKeys = ref<string[]>([])

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getList,
  getRowSelection,
  getCustomRow,
} = useTableHooks<any>({
  api: () => getDictByCode('eqUpkeepProject'),
  immediate: false,
  responseDataTransform: (data) => {
    data.forEach((item: any) => {
      item.id = item.typeCode
    })
    return {
      rows: data,
    }
  },
})

const formState = ref({
  quickQry: '',
})

const internalOpen = ref(true)

const columns = [
  {
    title: '保养项目',
    dataIndex: 'typeName',
    key: 'typeName',
  },
]

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择人员')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}

function init() {
  getList()
  if (props.checkedRows?.length) {
    selectedRows.value = props.checkedRows
    selectedRowKeys.value = props.checkedRows.map(d => d.typeCode)
  }
}
init()
</script>

<style lang="less" scoped>
</style>
