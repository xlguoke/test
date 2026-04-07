<!-- 变更规程类型 -->
<template>
  <ht-modal
    v-model:open="visible"
    title="选择规程"
    width="80%"
    fixed-height
    @ok="onOk"
    @cancel="onCancel"
  >
    <Standard
      ref="standardRef"
      :key="key"
      selected-mode
      :use-type="useType"
      :check-whether-this-unit="checkWhetherThisUnit"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { DataSource } from './api'
import { ref } from 'vue'
import Standard from './Standard.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  useType: {
    type: String,
    default: '',
  },
  /** 选择数据时，是否验证本单位规程 */
  checkWhetherThisUnit: {
    type: Boolean,
    default: true,
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
