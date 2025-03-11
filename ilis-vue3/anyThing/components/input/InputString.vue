<template>
  <a-input
    v-model:value.trim="value"
    v-bind="$attrs"
    @change="onChange"
  >
    <template v-if="$slots.addonBefore" #addonBefore>
      <slot name="addonBefore" />
    </template>
    <template v-if="$slots.addonAfter" #addonAfter>
      <slot name="addonAfter" />
    </template>
  </a-input>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: string | number | undefined
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string | number | undefined): void
  (event: 'change', value: string): void
}>()

const value = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  value.value = newValue
})

watch(() => value.value, (newValue) => {
  emits('update:modelValue', newValue)
})

function onChange(e: Event) {
  emits('change', (e.target as HTMLInputElement).value)
}
</script>
