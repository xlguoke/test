<template>
  <ht-modal
    v-model:open="visible"
    :title="param.title || '选择'"
    width="300px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk()"
  >
    <a-checkbox-group
      v-if="param.multiple"
      v-model:value="value"
      :options="param.options"
    />
    <a-radio-group
      v-else
      v-model:value="value"
      :options="param.options"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'

interface ISelectModalProps {
  /** # 标题 */
  title?: string
  /** # 弹窗选项 */
  options: IOption[]
  /** # 是否多选 */
  multiple?: boolean
  /** # 默认值 */
  defaultValue: any
}

const props = defineProps<IDialogPropsParam<any, ISelectModalProps>>()

const visible = ref(true)

const loading = ref(false)

const value = ref(props.param.defaultValue)

function handleOk() {
  props.onConfirm(value.value)
  visible.value = false
}
</script>
