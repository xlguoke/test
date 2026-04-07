<template>
  <ht-modal
    v-model:open="open"
    :title="`请选择委托${term('样品')}`"
    width="95%"
    destroy-on-close
    centered
    fixed-height
    :mask-closable="false"
    :full-screen="EmbeddedHelper.isEmbedded"
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
  </ht-modal>
</template>

<script setup lang='ts'>
import type { MainController } from '../selectSample/modules/MainController'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam/index.ts'
import { useIndustryStore } from '~/store/industryStore.ts'
import SelectSampleParam from './SelectSampleParam.vue'

interface PropParam {
  industryId: string
  mainController: MainController
}

const props = defineProps<IDialogPropsParam<SelectSampleParamEntity | false, PropParam>>()

provide('mainController', props.param.mainController)

const open = ref(true)

const { term } = useIndustryStore()

/**
 * 提交方法
 * 将子组件的构建提交数据方法赋值给该页面，该页面调用获取
 */
let onSubmit: () => SelectSampleParamEntity | false
provide('setOnSubmit', (fn: () => SelectSampleParamEntity | false) => {
  onSubmit = fn
})

function onCancel() {
  open.value = false
}
function onOk() {
  const data: SelectSampleParamEntity | false = onSubmit()

  if (!data) {
    return
  }

  props.onConfirm(data)
  onCancel()
}
</script>
