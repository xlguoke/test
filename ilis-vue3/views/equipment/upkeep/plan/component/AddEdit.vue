<template>
  <HtModal
    v-model:open="visible"
    :title="param.isDetail ? '详情' : (param.data.id ? '编辑' : '新增')"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="pr-3">
      <BaseTitle>保养计划信息</BaseTitle>
      <IlisForm
        :key="initData.planTime?.length"
        ref="ilisFormRef"
        :cols="2"
        :mixin-rules="mixinRules"
        :entity="EquipmentUpkeepPlanEntity"
        :init-data="initData"
        :disabled="param?.isDetail"
        :field-order="['inventoryName']"
        :field-list="fieldList"
        :label-col="{
          style: { width: '120px' },
        }"
      >
        <template #sn="{ data }">
          <a-input v-model:value="data.sn" disabled placeholder="保存后自动生成"></a-input>
        </template>
        <template #planYear="{ data }">
          <div class="flex">
            <IlisInput
              v-model="data.planYear"
              field="planYear"
              :entity="EquipmentUpkeepPlanEntity"
            ></IlisInput>
            <a-form-item
              v-if="data.type === EquipmentUpkeepPlanType.MONTH"
              class=" h-[32px] w-[50%]  overflow-visible m-0"
              name="planMonth"
            >
              <IlisInput
                v-model="data.planMonth"
                field="planMonth"
                :entity="EquipmentUpkeepPlanEntity"
              ></IlisInput>
            </a-form-item>
          </div>
        </template>
      </IlisForm>
      <BaseTitle>保养设备</BaseTitle>
      <a-space direction="vertical" style="width: 100%;">
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
        <a-space v-if="!param.isDetail">
          <a-button
            :icon="h(PlusOutlined)"
            @click="handleSelectDevice"
          >
            添加设备
          </a-button>
          <a-button
            :icon="h(EditOutlined)"
            @click="handleBatchEdit"
          >
            批量编辑
          </a-button>
          <a-button
            :icon="h(DeleteOutlined)"
            @click="handleDelete(selectedRows)"
          >
            删除
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
            :entity="EquipmentUpkeepDeviceEntity"
            :field-list="tableFieldList"
            :data-source="dataSource"
            :pagination="getPagination()"
            :row-selection="getRowSelection()"
            :custom-row="getCustomRow"
            :table-width="800"
          >
            <template #headerCell="{ column, title }">
              <template v-if="['upkeepDepart', 'upkeepPerson', 'upkeepProjectName', 'planPeriod'].includes(column.dataIndex as string)">
                <span class="required-title">{{ title }}</span>
              </template>
            </template>
            <template v-if="!param.isDetail" #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'upkeepDepart'">
                <a-form-item :name="[index, column.dataIndex]">
                  <IlisInput
                    v-model="record.upkeepDepart"
                    :entity="EquipmentUpkeepDeviceEntity"
                    :form-data="record"
                    text="· · ·"
                    field="upkeepDepart"
                    @change="nextTick(() => formRef.validate())"
                  ></IlisInput>
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'upkeepPerson'">
                <a-form-item :name="[index, column.dataIndex]">
                  <IlisInput
                    v-model="record.upkeepPerson"
                    :entity="EquipmentUpkeepDeviceEntity"
                    :form-data="record"
                    text="· · ·"
                    field="upkeepPerson"
                    @change="nextTick(() => formRef.validate())"
                  ></IlisInput>
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'upkeepProjectName'">
                <a-form-item :name="[index, column.dataIndex]">
                  <IlisInput
                    v-model="record.upkeepProjectName"
                    :entity="EquipmentUpkeepDeviceEntity"
                    :form-data="record"
                    text="· · ·"
                    field="upkeepProjectName"
                    @change="nextTick(() => formRef.validate())"
                  ></IlisInput>
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'planPeriod'">
                <a-form-item :name="[index, column.dataIndex]">
                  <IlisInput
                    v-model="record.planPeriod"
                    :entity="EquipmentUpkeepDeviceEntity"
                    field="planPeriod"
                    @change="nextTick(() => formRef.validate())"
                  ></IlisInput>
                </a-form-item>
              </template>
              <template v-if="column.dataIndex === 'remark'">
                <IlisInput
                  v-model="record.remark"
                  :entity="EquipmentUpkeepDeviceEntity"
                  field="remark"
                ></IlisInput>
              </template>
            </template>
          </IlisTable>
        </a-form>
      </a-space>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { cloneDeep } from '@unovis/ts'
