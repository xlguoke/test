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
      :process-type="props.param.processType"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    >
      <template #formAfter>
        <a-form-item label="抄送人">
          <a-input
            :value="personData.copyToName"
            readonly
            @click="showPersonSelector = true"
          ></a-input>
        </a-form-item>
      </template>
    </IlisProcessForm>
    <!-- 人员选择器 -->
    <PersonSelector
      v-model:show="showPersonSelector"
      multiple
      @confirm="getPerson"
    />
  </ht-modal>
</template>

<script setup lang='ts'>
import type { AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import { IlisProcessForm } from '~/components/ilisComponent'
import { preSubmitProcess } from '~/components/commonProcess/api'
import type { ProcessType } from '~/components/commonProcess'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'

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

const showPersonSelector = ref(false)

const personData = ref({} as Record<string, any>)

/** 提交审核 */
const visible = ref(false)
const processLoading = ref(false)
const processFormRef = ref<IProcessFormExpose>()

submitAudit()

function getPerson(rows: IUserSelectVoEntity[]) {
  showPersonSelector.value = false
  personData.value = {
    copyToIds: rows.map(it => it.id).join(','),
    copyTo: rows.map(it => it.account).join(','),
    copyToName: rows.map(it => it.name).join(','),
  }
}

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
      formPropertyJson: JSON.stringify({ ...data.formPropertyJson, copyTo: personData.value.copyTo, remark: data.remark }),
      remark: data.remark,
      ...props.param.queryParams,
      copyToIds: personData.value.copyToIds,
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
