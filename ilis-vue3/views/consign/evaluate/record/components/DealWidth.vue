<template>
  <HtModal
    v-model:open="showDialog"
    title="处理警示"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleOk"
  >
    <a-space direction="vertical" style="width: 100%;">
      <IlisForm
        ref="formRef"
        :entity="EvaluateRecordEntity"
        :field-list="['dealWidth']"
        :cols="1"
      ></IlisForm>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { EvaluateRecordEntity } from '../EvaluateRecordEntity'
import { handleEvaluateRecord } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EvaluateRecordEntity>>()

const showDialog = ref(true)

const formRef = ref<IlisFormExpose<EvaluateRecordEntity>>()

const loading = ref(false)

async function handleOk() {
  const formData = await formRef.value?.getFormData()
  formData!.id = props.param.id
  loading.value = true
  // 异步操作
  await handleEvaluateRecord(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  showDialog.value = false
  props.onConfirm(null)
}
</script>

<style>

</style>
