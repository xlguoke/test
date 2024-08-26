<script lang="ts" setup>
import type { UnwrapRef } from 'vue'
import { useRouter } from 'vue-router'
import qs from 'qs'
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { FormProps } from 'ant-design-vue'
import type { LoginRole } from '@/types/permission'
import { Footer } from '@/layout'
import CanvasBg from '@/components/CanvasBg.vue'
import permissionStore from '@/stores/permissions'
import useMyFetch from '@/composables/useMyFetch'

interface FormState {
  username: string
  password: string
}

const props = defineProps<{
  entry?: LoginRole
}>()

const permission = permissionStore()
const formState: UnwrapRef<FormState> = reactive({
  username: '',
  password: '',
})
const router = useRouter()
const loading = ref(false)
let loginId = localStorage.getItem('loginId')
const handleFinish: FormProps['onFinish'] = async () => {
  if (!loginId) {
    loginId = uuid()
    localStorage.setItem('loginId', loginId)
  }
  try {
    loading.value = true
    const formdata = new FormData()
    formdata.append('username', formState.username)
    formdata.append('password', formState.password)
    const { data, error } = await useMyFetch<string>('/test/login', {
      method: 'POST',
      body: qs.stringify(formState),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'X-CNT-ID': loginId,
      },
    }).text()
    if (!error.value) {
      permission.Authorization = data.value || ''
      // 登录成功，获取权限列表，跳转首页
      await permission.getAllPermissions()
      const path = permission.homePath(props.entry)
      router.replace(path)
    }
  }
  catch (err) {
    console.error('登录异常->', err)
  }
  loading.value = false
}

function uuid(): string {
  const s: any = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  const uuid = s.join('')
  return uuid
}
</script>

<template>
  <a-layout h-screen>
    <a-layout-header
      class="h-[70px]! leading-[70px]! pl-4! pr-4! bg-gradient-to-r! text-white!"
      from-blue-700
      to-sky-500
      text-2xl
      z-100
    >
      统一平台管理系统
    </a-layout-header>
    <a-layout>
      <a-layout-content>
        <CanvasBg />
        <div w-full h-full grid place-items-center>
          <div class="py-4 px-12 w-[360px] shadow-md rounded-lg bg-white z-100">
            <h3 mb-10 text-center>
              登录
            </h3>
            <a-form
              :model="formState"
              @finish="handleFinish"
            >
              <a-form-item>
                <a-input
                  v-model:value="formState.username"
                  placeholder="请输入用户账号"
                  :maxlength="50"
                >
                  <template #prefix>
                    <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item>
                <a-input-password
                  v-model:value.trim="formState.password"
                  placeholder="请输入用户密码"
                  :maxlength="20"
                >
                  <template #prefix>
                    <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                  </template>
                </a-input-password>
              </a-form-item>
              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  block
                  :loading="loading"
                  :disabled="formState.username === '' || formState.password === ''"
                >
                  登 录
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-layout-content>
      <Footer />
    </a-layout>
  </a-layout>
</template>
