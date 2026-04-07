<template>
  <ht-modal
    v-model:open="visible"
    :title="param?.title || '签字'"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    :footer="null"
  >
    <SignatureVue
      @confirm="handleConfirm"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import SignatureVue from '~/views/mobile/signature/index.vue'

interface IModalProps {
  /** # 标题 */
  title?: string
}

const props = defineProps<IDialogPropsParam<string, IModalProps>>()

const visible = ref(true)

const loading = ref(false)

function handleConfirm(data: string) {
  visible.value = false
  props.onConfirm(data)
}
</script>
