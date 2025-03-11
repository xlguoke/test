<!-- 重复规程 -->
<template>
  <a-modal
    v-model:open="visible"
    title="检测到重复规程"
    width="1000px"
  >
    <a-alert message="提示" type="info" show-icon>
      <template #description>
        <div>
          <p>如果需要合并规程，请在以下重复规程数据中选择其中一条，系统自动将其它未选中的重复数据合并为您选择的数据</p>
          <p>当数据量较大时，合并操作将会比较耗时，请耐心等待</p>
        </div>
      </template>
    </a-alert>
    <a-divider />
    <a-table
      :row-selection="radioRow"
      :columns="columns"
      :data-source="duplicateStandards"
      :pagination="false"
      bordered
      row-key="id"
    />
    <template #footer>
      <a-button @click="handleDuplicateCancel">
        取消
      </a-button>
      <a-button :loading="mergeLoading" @click="handleDuplicateMerge(false)">
        仅合并
      </a-button>
      <a-button
        key="submit"
        type="primary"
        :loading="mergeLoading"
        @click="handleDuplicateMerge(true)"
      >
        合并后继续同步
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { type MergeStandard, mergeStandardApi, syncBaseStandardApi } from '../api'

const emits = defineEmits<{
  (e: 'success', isAsync?: boolean): void
}>()

const columns = [
  { title: '规程名称', dataIndex: 'standardName' },
  { title: '颁布号', dataIndex: 'publishCode' },
  { title: '执行日期', dataIndex: 'executeDate' },
  { title: '过期日期', dataIndex: 'expireDate' },
]

const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<MergeStandard[]>([])
const radioRow: any = {
  type: 'radio',
  hideDefaultSelections: false,
  onChange: (keys: string[], rows: MergeStandard[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  },
}

const visible = ref(false)
const loading = ref(false)
const mergeLoading = ref(false)
const duplicateStandards = ref<MergeStandard[]>([])

/**
 * ## 同步基础规程
 */
async function syncBaseStandard() {
  loading.value = true
  try {
    const { data } = await syncBaseStandardApi()
    if (data.success) {
      message.success('同步系统规程成功')
      visible.value = false
      emits('success')
      return
    }
    throw data
  }
  catch (err) {
    console.error(err)
    loading.value = false
  }
}

function handleDuplicateCancel() {
  visible.value = false
  selectedRowKeys.value = []
  selectedRows.value = []
}

/**
 * ## 合并
 */
async function handleDuplicateMerge(isAsync: boolean) {
  if (selectedRows.value.length === 0) {
    message.warning('请选择一条需要合并的规程数据')
    return
  }
  const mergeTo = selectedRows.value[0]
  const mergedStandards = duplicateStandards.value.filter(s => s.id !== mergeTo.id)
  mergeLoading.value = true
  try {
    await mergeStandardApi({ mergeTo, mergedStandards })
    emits('success', isAsync)
    visible.value = false
    selectedRows.value = []
    message.success(`合并成功${isAsync ? '，开始继续同步规程' : ''}`)
  }
  finally {
    mergeLoading.value = false
  }
}

function showModal(datas: any) {
  visible.value = true
  duplicateStandards.value = datas
}

defineExpose({
  showModal,
  syncBaseStandard,
})
</script>

 <style>

 </style>
