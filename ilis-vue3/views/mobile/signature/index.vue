<template>
  <van-signature @submit="onSubmit" @clear="onClear" />
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'

interface SignatureData {
  image: string
  canvas: HTMLCanvasElement
}

const emits = defineEmits<{
  (e: 'confirm', data: string): void
  (e: 'clear'): void
}>()

function onSubmit(data: SignatureData) {
  if (!data.image) {
    return message.error('请签名')
  }
  emits('confirm', data.image)
}
function onClear() {
  emits('clear')
};
</script>
