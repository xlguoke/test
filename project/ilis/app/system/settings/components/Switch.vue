<template>
  <Option :name="props.name" :desc="props.description" flexed>
    <ASwitch
      v-model:checked="value"
      checked-children="开启"
      un-checked-children="关闭"
      :disabled="props.disabled"
      @change="$emit('optionChange', props.id, value ? 'Y' : 'N', props.value)"
    />
  </Option>
</template>

<script setup lang="ts">
import type { BaseOptionProps } from '../Options.vue'
import Option from './Option.vue'

export interface Props extends BaseOptionProps {
  type: 'switch'
}
const props = defineProps<Props>()
defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()
const value = ref(false)
</script>
