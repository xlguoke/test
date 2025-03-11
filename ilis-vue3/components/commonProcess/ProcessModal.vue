<template>
  <ht-modal
    v-model:open="visible"
    title="提交审核"
    width="600px"
    :confirm-loading="processLoading"
    :after-close="onClosed"
    @ok="handleSubmitProcess()"
  >
    <IlisProcessForm
      ref="processFormRef"
      :hide-remark="param.hideRemark"
      :process-type="props.param.processType"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { AxiosResponse } from 'axios'
import { IlisProcessForm } from '~/components/ilisComponent'
import { preSubmitProcess } from '~/components/commonProcess/api'
import type { ProcessType } from '~/components/commonProcess'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'

export interface IProcessForm {
  /** # 审批流程类型 */
  processType: ProcessType
  /** # 查询是否配置审批流程的id */
  processId: string
  /** # 提交审批时要携带的参数 */
  queryParams?: Record<string, any>
  /** # 提交审批的api */
  submitAuditApi: (q?: any) => Promise<AxiosResponse<any>>
  /** # 提交审批时，将数据转换成想要的数据格式  */
  submitDataTransfer?: (data: Record<string, any>) => Record<string, any>
  /** 隐藏备注字段 */
  hideRemark?: boolean
}

const props = defineProps<IDialogPropsParam<null, IProcessForm>>()

/** 提交审核 */
const visible = ref(false)
const processLoading = ref(false)
const processFormRef = ref<IProcessFormExpose>()

submitAudit()

/** 查询是否配置审核流程 */
async function submitAudit() {
  const { data } = await preSubmitProcess(props.param.processType, props.param.processId)
  if (data.haveProcess) {
    visible.value = true
  }
  else {
    props.onConfirm(null)
  }
}

/** 提交审批 */
async function handleSubmitProcess() {
  processLoading.value = true
  try {
    const data = await processFormRef.value!.getProcessFormData()
    let query = {
      ...data,
      presetAuditers: JSON.stringify(data.presetAuditers),
      formPropertyJson: JSON.stringify(data.formPropertyJson),
      ...props.param.queryParams,
    } as Record<string, any>

    // 传入了自定义数据转换函数
    if (props.param.submitDataTransfer) {
      query = props.param.submitDataTransfer(query)
    }

    await props.param.submitAuditApi(query)
    props.onConfirm(null)
    processLoading.value = false
    visible.value = false
  }
  catch (error) {
    processLoading.value = false
    throw error
  }
}
</script>
