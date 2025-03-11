<template>
  <Option :name="props.name" :desc="props.description">
    <AInputNumber
      v-model:value.lazy="value"
      :disabled="props.disabled"
      :min="1"
      :addon-after="props.unit"
      @change="$emit('optionChange', props.id, value, props.value)"
    />
  </Option>
</template>

<script setup lang="ts">
import type { BaseOptionProps } from '../Options.vue'
import Option from '~/system/settings/components/Option.vue'

export interface Props extends BaseOptionProps {
  type: 'number'
}
const props = defineProps<Props>()
defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()
const value = ref(props.value)
</script>

<style scoped lang="less">

</style>
