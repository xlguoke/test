<template>
  <div class="flex items-center">
    <input
      v-model="value"
      type="color"
      class="w-10 h-10 border rounded cursor-pointer"
    />
    <a-input
      v-model:value="value"
      placeholder="请输入十六进制颜色值"
      style="width: 120px;"
      @change="handleValChange"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const value = defineModel<string>()

function handleValChange(e: Event) {
  emit('change', (e.target as HTMLInputElement).value)
}
</script>
