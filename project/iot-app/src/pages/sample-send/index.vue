<template>
  <VanNavBar
    title="新增智能送样任务"
    :fixed="true"
    clickable
    placeholder
    :left-arrow="true"
    @click-left="onBack"
  />
  <div p16 pb100>
    <van-cell-group inset>
      <van-form class="mb-12" @submit="onSubmit">
        <SendForm
          ref="SendFormRef"
          :init-data="sendInitData"
          @pre-change="handlePreChange"
          @lab-change="handleLabChange"
        ></SendForm>
        <THInnerForm
          v-if="isPre"
          ref="THInnerFormRef"
          :init-data="THInitData"
          :hide-fields="['taskId', 'laboratoryIotEqType', 'laboratoryId']"
        ></THInnerForm>
        <div class="fixed-box flex-x gap12">
          <van-button size="small" block type="primary" native-type="submit">
            提交
          </van-button>
        </div>
      </van-form>
    </van-cell-group>
  </div>
</template>

<script lang="ts" setup>
import { showLoadingToast, showSuccessToast } from 'vant'
import THInnerForm from '../appointment-management/innerForm.vue'
import SendForm from './sendForm.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { URLHelper } from '@/utils/URLHelper'
import { addSampleSendTask, SampleSendType } from '.'

const router = useRouter()

const THInnerFormRef = ref()

const SendFormRef = ref()

const isPre = ref(false)

const sendInitData = ref({
  /** 操作人id */
  operatorId: URLHelper.getUrlParam('operatorId'),
  /** 任务id */
  taskId: URLHelper.getUrlParam('taskId') || '',
  /** 任务编号 */
  taskCode: URLHelper.getUrlParam('taskCode') || '',
  /** 功能室id */
  labId: URLHelper.getUrlParam('labId') || '',
  // labId: '2c9120818ab58877018ab5b5825f0028',
  /** 样品编号 */
  objectCode: URLHelper.getUrlParam('objectCode') || '',
  /** 样品名称 */
  objectName: URLHelper.getUrlParam('objectName') || '',
})

const THInitData = ref({
  laboratoryId: URLHelper.getUrlParam('labId') || '',
  // laboratoryId: '2c9120818ab58877018ab5b5825f0028',
  testTaskId: URLHelper.getUrlParam('taskId') || '',
})

function handlePreChange(val) {
  isPre.value = val
  nextTick(() => {
    if (THInnerFormRef.value) {
      THInnerFormRef.value.currentLaboratory = SendFormRef.value.currentLaboratory
      THInnerFormRef.value.getLaboratoryList()
      if (val && SendFormRef.value?.taskType === SampleSendType.Appointment) {
        THInnerFormRef.value.startDate = SendFormRef.value.startDate
        THInnerFormRef.value.startTime = SendFormRef.value.startTime
        THInnerFormRef.value.endDate = SendFormRef.value.startDate
        THInnerFormRef.value.endTime = SendFormRef.value.startTime
      }
    }
  })
}

function handleLabChange() {
  nextTick(() => {
    if (THInnerFormRef.value) {
      THInnerFormRef.value.currentLaboratory = SendFormRef.value.currentLaboratory
      THInnerFormRef.value.getLaboratoryList()
    }
  })
}

async function onSubmit() {
  const res = await SendFormRef.value?.getFormData()
  const resTH = await THInnerFormRef.value?.getFormData()
  const params = {
    ...res,
    ...(resTH
      ? { humitureResFrom: {
          ...resTH,
          taskId: res.taskId,
          laboratoryId: res.labId,
          testParams: '',
        } }
      : {}),
  }
  if (params.taskType !== SampleSendType.Appointment) {
    delete params.requestDeliveryTime
  }
  if (params?.humitureResFrom?.testParams) {
    params.humitureResFrom.testParams = params?.humitureResFrom?.testParams?.join(',')
  }
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const response = await addSampleSendTask(params).finally(() => {
    closeToast()
  }) as any
  if (response?.code === 21000) {
    showSuccessToast('操作成功')
    setTimeout(() => {
      onBack()
    }, 1000)
  }
  else {
    showFailToast(response?.message || response?.msg || '操作失败')
  }
}

function onBack() {
  if ((parent as any).back) {
    (parent as any).back()
    return
  }
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}
</script>

<route lang="json">
  {
    "name": "addSampleSendTask",
    "meta": {
      "hiddenNavBar": true
    }
  }
</route>
