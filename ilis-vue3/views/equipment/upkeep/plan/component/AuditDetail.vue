<template>
  <IlisContainer app-id="common_eq_upkeep_plan_detail">
    <div class="pr-3">
      <BaseTitle>保养计划信息</BaseTitle>
      <IlisForm
        :key="initData.planTime?.length"
        ref="ilisFormRef"
        :cols="2"
        :entity="EquipmentUpkeepPlanEntity"
        :init-data="initData"
        disabled
        :field-order="['inventoryName']"
        :field-list="fieldList"
        :label-col="{
          style: { width: '120px' },
        }"
      >
        <template #sn="{ data }">
          <a-input v-model:value="data.sn" disabled placeholder="保存后自动生成"></a-input>
        </template>
      </IlisForm>
      <BaseTitle>保养设备</BaseTitle>
      <a-space direction="vertical">
        <IlisFormSearch
          :entity="EquipmentUpkeepDeviceEntity"
          :field-list="['departId', 'quickQuery']"
          :field-order="['departId', 'quickQuery']"
          @reset="handleReset"
          @search="handleSearch"
        >
          <template #departId="{ data }">
            <BaseSelectDepart
              v-model="data.departId"
              @change="nextTick(() => handleSearch(data))"
            ></BaseSelectDepart>
          </template>
        </IlisFormSearch>
        <IlisTable
          row-key="id"
          show-index
          :entity="EquipmentUpkeepDeviceEntity"
          :field-list="tableFieldList"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :custom-row="getCustomRow"
        >
        </IlisTable>
      </a-space>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { EquipmentUpkeepPlanEntity, EquipmentUpkeepPlanType } from '../EquipmentUpkeepPlanEntity'
import { getEquipmentUpkeepPlanDetail, getEquipmentUpkeepPlanEqDetail } from '../api'
import { EquipmentUpkeepDeviceEntity } from '../EquipmentUpkeepDeviceEntity'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import { BaseSelectDepart, BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'

const initData = ref(new EquipmentUpkeepPlanEntity())

const ilisFormRef = ref<IlisFormExpose<EquipmentUpkeepPlanEntity>>()

const selData = ref<EquipmentUpkeepDeviceEntity[]>([])

const {
  dataSource,
  getList,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useLocalTableHooks<EquipmentUpkeepDeviceEntity>({
  dataSource: selData,
  immediate: false,
  quickQueryMap: ['quickQuery', ['name', 'equipment_sn']],
})

const fieldList = computed(() => {
  if (initData.value.type === EquipmentUpkeepPlanType.YEAR) {
    return initData.value.getFormFieldList().filter(item => !['planMonth'].includes(item))
  }
  else {
    return initData.value.getFormFieldList()
  }
})

const tableFieldList = computed(() => {
  let fieldList = []
  if (initData.value.type === EquipmentUpkeepPlanType.YEAR) {
    fieldList = EquipmentUpkeepDeviceEntity.getTableFieldList()?.filter(item => !['buyDate', 'upkeepTime'].includes(item))
  }
  else {
    fieldList = EquipmentUpkeepDeviceEntity.getTableFieldList()?.filter(item => !['buyDate', 'upkeepTime', 'planPeriod'].includes(item))
  }
  return fieldList
})

const urlParams = new URLSearchParams(location.search)

const id = urlParams.get('businessKey')

async function init() {
  if (id) {
    const data = EquipmentUpkeepPlanEntity.fromJSON({
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
async function getBaseData(query: EquipmentUpkeepPlanEntity) {
  const { data } = await getEquipmentUpkeepPlanDetail(query)
  initData.value = EquipmentUpkeepPlanEntity.fromJSON(data)
  if (data.planTimeBegin && data.planTimeEnd) {
    initData.value.planTime = [data.planTimeBegin, data.planTimeEnd]
  }
}

/**
 * # 盘点计划设备详情
 */
async function getDeviceList(query: EquipmentUpkeepPlanEntity) {
  const { data } = await getEquipmentUpkeepPlanEqDetail(query)
  if (data?.rows?.length) {
    const options = EquipmentUpkeepDeviceEntity.getOptions('upkeepProjectName')?.map((item) => {
      return {
        typeName: item.label,
        typeCode: item.value?.toString(),
      }
    })
    data?.rows?.forEach((item) => {
      item.name = item.equipmentVo?.name
      item.equipment_sn = item.equipmentVo?.equipmentSn
      item.standard = item.equipmentVo?.standard
      item.departname = item.equipmentVo?.departName
      item.departId = item.equipmentVo?.departId
      item.upkeepProjectName = options?.filter((i) => {
        return item.upkeepProject?.includes(i.typeCode)
      })?.map(i => i.typeName)?.join(',')
    })
    selData.value = EquipmentUpkeepDeviceEntity.fromJsonArray(data.rows)
    getList()
  }
}
</script>
