<template>
  <HtModal
    v-model:open="showDialog"
    :title="props.param.type === 'handover'
      ? '设备转交'
      : props.param.type === 'confirm'
        ? '接收设备'
        : '拒绝转交'"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="onOk"
  >
    <div class="w-full flex items-start">
      <div class="w-[110px] text-right">
        转交设备：
      </div>
      <div>
        <div>{{ props.param.data.equipmentName }}</div>
        <div>
          <span>设备编号：{{ props.param.data.equipmentSn }}</span>
          <span>设备规格：{{ props.param.data.standard }}</span>
        </div>
      </div>
    </div>
    <IlisForm
      ref="formRef"
      :init-data="formState"
      :cols="1"
      :entity="OperationEntity"
      :hidden-fields="props.param.type === 'handover' ? [] : ['equipmentStatus']"
    >
      <template #receiveUser="{ data }">
        {{ (data as OperationEntity).receiveUser }}
      </template>
      <template #transitionUser="{ data }">
        {{ (data as OperationEntity).transitionUser }}
      </template>
      <template #qrKey="{ data }">
        <HtUploadFile
          :business-id="data?.id"
          :business-type="BUSINES_TYPE.EQ_EGRESS"
          @get-qr-code-key="data.qrKey = $event"
        />
      </template>
    </IlisForm>
  </HtModal>
</template>

<script setup lang='ts'>
import type { EqEgressList } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import IlisForm from '~/components/ilisComponent/IlisForm.vue'
import { getTransitionRecordApi, operationApi } from '../api'
import { EgressStatus, OperationEntity } from '../OperationEntity'

interface Props {
  data: EqEgressList
  type: 'handover' | 'confirm' | 'reject'
}

const props = defineProps<IDialogPropsParam<any, Props>>()

const loading = ref(false)

const formRef = ref<IlisFormExpose<OperationEntity>>()

const formState = reactive(new OperationEntity())

const showDialog = ref(true)

async function getTransitionRecord() {
  const { data } = await getTransitionRecordApi(props.param.data.id)
  if (data?.length) {
    formState.receiveUser = data[0].borrowUser
  }
}

async function onOk() {
  const fromData = await formRef.value?.getFormData()

  fromData!.operationType = props.param.type === 'handover'
    ? EgressStatus.OUTGOING_TRANSFER
    : props.param.type === 'confirm'
      ? EgressStatus.TRANSFER_PENDING
      : EgressStatus.TRANSFER_REJECTED

  loading.value = true
  await operationApi({
    ids: [props.param.data.id],
    operation: fromData!,
  }).finally(() => {
    loading.value = false
  })
  message.success('转交成功')
  showDialog.value = false
  props.onConfirm(null)
}

function init() {
  getTransitionRecord()
  formState.transitionUser = props.param.data.borrowUser
  formState.operationTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  if (props.param.type !== 'handover') {
    formState.equipmentStatus = props.param.data.beforeStatus
  }
}

init()
</script>
