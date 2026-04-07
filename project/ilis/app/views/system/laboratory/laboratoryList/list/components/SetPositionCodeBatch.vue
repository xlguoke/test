<template>
  <HtModal
    v-model:open="showDialog"
    title="批量配置目的地编号"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleConfirm()"
  >
    <IlisForm
      ref="formRef"
      :cols="1"
      :entity="SetPositionCodeBatchEntity"
      :label-col="{
        span: 7,
      }"
    >
    </IlisForm>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import { setPositionCodeBatch } from '../../../api.ts'
import { SetPositionCodeBatchEntity } from './SetPositionCodeBatchEntity.ts'

interface IProps {
  ids: string[]
}

/** 带参数的弹窗props */
const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const loading = ref(false)

const formRef = ref<IlisFormExpose<SetPositionCodeBatchEntity>>()
async function handleConfirm() {
  const res = await formRef.value?.getFormData()
  loading.value = true
  await setPositionCodeBatch(props.param.ids, res!.positionCode as string).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  showDialog.value = false
  props.onConfirm(null)
}
</script>
