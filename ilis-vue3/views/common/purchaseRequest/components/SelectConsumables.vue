<template>
  <a-modal
    v-model:open="open"
    title="选择耗材"
    width="80%"
    :mask-closable="false"
    destroy-on-close
    centered
    @cancel="cancel"
  >
    <a-space class="mt-4">
      <a-input
        v-model:value.trim="queryForm.quickQryParam"
        allow-clear
        class="w-[420px]"
        placeholder="请输入耗材名称、耗材类别、型号进行查询"
      />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="h-[420px] overflow-auto mt-4">
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="dataSource"
        :row-selection="getRowSelection()"
        :pagination="getPagination()"
        :loading="loading"
        :scroll="{ y: tableHeight }"
        bordered
      />
    </div>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" @click="onSubmit">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ColumnType } from 'ant-design-vue/es/table'
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useTableHeight } from '~/hooks/useTableHeight.ts'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import type {
  ConsumablesDataItem,
  ConsumablesListParams,
} from '~/views/common/purchaseRequest/api.ts'
import {
  getConsumablesList,
} from '~/views/common/purchaseRequest/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSelect'])

const columns: ColumnType[] = [
  { title: '管理编号', dataIndex: 'sn', width: 220 },
  { title: '所属部门', dataIndex: 'depart', width: 220 },
  { title: '耗材名称', dataIndex: 'name', width: 220 },
  { title: '型号', dataIndex: 'standard', width: 220 },
  { title: '耗材类别', dataIndex: 'type', width: 220 },
  { title: '存放地点', dataIndex: 'site', width: 220 },
  { title: '保管人', dataIndex: 'managerName', width: 120 },
  { title: '核查人', dataIndex: 'auditPersonName', width: 120 },
  { title: '库存数量', dataIndex: 'amount', width: 120 },
  { title: '库存告警数量', dataIndex: 'inventoryAlarmAmount', width: 120 },
]

const open = computed(() => props.open)

const { tableHeight, tableBoxRef } = useTableHeight()

const queryForm = ref<ConsumablesListParams>({})

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
  getRowSelection,
  selectedRowKeys,
  selectedRows,
} = useTableHooks<ConsumablesDataItem>({
  api: getConsumablesList,
  query: queryForm,
  immediate: false,
  sizeKey: 'rows',
})

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    handleSearch()
  }
})

function onSubmit() {
  if (!selectedRows.value.length) {
    message.warn('请选择数据！')
    return
  }

  emits('onSelect', unref(selectedRows.value))
  cancel()
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)

  queryForm.value = {}
  selectedRows.value = []
  selectedRowKeys.value = []
}
</script>
