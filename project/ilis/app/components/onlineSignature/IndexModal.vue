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
        :special-sign-type="specialSignType"
        :data-id="dataId"
        :reports="reports"
        class="min-h-[50vh]"
      />
    </ht-modal>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { SignatureData, SPECIAL_SIGN_TYPE } from '.'
import type { PropsData } from '~/components/onlineSignature'
import { OnlineSginature, SIGNATURE_SOURCE } from '~/components/onlineSignature'

const props = defineProps({
  isJsp: Boolean,
})

const emits = defineEmits<{
  (e: 'cancel', data: SignatureData): void
  (e: 'confirm', data: SignatureData): void
}>()

const signSource = ref<SIGNATURE_SOURCE>(SIGNATURE_SOURCE.REPORT)
const specialSignType = ref<SPECIAL_SIGN_TYPE>()
const dataId = ref('')
const reports = ref()
const title = ref('线上签字')
const visible = ref(false)
const key = ref(0)

function openModal(data: PropsData) {
  key.value++
  title.value = data.title || '线上签字'
  signSource.value = data.source || SIGNATURE_SOURCE.REPORT
  specialSignType.value = data.specialSignType || undefined
  dataId.value = data.dataId || ''
  reports.value = data.reports || []
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
  if (!data) {
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

if (props.isJsp) {
  if (!window.vm) {
    window.vm = {}
  }
  window.vm.openOnlineSignatureModal = openModal
}
</script>

<style>

</style>
