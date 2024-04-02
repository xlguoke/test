<script lang="ts" setup>
import { Button, Form, FormItem, Input, message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { ref } from 'vue'
import { z } from 'zod'
import { request } from '@/axios'
import { translateError } from '@/utils/translateError'

const form = ref({
  password: '',
  newpassword: '',
  repassword: '',
})

const reg
  = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{6,18}$/
const regMsg
  = '密码为6-18个字符组成，必须包含数字、大写字母、小写字母、特殊符号（!@#$%^&*_）中的三种！'

async function validNewPwd(_rule: Rule, value: string) {
  try {
    if (value) {
      if (form.value.password && value === form.value.password)
        return Promise.reject(new Error('新密码不能与原密码相同'))
      else if (!reg.test(value))
        return Promise.reject(regMsg)
    }
    else {
      return Promise.resolve()
    }
  }
  catch (err) {}
}

async function validReport(_rule: Rule, value: string) {
  if (value) {
    if (value && value !== form.value.newpassword)
      return Promise.reject(new Error('两次密码不一致'))
    else if (!reg.test(value))
      return Promise.reject(regMsg)
  }
  else {
    return Promise.resolve()
  }
}

const rules: Record<string, Rule[]> = {
  password: [{ required: true, message: '请输入旧密码' }],
  newpassword: [
    { required: true, message: '请输入新密码' },
    { validator: validNewPwd, trigger: 'blur' },
  ],
  repassword: [
    { required: true, message: '请重复输入新密码' },
    { validator: validReport, trigger: 'blur' },
  ],
}

const pwdFrom = ref()
const loading = ref(false)
async function savePwd() {
  try {
    await pwdFrom.value.validateFields()
  }
  catch (err) {
    return
  }
  loading.value = true
  request({
    url: '/ilis2/userController.do?savenewpwd',
    method: 'post',
    data: {
      password: form.value.password,
      newpassword: form.value.newpassword,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    schema: z.object({
      success: z.boolean(),
      msg: z.string().nullable(),
    }),
  })
    .then((res) => {
      loading.value = false
      if (res.success) {
        message.success('修改成功')
        pwdFrom.value.resetFields()
      }
      else {
        message.error(res.msg || '修改失败')
      }
    })
    .catch((err: any) => {
      const e = translateError(err)
      message.error(e.message)
      loading.value = false
    })
}
</script>

<template>
  <div class="show-title-bar account-safe-warp">
    <TitleBar />
    <div class="pd">
      <div class="form-wrap">
        <Form
          ref="pwdFrom"
          class="custom-form"
          :model="form"
          :rules="rules"
          layout="vertical"
        >
          <FormItem label="旧密码" name="password">
            <Input.Password
              v-model:value="form.password"
              allow-clear
              placeholder="请输入旧密码"
            />
          </FormItem>
          <FormItem label="新密码" name="newpassword">
            <Input.Password
              v-model:value="form.newpassword"
              allow-clear
              placeholder="请输入新密码"
            />
          </FormItem>
          <FormItem label="重复新密码" name="repassword">
            <Input.Password
              v-model:value="form.repassword"
              allow-clear
              placeholder="请重复输入新密码"
            />
          </FormItem>
        </Form>
      </div>
      <Button type="primary" block :loading="loading" @click="savePwd">
        保存
      </Button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  .login-content {
    width: 420px;
    height: auto;
  }
  .logo-img {
    display: block;
    margin: 0 auto;
  }
  .login-title {
    margin: 30px 0;
    font-size: 18px;
    text-align: center;
  }
}

.form-wrap {
  padding: 20px 20px 10px;
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
}
</style>
