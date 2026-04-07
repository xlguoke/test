<template>
  <ht-modal
    v-model:open="open"
    width="600px"
    title="提交审核"
    :confirm-loading="auditLoading"
    @cancel="cancel"
    @ok="handleSubmitProcess"
  >
    <ProcessForm
      ref="processFormRef"
      :process-type="ProcessType.PURCHASE_REQUEST"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { ProcessType } from '~/components/commonProcess'
import { submitAudit } from '~/views/common/purchaseRequest/api.ts'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  ids: {
    type: Array,
    default: () => [],
  },
})

const emits = defineEmits(['update:open', 'onSubmit'])

const open = computed(() => props.open)

const auditLoading = ref(false)

const processFormRef = ref()

function cancel() {
  emits('update:open', false)
}

// 提交审核
async function handleSubmitProcess() {
  const data = await processFormRef.value.getProcessFormData()
  auditLoading.value = true
  data.ids = props.ids
  data.presetAuditors = data.presetAuditers
  data.processForm = data.formPropertyJson
  delete data.presetAuditers
  await submitAudit(data).finally(() => {
    auditLoading.value = false
  })
  message.success('操作成功！')
  emits('onSubmit')
  cancel()
}
</script>
