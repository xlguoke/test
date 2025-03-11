<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    title="检校参数"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-button type="primary" @click="handleConfirm()">
        确定
      </a-button>
      <a-button @click="handleCancel()">
        取消
      </a-button>
    </template>
    <a-space direction="vertical" style="width: 100%;">
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
      />
    </a-space>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { ColumnType } from 'ant-design-vue/es/table'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IParamsEntity } from '~/interface/IParamsEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

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
   * 设备ID，传入后查询指定设备的参数列表
   */
  deviceId: {
    type: String,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: IParamsEntity[]): void
  (e: 'cancel'): void
}>()

const columns: ColumnType[] = [
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    ellipsis: true,
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '所属科室',
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '检校项目/参数',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '技术要求',
    dataIndex: 'skillLimit',
    ellipsis: true,
  },
  {
    title: '备注说明',
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '检校周期',
    dataIndex: 'checkPeriod',
    ellipsis: true,
  },

  {
    title: '前次检校日期',
    dataIndex: 'preCheckDate',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '下次检校日期',
    dataIndex: 'nextCheckDate',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '检校类型',
    dataIndex: 'checkType',
    ellipsis: true,
  },
  {
    title: '检校依据',
    dataIndex: 'checkReference',
    ellipsis: true,
  },
  {
    title: '检校单位',
    dataIndex: 'checkUnit',
    ellipsis: true,
  },
]

const formRef = ref<FormExpose>()

const formState = ref({
  quickQryParam: '',
  eqDepartId: undefined,
})

const internalOpen = ref(props.show)

const {
  loading,
  dataSource,
  selectedRows,
  selectedRowKeys,
  getList,
  getPagination,
  getRowSelection,
} = useTableHooks<IParamsEntity>({
  api: getParamsListByDeviceId,
  formRef,
  query: formState,
  immediate: false,
  sizeKey: 'rows',
})

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
 * # 通过设备ID获取参数列表
 */
function getParamsListByDeviceId(obj: string) {
  return ilisAxios.postForm<any>(`/rest/checkItemController.do?datagrid&objId=${props.deviceId}`, obj)
}

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择参数')
  }
  emits('confirm', selectedRows.value)
  reset()
}

/**
 * # 取消
 */
function handleCancel() {
  internalOpen.value = false
  emits('cancel')
  reset()
}

/**
 * # 重置
 */
function reset() {
  formRef.value?.resetFields()
  selectedRowKeys.value = []
  selectedRows.value = []
}

function init() {
  getList()
  if (props.checkedIds?.length) {
    selectedRowKeys.value = props.checkedIds
  }
}
</script>
