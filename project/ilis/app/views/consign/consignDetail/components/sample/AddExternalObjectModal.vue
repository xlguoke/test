<template>
  <HtModal
    v-model:open="showDialog"
    title="录入外来样品"
    width="80%"
    :confirm-loading="confirmLoading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>样品信息</BaseTitle>
    <a-alert
      v-if="props.param?.referred"
      type="info"
      message="注：引用的外来样品信息不可修改，若需修改，请原委托中修改外来样品信息并重新引用"
      show-icon
      class="!mb-2"
    />
    <IlisForm
      ref="externalObjectFormRef"
      :cols="3"
      :init-data="ExternalObjectEntity.fromJSON(param)"
      :entity="ExternalObjectEntity"
      :disabled="props.param?.referred"
      :hidden-fields="hiddenFields"
      :mixin-rules="mixinRules"
    ></IlisForm>
    <BaseTitle>掺量信息</BaseTitle>
    <IlisForm
      ref="mixingAmountFormRef"
      :cols="3"
      :init-data="MixingAmountEntity.fromJSON(param)"
      :entity="MixingAmountEntity"
    ></IlisForm>
  </HtModal>
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import type { IConsignSamples } from '../../interface'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { addExternalSampleApi } from '~/api/consign/consign-management'
import { ExternalObjectEntity } from '~/components/selectorViaMethodCall/entity/ExternalObjectEntity'
import { MixingAmountEntity } from '~/components/selectorViaMethodCall/entity/MixingAmountEntity'
import { useSystemParamStore } from '~/store/systemParamStore'

/** 带参数的弹窗props */
const props = defineProps<IDialogPropsParam<Record<string, any>, IConsignSamples>>()

const { systemParams } = useSystemParamStore()

const showDialog = ref(true)

const externalObjectFormRef = ref<IlisFormExpose<ExternalObjectEntity>>()

const mixingAmountFormRef = ref<IlisFormExpose<MixingAmountEntity>>()

const confirmLoading = ref(false)

const hiddenFields = computed<string[]>(() => {
  const arr = []
  if (!systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE) {
    arr.push('provideToCustomerSampleCode')
  }
  return arr
})

const mixinRules = computed<Record<string, Rule[]> | undefined>(() => {
  return {
    ...(systemParams.EXTERNAL_OBJECT_OCCUPATION
      ? {
          testObjectCode: [
            { required: true, message: '请输入样品编号！', trigger: 'blur' },
            { validator: detectTestObjectCodeHasBeenUsed('typeSample'), trigger: 'blur' },
          ],
        }
      : {}),
    ...(systemParams.EXTERNAL_OBJECT_OCCUPATION && systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE
      ? {
          provideToCustomerSampleCode: [
            { required: true, message: '请输入来样编号！', trigger: 'blur' },
            { validator: detectTestObjectCodeHasBeenUsed('typeProvideToCustomerSampleCode'), trigger: 'blur' },
          ],
        }
      : {}),
  }
})

function detectTestObjectCodeHasBeenUsed(snType: 'typeSample' | 'typeProvideToCustomerSampleCode') {
  return async (_rule: Rule, value: string) => {
    if (!value)
      return Promise.resolve()
    let url = 'testObjectController/validObjectCode.do'
    if (snType !== 'typeSample') {
      url = 'testObjectController/validPtcSampleCode.do'
    }
    await ilisAxios.get(url, {
      params: {
        code: value,
        id: props.param?.id || '',
      },
    })
  }
}

async function handleOk() {
  const [externalObjectData, mixingAmountData] = await Promise.all([
    externalObjectFormRef.value?.getFormData(),
    mixingAmountFormRef.value?.getFormData(),
  ])
  const fromData = {
    ...externalObjectData,
    ...mixingAmountData,
    mark: props.param?.mark || generateGUID(),
    needOccupation: systemParams.EXTERNAL_OBJECT_OCCUPATION && !props.param?.referred,
    referred: props.param?.referred || false,
    type: 3, // 添加手动录入类型 by chenlm at 2019-07-04 09:11:20
  }
  confirmLoading.value = true
  const { data } = await addExternalSampleApi(fromData).finally(() => {
    showDialog.value = false
    confirmLoading.value = false
  })

  fromData.externalObjectId = data.data
  props.onConfirm(fromData)
  showDialog.value = false
}
</script>

<style scoped>
:deep(.ant-form-item-explain-error){
  white-space: pre-wrap;
  line-height: 14px;
}
</style>
