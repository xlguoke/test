<template>
  <Option :name="props.name" :desc="props.description">
    <ASelect
      v-model:value="value"
      allow-clear
      :dropdown-match-select-width="false"
      :options="payload"
      class="min-w-min"
      popup-class-name="min-w-max"
      @change="$emit('optionChange', props.id, value, props.value)"
    />
  </Option>
</template>

<script setup lang="ts">
import type { BaseOptionProps } from '../Options.vue'
import Option from './Option.vue'

export interface Props extends BaseOptionProps {
  type: 'select'
  payload: { label: string, value: string }[]
}

const props = defineProps<Props>()
defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()

const value = ref(props.value)
</script>
