<template>
  <a-modal
    v-model:open="visible"
    title="应用到其他评定标准"
    width="460px"
    :mask-closable="false"
    :keyboard="false"
    centered
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-table
      bordered
      row-key="uniqueKey"
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :row-selection="getRowSelection()"
      :scroll="{ y: 320 }"
      children-column-name="notChildren"
    />
  </a-modal>
</template>

<script setup lang='ts'>
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { message } from 'ant-design-vue'
import type { DataSource } from '~/views/unit-config/standard/api.ts'

const props = defineProps({
  dataSource: {
    type: Array as PropType<DataSource[]>,
    default: () => [],
  },
})

const columns: ColumnType[] = [
  { title: '规程名称', dataIndex: 'standardName' },
]

const visible = ref(false)

const dataSource = computed(() => props.dataSource)

const selectedRowKeys = ref<string[]>([])

const resolveFn = ref()

function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[]) => {
      selectedRowKeys.value = keys
    },
  }
}

function open() {
  return new Promise((resolve) => {
    resolveFn.value = resolve
    visible.value = true
  })
}

// 关闭弹窗
function onCancel() {
  visible.value = false
  resolveFn.value(false)
}

async function onOk() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选数据！')
    return
  }

  resolveFn.value(selectedRowKeys.value)
  visible.value = false
}

defineExpose({
  open,
})
</script>
