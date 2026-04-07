<template>
  <div class="inline-block">
    <a-form-item-rest>
      <a-flex align="center">
        <a-input
          v-model:value.trim="startValue"
          class="flex-1 w-0 !min-w-[100px]"
          allow-clear
          :placeholder="placeholder[0] || ''"
          :disabled="!!disabled"
          @change="onChange"
        />
        <span class="mx-1">~</span>
        <a-input
          v-model:value.trim="endValue"
          class="flex-1 w-0 !min-w-[100px]"
          allow-clear
          :placeholder="placeholder[1] || ''"
          :disabled="!!disabled"
          @change="onChange"
        />
      </a-flex>
    </a-form-item-rest>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: Array<string | number> | undefined
  placeholder: string[]
  disabled?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: Array<string | number> | undefined): void
  (event: 'change', value: Array<string | number> | undefined): void
}>()

const startValue = ref('')
const endValue = ref('')
const rangeVal = computed(() => [startValue.value, endValue.value])

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      startValue.value = newValue[0] !== undefined ? String(newValue[0]) : ''
      endValue.value = newValue[1] !== undefined ? String(newValue[1]) : ''
    }
    else {
      startValue.value = ''
      endValue.value = ''
    }
  },
  {
    immediate: true,
  },
)

watch(() => rangeVal.value, (newValue) => {
  emits('update:modelValue', newValue)
})

function onChange() {
  emits('change', rangeVal.value)
}
</script>
