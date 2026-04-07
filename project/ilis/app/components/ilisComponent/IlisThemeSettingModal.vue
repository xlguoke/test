<template>
  <a-drawer
    v-model:open="showDialog"
    title="设置"
    width="30%"
    @after-open-change="handleOpenChange"
    @ok="onOk"
  >
    <ThemeSettings></ThemeSettings>
  </a-drawer>
</template>

<script setup lang='ts'>
import type { IDialogProps } from '~/anyThing/interface/IDialogProps'
import ThemeSettings from '~/system/settings/ThemeSettings.vue'

const props = defineProps<IDialogProps<null>>()

const showDialog = ref(true)

/**
 * 处理抽屉打开状态变化
 */
function handleOpenChange(open: boolean) {
  if (!open) {
    props.onClosed()
  }
}

function onOk() {
  props.onConfirm(null)
  showDialog.value = false
}
</script>
