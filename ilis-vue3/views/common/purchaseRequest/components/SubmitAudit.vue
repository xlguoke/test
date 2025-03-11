<template>
  <a-modal
    v-model:open="open"
    centered
    width="460px"
    title="提交审核"
    :body-style="{ height: '400px', overflowY: 'auto' }"
    :mask-closable="false"
    @cancel="cancel"
  >
    <ProcessForm
      ref="processFormRef"
      class="mt-4"
      :process-type="ProcessType.PURCHASE_REQUEST"
      :label-col="{ style: { width: '100px' } }"
    />
    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="auditLoading" @click="handleSubmitProcess">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
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
  auditLoading.value = true
  const data = await processFormRef.value.getProcessFormData()
  data.ids = props.ids
  data.presetAuditors = data.presetAuditers
  data.processForm = data.formPropertyJson
  await submitAudit(data).finally(() => {
    auditLoading.value = false
  })
  message.success('操作成功！')
  emits('onSubmit')
  cancel()
}
</script>
