<template>
  <HtModal
    v-model:open="showDialog"
    title="复制问卷"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleOk"
  >
    <IlisForm
      ref="formRef"
      :entity="EvaluateModelEntity"
      :cols="1"
    >
    </IlisForm>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EvaluateModelEntity } from '../EvaluateModelEntity'
import { copyEvaluateModel } from '../api'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm } from '~/components/ilisComponent'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

const props = defineProps<IDialogPropsParam<null, EvaluateModelEntity>>()

const showDialog = ref(true)

const formRef = ref<IlisFormExpose<EvaluateModelEntity>>()

const loading = ref(false)

async function handleOk() {
  const data = await formRef.value?.getFormData()
  data!.id = props.param.id
  loading.value = true
  await copyEvaluateModel(data!).finally(() => {
    loading.value = false
  })
  showDialog.value = false
  message.success('复制成功')
  props.onConfirm(null)
}
</script>
