<template>
  <Option :name="props.name" :desc="props.description">
    <AInput
      v-model:value.lazy="value"
      allow-clear
      class="max-w-max min-w-80"
      :disabled="props.disabled"
      :suffix="props.unit"
      :data-test="props.id"
      @change="$emit('optionChange', props.id, value, props.value)"
    />
  </Option>
</template>

<script setup lang="ts">
import type { BaseOptionProps } from '../Options.vue'
import Option from './Option.vue'

export interface Props extends BaseOptionProps {
  type: 'text'
}

const props = defineProps<Props>()
defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()
const value = ref(props.value)
</script>
