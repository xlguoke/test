<!-- 重复规程 -->
<template>
  <ht-modal
    v-model:open="visible"
    title="合并规程"
    width="1000px"
    :confirm-loading="loading"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <div class="min-h-[50vh] pb-5">
      <a-alert
        v-if="sysOrUser"
        show-icon
        message="您选择了系统规程和非系统规程进行合并，为确保规程的准确性，非系统规程将不能被选择（禁用）保留！"
        type="info"
        class="px-3 py-2 mb-3"
      />

      <BaseTitle class="my-3">
        选择保留的规程
      </BaseTitle>
      <a-table
        :row-selection="radioRow"
        :columns="columns"
        :data-source="standardDatas"
        :pagination="false"
        bordered
        row-key="id"
        :custom-row="getCustomRow"
      >
        <template #bodyCell="{ column, text, index }">
          <template v-if="column.dataIndex === 'type'">
            {{ STANDARD_TYPE_DICT.getLabelByKey(text) }}
          </template>
          <template v-else-if="column.dataIndex === 'sourceType'">
            {{ SOURCE_TYPE.SYS === text ? '是' : '否' }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <div @click.stop="() => {}">
              <a-button type="link" danger @click="removeRow(index)">
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>

      <BaseTitle class="my-3">
        历史委托同步更新
      </BaseTitle>
      <a-alert
        show-icon
        message="若您需要更新历史委托中规程信息，请选择委托日期范围进行更新；若不需要更新，请不要选择！"
        type="info"
        class="px-3 py-2 mb-3"
      />
      <a-form layout="inline" :label-col="{ style: { width: '120px' } }">
        <a-form-item label="委托起始日期">
          <a-date-picker
            v-model:value="formState.consignStartDate"
            placeholder="请选择委托起始日期"
            value-format="YYYY-MM-DD"
            class="w-[200px]"
          />
        </a-form-item>
        <a-form-item label="委托截止日期">
          <a-date-picker
            v-model:value="formState.consignEndDate"
            placeholder="请选择委托起始日期"
            value-format="YYYY-MM-DD"
            class="w-[200px]"
          />
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { DataSource } from '../api'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { SOURCE_TYPE, STANDARD_TYPE_DICT } from '~/types/standard'
import { handMergeStandardApi } from '../api'

const emits = defineEmits<{
  (e: 'success', isAsync?: boolean): void
}>()

const columns = [
  { title: '规程名称', dataIndex: 'standardName' },
  { title: '颁布号', dataIndex: 'publishCode' },
  { title: '规程类型', dataIndex: 'type' },
  { title: '是否系统规程', dataIndex: 'sourceType' },
  { title: '操作', dataIndex: 'action', width: 80 },
]

const visible = ref(false)
const loading = ref(false)
const standardDatas = ref<DataSource[]>([])
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<DataSource[]>([])
const formState = ref({
  consignStartDate: '',
  consignEndDate: '',
})

/**
 * 是否存在非系统规程
 */
const sysOrUser = computed(() => {
  const sys = standardDatas.value.some(d => d.sourceType === SOURCE_TYPE.SYS)
  const user = standardDatas.value.some(d => d.sourceType === SOURCE_TYPE.USER)
  return sys && user
})
const radioRow: any = {
  type: 'radio',
  selectedRowKeys,
  onChange: (keys: string[], rows: DataSource[]) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
  },
  getCheckboxProps: (row: DataSource) => ({
    disabled: sysOrUser.value && row.sourceType !== SOURCE_TYPE.SYS,
  }),
}
/**
 * 点击行选择事件
 */
function getCustomRow(record: DataSource) {
  return {
    onClick: () => {
      if (sysOrUser.value && record.sourceType !== SOURCE_TYPE.SYS)
        return
      selectedRowKeys.value = [record.id]
      selectedRows.value = [record]
    },
  }
}

/** 删除行 */
function removeRow(ind: number) {
  const item = standardDatas.value[ind]
  if (item.id === selectedRowKeys.value[0]) {
    selectedRowKeys.value = []
    selectedRows.value = []
  }
  standardDatas.value.splice(ind, 1)
}

function handleCancel() {
  visible.value = false
  selectedRowKeys.value = []
  selectedRows.value = []
  formState.value = {
    consignStartDate: '',
    consignEndDate: '',
  }
}

/**
 * ## 合并
 */
async function handleOk() {
  if (selectedRows.value.length === 0) {
    message.warning('请选择一条需要合并的规程数据')
    return
  }
  try {
    loading.value = true
    const mergeRows = standardDatas.value.filter(s => s.id !== selectedRowKeys.value[0])
    await handMergeStandardApi({
      reservedStandardId: selectedRowKeys.value[0],
      abandonedStandardIds: mergeRows.map(s => s.id),
      ...formState.value,
    })
    emits('success')
    handleCancel()
    message.success('合并成功')
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}

function showModal(datas: any) {
  loading.value = false
  visible.value = true
  standardDatas.value = datas
}

defineExpose({
  showModal,
})
</script>

 <style>

 </style>
