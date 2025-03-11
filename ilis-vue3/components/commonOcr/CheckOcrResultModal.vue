<template>
  <a-modal
    v-bind="$attrs"
    v-model:open="internalOpen"
    centered
    destroy-on-close
    title="解析结果"
    :body-style="{
      maxHeight: '80vh',
      overflow: 'auto',
    }"
    :width="modalWidth"
    :keyboard="false"
    :mask-closable="false"
  >
    <template #footer>
      <a-button type="primary" @click="handleConfirm">
        关闭
      </a-button>
    </template>
    <CheckOcrResult ref="checkOcrResultRef" :ocr="ocr" />
  </a-modal>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { IOcrQueryParams } from './ocrResultMockData'
import CheckOcrResult from './CheckOcrResult.vue'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  ocr: {
    type: Object as PropType<IOcrQueryParams>,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

const checkOcrResultRef = ref()

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

const modalWidth = computed(() => {
  if (checkOcrResultRef.value?.getWidth()) {
    return `${checkOcrResultRef.value?.getWidth()}px`
  }
  return '80%'
})

/**
 * # 确认
 */
function handleConfirm() {
  internalOpen.value = false
  emits('confirm')
}

defineExpose({
  internalOpen,
  handleConfirm,
})
</script>
