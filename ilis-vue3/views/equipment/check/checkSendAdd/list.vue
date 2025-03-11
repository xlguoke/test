<template>
  <AppProvider>
    <a-card style="width: 100%">
      <a-space direction="vertical" style="width: 100%;">
        <a-table
          row-key="id"
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          :pagination="getPagination()"
          :row-selection="getRowSelection({ type: 'radio' })"
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
          :columns="addColumns"
          :loading="deviceLoading"
          :pagination="getDevicePagination()"
          :row-selection="getDeviceRowSelection()"
          :scroll="{
            x: '1000px',
          }"
        />
      </a-space>
    </a-card>
    <EditVue v-model:show="showEdit" :data="currentEdit" :is-detail="isDetail" />
  </AppProvider>
</template>

<script lang="ts" setup>
import { type CheckSendEntity, CheckSendStatus, CheckSendStatusDict, addColumns } from '../checkSend'
import { getCheckSendDetailDeviceList, getCheckSendPage } from '../checkSend/api'
import EditVue from '../checkSend/component/Edit.vue'
import { columns } from './index'
import { useTableHooks } from '~/hooks/useTableHooks'

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

const showEdit = ref(false)

const currentEdit = ref<CheckSendEntity>()

const isDetail = ref(false)

watch(() => selectedRowKeys.value, (val) => {
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

function getCheckSendAddData() {
  return deviceSelectedRows.value
}

// /**
//  * # 点击送检记录查找对应设备明细
//  * @param row
//  */
//  :custom-row="(record) => {
//             return { onClick: () => handleRowClick(record) }
//           }"
// function handleRowClick(row: CheckSendEntity) {
//   selectedRowKeys.value = [row.id]
// }

window.getCheckSendAddData = getCheckSendAddData
</script>

<style>

</style>
