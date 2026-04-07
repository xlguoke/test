<template>
  <ht-modal
    v-model:open="visible"
    title="邀请设置"
    width="450px"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="onConfirm"
  >
    <div class="p-4">
      <a-form ref="formRef" :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="上传人员" name="audience" :rules="[{ required: true, message: '请输入上传人员' }]">
          <a-input
            v-model:value="form.audience"
            :maxlength="30"
            allow-clear
            placeholder="请输入上传人员"
          />
        </a-form-item>
        <a-form-item label="有效截止日期" name="invalidTime" :rules="[{ required: true, validator: validateTime }]">
          <a-date-picker
            v-model:value="form.invalidTime"
            allow-clear
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            placeholder="请选择有效截止日期"
            class="w-full"
          />
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { Dayjs } from 'dayjs'
import type { InviteFileData } from '..'
import type { IniteParam } from './fileOperations'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { editInviteQrCode, setInviteQrCode } from './fileOperations'

interface Param {
  /** 主码 */
  coreKey: string
  data?: InviteFileData
  isEdit?: boolean
}

const props = defineProps<IDialogPropsParam<string, Param>>()

const visible = ref(true)
const loading = ref(false)
const formRef = ref()
const form = reactive<IniteParam>({
  audience: '',
  invalidTime: '',
})

onMounted(() => {
  const { data } = props.param
  if (data) {
    form.audience = data.audience
    form.invalidTime = data.invalidTime
    formRef.value.validateFields('invalidTime')
  }
})

function disabledDate(current: Dayjs) {
  return current && current < dayjs().subtract(1, 'day')
}

function validateTime(_rule: any, value: string) {
  if (!value)
    return Promise.reject(new Error('请选择有效截止日期'))

  if (props.param.isEdit && value < dayjs().format('YYYY-MM-DD'))
    return Promise.reject(new Error('当前日期已超过二维码有效截止日期，请重新设置有效截止日期！'))

  return Promise.resolve()
}

async function onConfirm() {
  try {
    loading.value = true
    await formRef.value.validateFields()
    const param = { ...form }
    if (props.param.isEdit) {
      param.key = props.param.data?.qrKey
      await editInviteQrCode(param)
    }
    else {
      param.coreKey = props.param.coreKey
      await setInviteQrCode(param)
    }
    visible.value = false
    message.success('设置成功')
    props.onConfirm('')
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}
</script>
