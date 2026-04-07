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
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getCurrentUserInfo } from '~/api/common'
import { preSubmitProcess } from '~/components/commonProcess/api'
import { SignType } from '~/components/IlisSignature'
import { getQrcodeLink } from '~/components/IlisSignature/api'
import IlisSignature from '~/components/IlisSignature/IlisSignature.vue'
import { getEquipmentRentDetailWithouAuth } from '~/views/mobile/signature/api'
import { changeSignStatus, getEquipmentRentDetail, submitEquipmentRentProcessBySign } from '../api'
import { EquipmentRentEntity, EquipmentRentSignStatus, EquipmentRentStatus, EquipmentRentType } from '../EquipmentRentEntity'

interface IProcessForm {
  /** # 审批流程类型 */
  processType: ProcessType
  /** # 查询是否配置审批流程的id */
  processId: string
  /** # 提交审批时要携带的参数 */
  queryParams: Record<string, any>
  /** # 提交审批的api */
  submitAuditApi: (q?: any) => Promise<AxiosResponse<any>>
  /** # 提交审批时，将数据转换成想要的数据格式  */
  submitDataTransfer?: (data: Record<string, any>) => Record<string, any>
  /** # 设备借出类型 */
  rentType: EquipmentRentType
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
    const { data: detail } = await getEquipmentRentDetail(EquipmentRentEntity.fromJSON(props.param.queryParams))

    // 设备外借时需要签字
    if ([EquipmentRentType.OUT_BORROW, EquipmentRentType.OUT_RENT].includes(props.param.rentType)) {
      // 把参数缓存到服务器，二维码侧仅携带返回的key
      query.applyUserId = localStorage.getItem('userId')
      const { data: userInfoRes } = await getCurrentUserInfo()
      query.departId = userInfoRes?.obj?.departid
      const keyId = await setServerCacheData(query)
      changeSignStatus(props.param.queryParams.id, 'RENT', keyId)
      const { data: link } = await getQrcodeLink()
      const linkQuery = {
        keyId,
        id: props.param?.queryParams?.id,
        type: SignType.BORROW,
      }
      let res
      if (!detail.signerStatus || detail.signerStatus === EquipmentRentSignStatus.NO_RENT) {
        res = await AnyDialogHelper.showModel(IlisSignature, {
          value: `${link}&${new URLSearchParams(linkQuery)}`,
        })
        if (!res) {
          return
        }
      }
      const unitCode = localStorage.getItem('unitCode') || ''
      processLoading.value = true
      await submitEquipmentRentProcessBySign(unitCode, props.param?.queryParams?.id, keyId, res as string)
        .catch(async (err) => {
          const { data } = await getEquipmentRentDetailWithouAuth(unitCode, props.param?.queryParams?.id)
          if ([EquipmentRentStatus.APPROVE_ING, EquipmentRentStatus.APPROVE_SUCCESS, EquipmentRentStatus.RETURNED].includes(data.applyStatus)) {
            visible.value = false
            props.onConfirm(null)
          }
          throw err
        })
        .finally(() => {
          processLoading.value = false
        })
      message.success('操作成功')
      props.onConfirm(null)
      visible.value = false
      return
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
