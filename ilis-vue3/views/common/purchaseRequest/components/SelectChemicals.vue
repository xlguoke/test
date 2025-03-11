<template>
  <a-modal
    v-model:open="open"
    title="选择化学品"
    width="80%"
    :mask-closable="false"
    destroy-on-close
    centered
    @cancel="cancel"
  >
    <a-space class="mt-4">
      <a-input
        v-model:value.trim="queryForm.quickQry"
        allow-clear
        class="w-[420px]"
        placeholder="请输入化学名称、化学名称编号进行查询"
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
  ChemicalDataItem,
  ChemicalListParams,
} from '~/views/common/purchaseRequest/api.ts'
import {
  getChemicalList,
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
  { title: '化学名称', dataIndex: 'name', width: '10%' },
  { title: '化学名称编号', dataIndex: 'sn', width: '10%' },
  { title: '所属类别', dataIndex: 'chemicalType', width: '10%' },
  { title: '管理级别', dataIndex: 'manageLevel', width: '10%' },
  { title: '用途', dataIndex: 'effect', width: '10%' },
  { title: '纯度', dataIndex: 'purity', width: '10%' },
  { title: '浓度', dataIndex: 'concentration', width: '10%' },
  { title: '计量单位', dataIndex: 'unit', width: '10%' },
  { title: '可支配库存', dataIndex: 'amount', width: '10%' },
  { title: '预警数量', dataIndex: 'warningAmount', width: '10%' },
]

const open = computed(() => props.open)

const { tableHeight, tableBoxRef } = useTableHeight()

const queryForm = ref<ChemicalListParams>({})

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
  getRowSelection,
  selectedRowKeys,
  selectedRows,
} = useTableHooks<ChemicalDataItem>({
  api: getChemicalList,
  query: queryForm,
  immediate: false,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.count,
    }
  },
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
