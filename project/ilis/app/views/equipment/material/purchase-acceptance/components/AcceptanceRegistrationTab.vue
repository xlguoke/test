<template>
  <div>
    <div class="mt-3">
      <BaseTitle>验收登记</BaseTitle>
      <a-form
        ref="acceptanceFormRef"
        :model="acceptanceDataSource"
        :rules="acceptanceRules"
      >
        <IlisTable
          row-key="id"
          bordered
          :entity="PurchaseAcceptanceAcceptanceEntity"
          :data-source="acceptanceDataSource"
          :pagination="false"
        >
          <template #headerCell="{ column, title }">
            <template v-if="['actualQuantity', 'acceptResult'].includes(column.dataIndex as string)">
              <span class="required-title">{{ title }}</span>
            </template>
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="['actualQuantity', 'acceptResult'].includes(column.dataIndex as string)">
              <a-form-item :name="[index, column.dataIndex as string]">
                <IlisInput
                  v-model="record[column.dataIndex as string]"
                  :entity="PurchaseAcceptanceAcceptanceEntity"
                  :form-data="record"
                  :field="(column.dataIndex as string)"
                />
              </a-form-item>
            </template>
          </template>
        </IlisTable>
      </a-form>
    </div>

    <div class="mt-3">
      <BaseTitle>验收结果</BaseTitle>
      <a-form
        ref="resultFormRef"
        :model="formData"
        :label-col="{ span: '120px' }"
        :wrapper-col="{ flex: '1' }"
      >
        <a-form-item label="验收结论" name="conclusion" :rules="[{ required: true, message: '请输入验收结论' }]">
          <a-textarea
            v-model:value="formData.conclusion"
            :rows="3"
            :max-length="500"
            placeholder="请输入验收结论"
            show-count
          />
        </a-form-item>

        <a-form-item label="验收日期" name="acceptDate" :rules="[{ required: true, message: '请选择验收日期' }]">
          <a-date-picker
            v-model:value="formData.acceptDate"
            value-format="YYYY-MM-DD"
            placeholder="请选择验收日期"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item>
          <a-checkbox
            v-model:checked="formData.isAutoStockIn"
          >
            验收通过后自动入库
          </a-checkbox>
        </a-form-item>

        <a-form-item label="附件">
          <HtUploadFile
            :business-id="props.id"
            :business-type="BUSINES_TYPE.REF_PURCHASE_ACCEPT_REGISTER"
            @get-qr-code-key="formData.attachmentQrKey = $event"
          />
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue'
import dayjs from 'dayjs'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'

import { createAcceptanceRecord, getAcceptanceDetail } from '../api'
import { PurchaseAcceptanceAcceptanceEntity } from '../entity/PurchaseAcceptanceAcceptanceEntity'

const props = defineProps<{
  id: string
}>()

const acceptanceFormRef = ref<FormInstance>()
const resultFormRef = ref<FormInstance>()
const acceptanceDataSource = ref<PurchaseAcceptanceAcceptanceEntity[]>([])

const formData = reactive({
  conclusion: '',
  acceptDate: dayjs().format('YYYY-MM-DD'),
  isAutoStockIn: true,
  attachments: '',
  attachmentQrKey: '',
})

const acceptanceRules = computed(() => {
  const rule = {} as Record<string, any>
  acceptanceDataSource.value.forEach((_item, index) => {
    rule[index] = AnyValidatorHelper.getValidateRules(new PurchaseAcceptanceAcceptanceEntity())
  })
  return rule
})

async function validate() {
  await Promise.all([
    acceptanceFormRef.value?.validate(),
    resultFormRef.value?.validate(),
  ])
}

async function handleAcceptanceConfirm() {
  const data = {
    id: props.id,
    acceptDate: formData?.acceptDate,
    conclusion: formData?.conclusion,
    attachmentQrKey: formData?.attachmentQrKey,
    isAutoStockIn: formData?.isAutoStockIn,
    acceptItems: (acceptanceDataSource.value).map((item: any) => ({
      id: item.id,
      actualQuantity: item?.actualQuantity,
      acceptResult: item?.acceptResult,
    })),
  }
  try {
    await createAcceptanceRecord({
      ...data,
    })
  }
  catch (error) {
    console.error('创建验收登记失败:', error)
  }
}

// 初始化购置信息
async function init() {
  try {
    const { data } = await getAcceptanceDetail(props.id)
    if (data) {
      formData.conclusion = data.conclusion || ''
      formData.acceptDate = data.acceptDate || dayjs().format('YYYY-MM-DD')
      formData.isAutoStockIn = data.isAutoStockIn
      formData.attachmentQrKey = data.attachmentQrKey || ''
      acceptanceDataSource.value = (data.acceptItems || []).map((item: any) => ({
        id: item.id, // 购置验收ID
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        actualQuantity: item?.actualQuantity,
        unit: item.unit,
        acceptResult: item.acceptResult,
      }))
    }
  }
  catch (error) {
    console.error('加载验收登记数据失败:', error)
  }
}

onMounted(async () => {
  if (props.id) {
    await init()
  }
})

defineExpose({
  validate,
  handleAcceptanceConfirm,
})
</script>

<style scoped>
.required-title::before {
  content: '*';
  color: red;
  display: inline-block;
  line-height: 1;
  margin-inline-end: 4px;
}
</style>
