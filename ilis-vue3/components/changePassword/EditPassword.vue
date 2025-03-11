<template>
  <ht-modal
    v-model:open="visible"
    :title="param.title || '修改密码'"
    width="600px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="onSubmit"
  >
    <div class="pt-8 min-h-[300px]">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="原密码" name="password">
          <a-input-password v-model:value="form.password" autocomplete="new-password" placeholder="请输入原密码" />
        </a-form-item>
        <a-form-item label="新密码" name="newpassword">
          <a-input-password v-model:value="form.newpassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认密码" name="renewpassword">
          <a-input-password v-model:value="form.renewpassword" placeholder="请确认密码" />
        </a-form-item>
      </a-form>
    </div>
  </ht-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form'
import { savenewpwdApi } from './api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface PropParam {
  title?: string
}
const props = defineProps<IDialogPropsParam<null, PropParam>>()

const visible = ref(true)
const form = ref({
  password: '',
  newpassword: '',
  renewpassword: '',
})
const formRef = ref()

// 根据系统控制参数设置密码最少位数 8~30
let minPwdNum = 8
let regExp: any = null

getBusinessParamValue('PASSWORD_MINIMUM_LENGTH').then((res) => {
  minPwdNum = Math.max(8, Number(res || ''))
  regExp = new RegExp(`^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W!@#$%^&*_()-+=]+$)(?![a-z0-9]+$)(?![a-z\W!@#$%^&*_()-+=]+$)(?![0-9\W!@#$%^&*_()-+=]+$)[a-zA-Z0-9\W!@#$%^&*_()-+=]{${minPwdNum},30}$`)
})

/**
 * 验证新密码
 */
function validPassword(_rule: any, value: string) {
  if (value && !regExp.test(value))
    return Promise.reject(new Error(`密码由${minPwdNum}-30个字符组成，必须包含数字、大写字母、小写字母、特殊符号（!@#$%^&*_）中的三种！`))
  else
    return Promise.resolve()
}

/**
 * 验证确认密码
 */
function validRePassword(_rule: any, value: string) {
  if (value && value !== form.value.newpassword)
    return Promise.reject(new Error('两次输入的密码不一致'))
  else
    return Promise.resolve()
}

const rules: { [key: string]: RuleObject[] } = {
  password: [
    { required: true, message: '请输入原密码', trigger: 'change' },
  ],
  newpassword: [
    { required: true, message: '请输入新密码', trigger: 'change' },
    { validator: validPassword, trigger: 'change' },
  ],
  renewpassword: [
    { required: true, message: '请输入确认密码', trigger: 'change' },
    { validator: validRePassword, trigger: 'change' },
  ],
}

const loading = ref(false)
async function onSubmit() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    await savenewpwdApi(form.value)
    message.success('修改成功')
    visible.value = false
    props.onConfirm(null)
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}
</script>

<style lang="less" scoped>

</style>
