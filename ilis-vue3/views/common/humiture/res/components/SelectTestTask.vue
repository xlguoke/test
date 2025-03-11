<template>
  <a-modal
    v-model:open="open"
    title="选择试验任务"
    width="80%"
    :mask-closable="false"
    destroy-on-close
    centered
    @cancel="cancel"
  >
    <a-space class="mt-4">
      <a-input v-model:value.trim="quickQryParam" class="w-[420px]" placeholder="输入任务编号/记录编号/报告编号/样品编号/样品名称后回车即可查询" />
      <a-button @click="handleSearch">
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
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import { getTestTask } from '~/views/common/humiture/res/api/getTestTask.ts'

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
  { title: '任务编号', dataIndex: 'testTaskCode', width: 220 },
  { title: '记录编号', dataIndex: 'testRecordCode', width: 220 },
  { title: '报告编号', dataIndex: 'reportCode', width: 220, ellipsis: true },
  { title: '样品编号', dataIndex: 'testObjectCode', width: 220 },
  { title: '样品名称', dataIndex: 'testSampleDisplayName', width: 220 },
  { title: '检测参数', dataIndex: 'testObjectParam', width: 320 },
  { title: '工程项目', dataIndex: 'projectNames', width: 220 },
  { title: '检测人员', dataIndex: 'testUser', width: 220 },
  { title: '检测时间', dataIndex: 'testTime', width: 220 },
]

const open = computed(() => props.open)

const { tableHeight, tableBoxRef } = useTableHeight()

const quickQryParam = ref('')

const loading = ref(false)

const total = ref(0)

const rows = ref(10)

const page = ref(1)

const dataSource = ref([])

const selectedRowKeys = ref<string[]>([])

const selectedRows = ref([])

watch(open, (val) => {
  if (!val) {
    cancel()
  }
  else {
    handleSearch()
  }
})

function getPagination() {
  return {
    total: total.value,
    pageSize: rows.value,
    current: page.value,
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条数据`,
    onChange: (p: number, r: number) => {
      page.value = p
      rows.value = r
      getList()
    },
    pageSizeOptions: ['10', '20', '50', '100'],
  }
}

function getRowSelection() {
  return {
    type: 'radio',
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows: TestTaskDataItem[]) => {
      selectedRows.value = rows
      selectedRowKeys.value = keys
    },
  }
}

function handleSearch() {
  page.value = 1
  getList()
}

async function getList() {
  loading.value = true
  const res = await getTestTask({
    type: 1,
    queryScope: 'user',
    dataType: 1,
  }, {
    page: page.value,
    rows: rows.value,
    quickQryParam: quickQryParam.value,
  }).finally(() => {
    loading.value = false
  })

  dataSource.value = res.data.rows
  total.value = res.data.total
}

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

  selectedRows.value = []
  selectedRowKeys.value = []
}
</script>
