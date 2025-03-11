<template>
  <Option :name="props.name" :desc="props.description" flexed>
    <ACheckbox
      v-model:checked="value"
      :disabled="props.disabled"
      @change="$emit('optionChange', props.id, value ? 'Y' : 'N', props.value)"
    />
  </Option>
</template>

<script setup lang="ts">
import type { BaseOptionProps } from '../Options.vue'
import Option from './Option.vue'

export interface Props extends BaseOptionProps {
  type: 'checkbox'
}

const props = defineProps<Props>()
defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()

const value = ref(props.value === 'Y')
</script>
