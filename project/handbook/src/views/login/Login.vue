<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { translateError } from '@/utils/translateError'
import { useSystemConfigStore } from '@/stores/systemConfig'

const version = __VERSION__
const userStore = useUserStore()
const router = useRouter()
const formSize = ref<any>('large')
const isShowPassword = ref(false)

onMounted(() => {
  const w = document.body.clientWidth || document.documentElement.clientWidth
  if (w <= 480)
    formSize.value = 'normal'
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
    await loginForm.value.validate()
  }
  catch (err) {
    return
  }

  loading.value = true
  try {
    await userStore.login(form.userName, form.password, form.unitCode)
    await router.replace('/')
    const { getUdrLogLevel } = useSystemConfigStore()
    getUdrLogLevel()
  }
  catch (err) {
    const error = translateError(err)
    // message.error(error.description || error.message)
    showToast({
      message: error.description || error.message,
      type: 'fail',
    })
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
          欢迎使用，海特博试云试验检测手簿软件
        </h4>
      </div>
      <van-form
        ref="loginForm"
        class="custom-form"
        label-align="top"
        required
        @submit="login"
      >
        <van-field
          v-model="form.unitCode"
          name="unitCode"
          placeholder="请输入单位编码"
          :size="formSize"
          clearable
          :rules="rules.unitCode"
        >
          <template #label>
            <i class="login-icon login-icon-unit" />
            单位
          </template>
        </van-field>
        <van-field
          v-model="form.userName"
          name="userName"
          placeholder="请输入用户名"
          :size="formSize"
          clearable
          :rules="rules.userName"
        >
          <template #label>
            <i class="login-icon login-icon-user" />
            用户名
          </template>
        </van-field>
        <van-field
          v-model="form.password"
          name="password"
          :type="isShowPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          :size="formSize"
          :rules="rules.password"
          :right-icon="isShowPassword ? 'eye-o' : 'closed-eye'"
          clearable
          @click-right-icon="(e:Event) => { e.preventDefault();isShowPassword = !isShowPassword }"
        >
          <template #label>
            <i class="login-icon login-icon-password" />
            密码
          </template>
        </van-field>
        <van-button block type="primary" native-type="submit" :loading="loading">
          登 录
        </van-button>
      </van-form>
    </div>
    <div class="login-footer">
      版本号：Hitek-ELN {{ version }}
      <span class="line">|</span>
      重庆海特科技发展有限公司版权所有
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  min-height: 500px;
  background-color: #fff;
  .login-logo-title {
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

.login-footer {
  position: absolute;
  bottom: 1.2rem;
  text-align: center;
  line-height: 18px;
  color: #999;
  font-size: 12px;
  .line {
    margin: 0 8px;
  }
}

.main-horizontal {
  .login-logo-title {
    margin-top: -5rem;
  }
}

@media screen and (max-width: 428px) {
  .login-footer {
    .line {
      display: block;
      opacity: 0;
      line-height: 0;
    }
  }
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

@media screen and (max-width: 950px), (max-height: 630px){
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
