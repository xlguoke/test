<template>
  <div>
    <a-table
      row-key="id"
      size="middle"
      :data-source="dataSource"
      :columns="planColumns"
      :loading="loading"
      :pagination="getPagination()"
      :scroll="{
        x: '1000px',
      }"
      :row-selection="getRowSelection({ type: 'radio' })"
    />
    <BaseTitle>设备明细表</BaseTitle>
    <a-table
      row-key="id"
      size="middle"
      :data-source="deviceDataSource"
      :columns="deviceDetailCloumns"
      :loading="deviceLoading"
      :pagination="getDevicePagination()"
      :row-selection="getDeviceRowSelection()"
      :scroll="{
        x: '1000px',
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import { getDeviceByPlanId, getPlanPage } from '../api'
import type { PlanDeviceEntity, PlanEntity } from './plan'
import { deviceDetailCloumns, planColumns } from './plan'
import { useTableHooks } from '~/hooks/useTableHooks'

const {
  loading,
  dataSource,
  selectedRowKeys,
  getPagination,
  getRowSelection,
} = useTableHooks<PlanEntity>({
  api: getPlanPage,
  sizeKey: 'rows',
  // defaultPageSize: 5,
  // defaultPageSizeOptions: ['5', '10', '20', '50'],
})

/**
 * 设备明细查询参数
 */
const deviceQuery = ref({
  planId: '',
})

const {
  loading: deviceLoading,
  dataSource: deviceDataSource,
  selectedRows: deviceSelectedRows,
  handleSearch: handleDeviceSearch,
  getPagination: getDevicePagination,
  getRowSelection: getDeviceRowSelection,
} = useTableHooks<PlanDeviceEntity>({
  api: getDeviceByPlanId,
  query: deviceQuery,
  sizeKey: 'rows',
  immediate: false,
})

watch(() => selectedRowKeys.value, (_val) => {
  deviceQuery.value.planId = selectedRowKeys.value[0] as string
  handleDeviceSearch()
})

// /**
//  * # 点击计划查找对应设备明细
//  * @param row
//  */
//  :custom-row="(record) => {
//         return { onClick: () => handlePlanClick(record) }
//       }"
// function handlePlanClick(row: PlanEntity) {
//   selectedRowKeys.value = [row.id]
// }

/**
 * # 获取选中设备明细
 */
function getSeletedPlanDevice() {
  return deviceSelectedRows.value
}

// 提供给jsp页面使用
window.getSeletedPlanDevice = getSeletedPlanDevice

defineExpose({
  getSeletedPlanDevice,
})
</script>
