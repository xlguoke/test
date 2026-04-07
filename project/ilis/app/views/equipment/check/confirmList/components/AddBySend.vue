<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="送检登记"
    :after-close="onClosed"
    :loading="loading"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <a-table
        row-key="id"
        :data-source="dataSource"
        :columns="columns"
        :loading="loading"
        :custom-row="getCustomRow()"
        :pagination="getPagination()"
        :row-selection="getRowSelection({ type: 'radio' })"
        :scroll="{
          y: '200px',
        }"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'status'">
            <span class=" inline-block w-2 h-2 rounded mr-1" :style="{ backgroundColor: CheckSendStatusDict.getColorByKey(text) }" />
            <span :style="{ color: CheckSendStatusDict.getColorByKey(text) }">{{ CheckSendStatusDict.getLabelByKey(text) }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <a-space size="small">
              <a-button
                type="link"
                size="small"
                @click="handleEdit(record as CheckSendEntity, true)"
              >
                查看
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
      <BaseTitle>设备明细表</BaseTitle>
      <a-table
        row-key="id"
        :data-source="deviceDataSource"
        :custom-row="getDeviceCustomRow()"
        :columns="addColumns.filter((item:any) => item.dataIndex !== 'operation')"
        :loading="deviceLoading"
        :pagination="getDevicePagination()"
        :row-selection="getDeviceRowSelection()"
        :scroll="{
          y: '200px',
          x: '1000px',
        }"
      />
    </a-space>
    <EditVue v-model:show="showEdit" :data="currentEdit" :is-detail="isDetail" />
  </ht-modal>
</template>

<script lang="ts" setup>
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { CheckSendEntity } from '../../checkSend'
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks'
import { addColumns, CheckSendStatus, CheckSendStatusDict } from '../../checkSend'
import { getCheckSendDetailDeviceList, getCheckSendPage } from '../../checkSend/api'
import EditVue from '../../checkSend/component/Edit.vue'
import { addEquipmentCheckConfirmBySend } from '../api'

const props = defineProps<IDialogProps<null>>()

const internalOpen = ref(true)

const formRef = ref()

const formState = ref({
  quickQryParam: '',
  status: CheckSendStatus.SENDED,
  timeRange: undefined,
})

const {
  loading,
  dataSource,
  selectedRowKeys,
  getPagination,
  getCustomRow,
  getRowSelection,
} = useTableHooks<CheckSendEntity>({
  api: getCheckSendPage,
  formRef,
  query: formState,
  sizeKey: 'rows',
})

const deviceQuery = ref({
  id: '',
})
const {
  loading: deviceLoading,
  dataSource: deviceDataSource,
  getCustomRow: getDeviceCustomRow,
  selectedRows: deviceSelectedRows,
  handleSearch: handleDeviceSearch,
  getPagination: getDevicePagination,
  getRowSelection: getDeviceRowSelection,
} = useTableHooks<CheckSendEntity>({
  api: getCheckSendDetailDeviceList,
  query: deviceQuery,
  sizeKey: 'rows',
  immediate: false,
})

const columns: ColumnsType = [
  {
    title: '登记批次号',
    dataIndex: 'batchNumber',
    ellipsis: true,
  },
  {
    title: '登记人员',
    dataIndex: 'createName',
    ellipsis: true,
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '检校单位',
    dataIndex: 'unit',
    ellipsis: true,
  },
  {
    title: '送检日期',
    dataIndex: 'sendTime',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    ellipsis: true,
    fixed: 'right',
  },
  {
    title: '送检说明',
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
  },
]

const showEdit = ref(false)

const currentEdit = ref<CheckSendEntity>()

const isDetail = ref(false)

watch(() => selectedRowKeys.value, (val) => {
  if (!val.length) {
    return
  }
  deviceQuery.value.id = val[0] as string
  handleDeviceSearch()
})

/**
 * 编辑
 */
function handleEdit(row: CheckSendEntity, detail?: boolean) {
  currentEdit.value = row
  showEdit.value = true
  isDetail.value = !!detail
}

async function handleConfirm() {
  if (!deviceSelectedRows.value.length) {
    return message.warning('请选择设备')
  }
  await addEquipmentCheckConfirmBySend(deviceSelectedRows.value)
  message.success('操作成功')
  internalOpen.value = false
  props.onConfirm(null)
}
</script>
