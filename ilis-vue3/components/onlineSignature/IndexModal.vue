<template>
  <AppProvider>
    <ht-modal
      v-model:open="visible"
      :title="title"
      width="800px"
      :confirm-loading="loading"
      @cancel="cancel"
      @ok="confirm"
    >
      <OnlineSginature
        ref="onlineSginatureRef"
        :key="key"
        :source="signSource"
        :data-id="dataId"
        class="h-[70vh] overflow-auto"
      />
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { SignatureData } from '.'
import { OnlineSginature, type PropsData, SIGNATURE_SOURCE, SIGN_TYPE } from '~/components/onlineSignature'

const emits = defineEmits<{
  (e: 'cancel', data: SignatureData): void
  (e: 'confirm', data: SignatureData): void
}>()

const signSource = ref<SIGNATURE_SOURCE>(SIGNATURE_SOURCE.REPORT)
const dataId = ref('')
const title = ref('线上签字')
const visible = ref(false)
const key = ref(0)

function openModal(data: PropsData) {
  key.value++
  title.value = data.title || '线上签字'
  signSource.value = data.source || SIGNATURE_SOURCE.REPORT
  dataId.value = data.dataId
  visible.value = true
}

function cancel(data: any) {
  if (window && window.vm_onlineSignatureCancel) {
    window.vm_onlineSignatureCancel(data)
  }
  visible.value = false
  emits('cancel', data)
}

const loading = ref(false)
const onlineSginatureRef = ref<typeof OnlineSginature>()
async function confirm() {
  loading.value = true
  const data = await onlineSginatureRef.value?.saveSignatures()
  loading.value = false
  if (!data)
    return
  if (data.signType !== SIGN_TYPE.HAND_WRITE) {
    cancel(data)
    return
  }
  if (window && window.vm_onlineSignatureConfirm) {
    window.vm_onlineSignatureConfirm(data)
  }
  emits('confirm', data)
  visible.value = false
}

defineExpose({
  openModal,
})

if (!window.vm) {
  window.vm = {}
}
window.vm.openOnlineSignatureModal = openModal
</script>

<style>

</style>
