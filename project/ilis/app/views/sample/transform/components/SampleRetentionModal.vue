<template>
  <HtModal
    v-model:open="showDialog"
    title="样品留样登记"
    :after-close="onClosed"
    @ok="onOk"
  >
    <IlisForm
      :entity="SampleRetentionEntity"
      :cols="1"
      :label-col="{
        style: { width: '130px' },
      }"
    />
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { SampleRetentionEntity } from '../entity/SampleRetentionEntity'

const props = defineProps<IDialogPropsParam<any, any>>()

const showDialog = ref(true)

function onOk() {
  message.success('保存成功')
  showDialog.value = false
  props.onConfirm(null)
}
</script>
