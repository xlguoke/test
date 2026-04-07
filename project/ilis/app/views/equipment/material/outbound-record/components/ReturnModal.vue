<template>
  <HtModal
    v-model:open="visible"
    title="返还入库"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="w-[90%]">
      <IlisForm
        ref="formRef"
        :entity="ReturnFormEntity"
        :init-data="formData"
        :cols="1"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <template #quantity="{ data }">
          <div class="flex flex-col gap-1">
            <a-input-number
              v-model:value="data.quantity"
              :min="1"
              :max="maxReturnQuantity"
              :precision="0"
              placeholder="请输入返还数量"
              style="width: 100%"
            />
            <div v-if="data.unit" class="text-gray-500 text-sm">
              已返还数量/出库数量（{{ data.unit }}） {{ data.returnQuantity }}/{{ data.outQuantity }}
            </div>
          </div>
        </template>

        <!-- 自定义附件字段：使用上传组件 -->
        <template #form-after>
          <a-form-item label="附件">
            <HtUploadFile
              :business-type="BUSINES_TYPE.REF_STOCK_IN"
              :business-id="formData.id"
              @get-qr-code-key="formData.attachmentQrKey = $event"
            />
          </a-form-item>
        </template>
      </IlisForm>
    </div>
  </HtModal>
</template>

<script setup lang="ts">
import type { OutboundRecordEntity } from '../entity/OutboundRecordEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { getOutboundRecordDetail, returnInbound } from '../api'
import { ReturnFormEntity } from '../entity/ReturnFormEntity'

const props = defineProps<IDialogPropsParam<null, { record: OutboundRecordEntity }>>()

const visible = ref(true)
const loading = ref(false)
const formRef = ref<IlisFormExpose<ReturnFormEntity>>()

const formData = ref(new ReturnFormEntity())
formData.value.id = props.param?.record?.id || ''

const maxReturnQuantity = computed(() => {
  const total = formData.value.outQuantity || 0
  const returned = formData.value.returnQuantity || 0
  return total - returned
})

async function init() {
  const { data } = await getOutboundRecordDetail(props.param?.record?.id || '')
  const localUserInfo = getLocalUserInfo()
  formData.value = new ReturnFormEntity().fromJSON({
    stockOutId: props.param?.record?.id,
    materialName: data?.material?.name,
    specification: data?.material.specification,
    inType: '返还入库',
    quantity: undefined, // 出库数量
    outQuantity: data?.quantity, // 详情中的quantity是出库数量
    operator: localUserInfo?.realName || '',
    operatorId: localUserInfo?.userId || '',
    returnDate: dayjs().format('YYYY-MM-DD'),
    unit: data?.material?.unit || '',
    returnQuantity: data?.returnQuantity, // 已返还数量
  })
}

async function handleOk() {
  try {
    const submitData = await formRef.value?.getFormData()
    loading.value = true

    const data = {
      stockOutId: submitData?.stockOutId,
      quantity: submitData?.quantity,
      operator: submitData?.operator,
      operatorId: submitData?.operatorId,
      returnDate: submitData?.returnDate,
      attachmentQrKey: submitData?.attachmentQrKey,
    }
    await returnInbound(data)
    message.success('返还成功')
    props.onConfirm(null)
    visible.value = false
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await init()
})
</script>
