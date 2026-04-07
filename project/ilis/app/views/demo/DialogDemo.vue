<template>
  <HtModal
    v-model:open="showDialog"
    title="列信息可见性编辑"
    :after-close="onClosed"
    @ok="onOk"
  >
    <a-space direction="vertical" style="width: 100%;">
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

defineProps<IDialogPropsParam<any, any>>()

const showDialog = ref(true)

function onOk() {
}
</script>
