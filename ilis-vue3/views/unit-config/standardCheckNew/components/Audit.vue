<template>
  <ht-modal
    v-model:open="visible"
    title="提交审核"
    width="600px"
    :confirm-loading="processLoading"
    :after-close="onClosed"
    @ok="handleSubmitProcess()"
  >
    <ProcessForm
      ref="processFormRef"
      :process-type="ProcessType.STANDARD_CHECK_NEW"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { StandardCheckNewEntity } from './listEntity'
import { submitAuditApi } from './api'
import { preSubmitProcess } from '~/components/commonProcess/api'
import { ProcessType } from '~/components/commonProcess'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, StandardCheckNewEntity[]>>()

/** 提交审核 */
const visible = ref(false)
const processLoading = ref(false)
const processFormRef = ref()

submitAudit()

async function submitAudit() {
  const row = props.param[0]
  const { data } = await preSubmitProcess(ProcessType.COMMON_TRAIN_PLAN, row.id.toString())
  if (data.haveProcess) {
    visible.value = true
  }
  else {
    props.onConfirm(null)
  }
}

async function handleSubmitProcess() {
  processLoading.value = true
  try {
    const data = await processFormRef.value.getProcessFormData()
    data.ids = props.param.map(d => d.id)
    data.processForm = data.formPropertyJson
    data.presetAuditors = data.presetAuditers
    delete data.formPropertyJson
    delete data.presetAuditers
    await submitAuditApi(data)
    props.onConfirm(null)
    processLoading.value = false
    visible.value = false
  }
  catch (error) {
    processLoading.value = false
    throw error
  }
}
</script>

<style>

</style>
