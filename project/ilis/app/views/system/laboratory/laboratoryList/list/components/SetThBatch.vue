<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <HtModal
    v-model:open="showDialog"
    title="批量设置温湿度"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleConfirm()"
  >
    <TempHumForm
      ref="formRef"
      :usedByBatch="true"
    ></tempHumForm>
  </HtModal>
</template>

<script setup lang='ts'>
import type { ISetTHBach } from '../../../api.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { setTHBatch } from '../../../api.ts'
import TempHumForm from './tempHumForm.vue'

interface IProps {
  ids: string[]
}

/** 带参数的弹窗props */
const props = defineProps<IDialogPropsParam<null, IProps>>()

const showDialog = ref(true)

const loading = ref(false)

const formRef = ref<any>()
async function handleConfirm() {
  const tempHumFormData = formRef.value?.getFormData()
  const params: ISetTHBach = {
    idList: props.param.ids,
    minTemperature: tempHumFormData.minTemperature,
    maxTemperature: tempHumFormData.maxTemperature,
    minHumidity: tempHumFormData.minHumidity,
    maxHumidity: tempHumFormData.maxHumidity,
    minTemperatureCon: tempHumFormData.minTemCon,
    maxTemperatureCon: tempHumFormData.maxTemCon,
    minHumidityCon: tempHumFormData.minHumCon,
    maxHumidityCon: tempHumFormData.maxHumCon,
    showReally: tempHumFormData.showReallyTH,
    valueTakeTem: tempHumFormData.temValueTake,
    valueTakeHum: tempHumFormData.humValueTake,
  }
  loading.value = true
  await setTHBatch(params).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  showDialog.value = false
  props.onConfirm(null)
}
</script>
