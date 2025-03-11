<template>
  <HtModal
    v-model:open="showDialog"
    title="邀请延期"
    :after-close="onClosed"
    :confirm-loading="loading"
    @ok="handleOk"
  >
    <a-space direction="vertical" style="width: 100%;">
      <a-alert
        show-icon
        type="info"
        message="新的结束日期不能在当前结束日期之前！"
      />
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{
          style: { width: '100px' },
        }"
      >
        <a-form-item label="当前结束日期" name="dueTime">
          <a-date-picker
            v-model:value="formState.dueTime"
            value-format="YYYY-MM-DD"
            disabled
            style="width: 100%;"
          />
        </a-form-item>
        <a-form-item label="当前结束日期" name="newDueTime">
          <a-date-picker
            v-model:value="formState.newDueTime"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </a-form-item>
      </a-form>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import { message } from 'ant-design-vue'
import type { EvaluateInvEntity } from '../EvaluateInvEntity'
import { defermentEvaluateInv } from '../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { EDateFormatType } from '~/utils/EDateFormatType'

const props = defineProps<IDialogPropsParam<null, EvaluateInvEntity>>()

const formRef = ref<FormExpose>()

const loading = ref(false)

const showDialog = ref(true)

const formState = ref({
  dueTime: AnyDateTimeHelper.format(props.param?.dueTime || '', EDateFormatType.YYYY_MM_DD),
  newDueTime: '',
})

const rules: Record<string, Rule[]> = {
  newDueTime: [
    { required: true, message: '请选择' },
    {
      validator: (_rule: Rule, value: string) => {
        if (AnyDateTimeHelper.getTime(value) < AnyDateTimeHelper.getTime(formState.value.dueTime || '')) {
        // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('不能小于当前结束日期')
        }
        else if (AnyDateTimeHelper.getTime(value) < Date.now()) {
        // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('不能小于当前日期')
        }
        else {
          return Promise.resolve()
        }
      },
      trigger: 'change',
    },
  ],
}

async function handleOk() {
  await formRef.value?.validate()
  loading.value = true
  await defermentEvaluateInv(props.param, formState.value.newDueTime)
    .finally(() => loading.value = false)
  message.success('操作成功')
  showDialog.value = false
}
</script>
