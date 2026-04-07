<template>
  <HtModal
    v-model:open="visible"
    title="报告详情"
    width="90%"
    fixed-height
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="visible = false">
        关闭
      </a-button>
    </template>
    <iframe :src="param.url" frameborder="0" width="100%" height="100%"></iframe>
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

defineProps<IDialogPropsParam<null, { url: string }>>()

const visible = ref(true)
</script>
