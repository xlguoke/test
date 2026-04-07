<template>
  <div class="p16">
    <div v-if="formData.newpassword" class="pb-8">
      当前密码强度：
      <span v-if="passwordLevel === '低'" style="color: red">低</span>
      <span v-if="passwordLevel === '中'" style="color: #ff976a">中</span>
      <span v-if="passwordLevel === '高'" style="color: green">高</span>
    </div>
    <van-form ref="formRef" @submit="onCheckLogin">
      <van-cell-group inset>
        <van-field
          v-model="formData.password"
          name="password"
          placeholder="请输入原密码"
          type="password"
          required
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <img src="../../assets/login-pwd.svg" class="w-[24px]" />
          </template>
        </van-field>
        <van-field
          v-model="formData.newpassword"
          name="newpassword"
          placeholder="请输入新密码"
          type="password"
          required
          :rules="[{ validator: validatePassword }]"
        >
          <template #left-icon>
            <img src="../../assets/login-pwd.svg" class="w-[24px]" />
          </template>
        </van-field>
        <van-field
          v-model="formData.repassword"
          name="repassword"
          placeholder="请确认密码"
          type="password"
          required
          :rules="[{ validator: validateRePassword }]"
        >
          <template #left-icon>
            <img src="../../assets/login-pwd.svg" class="w-[24px]" />
          </template>
        </van-field>
      </van-cell-group>
      <div class="mt-16">
        <van-button block type="primary" native-type="submit">
          修改密码
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts" setup>
import { saveNewPwd } from '@/api/user'
import { clearToken } from '@/utils/auth'

const formRef = ref()

const $router = useRouter()

const formData = ref({
  password: '',
  newpassword: '',
  repassword: '',
})

const passwordLevel = ref('')

watch(() => formData.value.newpassword, (val) => {
  if (val !== '' && val.length >= 6 && val.length <= 18) {
    getPasswordLvl(val)
  }
  else {
    passwordLevel.value = '低'
  }
})

function validatePassword(val, rule) {
  if (val === '') {
    rule.message = '请输入新密码'
    formData.value.repassword !== '' && formRef.value.validate('repassword')
    return false
  }
  else if (val.length < 6 || val.length > 18) {
    rule.message = '密码至少6个字符,最多18个字符'
    formData.value.repassword !== '' && formRef.value.validate('repassword')
    return false
  }
  else {
    formData.value.repassword !== '' && formRef.value.validate('repassword')
    return true
  }
}

function getPasswordLvl(pwd: string) {
  let lvl = '低'
  if (/[a-z]/i.test(pwd)) {
    lvl = '中'
  }
  if (/[a-z]/i.test(pwd) && pwd.length > 10) {
    lvl = '中'
  }
  if (/\W/.test(pwd) && pwd.length < 8) {
    lvl = '中'
  }
  if (/\W/.test(pwd) && pwd.length >= 8) {
    lvl = '高'
  }
  passwordLevel.value = lvl
}

function validateRePassword(val, rule) {
  if (formData.value.newpassword === '') {
    rule.message = '请输入新密码'
    return false
  }
  else if (formData.value.newpassword && val === '') {
    rule.message = '请再次输入新密码'
    return false
  }
  else if (formData.value.newpassword !== val) {
    rule.message = '确认密码与新密码不同'
    return false
  }
  else {
    return true
  }
}

async function onCheckLogin() {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  })
  const res = await saveNewPwd({
    password: formData.value.password,
    newpassword: formData.value.newpassword,
  }).finally(closeToast)

  if (res.success) {
    showDialog({
      title: '提示',
      message: '密码修改成功，请重新登陆！',
    }).then(() => {
      clearToken()
      $router.push('/login')
    })
  }
}
</script>

<route lang="json">
{
  "name": "password",
  "meta": {
    "title": "修改密码"
  }
}
</route>
