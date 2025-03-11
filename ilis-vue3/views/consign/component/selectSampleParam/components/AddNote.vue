<!-- 添加附注 -->
<template>
  <a-modal
    v-model:open="visible"
    title="添加附注"
    :keyboard="false"
    :mask-closable="false"
    centered
    width="500px"
    :confirm-loading="loading"
    @cancel="onCancel"
    @ok="onOk"
  >
    <div class="pt-4 h-20">
      <a-input v-model:value="sampleNote" allow-clear placeholder="请输入附注信息" />
    </div>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  value: {
    type: String,
    default: '',
  },
})
const emits = defineEmits<{
  (e: 'save', data: string): void
  (e: 'update:open', data: boolean): void
}>()
const visible = ref(false)
const sampleNote = ref(props.value)
// 关闭弹窗
function onCancel() {
  visible.value = false
}
// 保存
function onOk() {
  emits('save', sampleNote.value)
}

watch(() => props.open, (val) => {
  visible.value = val
  sampleNote.value = props.value || ''
})
watch(visible, (val) => {
  if (val)
    return
  emits('update:open', val)
  sampleNote.value = ''
})
</script>

 <style>

 </style>
