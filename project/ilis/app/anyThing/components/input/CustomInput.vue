<template>
  <component
    :is="dynamicComponentsMap[formFieldConfig.formType]"
    v-model="value"
    v-bind="$attrs"
    :form-field-config="formFieldConfig"
    :selector-config="formFieldConfig.selectorConfig"
    :allow-clear="allowClear"
    :title="value || placeholder"
    :value-format="formFieldConfig.dateFormat"
    :placeholder="placeholder"
    :options="formFieldConfig.options || []"
    :tree-data="formFieldConfig.treeData || undefined"
    :disabled="disabled"
    :mode="formFieldConfig.multiple ? 'multiple' : undefined"
    @change="(e:any) => emits('change', initValueFormat(e))"
  />
</template>

<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import type { IInputSelectorConfig } from '~/anyThing/interface/IInputSelectorConfig'
import dayjs from 'dayjs'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { EFormItemDynamicType } from '../../enum/EFormItemType'
import { dynamicComponentsMap } from './customIndex'

/** 自定义配置 */
export interface CustomFormFieldConfig {
  formType?: EFormItemDynamicType
  dateFormat?: EDateFormatType
  multiple?: boolean
  allowClear?: boolean
  placeholder?: string | string[]
  options?: Array<{ label: string, value: any }>
  treeData?: TreeProps['treeData']
  showTime?: boolean
  selectorConfig?: IInputSelectorConfig
}

const props = withDefaults(defineProps<{
  /** # 双向数据绑定 */
  modelValue: any
  /** # 禁用 */
  disabled?: boolean
  /** 清除图标 */
  allowClear?: boolean
  /** 自定义配置 */
  formFieldConfig?: CustomFormFieldConfig
  /** 日期返回标准格式：存在系统控制参数控制日期精度，格式不是标准格式时后端报错 */
  standardDateFormat?: boolean
}>(), {
  allowClear: true,
})

const emits = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', value: any): void
}>()

/** 表单字段配置 */
const formFieldConfig = computed(() => {
  const c = props.formFieldConfig || {}
  const { DATETIME, DATETIME_RANGE } = EFormItemDynamicType
  let showTime: any = c.formType === DATETIME || c.formType === DATETIME_RANGE
  let picker = ''

  if (showTime) {
    const timeFormat = c.dateFormat?.split(' ')[1]
    if (timeFormat)
      showTime = { format: timeFormat }
    else
      showTime = false
  }
  if (c.dateFormat === EDateFormatType.YYYY)
    picker = 'year'
  if (c.dateFormat === EDateFormatType.YYYY_MM)
    picker = 'month'

  return {
    formType: c.formType || EFormItemDynamicType.INPUT,
    dateFormat: c.dateFormat,
    options: c.options || [],
    treeData: c.treeData || [],
    multiple: c.multiple || false,
    placeholder: c.placeholder || '',
    showTime,
    picker,
    selectorConfig: c.selectorConfig || {},
  }
})

const value = computed({
  get: () => {
    const { DATE, DATETIME, DATE_RANGE, DATETIME_RANGE, TIME_RANGE, CHECKBOX, SELECT, SELECT_MULTIPLE, TREE_SELECT } = EFormItemDynamicType
    if ([DATE, DATETIME].includes(formFieldConfig.value.formType) && props.modelValue) {
      return dayjs(props.modelValue)
    }
    if ([DATE_RANGE, DATETIME_RANGE].includes(formFieldConfig.value.formType) && props.modelValue) {
      if (props.modelValue?.length === 2) {
        const transformDate = Array.from({ length: 2 })
        transformDate[0] = dayjs(props.modelValue[0])
        transformDate[1] = dayjs(props.modelValue[1])
        return transformDate
      }
      return []
    }
    if (!props.modelValue) {
      if ([CHECKBOX, TIME_RANGE].includes(formFieldConfig.value.formType))
        return []
      if ([SELECT, SELECT_MULTIPLE, TREE_SELECT].includes(formFieldConfig.value.formType))
        return undefined
    }
    return props.modelValue
  },
  set: (val) => {
    val = initValueFormat(val)
    if (JSON.stringify(props.modelValue) !== JSON.stringify(val)) {
      emits('update:modelValue', val)
    }
  },
})

function initValueFormat(val?: any) {
  if (props.standardDateFormat && val) {
    const { DATE, DATETIME, DATE_RANGE, DATETIME_RANGE } = EFormItemDynamicType
    const c = props.formFieldConfig || {}
    if (c!.formType && [DATE, DATE_RANGE].includes(c.formType)) {
      if (Object.prototype.toString.call(val) === '[object Array]')
        val = [dayjs(val[0]).format(EDateFormatType.YYYY_MM_DD), dayjs(val[1]).format(EDateFormatType.YYYY_MM_DD)]
      else
        val = dayjs(val).format(EDateFormatType.YYYY_MM_DD)
    }
    else if (c!.formType && [DATETIME, DATETIME_RANGE].includes(c.formType)) {
      if (Object.prototype.toString.call(val) === '[object Array]')
        val = [dayjs(val[0]).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS), dayjs(val[1]).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS)]
      else
        val = dayjs(val).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS)
    }
  }
  return val
}

/** 占位符 */
const placeholder = computed(() => {
  const v = props.modelValue
  if (props.disabled) {
    if (!v || v.length === 0) {
      const { DATE_RANGE, DATETIME_RANGE, TIME_RANGE } = EFormItemDynamicType
      if ([DATE_RANGE, DATETIME_RANGE, TIME_RANGE].includes(formFieldConfig.value.formType))
        return []
      return ''
    }
    if (!v[0] || !v[1]) {
      return []
    }
  }
  return formFieldConfig.value.placeholder || ''
})
</script>
