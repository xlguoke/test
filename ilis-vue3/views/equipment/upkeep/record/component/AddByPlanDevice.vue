<!-- 设备保养计划选择器 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="80%"
    title="选择设备"
    @cancel="internalOpen = false"
    @ok="handleConfirm"
  >
    <a-space direction="vertical" style="width: 100%;">
      <BaseTitle>{{ `${initData.name}（${initData.sn}）` }}</BaseTitle>
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
        :field-list="['name', 'equipment_sn', 'standard', 'buyDate', 'upkeepTime', 'departname', 'recordCount']"
        :data-source="dataSource"
        :pagination="getPagination()"
        :row-selection="getRowSelection({
          getCheckboxProps: (record: EquipmentUpkeepDeviceEntity) => ({
            disabled: record.recordCount >= record.totalCount,
          }),
        })"
        :custom-row="getCustomRow"
      >
      </IlisTable>
    </a-space>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { EquipmentUpkeepPlanEntity } from '../../plan/EquipmentUpkeepPlanEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { IlisTable } from '~/components/ilisComponent'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { EquipmentUpkeepDeviceEntity } from '~/views/equipment/upkeep/plan/EquipmentUpkeepDeviceEntity'
import { getEquipmentUpkeepPlanDetail, getEquipmentUpkeepPlanEqDetail } from '~/views/equipment/upkeep/plan/api'

interface IDialogProps {
  data: EquipmentUpkeepPlanEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<EquipmentUpkeepDeviceEntity[], IDialogProps>>()

const internalOpen = ref(true)

const initData = ref<EquipmentUpkeepPlanEntity>(props.param.data)

const selData = ref<EquipmentUpkeepDeviceEntity[]>([])

const {
  dataSource,
  getList,
  selectedRows,
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

async function init() {
  if (props.param.data.id) {
    // 盘点计划基础信息详情
    getBaseData(props.param.data)
    // 盘点计划设备详情
    getDeviceList(props.param.data)
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
        const codeArr = item.upkeepProject?.split(',')
        return codeArr?.includes(i.typeCode)
      })?.map(i => i.typeName)?.join(',')
      item.disabled = item.recordCount >= item.totalCount
    })
    selData.value = EquipmentUpkeepDeviceEntity.fromJsonArray(data.rows)

    getList()
  }
}

/**
 * # 确认
 */
function handleConfirm() {
  if (!selectedRows.value?.length) {
    return message.warning('请选择计划')
  }
  props.onConfirm(selectedRows.value)
  internalOpen.value = false
}
</script>
