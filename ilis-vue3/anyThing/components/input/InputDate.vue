<template>
  <a-date-picker
    v-model:value="value"
    v-bind="$attrs"
    @change="onChange"
  />
</template>

<script lang="ts" setup>
import type { Dayjs } from 'dayjs'

const props = defineProps<{
  modelValue: string | Dayjs | undefined
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string | Dayjs | undefined): void
  (event: 'change', value: string | Dayjs | undefined): void
}>()

const value = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  value.value = newValue
})

watch(() => value.value, (newValue) => {
  emits('update:modelValue', newValue)
})

function onChange(e: string | Dayjs | undefined) {
  emits('change', e)
}
</script>
