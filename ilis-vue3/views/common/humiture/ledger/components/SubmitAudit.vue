<template>
  <a-modal
    v-model:open="visible"
    centered
    width="500px"
    title="提交审核"
    :body-style="{ height: '420px', overflowY: 'auto' }"
    :keyboard="false"
    :mask-closable="false"
    :confirm-loading="submitLoading"
    @ok="onSubmit()"
  >
    <ProcessForm
      ref="processFormRef"
      class="mt-4"
      :process-type="ProcessType.TEM_HUM_AUDIT"
      :label-col="{ style: { width: '100px' } }"
    />
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { ProcessType } from '~/components/commonProcess'
import ProcessForm from '~/components/commonProcess/ProcessForm.vue'
import { submitLedgerRecord } from '~/views/common/humiture/ledger/api/submitLedgerRecord.ts'

const emits = defineEmits(['onSubmit'])

const visible = ref(false)

const submitLoading = ref(false)

const processFormRef = ref()

const submitIds = ref<string[]>([])

function open(ids) {
  submitIds.value = ids
  visible.value = true
}

function onClose() {
  visible.value = false
  submitIds.value = []
}

async function onSubmit() {
  submitLoading.value = true
  const data = await processFormRef.value.getProcessFormData()
  data.id = submitIds.value.join(',')
  data.presetAuditers = JSON.stringify(data.presetAuditers)
  data.formPropertyJson = JSON.stringify(data.formPropertyJson)

  await submitLedgerRecord(data).finally(() => {
    submitLoading.value = false
  })
  message.success('提交成功')

  onClose()
  emits('onSubmit')
}

defineExpose({
  open,
})
</script>
