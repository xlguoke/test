<template>
  <ht-modal
    v-model:open="visible"
    title="查新登记"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @cancel="cancel"
    @ok="saveData"
  >
    <div class="mx-12 min-h-[400px]">
      <IlisForm
        ref="formRef"
        :entity="StandardCheckNewRegisterEntity"
        :init-data="formData"
        :cols="1"
        :label-col="{ span: 5 }"
        :field-list="formFiledList"
      >
        <template #standardName="{ data }">
          <IlisInput
            v-model="data.standardName"
            disabled
            :entity="StandardCheckNewRegisterEntity"
            field="standardName"
          />
        </template>
        <template #standardPublishCode="{ data }">
          <IlisInput
            v-model="data.standardPublishCode"
            disabled
            :entity="StandardCheckNewRegisterEntity"
            field="standardPublishCode"
          />
        </template>
        <template #standardType="{ data }">
          <IlisInput
            v-model="data.standardType"
            disabled
            :entity="StandardCheckNewRegisterEntity"
            field="standardType"
            :options="StandardCheckNewRegisterEntity.getOptions('standardType')"
          />
        </template>
        <template #status="{ data }">
          <IlisInput
            v-model="data.status"
            field="status"
            :allow-clear="false"
            :entity="StandardCheckNewRegisterEntity"
            :options="initStatusOptions(data as StandardCheckNewRegisterEntity)"
            @change="(value) => (selectedStatus = value)"
          />
        </template>
      </IlisForm>
      <IlisCustomPropertiesForm
        v-if="customValues?.length"
        ref="customFormRef"
        :customize-type="CUSTOM_ATTRIBUTE_TYPE"
        :default-value="customValues"
        :label-col="{ span: 5 }"
      />
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { registerDetailApi, saveApi } from '../api'
import { CUSTOM_ATTRIBUTE_TYPE, StandardCheckNewRegisterEntity } from '../listEntity'
import { CHECKNEW_RECORD_STATUS } from './checkNewResult'
import { STANDARD_TYPE } from './waitCheckNewStandard'

const props = defineProps<IDialogPropsParam<null, StandardCheckNewRegisterEntity>>()

const visible = ref(true)
const loading = ref(false)
const formData = ref()
const formRef = ref()
const customFormRef = ref()
const customValues = ref([])
const selectedStatus = ref<string>()
const formFiledList = ref<string[]>([])

function cancel() {
  visible.value = false
  loading.value = false
}

onMounted(() => {
  getData(props.param.id)
})

async function getData(id: string | number) {
  const { data } = await registerDetailApi(`${id}`)
  const json = StandardCheckNewRegisterEntity.fromJSON(data)
  const columns = data.customValues || []
  json.standardType = `${json.standardType}`
  if (!json.status || json.status === CHECKNEW_RECORD_STATUS.PENDING) {
    json.status = CHECKNEW_RECORD_STATUS.UPDATED
  }
  formData.value = json
  selectedStatus.value = json.status
  customValues.value = columns.map((d: any) => ({
    columnId: d.customColumnId,
    columnValue: d.customColumnValue,
    columnName: d.customColumnName,
  }))
}

/** 更新结果待选项 */
function initStatusOptions(data: StandardCheckNewRegisterEntity) {
  const status = data.getOptions('status') || []
  return status.filter((d: any) => d.value !== CHECKNEW_RECORD_STATUS.PENDING)
}

/**
 * 修改查新结果
 * 1. 查新结果为更新规程时才显示全部字段
 * 2. 规程类型为评定标准或查新结果不是更新规程时，不显示验证人员
 */
watchEffect(() => {
  const fileds = StandardCheckNewRegisterEntity.getFormFieldList()
  if (selectedStatus.value === CHECKNEW_RECORD_STATUS.UPDATED) {
    if (formData.value?.standardType === STANDARD_TYPE.STANDARD) {
      formFiledList.value = fileds.filter((f) => {
        return !(['verificationUserName'].includes(f))
      })
    }
    else {
      formFiledList.value = fileds
    }
  }
  else {
    formFiledList.value = fileds.filter((f) => {
      return !(['newStandardName', 'newStandardPublishCode', 'newStandardPublishDate', 'newStandardExecuteDate', 'verificationUserName'].includes(f))
    })
  }
})

async function saveData() {
  const form = await formRef.value.getFormData()
  let customForm = []
  if (customFormRef.value) {
    customForm = await customFormRef.value.getFormData()
  }
  loading.value = true
  const _customForm = customForm.map((d: any) => ({
    customColumnId: d.columnId,
    customColumnValue: d.columnValue,
    customColumnName: d.columnName,
  }))
  await saveApi({ ...form, customValues: _customForm }).finally(() => {
    loading.value = false
  })
  message.success('保存成功!')
  props.onConfirm(null)
  visible.value = false
}
</script>

<style>

</style>
