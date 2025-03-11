<template>
  <a-modal
    v-model:open="internalOpen"
    centered
    width="80%"
    title="检校详情"
    :keyboard="false"
    :mask-closable="false"
  >
    <iframe
      class="w-full h-[80vh]"
      :src="`/ilis2/checkController.do?goCheckEdit&detail=detailPage&editId=${ocr.eqCheckId}&equipmentId=${ocr.equipmentId}`"
      frameborder="0"
    />
    <template #footer>
      <a-button type="primary" @click="handleConfirm()">
        关闭
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import type { OcrRecordEntity } from '..'

const props = defineProps({
  /**
   * # 是否展示弹窗
   */
  show: {
    type: Boolean,
    default: false,
  },
  ocr: {
    type: Object as PropType<OcrRecordEntity>,
    required: true,
  },
})

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

const internalOpen = ref(props.show)

watch(() => props.show, (val) => {
  internalOpen.value = val
})

watch(internalOpen, (val) => {
  emits('update:show', val)
})

/**
 * # 确认
 */
function handleConfirm() {
  internalOpen.value = false
  emits('confirm')
}
</script>
