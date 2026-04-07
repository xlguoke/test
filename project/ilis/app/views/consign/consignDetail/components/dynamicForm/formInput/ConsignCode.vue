<template>
  <a-input-group compact>
    <a-input
      v-model:value.trim="value"
      :style="`width: ${consignProcessor.pageStateService.isCreateTest ? '100%' : 'calc(100% - 72px)'}`"
      :disabled="disabled"
      :placeholder="`${!disabled ? `请输入${layoutItem.fieldName}` : ''}`"
      @change="handleChange"
    />
    <a-button
      v-if="!consignProcessor.pageStateService.isCreateTest"
      type="primary"
      :disabled="disabled"
      @click="createCode"
    >
      生成编号
    </a-button>
  </a-input-group>
</template>

<script setup lang='ts'>
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import { useConsignProcessor } from '../../../composables/useProviderInject'

defineProps<{
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
}>()
const emits = defineEmits(['change', 'click'])
const value = defineModel<string>()

const { consignProcessor } = useConsignProcessor()

function handleChange(e: any) {
  emits('change', e.target?.value)
}

function createCode() {
  emits('click')
}
</script>

<style>

</style>
