<template>
  <a-modal
    v-model:open="internalOpen"
    :title="title"
    centered
    width="80%"
    :keyboard="false"
    :mask-closable="false"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="TrainPlanEntity"
        :field-list="['quickQryParam']"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <IlisTable
        row-key="id"
        show-index
        :loading="loading"
        :data-source="dataSource"
        :entity="TrainPlanEntity"
        :pagination="getPagination()"
        :field-list="['theme', 'trainTime', 'address', 'lecturer', 'trainObject', 'createName', 'createDate']"
        :row-selection="
          getRowSelection({
            type: multiple ? 'checkbox' : 'radio',
          })"
        @change="handleSortChange"
      >
      </IlisTable>
    </a-space>
  </a-modal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { getTrainPlanPage } from '~/views/common/train/plan/api'
import { TrainPlanEntity, TrainPlanStatus } from '~/views/common/train/plan/TrainPlanEntity'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否可以多选
   */
  multiple: {
    type: Boolean,
    default: false,
  },
  /**
   * 已选中的ID列表
   */
  checkedIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  /**
   * 标题
   */
  title: {
    type: String,
    default: '请选择培训计划',
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: TrainPlanEntity[]): void
  (e: 'cancel'): void
}>()

const {
  loading,
  dataSource,
  getList,
  selectedRows,
  selectedRowKeys,
  getRowSelection,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
} = useTableHooks<TrainPlanEntity>({
  api: getTrainPlanPage,
  immediate: false,
  payload: { status: TrainPlanStatus.APPROVED },
})

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
  if (val) {
    init()
  }
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择培训计划')
  }
  emits('confirm', selectedRows.value)
  handleReset()
}

/**
 * # 取消
 */
function handleCancel() {
  emits('cancel')
  handleReset()
}

function init() {
  getList()
  if (props.checkedIds?.length) {
    selectedRowKeys.value = props.checkedIds
  }
}
</script>

<style lang="less" scoped>
</style>
