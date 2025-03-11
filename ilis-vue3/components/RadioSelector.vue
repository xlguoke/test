<template>
  <ht-modal
    v-model:open="internalOpen"
    width="460px"
    :title="param.title || '选择'"
    :ok-text="param.okText || '确定'"
    @cancel="internalOpen = false"
    @ok="handleConfirm"
  >
    <a-radio-group
      v-model:value="typeVal"
      :options="param.options"
    >
      <div class=" flex flex-col">
        <a-radio
          v-for="(item, index) in param.options"
          :key="index"
          :value="item.value"
        >
          {{ item.label }}
        </a-radio>
      </div>
    </a-radio-group>
  </ht-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IOption } from '~/interface/IOption'

const props = defineProps<IDialogPropsParam<string, {
  title?: string
  okText?: string
  options: IOption[]
}>>()

const internalOpen = ref(true)

const typeVal = ref(props.param?.options?.[0]?.value)

/**
 * # 确认
 */
function handleConfirm() {
  if (!typeVal.value) {
    return message.warning('请选择！')
  }
  props.onConfirm(unref(typeVal.value))
  internalOpen.value = false
}
</script>
