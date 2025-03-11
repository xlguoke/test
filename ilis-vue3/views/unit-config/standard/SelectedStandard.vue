<!-- 变更规程类型 -->
<template>
  <a-modal
    v-model:open="visible"
    title="选择规程"
    width="80%"
    :mask-closable="false"
    :keyboard="false"
    centered
    @ok="onOk"
    @cancel="onCancel"
  >
    <div class="h-[75vh]">
      <Standard
        ref="standardRef"
        :key="key"
        selected-mode
        :use-type="useType"
      />
    </div>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import Standard from './Standard.vue'
import type { DataSource } from './api'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  useType: {
    type: String,
    default: '',
  },
})

const emits = defineEmits<{
  (e: 'select', data: DataSource[]): void
  (e: 'update:open', data: boolean): void
}>()

const visible = ref(false)
const key = ref(0)
// 关闭弹窗
function onCancel() {
  visible.value = false
}

const standardRef = ref()
async function onOk() {
  const data = await standardRef.value.getSelectedRows()
  emits('select', data)
}

watch(() => props.open, (val) => {
  if (val)
    key.value += 1
  visible.value = val
})
watch(visible, (val) => {
  if (val)
    return
  emits('update:open', val)
})
</script>

<style>

</style>
