<template>
  <a-modal
    v-model:open="open"
    title="选择样品/参数"
    width="95%"
    destroy-on-close
    centered
    :mask-closable="false"
    :body-style="{ height: modalHeight }"
    @cancel="onCancel"
  >
    <SelectSampleParam />

    <template #footer>
      <a-button @click="onCancel">
        取消
      </a-button>
      <a-button type="primary" @click="onOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import SelectSampleParam from './SelectSampleParam.vue'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam/index.ts'

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open', 'onSelect'])

/**
 * 提交方法
 * 将子组件的构建提交数据方法赋值给该页面，该页面调用获取
 */
let onSubmit
provide('setOnSubmit', (fn) => {
  onSubmit = fn
})

const modalHeight = `${document.body.clientHeight - 160}px`

const open = computed(() => props.value)

const onCancel = function () {
  emits('update:open', false)
}
const onOk = function () {
  const data: SelectSampleParamEntity | false = onSubmit()

  if (!data) {
    return
  }

  emits('onSelect', data)
  onCancel()
}
</script>
