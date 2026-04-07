<template>
  <a-input-group compact>
    <a-input
      :value="displayValue || value"
      class="flex-1"
      readonly
      :disabled="props.disabled"
      :title="displayValue || value"
      :placeholder="disabled ? '' : `请选择${props.layoutItem.fieldName}`"
    />
    <a-button
      v-if="showBtn"
      class="h-full"
      type="primary"
      :disabled="props.disabled"
      @click="handleSelect"
    >
      选择
    </a-button>
  </a-input-group>
</template>

<script setup lang='ts'>
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IBusinessConfig, IConsignProcessor } from '~/views/consign/consignDetail/interface'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { INPUT_TEMPLATE_MAP } from '../../../constants'

const props = defineProps<{
  modelValue: string | { name: string } | undefined
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
  /** 业务配置 */
  businessConfig?: IBusinessConfig
  /** 委托处理器 */
  consignProcessor: IConsignProcessor
  /** 展示值 */
  displayValue?: string
}>()
const emits = defineEmits<{
  (event: 'update:modelValue', value: any): void
  (event: 'change', value: any): void
}>()

const component = computed(() => {
  const c = props.layoutItem.config?.component
  return c ? INPUT_TEMPLATE_MAP[c] : null
})

const showBtn = computed(() => {
  return !(props.layoutItem.fieldCode === 'project' && props.consignProcessor.pageStateService.isTestProject)
})

const value = computed({
  get() {
    if (typeof props.modelValue === 'string')
      return props.modelValue || ''
    return props.modelValue?.name || ''
  },
  set(val: any) {
    if (JSON.stringify(props.modelValue) !== JSON.stringify(val)) {
      emits('update:modelValue', val)
    }
  },
})

async function handleSelect() {
  const fieldCode = props.layoutItem.fieldCode
  const config = props.businessConfig ? props.businessConfig[fieldCode] : {}
  if (config && config.beforeClick) {
    const res = await config.beforeClick()
    if (!res)
      return
  }

  if (!component.value)
    throw new Error('组件不存在')

  const res = await AnyDialogHelper.showSelector(component.value, {
    title: `请选择${props.layoutItem.fieldName}`,
    customParams: {
      consignProcessor: props.consignProcessor,
    },
  })
  // eslint-disable-next-line no-console
  console.log('selector选择结果', res)
  emits('change', res)
}
</script>

<style>

</style>
