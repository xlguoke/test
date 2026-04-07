<template>
  <component
    :is="layoutItem.config?.component ? INPUT_TEMPLATE_MAP[layoutItem.config.component] : undefined"
    v-model="value"
    :layout-item="layoutItem"
    :disabled="disabled"
    :consign-detail="consignDetail"
    @change="(e:any) => emits('change', e)"
    @click="emits('click')"
  />
</template>

<script lang="ts" setup>
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'
import { INPUT_TEMPLATE_MAP } from '../../../constants'

const props = defineProps<{
  /** # 双向数据绑定 */
  modelValue: any
  /** # 禁用状态 */
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
  /** 委托详情 */
  consignDetail?: IConsignDataDTO
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', value: string): void
  (event: 'click'): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (JSON.stringify(props.modelValue) !== JSON.stringify(val)) {
      emits('update:modelValue', val)
    }
  },
})
</script>
