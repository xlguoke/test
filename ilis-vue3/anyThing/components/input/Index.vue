<template>
  <component
    :is="componentsMap[formFieldConfig.formType || EFormItemType.INPUT]"
    v-bind="$attrs"
    allow-clear
    :model-value="value"
    :value-format="formFieldConfig.dateFormat"
    :placeholder="placeholder"
    :form-field-config="formFieldConfig"
    :selector-config="formFieldConfig.selectorConfig"
    :options="configInstance.getOptions(field)"
    :disabled="disabled"
    @update:model-value="value = $event"
    @change="(e:any) => emits('change', e)"
  />
</template>

<script lang="ts" setup>
import { EFormItemType } from '../../enum/EFormItemType'
import type { AnyBaseModel } from '../../model/AnyBaseModel'
import type { ClassConstructor } from '../../types/ClassConstructor'
import { componentsMap } from '.'

const props = defineProps<{
  /**
   * # 双向数据绑定
   * @description 父组件通过v-model绑定
   */
  modelValue: any
  /**
   * # 配置实体
   */
  entity: ClassConstructor<AnyBaseModel>
  /**
   * # 表单项关联字段
   */
  field: string
  /**
   * # 占位符
   */
  placeholder?: string
  /**
   * # 禁用
   */
  disabled?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', value: string): void
}>()

const value = ref(props.modelValue)

/**
 * 配置实例
 */
const configInstance = computed(() => {
  return new props.entity!()
})

/**
 * 表单字段配置
 */
const formFieldConfig = computed(() => {
  return configInstance.value.getFormFieldConfigObj(props.field)[props.field]
})

watch(() => props.modelValue, (newValue: any) => {
  if ([EFormItemType.DATE, EFormItemType.DATETIME].includes(formFieldConfig.value.formType) && formFieldConfig.value.dateFormat) {
    value.value = AnyDateTimeHelper.format(newValue, formFieldConfig.value.dateFormat)
    emits('update:modelValue', value.value)
  }
  else if ([EFormItemType.DATE_RANGE, EFormItemType.DATETIME_RANGE].includes(formFieldConfig.value.formType) && formFieldConfig.value.dateFormat) {
    if (value.value?.length === 2) {
      value.value[0] = AnyDateTimeHelper.format(newValue?.[0], formFieldConfig.value.dateFormat)
      value.value[1] = AnyDateTimeHelper.format(newValue?.[1], formFieldConfig.value.dateFormat)
    }
    emits('update:modelValue', value.value)
  }
  else {
    value.value = newValue
  }
}, {
  immediate: true,
})

watch(() => value.value, (newValue) => {
  emits('update:modelValue', newValue)
}, {
  immediate: true,
  deep: true,
})

/**
 * 占位符
 */
const placeholder = computed(() => {
  if (props.disabled && !props.modelValue) {
    return ''
  }

  if (props.placeholder) {
    return props.placeholder
  }

  const label = configInstance.value.getFormFieldLabel(props.field)

  if (formFieldConfig.value.placeholder) {
    return formFieldConfig.value.placeholder
  }
  else if (
    formFieldConfig.value.formType === EFormItemType.INPUT
    || formFieldConfig.value.formType === EFormItemType.INPUT_NUMBER
    || formFieldConfig.value.formType === EFormItemType.TEXTAREA
  ) {
    return `请输入${label}`
  }
  else if (
    formFieldConfig.value.formType === EFormItemType.SELECT
    || formFieldConfig.value.formType === EFormItemType.DATE
    || formFieldConfig.value.formType === EFormItemType.DATETIME
    || formFieldConfig.value.formType === EFormItemType.INPUT_SELECTOR
  ) {
    return `请选择${label}`
  }
  else if (
    formFieldConfig.value.formType === EFormItemType.DATE_RANGE
    || formFieldConfig.value.formType === EFormItemType.DATETIME_RANGE
  ) {
    return [`${label}开始`, `${label}结束`]
  }
  else {
    return '请输入...'
  }
})
</script>
