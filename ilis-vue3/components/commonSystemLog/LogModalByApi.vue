<template>
  <HtModal
    v-model:open="internalOpen"
    title="日志"
    :after-close="onClosed"
    width="60vw"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <LogList :id="param.id" :log-type="param.logType" :list="param.list" />
  </HtModal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

defineProps<IDialogPropsParam<null, { id: string, logType: string }>>()

const internalOpen = ref(false)

onMounted(() => {
  internalOpen.value = true
})
</script>
