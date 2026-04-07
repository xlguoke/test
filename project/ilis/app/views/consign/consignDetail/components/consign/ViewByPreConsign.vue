<template>
  <HtModal
    v-model:open="showDialog"
    title="以预委托方式查看"
    full-screen
    :footer="false"
    :after-close="onClosed"
    @ok="onConfirm(null);showDialog = false"
  >
    <div class="w-full h-full">
      <iframe :src="param.url" style="width: 100%; height: 100%;"></iframe>
    </div>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

defineProps<IDialogPropsParam<null, {
  url: string
}>>()

const showDialog = ref(true)
</script>
