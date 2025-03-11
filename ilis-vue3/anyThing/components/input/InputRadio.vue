<template>
  <a-radio-group
    v-model:value="value"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script lang="ts" setup>
import type { RadioChangeEvent } from 'ant-design-vue'

const props = defineProps<{
  modelValue: number | string | undefined
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: number | string | undefined): void
  (event: 'change', value: number | string): void
}>()

const value = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  value.value = newValue
})

watch(() => value.value, (newValue) => {
  emits('update:modelValue', newValue)
})

function onChange(e: RadioChangeEvent) {
  emits('change', e.target.value)
}
</script>
