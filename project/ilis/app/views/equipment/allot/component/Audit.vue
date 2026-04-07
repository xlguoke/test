<template>
  <ht-modal
    v-model:open="visible"
    title="提交审核"
    width="600px"
    :confirm-loading="processLoading"
    :after-close="onClosed"
    @ok="handleSubmitProcess()"
  >
    <ProcessForm
      ref="processFormRef"
      :process-type="props.param.processType"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { AxiosResponse } from 'axios'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ProcessType } from '~/components/commonProcess'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'
import { message } from 'ant-design-vue'
import { preSubmitProcess } from '~/components/commonProcess/api'

interface IProcessForm {
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
  try {
    const data = await processFormRef.value!.getProcessFormData()
    let query = {
      presetAuditers: JSON.stringify(data.presetAuditers),
      formPropertyJson: JSON.stringify({ ...data.formPropertyJson, remark: data.remark }),
      remark: data.remark,
      ...props.param.queryParams,
      copyToIds: data.copyToPersons?.map(d => d.id).join(','),
    } as Record<string, any>

    // 传入了自定义数据转换函数
    if (props.param.submitDataTransfer) {
      query = props.param.submitDataTransfer(query)
    }

    processLoading.value = true
    await props.param.submitAuditApi(query).finally(() => {
      processLoading.value = false
    })
    message.success('操作成功')
    props.onConfirm(null)
    visible.value = false
  }
  catch (error) {
    processLoading.value = false
    throw error
  }
}
</script>
