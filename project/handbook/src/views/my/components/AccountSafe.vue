<script lang="ts" setup>
import { ref } from 'vue'
import { z } from 'zod'
import type { FieldRule } from 'vant'
import { request } from '@/axios'
import { translateError } from '@/utils/translateError'

const form = ref({
  password: '',
  newpassword: '',
  repassword: '',
})

const isShowPassword = ref(false)
const isShowNewpassword = ref(false)
const isShowRepassword = ref(false)

const reg
  = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{6,18}$/
const regMsg
  = '密码为6-18个字符组成，必须包含数字、大写字母、小写字母、特殊符号（!@#$%^&*_）中的三种！'

function validNewPwd(value: string, _rule: FieldRule) {
  if (form.value.password && value === form.value.password)
    return '新密码不能与原密码相同'
  else if (!reg.test(value))
    return regMsg
  else return true
}

function validReport(value: string, _rule: FieldRule) {
  if (value && value !== form.value.newpassword)
    return '两次密码不一致'
  else if (!reg.test(value))
    return regMsg
  else return true
}

const rules: Record<string, FieldRule[]> = {
  password: [{ required: true, message: '请输入旧密码' }],
  newpassword: [
    { required: true, message: '请输入新密码' },
    { validator: validNewPwd, trigger: 'onBlur' },
  ],
  repassword: [
    { required: true, message: '请重复输入新密码' },
    { validator: validReport, trigger: 'onBlur' },
  ],
}

const pwdFrom = ref()
const loading = ref(false)
async function savePwd() {
  try {
    await pwdFrom.value.validate()
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
        showToast({
          type: 'success',
          message: '修改成功',
        })
        form.value = {
          password: '',
          newpassword: '',
          repassword: '',
        }
      }
      else {
        showToast({
          type: 'fail',
          message: res.msg || '修改失败',
        })
      }
    })
    .catch((err: any) => {
      const e = translateError(err)
      showToast({
        type: 'fail',
        message: e.message,
      })
      loading.value = false
    })
}
</script>

<template>
  <div class="show-title-bar account-safe-warp">
    <TitleBar />
    <div class="pd">
      <div class="form-wrap">
        <van-form
          ref="pwdFrom"
          class="custom-form"
          label-align="top"
          required
          @submit="savePwd"
        >
          <van-field
            v-model="form.password"
            name="password"
            placeholder="请输入旧密码"
            label="旧密码"
            :rules="rules.password"
            :type="isShowPassword ? 'text' : 'password'"
            :right-icon="isShowPassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="(e:Event) => { e.preventDefault();isShowPassword = !isShowPassword }"
          />
          <van-field
            v-model="form.newpassword"
            name="newpassword"
            placeholder="请输入新密码"
            label="新密码"
            :rules="rules.newpassword"
            :type="isShowNewpassword ? 'text' : 'password'"
            :right-icon="isShowNewpassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="(e:Event) => { e.preventDefault();isShowNewpassword = !isShowNewpassword }"
          />
          <van-field
            v-model="form.repassword"
            name="repassword"
            placeholder="请重复输入新密码"
            label="重复新密码"
            :rules="rules.repassword"
            :type="isShowRepassword ? 'text' : 'password'"
            :right-icon="isShowRepassword ? 'eye-o' : 'closed-eye'"
            @click-right-icon="(e:Event) => { e.preventDefault();isShowRepassword = !isShowRepassword }"
          />
          <van-button block type="primary" native-type="submit" :loading="loading">
            保存
          </van-button>
        </van-form>
      </div>
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

.custom-form{
  >.van-cell{
    margin-bottom: 48px;
  }
}
</style>
