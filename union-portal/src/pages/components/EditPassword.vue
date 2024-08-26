<script setup lang='ts'>
import type { Rule } from 'ant-design-vue/es/form'
import { message } from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import permissions from '@/stores/permissions'
import useMyFetch from '@/composables/useMyFetch'

const { userInfo } = storeToRefs(permissions())
// 修改密码
const visible = ref(false)
const submitLoad = ref(false)
const formRef = ref()
const form = reactive({
  oldPassWord: '',
  newPassWord: '',
})

// eslint-disable-next-line vue/max-len
const pwdReg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@$%^&*.]+$)(?![a-z0-9]+$)(?![a-z_!@$%^&*.]+$)(?![0-9_!@$%^&*.]+$)[\w!@$%^&*.]{8,15}$/

// 密码强度校验
async function validNewPwd(_rule: Rule, value: string) {
  if (!value) {
    return Promise.resolve()
  }
  if (value.length < 8 || value.length > 15) {
    return Promise.reject(new Error('密码长度为8~15个字符'))
  }
  if (!pwdReg.test(value)) {
    return Promise.reject(new Error('密码必须包含大小写字母、数字、特殊字符(_!@$%^&*.)中的至少三种'))
  }
}

const rules = reactive({
  oldPassWord: [
    { required: true, message: '请输入原密码' },
  ],
  newPassWord: [
    { required: true, message: '请输入新密码' },
    { validator: validNewPwd },
  ],
})

function cancelModal() {
  visible.value = false
  submitLoad.value = false
  formRef.value.resetFields()
}

async function submit() {
  await formRef.value.validateFields()
  submitLoad.value = true
  const { error } = await useMyFetch(`/api/v1/users/${userInfo.value.id}/password`, {
    method: 'PUT',
    body: JSON.stringify(form),
  })
  submitLoad.value = false
  if (error.value)
    return
  cancelModal()
  message.success('修改成功')
}

function openModal() {
  visible.value = true
}

defineExpose({
  openModal,
})
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="修改密码"
    :keyboard="false"
    :mask-closable="false"
    :confirm-loading="submitLoad"
    centered
    width="600px"
    @cancel="cancelModal"
    @ok="submit"
  >
    <div class="my-4 max-h-[60vh] min-h-[200px] overflow-auto">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 17 }"
      >
        <a-form-item label="原密码" name="oldPassWord">
          <a-input-password
            v-model:value="form.oldPassWord"
            :maxlength="20"
            placeholder="请输入原密码"
          />
        </a-form-item>
        <a-form-item label="新密码" name="newPassWord">
          <a-input-password
            v-model:value="form.newPassWord"
            type="password"
            :maxlength="20"
            placeholder="请输入新密码"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style>

</style>
