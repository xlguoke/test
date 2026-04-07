<template>
  <HtModal
    v-model:open="showDialog"
    title="运输过程登记"
    :after-close="onClosed"
    @ok="onOk"
  >
    <IlisForm
      :entity="TransportationProcessEntity"
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
import { TransportationProcessEntity } from '../entity/TransportationProcessEntity'

const props = defineProps<IDialogPropsParam<any, any>>()

const showDialog = ref(true)

function onOk() {
  message.success('保存成功')
  showDialog.value = false
  props.onConfirm(null)
}
</script>
