<template>
  <a-radio-group
    v-model:value="value"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script lang="ts" setup>
import type { RadioChangeEvent } from 'ant-design-vue'

const emits = defineEmits<{
  (event: 'change', value: number | string): void
}>()

const value = defineModel<string>()

function onChange(e: RadioChangeEvent) {
  emits('change', e.target.value)
}
</script>
