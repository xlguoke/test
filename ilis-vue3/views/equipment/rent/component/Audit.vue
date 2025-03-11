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
import { EquipmentRentEntity, EquipmentRentSignStatus, EquipmentRentStatus, EquipmentRentType } from '../EquipmentRentEntity'
import { changeSignStatus, getEquipmentRentDetail, submitEquipmentRentProcessBySign } from '../api'
import { IlisProcessForm, IlisSignature } from '~/components/ilisComponent'
import { preSubmitProcess } from '~/components/commonProcess/api'
import type { ProcessType } from '~/components/commonProcess'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { getQrcodeLink } from '~/components/IlisSignature/api'
import { SignType } from '~/components/IlisSignature'
import { getCurrentUserInfo } from '~/api/common'
import { getEquipmentRentDetailWithouAuth } from '~/views/mobile/signature/api'

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
