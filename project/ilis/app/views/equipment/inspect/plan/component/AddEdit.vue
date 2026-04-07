<template>
  <HtModal
    v-model:open="visible"
    :title="isReadOnly ? '详情' : (param.data.id ? '编辑' : '新增')"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
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
        :mixin-rules="mixinRules"
        :entity="EquipmentInspectPlanEntity"
        :init-data="initData"
        :disabled="isReadOnly"
        :field-list="fieldList"
      >
        <template #sn="{ data }">
          <a-input v-model:value="data.sn" disabled placeholder="保存后自动生成"></a-input>
        </template>
        <template #planDepartId="{ data }">
          <BaseSelectDepart v-model="data.planDepartId" placeholder="请选择科室"></BaseSelectDepart>
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
        <a-space v-if="!isReadOnly">
          <a-button
            @click="handleSelectDevice"
          >
            添加核查设备
          </a-button>
          <a-button
            @click="handleBatchEdit"
          >
            批量编辑
          </a-button>
        </a-space>
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
            <template #headerCell="{ column, title }">
              <template v-if="['inspectTimes', 'inspectUserName'].includes(column.dataIndex as string)">
                <span class="required-title">{{ title }}</span>
              </template>
            </template>
            <template v-if="!isReadOnly" #bodyCell="{ column, record, index }">
              <template v-if="['inspectTimes', 'inspectWay', 'inspectItems', 'verificationBasis', 'referenceStandards', 'remark', 'inspectUserName'].includes(column.dataIndex as string)">
                <a-form-item :name="[index, column.dataIndex as string]">
                  <IlisInput
                    v-model="record[column.dataIndex as string]"
                    :entity="EquipmentInspectDeviceEntity"
                    :form-data="record"
                    :field="(column.dataIndex as string)"
                    @change="nextTick(() => formRef.validate())"
                  ></IlisInput>
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button type="link" danger @click="handleDelete([record as EquipmentInspectDeviceEntity])">
                  删除
                </a-button>
              </template>
            </template>
          </IlisTable>
        </a-form>
      </a-space>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { cloneDeep } from '@unovis/ts'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import VMCallDeviceSelector from '~/components/selectorViaMethodCall/VMCallDeviceSelector.vue'
import { BaseSelectDepart, BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { DeviceEntity } from '~/views/equipment/DeviceEntity'
import { getEquipmentInspectPlanDetail, getEquipmentInspectPlanEqDetail, saveEquipmentInspectPlan } from '../api'
import { EquipmentInspectDeviceEntity } from '../EquipmentInspectDeviceEntity'
import { EquipmentInspectPlanEntity, EquipmentInspectPlanType } from '../EquipmentInspectPlanEntity'
import BatchEdit from './BatchEdit.vue'

interface IDialogProps {
  data: EquipmentInspectPlanEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const formRef = ref()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentInspectPlanEntity>(props.param.data)

const ilisFormRef = ref<IlisFormExpose<EquipmentInspectPlanEntity>>()

const showDeviceSelector = ref(false)

const selData = ref<EquipmentInspectDeviceEntity[]>([])
// console.log(EquipmentInspectDeviceEntity.getTableFieldList())

const {
  dataSource,
  dataSourceAll,
  getList,
  selectedRows,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleDelete,
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

const mixinRules = ref<Record<string, Rule[]>>({
  planMouth: [
    {
      validator: async (_rule: any, value: string) => {
        // 通过正则校验value是否为月份
        // eslint-disable-next-line regexp/no-unused-capturing-group
        if (!/^(0?[1-9]|1[012])$/.test(value)) { // 去掉括号
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('请输入1-12之间的数字月份')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  planYear: [
    {
      validator: async (_rule: any, value: string) => {
        // 通过正则校验value是否为年份
        if (!/^\d{4}$/.test(value)) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('请输入4位数字年份')
        }
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
})

// 审核详情查看该界面时的获取参数方式
const urlParams = new URLSearchParams(location.search)
const idByAuthPage = urlParams.get('businessKey')

const isReadOnly = computed(() => {
  return props.param?.isDetail || !!idByAuthPage
})

async function init() {
  if (props.param.data.id || idByAuthPage) {
    // 盘点计划基础信息详情
    getBaseData(props.param.data)
    // 盘点计划设备详情
    getDeviceList(props.param.data)
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

/**
 * # 选择设备
 */
async function handleSelectDevice() {
  const data = await AnyDialogHelper.showSelector<DeviceEntity>(VMCallDeviceSelector, {
    multiple: true,
    // isCacheSelect: true,
    // checkedRows: DeviceEntity.fromJsonArray(dataSourceAll.value?.map(i => ({ id: i.equipmentId }))),
    initData: DeviceEntity.fromJSON({ eqDepartId: initData.value.planDepartId }),
  })
  data.forEach((item) => {
    item.equipmentId = item.id
    item.inspectUserName = item.userName?.split(',')?.[0]
    item.inspectUserId = item.userId?.split(',')?.[0]
  })

  const addData = data.filter((item) => {
    return !selData.value.some(i => i.equipmentId === item.equipmentId)
  })
  selData.value = [...selData.value, ...EquipmentInspectDeviceEntity.fromJsonArray(cloneDeep(addData))]
  showDeviceSelector.value = false
  getList()
}

async function handleBatchEdit() {
  if (!selectedRows.value?.length) {
    message.warning('请选择设备！')
    return
  }
  await AnyDialogHelper.showModel(BatchEdit, selectedRows.value)
}

function handleExport() {
  const a = document.createElement('a')
  const href = `${import.meta.env.VITE_ILIS_BASE}/eqInspectPlan.do?export&planId=${props.param.data.id}`
  a.href = href
  a.click()
}

function handlePrint() {
  if (!props.param.data.id) {
    return message.warning('未获取到核查计划id')
  }
  IlisPrintUdr.commonPrint([props.param.data.id], 'EquipmentInspectPlanLedger')
}

async function handleOk() {
  await formRef.value?.validate()
  const isAllFinish = dataSourceAll.value?.every((i) => {
    return i.inspectTimes
  })
  if (!isAllFinish) {
    message.warning('请检查表格每页必填项！')
    return
  }
  const formData = await ilisFormRef.value?.getFormData()
  if (!dataSourceAll.value?.length) {
    message.warning('请选择设备！')
    return
  }
  loading.value = true
  const param = {
    ...formData,
    planDetailStr: JSON.stringify(dataSourceAll.value),
  }
  await saveEquipmentInspectPlan(param).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>

<style lang="less" scoped>
:deep(.table-form){
  .ant-form-item{
    margin-bottom: unset !important;
  }
}
.required-title{
  &::before{
    content: '*';
    color: red;
    display: inline-block;
    line-height: 1;
    margin-inline-end:4px;
  }
}
</style>
