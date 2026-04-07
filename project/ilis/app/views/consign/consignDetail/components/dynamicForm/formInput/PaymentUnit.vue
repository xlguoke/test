<!-- 缴费单位 -->
<template>
  <a-input-group compact>
    <a-input
      v-model:value="value"
      :style="`width: ${systemParams.CONGIN_UNIT_1 ? 'calc(100% - 52px)' : '100%'}`"
      :disabled="props.disabled"
      :readonly="systemParams.CONGIN_UNIT_1"
      allow-clear
      :placeholder="disabled ? '' : `请选择${props.layoutItem.fieldName}`"
    />
    <a-button
      v-if="systemParams.CONGIN_UNIT_1"
      class="h-full W-[52px]"
      type="primary"
      :disabled="props.disabled"
      @click="handleSelect"
    >
      选择
    </a-button>
  </a-input-group>
</template>

<script setup lang="ts">
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { ConfirmResult } from '~/components/IframeLayer.vue'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import IframeLayer from '~/components/IframeLayer.vue'
import { useSystemParamStore } from '~/store/systemParamStore'

const props = defineProps<{
  /** # 双向数据绑定 */
  modelValue: any
  /** # 禁用状态 */
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: unknown): void
  (event: 'change', value: any): void
}>()

const { systemParams } = useSystemParamStore()

const value = computed({
  get: () => props.modelValue || undefined,
  set: (val) => {
    emits('update:modelValue', val)
  },
})

function handleSelect() {
  AnyDialogHelper.showModel(IframeLayer, {
    title: '选择第三方缴费单位',
    url: '/ilis2/consignUnitController.do?goExternalUnitList',
    onConfirm: (res: ConfirmResult) => {
      if (!res)
        return

      const data = res.iframeWindow?.getSelectedData()
      if (!data || !data.length)
        return message.error('请选择缴费单位')

      if (data.length > 1)
        return message.error('请选择一个缴费单位')

      const row = data[0]
      res.close()

      emits('update:modelValue', row.name)
      emits('change', row)
    },
  })
}
</script>
