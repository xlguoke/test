<template>
  <div class="flex flex-col p16 text-center">
    <img src="../../assets/logo.svg" class="mx-auto mt-48 max-w-[40%]" />
    <img src="../../assets/login-title.svg" class="mx-auto max-w-[80%]" />
    <van-form class="mt-48" @submit="onLogin">
      <van-cell-group inset>
        <van-field
          v-model="formData.userName"
          name="userName"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <template #left-icon>
            <img src="../../assets/login-user.svg" class="w-[20px]" />
          </template>
        </van-field>
        <van-field
          v-model="formData.companyId"
          name="companyId"
          placeholder="请输入公司登录名"
          :rules="[{ required: true, message: '请输入公司登录名' }]"
        >
          <template #left-icon>
            <img src="../../assets/login-depart.svg" class="w-[22px]" />
          </template>
        </van-field>
        <van-field
          v-model="formData.password"
          name="password"
          placeholder="请输入密码"
          :type="showPasswrod ? 'text' : 'password'"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <template #left-icon>
            <img src="../../assets/login-pwd.svg" class="w-[24px]" />
          </template>
          <template #right-icon>
            <van-icon v-if="showPasswrod" name="eye-o" @click="showPasswrod = false" />
            <van-icon v-else name="closed-eye" @click="showPasswrod = true" />
          </template>
        </van-field>
      </van-cell-group>
      <div class="mt-16">
        <van-button block :loading="submitLoading" type="primary" native-type="submit">
          登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores'
import { URLHelper } from '@/utils/URLHelper'

const { login } = useUserStore()

const unitCode = URLHelper.getUrlParam('unitCode') || ''

const $router = useRouter()

const showPasswrod = ref(false)

const submitLoading = ref(false)

const formData = ref({
  companyId: unitCode,
  userName: '',
  password: '',
})

async function onLogin() {
  submitLoading.value = true
  const res = await login(formData.value.userName, formData.value.password, formData.value.companyId).finally(() => {
    submitLoading.value = false
  })

  if (res && res.code !== 20010) {
    showSuccessToast('登录成功！')
    $router.push({ name: 'home' })
  }
}
</script>

<route lang="json">
{
  "name": "login",
  "meta": {
    "title": "登录",
    "hiddenNavBar": true
  }
}
</route>
