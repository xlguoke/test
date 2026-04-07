<template>
  <HtModal
    v-model:open="visible"
    title="审核"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="submit"
  >
    <a-form
      ref="formRef"
      :model="form"
      v-bind="formItemLayout"
      class="h-[200px]"
    >
      <a-form-item label="审核结果" name="pass" :rules="[{ required: true }]">
        <a-radio-group v-model:value="form.pass">
          <a-radio v-for="(d, i) in AUDIT_STATUS_OPTIONS" :key="i" :value="d.key">
            {{ d.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="审核说明" name="opinion" :rules="[{ required: true, message: '请输入审核说明' }]">
        <a-textarea
          v-model:value="form.opinion"
          :rows="4"
          :maxlength="200"
          placeholder="请输入审核说明"
        />
      </a-form-item>
    </a-form>
  </HtModal>
</template>

<script setup lang='ts'>
import type { AuditParams } from '../api'
import type { WaitAuditReportEntity } from '../ReportBusinessEntity'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { aduit } from '../api'
import { AUDIT_PASS_DICT } from '../ReportBusinessEntity'

const props = defineProps<IDialogPropsParam<null, WaitAuditReportEntity[]>>()

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 },
}

const AUDIT_STATUS_OPTIONS = AUDIT_PASS_DICT
const loading = ref(false)
const visible = ref(true)

const formRef = ref()
const form = ref<AuditParams>({
  applicationIds: [],
  pass: false,
  opinion: '',
})

function cancelModal() {
  visible.value = false
  loading.value = false
  formRef.value.resetFields()
}

async function submit() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    form.value.applicationIds = props.param.map(item => item.id)
    await aduit(form.value)
    message.success('操作成功!')
    cancelModal()
    props.onConfirm(null)
  }
  catch (err) {
    console.error(err)
    loading.value = false
  }
}
</script>

  <style scoped>

  </style>
