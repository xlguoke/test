<script lang="ts" setup>
import { Button, Form, FormItem, Input, message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { translateError } from '@/utils/translateError'

const userStore = useUserStore()
const router = useRouter()
const formSize = ref<any>('large')

onMounted(() => {
  const w = document.body.clientWidth || document.documentElement.clientWidth
  if (w <= 480)
    formSize.value = 'default'
})

const form = reactive({
  unitCode: '',
  userName: '',
  password: '',
})

const rules = reactive({
  unitCode: [{ required: true, message: '单位不能为空' }],
  userName: [{ required: true, message: '用户名不能为空' }],
  password: [{ required: true, message: '密码不能为空' }],
})

// 登录：只能在在线状态登录
const loading = ref(false)
const loginForm = ref()
async function login() {
  try {
    const valid = await loginForm.value.validateFields()
    if (!valid)
      return
  }
  catch (err) {
    return
  }

  loading.value = true
  try {
    await userStore.login(form.userName, form.password, form.unitCode)
    await router.replace('/')
  }
  catch (err) {
    const error = translateError(err)
    message.error(error.description || error.message)
  }
  loading.value = false
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-content">
      <div class="login-logo-title">
        <img class="logo-img" src="@/assets/images/logo.png" alt="LOGO">
        <h4 class="login-title">
          欢迎使用，海特电子试验记录系统
        </h4>
      </div>
      <Form
        ref="loginForm"
        class="custom-form"
        :model="form"
        :rules="rules"
        layout="vertical"
        :size="formSize"
        @keydown.enter="login"
      >
        <FormItem name="unitCode">
          <template #label>
            <i class="login-icon login-icon-unit" />
            单位
          </template>
          <Input v-model:value="form.unitCode" placeholder="请输入单位编码" />
        </FormItem>
        <FormItem name="userName">
          <template #label>
            <i class="login-icon login-icon-user" />
            用户名
          </template>
          <Input v-model:value="form.userName" placeholder="请输入用户名" />
        </FormItem>
        <FormItem name="password">
          <template #label>
            <i class="login-icon login-icon-password" />
            密码
          </template>
          <Input.Password
            v-model:value="form.password"
            placeholder="请输入密码"
          />
        </FormItem>
      </Form>

      <Button type="primary" block :loading="loading" @click="login">
        登 录
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
  background-color: #fff;
  .login-logo-title{
    margin-top: -12rem;
  }
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
.login-icon {
  display: inline-block;
  margin-right: 5px;
  width: 18px;
  height: 18px;
}
.login-icon-unit {
  background: url('@/assets/images/login-unit.svg') no-repeat center center;
}
.login-icon-user {
  background: url('@/assets/images/login-user.svg') no-repeat center center;
}
.login-icon-password {
  background: url('@/assets/images/login-password.svg') no-repeat center center;
}

.custom-form {
  margin-bottom: 5rem;
}

@media screen and (max-width: 576px) {
  .login-wrap {
    .logo-img {
      width: 12rem;
    }
    .login-content {
      width: 80%;
    }
  }
}

.main-horizontal{
  .login-logo-title{
    margin-top: -5rem;
  }
}

@media screen and (max-width: 950px) {
  /* 横屏模式 */
  .main-horizontal {
    .login-logo-title {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      .logo-img {
        margin-right: 5%;
        margin-left: 0;
        width: 4rem;
        height: 4rem;
      }
      .login-title {
        margin: 0;
      }
    }
    .custom-form {
      margin-bottom: 2rem;
    }
  }
}
</style>