import type { Rule } from 'ant-design-vue/es/form'
import { EquipmentUpkeepPlanEntity, EquipmentUpkeepPlanType } from '../EquipmentUpkeepPlanEntity'
import { getEquipmentUpkeepPlanDetail, getEquipmentUpkeepPlanEqDetail, saveEquipmentUpkeepPlan } from '../api'
import { EquipmentUpkeepDeviceEntity } from '../EquipmentUpkeepDeviceEntity'
import type { UpkeepPlanDeviceSelectorEntity } from '../UpkeepPlanDeviceSelectorEntity'
import UpkeepPlanDeviceSelector from './UpkeepPlanDeviceSelector.vue'
import BatchEdit from './BatchEdit.vue'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisInput } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { BaseSelectDepart, BaseTitle } from '~/components/UI'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'

interface IDialogProps {
  data: EquipmentUpkeepPlanEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const formRef = ref()

const loading = ref(false)

const visible = ref(true)

const initData = ref<EquipmentUpkeepPlanEntity>(props.param.data)

const ilisFormRef = ref<IlisFormExpose<EquipmentUpkeepPlanEntity>>()

const showDeviceSelector = ref(false)

const selData = ref<EquipmentUpkeepDeviceEntity[]>([])

const {
  dataSource,
  dataSourceAll,
  getList,
  selectedRows,
  getCustomRow,
  getPagination,
  getRowSelection,
  handleDelete,
  handleSearch,
  handleReset,
} = useLocalTableHooks<EquipmentUpkeepDeviceEntity>({
  dataSource: selData,
  immediate: false,
  quickQueryMap: ['quickQuery', ['name', 'equipment_sn']],
})

const rules = computed(() => {
  const rule = {} as Record<string, any>
  dataSourceAll.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(EquipmentUpkeepDeviceEntity)
  })
  return rule
})

const fieldList = computed(() => {
  return initData.value.getFormFieldList().filter(item => !['planMonth'].includes(item))
})

const tableFieldList = computed(() => {
  let fieldList = []
  if (initData.value.type === EquipmentUpkeepPlanType.YEAR) {
    fieldList = EquipmentUpkeepDeviceEntity.getTableFieldList()?.filter(item => !['buyDate', 'upkeepTime'].includes(item))
  }
  else {
    fieldList = EquipmentUpkeepDeviceEntity.getTableFieldList()?.filter(item => !['buyDate', 'upkeepTime', 'planPeriod'].includes(item))
  }
  if (!props.param.isDetail) {
    fieldList = fieldList.filter(item => !['recordCount'].includes(item))
  }
  return fieldList
})

const mixinRules = ref<Record<string, Rule[]>>({
  planMonth: [
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

async function init() {
  if (props.param.data.id) {
    // 盘点计划基础信息详情
    getBaseData(props.param.data)
    // 盘点计划设备详情
    getDeviceList(props.param.data)
  }
  else {
    // 新增时默认当前登陆人为创建人
    const currentUser = getLocalUserInfo()
    initData.value.creator = currentUser?.realName
    initData.value.creatorId = currentUser?.userId
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
    })
    selData.value = EquipmentUpkeepDeviceEntity.fromJsonArray(data.rows)
    getList()
  }
}

/**
 * # 选择设备
 */
async function handleSelectDevice() {
  const data = await AnyDialogHelper.showSelector<UpkeepPlanDeviceSelectorEntity>(UpkeepPlanDeviceSelector, {
    multiple: true,
  })
  const addData = data.filter((item) => {
    return !selData.value.some(i => i.id === item.id)
  })
  selData.value = [...selData.value, ...EquipmentUpkeepDeviceEntity.fromJsonArray(cloneDeep(addData))]
  showDeviceSelector.value = false
  getList()
}

async function handleBatchEdit() {
  if (!selectedRows.value?.length) {
    message.warning('请选择设备！')
    return
  }
  await AnyDialogHelper.showModel(BatchEdit, {
    data: selectedRows.value,
    type: initData.value.type,
  })
}

async function handleOk() {
  await formRef.value?.validate()
  const isAllFinish = dataSourceAll.value?.every((i) => {
    if (initData.value.type === EquipmentUpkeepPlanType.MONTH) {
      return i.upkeepDepart && i.upkeepPerson && i.upkeepProjectName
    }
    else {
      return i.upkeepDepart && i.upkeepPerson && i.upkeepProjectName && i.planPeriod
    }
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
    planCreator: formData?.creator,
    planCreatorId: formData?.creatorId,
    planDetailStr: JSON.stringify(dataSourceAll.value?.map((i: any) => {
      if (!i.equipmentId) {
        i.equipmentId = i.id
        delete i.id
      }
      return i
    })),
  }
  await saveEquipmentUpkeepPlan(param).finally(() => {
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
