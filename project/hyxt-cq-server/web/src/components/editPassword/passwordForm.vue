<template>
  <a-spin :spinning="spinning">
    <a-form ref="refFrom" :model="pwdForm" :label-col="{ style: { width: '200px' } }">
      <a-form-item
        label="旧密码"
        name="oldPassword"
        :rules="[{ required: true, message: '请输入旧密码' }]"
      >
        <a-input-password
          v-model:value="pwdForm.oldPassword"
          allow-clear
          placeholder="请输入旧密码"
          style="width: 450px"
        />
      </a-form-item>
      <a-form-item
        label="新密码"
        name="password"
        :rules="[{ required: true, message: '请输入新密码' }, { validator: validNewPwd }]"
      >
        <a-input-password
          v-model:value="pwdForm.password"
          allow-clear
          placeholder="新密码至少8位，区分大小写、数字和特殊字符( _!@$%^&*. )"
          style="width: 450px"
        />
      </a-form-item>
      <a-form-item
        label="确认新密码"
        name="repassword"
        :rules="[{ required: true, message: '请确认新密码' }, { validator: validPwd }]"
      >
        <a-input-password
          v-model:value="pwdForm.repassword"
          allow-clear
          placeholder="新密码至少8位，区分大小写、数字和特殊字符( _!@$%^&*. )"
          style="width: 450px"
        />
      </a-form-item>
    </a-form>
    <div v-if="!hideOk" style="padding-left: 200px; margin-top: 50px">
      <a-button type="primary" style="width: 120px" html-type="submit" @click="savePassword">
        确认
      </a-button>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { message } from "ant-design-vue"
import type { Rule } from "ant-design-vue/es/form"
import { storeToRefs } from "pinia"
import userInfoStore from "@/stores/userInfo"
import { editPasswordAPI } from "@/api/system.api"
const { userInfo } = storeToRefs(userInfoStore())
const props = defineProps({
  hideOk: Boolean
})
const spinning = ref<boolean>(false)

const pwdForm = ref<{
  oldPassword: string
  password: string
  repassword: string
}>({
  oldPassword: "",
  password: "",
  repassword: ""
})

const pwdReg =
  /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@$%^&*.]+$)(?![a-z0-9]+$)(?![a-z_!@$%^&*.]+$)(?![0-9_!@$%^&*.]+$)[a-zA-Z0-9_!@$%^&*.]{8,15}$/

// 密码强度校验
const validNewPwd = async (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.resolve()
  }
  if (value.length < 8 || value.length > 15) {
    return Promise.reject("密码长度为8~15个字符")
  }
  if (!pwdReg.test(value)) {
    return Promise.reject("密码必须包含大小写字母、数字、特殊字符中的至少三种")
  }
}
const validPwd = async (_rule: Rule, value: string) => {
  if (value && value !== pwdForm.value.password) {
    return Promise.reject("两次密码输入不一致")
  } else {
    return Promise.resolve()
  }
}
const refFrom = ref()
const savePassword = async () => {
  await refFrom.value.validateFields()
  spinning.value = true
  return await editPasswordAPI({
    id: userInfo.value.id || "",
    password: pwdForm.value.oldPassword,
    anew: pwdForm.value.password
  })
    .then(() => {
      spinning.value = false
      message.success("密码修改成功！")
      refFrom.value.resetFields()
      return Promise.resolve()
    })
    .catch(() => {
      spinning.value = false
      return Promise.reject()
    })
}

defineExpose({
  savePassword
})
</script>

<style></style>
