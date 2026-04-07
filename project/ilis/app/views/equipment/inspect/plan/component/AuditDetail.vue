<template>
  <IlisContainer app-id="common_equipment_inspect_plan_detail">
    <template v-if="isReadOnly" #footer>
      <a-button type="primary" @click="handleExport">
        导出计划详情
      </a-button>
      <a-button type="primary" @click="handlePrint">
        打印核查计划
      </a-button>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <div class="pr-3">
      <BaseTitle>核查计划信息</BaseTitle>
      <IlisForm
        :key="initData.planTime?.length"
        ref="ilisFormRef"
        :cols="2"
        :entity="EquipmentInspectPlanEntity"
        :init-data="initData"
        :disabled="isReadOnly"
        :field-list="fieldList"
      >
        <template #planDepartId="{ data }">
          <BaseSelectDepart v-model="data.planDepartId"></BaseSelectDepart>
        </template>
        <template #planYear="{ data }">
          <div class="flex">
            <IlisInput
              v-model="data.planYear"
              field="planYear"
              :disabled="isReadOnly"
              :entity="EquipmentInspectPlanEntity"
            ></IlisInput>
            <a-form-item
              v-if="data.planType === EquipmentInspectPlanType.MONTH"
              class=" h-[32px] w-[50%]  overflow-visible m-0"
              name="planMouth"
            >
              <IlisInput
                v-model="data.planMouth"
                field="planMouth"
                :disabled="isReadOnly"
                :entity="EquipmentInspectPlanEntity"
              ></IlisInput>
            </a-form-item>
          </div>
        </template>
      </IlisForm>
      <BaseTitle>核查设备</BaseTitle>
      <a-space direction="vertical" style="width: 100%;">
        <a-form
          ref="formRef"
          class="table-form"
          :model="dataSource"
          :rules="rules"
        >
          <IlisTable
            row-key="id"
            show-index
            class=" w-full"
            :entity="EquipmentInspectDeviceEntity"
            :data-source="dataSource"
            :pagination="getPagination()"
            :row-selection="getRowSelection()"
            :custom-row="getCustomRow()"
            :table-width="800"
          >
          </IlisTable>
        </a-form>
      </a-space>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { BaseSelectDepart, BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { getEquipmentInspectPlanDetail, getEquipmentInspectPlanEqDetail } from '../api'
import { EquipmentInspectDeviceEntity } from '../EquipmentInspectDeviceEntity'
import { EquipmentInspectPlanEntity, EquipmentInspectPlanType } from '../EquipmentInspectPlanEntity'

const formRef = ref()

const visible = ref(true)

const initData = ref(new EquipmentInspectPlanEntity())

const ilisFormRef = ref<IlisFormExpose<EquipmentInspectPlanEntity>>()

const selData = ref<EquipmentInspectDeviceEntity[]>([])
// console.log(EquipmentInspectDeviceEntity.getTableFieldList())

const {
  dataSource,
  dataSourceAll,
  getList,
  getCustomRow,
  getPagination,
  getRowSelection,
} = useLocalTableHooks<EquipmentInspectDeviceEntity>({
  dataSource: selData,
  immediate: false,
})

const rules = computed(() => {
  const rule = {} as Record<string, any>
  dataSourceAll.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(EquipmentInspectDeviceEntity)
  })
  return rule
})

const fieldList = computed(() => {
  return initData.value.getFormFieldList().filter(item => !['planMouth'].includes(item))
})

// 审核详情查看该界面时的获取参数方式
const urlParams = new URLSearchParams(location.search)

const idByAuthPage = urlParams.get('businessKey')

const isReadOnly = computed(() => {
  return !!idByAuthPage
})

async function init() {
  if (idByAuthPage) {
    const data = EquipmentInspectDeviceEntity.fromJSON({ id: idByAuthPage })
    // 盘点计划基础信息详情
    getBaseData(data)
    // 盘点计划设备详情
    getDeviceList(data)
  }
  else {
    // 新增时默认当前登陆人为创建人
    // const currentUser = getLocalUserInfo()
    initData.value.planType = EquipmentInspectPlanType.YEAR
  }
}
init()

/**
 * 盘点计划基础信息详情
 */
async function getBaseData(query: EquipmentInspectPlanEntity) {
  const { data } = await getEquipmentInspectPlanDetail(query)
  initData.value = EquipmentInspectPlanEntity.fromJSON(data)
  if (data.planTimeBegin && data.planTimeEnd) {
    initData.value.planTime = [data.planTimeBegin, data.planTimeEnd]
  }
}

/**
 * # 盘点计划设备详情
 */
async function getDeviceList(query: EquipmentInspectPlanEntity) {
  const { data } = await getEquipmentInspectPlanEqDetail(query)
  if (data?.rows?.length) {
    selData.value = EquipmentInspectDeviceEntity.fromJsonArray(data.rows)
    getList()
  }
}

function handleExport() {
  const a = document.createElement('a')
  const href = `${import.meta.env.VITE_ILIS_BASE}/eqInspectPlan.do?export&planId=${idByAuthPage}`
  a.href = href
  a.click()
}

function handlePrint() {
  if (!idByAuthPage) {
    return message.warning('未获取到核查计划id')
  }
  IlisPrintUdr.commonPrint([idByAuthPage], 'EquipmentInspectPlanLedger')
}
</script>

<style lang="less" scoped>
:deep(.table-form){
  .ant-form-item{
    margin-bottom: unset !important;
  }
}
</style>
