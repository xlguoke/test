<template>
  <ASkeleton v-if="isLoading" active />
  <AResult v-else-if="!!error" title="500" :sub-title="error" />
  <AFlex v-else gap="small" vertical>
    <component
      :is="components[option.type]"
      v-for="option in options"
      :key="option.id"
      v-bind="option"
      @option-change="onOptionChange"
    />
  </AFlex>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { CheckboxProps, NumberProps, SelectProps, SwitchProps, TextProps } from './components'
import { Switch, Checkbox as checkbox, Number as number, Select as select, Text as text } from './components'
import { useSettingOptions } from './settings'

export interface BaseOptionProps {
  id: string
  name: string
  description?: string
  value?: string
  unit?: string
  disabled: boolean
}

export type Option = TextProps | SelectProps | NumberProps | CheckboxProps | SwitchProps

const props = defineProps<{ id: string, name: string }>()
const e = defineEmits<{
  optionChange: [id: string, value: string | undefined, prev: string | undefined]
}>()

const components: { [key: string]: Component } = {
  text,
  select,
  number,
  checkbox,
  switch: Switch,
}

function onOptionChange(id: string, val: string | undefined, prev: string | undefined) {
  e('optionChange', id, val, prev)
}

const id = computed(() => props.id)

const { options, isLoading, error } = useSettingOptions(id)
</script>
