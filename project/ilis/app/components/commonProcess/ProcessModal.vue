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
      :hide-remark="param.hideRemark"
      :show-copy-to="param.showCopyTo"
      :process-type="props.param.processType"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
      :disabled-audit-nodes="props.param.disabledAuditNodes"
      :default-auditers="props.param.defaultAuditers"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { AxiosResponse } from 'axios'
import type { IDefaultAuditers } from './ProcessPerson.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ProcessType } from '~/components/commonProcess'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'
import { preSubmitProcess } from '~/components/commonProcess/api'

export interface IProcessForm {
  /** # 审批流程类型 */
  processType: ProcessType
  /** # 查询是否配置审批流程的id(没传的话就不会发起流程查询，并且会尝试直接提交审批请求) */
  processId?: string
  /** # 提交审批时要携带的参数 */
  queryParams?: Record<string, any>
  /** # 提交审批的api */
  submitAuditApi: (q?: any) => Promise<AxiosResponse<any>>
  /** # 提交审批时，将数据转换成想要的数据格式  */
  submitDataTransfer?: (data: Record<string, any>) => Record<string, any>
  /** 隐藏备注字段 */
  hideRemark?: boolean
  /** 展示抄送人字段（选择） */
  showCopyTo?: boolean
  /** # 默认指定节点人员 */
  defaultAuditers?: Record<string, IDefaultAuditers[]>
  /** # 禁用审核节点 */
  disabledAuditNodes?: string[]
}

const props = defineProps<IDialogPropsParam<null, IProcessForm>>()

/** 提交审核 */
const visible = ref(false)
const processLoading = ref(false)
const processFormRef = ref<IProcessFormExpose>()

submitAudit()

/** 查询是否配置审核流程 */
async function submitAudit() {
  const { data } = await preSubmitProcess(props.param.processType, props.param?.processId)
  if (data.haveProcess) {
    visible.value = true
  }
  else {
    // 项目资料归档、报告资料归档的特殊处理（数据是跟随审批流程提交的，所以要直接提交审批来触发保存）
    if (!props.param.processId) {
      await handleSubmitProcess()
    }
    props.onConfirm(null)
  }
}

/** 提交审批 */
async function handleSubmitProcess() {
  processLoading.value = true
  try {
    let data: Record<string, any> = {}
    if (processFormRef.value?.getProcessFormData) {
      data = await processFormRef.value!.getProcessFormData()
    }
    let query = {
      ...data,
      presetAuditers: data.presetAuditers ? JSON.stringify(data.presetAuditers) : '',
      formPropertyJson: data.formPropertyJson ? JSON.stringify(data.formPropertyJson) : '',
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
