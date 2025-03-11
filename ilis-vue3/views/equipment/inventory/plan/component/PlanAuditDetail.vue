<template>
  <IlisContainer app-id="inventory_plan_audit_detail">
    <div class="pr-3">
      <BaseTitle>盘点基础信息</BaseTitle>
      <IlisForm
        :key="Date.now()"
        ref="ilisFormRef"
        :cols="2"
        :entity="EquipmentInventoryPlanEntity"
        :init-data="initData"
        disabled
        :field-order="['inventoryName']"
        :label-col="{
          style: { width: '120px' },
        }"
      >
        <template #inventorySn="{ data }">
          <a-input v-model:value="data.inventorySn" disabled placeholder="保存后自动生成"></a-input>
        </template>
      </IlisForm>
      <BaseTitle>盘点设备</BaseTitle>
      <a-space direction="vertical">
        <IlisFormSearch
          :entity="DeviceEntity"
          :field-list="['departId', 'quickQryParam']"
          :field-order="['departId', 'quickQryParam']"
          @reset="handleReset"
          @search="handleSearch"
        >
          <template #departId="{ data }">
            <a-tree-select
              v-model:value="data.departId"
              style="width: 240px"
              :tree-data="treeData"
              :field-names="{
                label: 'text',
                value: 'id',
              }"
              allow-clear
              placeholder="请选择组织机构"
              tree-node-filter-prop="text"
              @change="nextTick(() => handleSearch(data))"
            />
          </template>
        </IlisFormSearch>
        <IlisTable
          row-key="id"
          show-index
          :entity="DeviceEntity"
          :field-list="['name', 'equipmentSn', 'assetSn', 'standard', 'buyDate', 'departName']"
          :data-source="dataSource"
          :pagination="getPagination()"
        >
        </IlisTable>
      </a-space>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { EquipmentInventoryPlanEntity } from '../EquipmentInventoryPlanEntity'
import { getEquipmentInventoryPlanDetail, getEquipmentInventoryPlanEqDetail } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import { BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import { getOrgComboTree } from '~/api/common'

const initData = ref<EquipmentInventoryPlanEntity>()

const ilisFormRef = ref<IlisFormExpose<EquipmentInventoryPlanEntity>>()

const selData = ref([] as DeviceEntity[])

const treeData = ref<IDepartmentEntity[]>([])

const {
  dataSource,
  getList,
  getPagination,
  handleSearch,
  handleReset,
} = useLocalTableHooks<DeviceEntity>({
  dataSource: selData,
  immediate: false,
  quickQueryMap: ['quickQryParam', ['name', 'equipmentSn']],
})

const urlParams = new URLSearchParams(location.search)

const id = urlParams.get('id')

async function init() {
  getTreeData()
  if (id) {
    const data = EquipmentInventoryPlanEntity.fromJSON({
      id,
    })
    // 盘点计划基础信息详情
    getBaseData(data)
    // 盘点计划设备详情
    getDeviceList(data)
  }
}
init()

/**
 * 盘点计划基础信息详情
 */
async function getBaseData(query: EquipmentInventoryPlanEntity) {
  const { data } = await getEquipmentInventoryPlanDetail(query)
  initData.value = EquipmentInventoryPlanEntity.fromJSON(data)
  if (data.planTimeBegin && data.planTimeEnd) {
    initData.value.planTime = [data.planTimeBegin, data.planTimeEnd]
  }
}

/**
 * # 盘点计划设备详情
 */
async function getDeviceList(query: EquipmentInventoryPlanEntity) {
  const { data } = await getEquipmentInventoryPlanEqDetail(query)
  if (data?.length) {
    selData.value = DeviceEntity.fromJsonArray(data)
    getList()
  }
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}
</script>
