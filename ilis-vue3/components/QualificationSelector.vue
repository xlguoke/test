<template>
  <ht-modal
    :open="internalOpen"
    width="640px"
    title="选择资质"
    @cancel="handleCancel"
  >
    <a-table
      row-key="id"
      bordered
      :loading="loading"
      :columns="columns"
      :data-source="dataSource"
      :pagination="getPagination()"
      :row-selection="getRowSelection({
        type: multiple ? 'checkbox' : 'radio',
      })"
      :scroll="{ y: 450 }"
      :custom-row="getCustomRow"
    />
    <template #footer>
      <a-button @click="handleCancel()">
        取消
      </a-button>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import type { PropType } from 'vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getQualification } from '~/views/consign/component/selectSample/api.ts'
import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  open: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否可以多选
   */
  multiple: {
    type: Boolean,
    default: true,
  },
  /**
   * 已选数据，用于回显
   */
  selected: {
    type: Array as PropType<QualificationEntity[] | string[]>,
    default: () => ([]),
  },
})

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'onSelect', value: QualificationEntity[]): void
}>()

const columns: ColumnType[] = [
  {
    title: '资质类型',
    dataIndex: 'name',
  },
]

const internalOpen = computed(() => props.open)

const selected = computed(() => props.selected)

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
} = useTableHooks<QualificationEntity>({
  api: getQualification,
  isPagination: false,
  immediate: false,
  responseDataTransform: (res: QualificationEntity[]) => {
    initSelected(res)

    return {
      rows: res,
      total: res.length,
    }
  },
})

watch(() => props.open, (val) => {
  if (val) {
    handleSearch()
  }
})

// 回显已选项
function initSelected(data: QualificationEntity[]) {
  if (selected.value) {
    selected.value.forEach((item: QualificationEntity | string) => {
      let id = null
      if (typeof (item) === 'string') {
        id = item
      }
      else {
        id = item.id
      }

      const dataItem = data.find(i => i.id === id)
      if (dataItem) {
        selectedRowKeys.value.push(dataItem.id)
        selectedRows.value.push(dataItem)
      }
    })
  }
}

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择资质')
  }

  emits('onSelect', selectedRows.value)
  handleCancel()
}

/**
 * # 取消
 */
function handleCancel() {
  emits('update:open', false)
  selectedRows.value = []
  selectedRowKeys.value = []
}
</script>
