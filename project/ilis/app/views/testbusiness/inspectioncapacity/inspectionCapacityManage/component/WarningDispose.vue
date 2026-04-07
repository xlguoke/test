<template>
  <HtModal
    v-model:open="visible"
    :title="isDetail ? '详情' : '处理预警'"
    width="640px"
    :confirm-loading="loading"
    :after-close="onClosed"
    :hide-confirm="isDetail"
    :cancel-text="isDetail ? '关闭' : '取消'"
    @ok="handleOk"
  >
    <BaseTitle class="mt-2">
      预警信息
    </BaseTitle>
    <BaseWarningInfo :init-data="baseWarningInfoData" />

    <BaseTitle class="mt-2">
      预警处理
    </BaseTitle>
    <Dispose ref="disposeFormRef" :is-detail="isDetail" :show-file-del="!isDetail" :init-data="disposeDetailData" />

    <BaseTitle class="mt-2">
      审核信息
    </BaseTitle>
    <ProcessForm
      ref="processFormRef"
      hide-remark
      :process-type="ProcessType.TEST_CAPACITY_WARNING_DISPOSE"
      :default-copyto="copyToUserList"
      :label-col="{ span: 3 }"
      :disabled="isDetail"
    />
  </HtModal>
</template>

<script lang="ts" setup>
import type { CapacityEntity, IBaseWarningInfo, IDisposeData } from '../CapacityEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IProcessFormExpose } from '~/interface/IProcessFormExpose'
import { message } from 'ant-design-vue'
import { ProcessType } from '~/components/commonProcess'
import { BaseTitle } from '~/components/UI/index.ts'
import { getWarningDetail, handleWarning } from '../api.ts'
import BaseWarningInfo from './BaseWarningInfo.vue'
import Dispose from './Dispose.vue'

interface IWarningDisposeParam { // 审核管理跳转参数
  id?: string
  isDetail?: boolean
}
const props = defineProps<IDialogPropsParam<null, CapacityEntity | IWarningDisposeParam>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref<CapacityEntity>(props.param as CapacityEntity || {}) // 表格单行完整数据
const baseWarningInfoData = ref<IBaseWarningInfo>({})
const disposeDetailData = ref<IDisposeData>({})
const isDetail = ref(false)
async function initDetailData() {
  if (props.param.isDetail) {
    isDetail.value = true
  }
  try {
    const { data } = await getWarningDetail(initData.value.id)
    const { reportSn, warningType, objectName, objectRemark, capacityLimit, warningDate, createDate, disposeInfo } = data
    baseWarningInfoData.value = {
      reportSn,
      warningType,
      objectName,
      objectRemark,
      capacityLimit,
      warningDate,
      createDate,
    }
    if (disposeInfo) {
      disposeDetailData.value = disposeInfo
      isDetail.value = true
    }
  }
  catch (error) {
    console.error(error)
  }
}

initDetailData()

const processFormRef = ref<IProcessFormExpose>()
const disposeFormRef = ref()

const copyToUserList = ref<any[]>([])
async function handleOk() {
  try {
    const isValid = await disposeFormRef.value?.validateForm?.()
    if (!isValid) {
      return
    }

    const warningId = initData.value?.id ?? ''
    const disposeData = await disposeFormRef.value!.getFormData()
    const processData = await processFormRef.value!.getProcessFormData()

    const submitData = {
      warningId,
      ...disposeData,
      formPropertyJson: processData.formPropertyJson,
      presetAuditers: processData.presetAuditers,
    }
    loading.value = true
    await handleWarning(submitData)
    props.onConfirm(null)
    visible.value = false
    message.success('操作成功！')
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>
