<template>
  <div class="loginPage">
    <a-spin :tip="spinTip ? spinTip : 'Loading...'" :spinning="spinning">
      <a-layout-header>
        <a-row class="header_wrap" justify="space-between" align="middle">
          <a-col :span="12" class="lt">
            <img src="@/assets/images/logo2.png" alt="" />
          </a-col>
          <a-col :span="12" class="rt">
            <ul>
              <li>客服电话：023-89183000</li>
              <li>传真：023-89183222</li>
              <!-- <li>
                <i class="iconfont icon-erweima"></i>
                <span>APP下载</span>
              </li> -->
            </ul>
          </a-col>
        </a-row>
      </a-layout-header>
      <a-layout-content class="container_wrap">
        <!-- <div class="message_wrap">
          <span>1/5</span>
          <span>
            <i class="iconfont icon-zuo"></i>
            <i class="iconfont icon-you"></i>
          </span>
          <span>公告：</span>
          <span>
            与现实生活一致：
            与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；在界面中一致：
            所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。
          </span>
          <span>
            <a>查看详情</a>
            <i style="vertical-align: middle" class="iconfont icon-jiantou_yemian_xiangyou_o"></i>
          </span>
        </div> -->
        <div class="login-form-wrap">
          <!-- 短信验证 -->
          <SmsVerification
            v-if="showSms"
            :sms-phone="smsPhone"
            :sms-user-id="smsUserId"
            @valid="loginSuccess"
          />
          <!-- 密码登录 -->
          <div v-else class="login_form">
            <ul>
              <li :class="activeTab == 1 ? 'active' : ''" @click="tabCut(1)">密码登录</li>
              <!-- <li :class="activeTab == 2 ? 'active' : ''" @click="tabCut(2)">微信登录</li> -->
            </ul>
            <div v-show="activeTab == 1" class="login_input_wrap">
              <a-input
                v-model:value="userName"
                class="input_row"
                size="large"
                placeholder="请输入用户名"
                @keypress.enter="login"
              >
                <template #prefix>
                  <span class="iconfont icon-zhanghu1"></span>
                </template>
              </a-input>
              <a-input-password
                v-model:value="passWord"
                class="input_row"
                size="large"
                placeholder="请输入密码"
                @keypress.enter="login"
              >
                <template #prefix>
                  <span class="iconfont icon-mima1"></span>
                </template>
              </a-input-password>

              <div v-show="verifyImage" class="verify_row">
                <img :src="'data:image/png;base64,' + verifyImage" />
                <a-input
                  v-model:value="code"
                  class="input_row"
                  size="large"
                  placeholder="请输入验证码"
                  @keypress.enter="login"
                ></a-input>
              </div>
              <div class="forget_password">
                <span style="line-height: 30px">
                  <a-checkbox v-model:checked="remember">记住密码</a-checkbox>
                </span>
                <a-button type="link" @click="openChangePassword">忘记密码？</a-button>
              </div>
              <div class="login_btn">
                <a-button class="btn" type="primary" size="large" @click="login">登录</a-button>
              </div>

              <!-- <div class="register_link">
                <span>我要注册：</span>
                <a-button type="link" style="margin-right: 10px">委托单位注册</a-button>
                <a-button type="link">检测中心注册</a-button>
              </div> -->
            </div>
            <div v-show="activeTab == 2" class="login_wx_wrap">
              <img
                src="https://img2.baidu.com/it/u=1989038259,1842360401&fm=253&fmt=auto&app=138&f=PNG?w=500&h=500"
              />
            </div>
          </div>
        </div>
      </a-layout-content>
      <a-layout-footer class="foot_wrap">
        <ul>
          <!-- <li>
            <a-button type="link">帮助中心</a-button>
          </li>
          <li>
            <a-button type="link">隐私相关</a-button>
          </li>
          <li>
            <a-button type="link">使用条例</a-button>
          </li> -->
        </ul>
        <p class="">
          <span>
            版权所有&nbsp; 重庆市交通运输委员会 &nbsp; 值班电话：023-89183000 &nbsp;&nbsp;
            传真：023-89183222
          </span>
          <!-- <span>渝ICP09003439</span> -->
          <!-- <a-button type="link">重庆海特科技发展有限公司</a-button> -->
        </p>
      </a-layout-footer>
    </a-spin>

    <a-modal
      v-model:visible="visibleForgetPassword"
      width="550px"
      :centered="true"
      :mask-closable="false"
      title="找回密码"
      :confirm-loading="confirmLoading"
      @ok="forgetPasswordFromSubmit"
    >
      <a-form
        ref="forgetPasswordFromRef"
        :model="forgetPasswordFrom"
        name="basic"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="forgetPasswordFrom.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item
          label="手机号码"
          name="phone"
          :rules="[{ required: true, message: '请输入手机号码!' }]"
        >
          <a-input v-model:value="forgetPasswordFrom.phone" placeholder="请输入手机号码" />
        </a-form-item>
        <a-form-item
          label="短信验证码"
          name="code"
          :rules="[{ required: true, message: '请输入短信验证码!' }]"
        >
          <a-input-group compact>
            <a-input
              v-model:value="forgetPasswordFrom.code"
              style="width: calc(100% - 130px)"
              placeholder="请输入短信验证码"
            />
            <a-button type="primary" style="width: 130px" :disabled="isDisable" @click="getMsgCode">
              {{ isDisable ? num + "后可再次发送" : "获取验证码" }}
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }, { validator: validNewPwd }]"
        >
          <a-input-password v-model:value="forgetPasswordFrom.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item
          label="确认密码"
          name="passwordOk"
          :rules="[{ required: true, message: '请输入确认密码!' }, { validator: validNewPwd }]"
        >
          <a-input-password
            v-model:value="forgetPasswordFrom.passwordOk"
            placeholder="请输入确认密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import type { Ref } from "vue"
import { useRouter } from "vue-router"
import {
  loginAPI,
  verifyUserNameAndPhoneAPI,
  sendChangePasswordSMSAPI,
  changePasswordAPI
} from "@/api/login.api"
import { getUsersInfoAPI } from "@/api/system.api"
import { message } from "ant-design-vue"
import menuStore from "@/stores/menuTree"
import userStore from "@/stores/userInfo"
import existingTag from "@/stores/existingTag"
import { storeToRefs } from "pinia"
import CryptoJS from "crypto-js"

import { userLocalStorage, getMenuData, uuid } from "@/assets/js/common"
import SmsVerification from "./SmsVerification.vue"

const { menuTree } = storeToRefs(menuStore())
const { userInfo, isJt } = storeToRefs(userStore())
let { existTags, currentView } = storeToRefs(existingTag())

let route = useRouter()

let spinning = ref<boolean>(false)
let spinTip = ref<string>("")
let verifyImage = ref("")

let visibleForgetPassword = ref(false)
let userName: Ref<string> = ref("")
let passWord: Ref<string> = ref("")
let code: Ref<string> = ref("")

let remember: Ref<boolean> = ref(true)

let activeTab: Ref<number> = ref(1)

const showSms = ref(false)
const smsPhone = ref("")
const smsUserId = ref("")

let forgetPasswordFrom = ref({
  username: "",
  phone: "",
  code: "",
  password: "",
  passwordOk: ""
})

let forgetPasswordFromRef = ref()
let confirmLoading = ref(false)

onMounted(() => {
  let d = userLocalStorage.get("loginFrom")
  if (d) {
    userName.value = d.userName
    passWord.value = d.passWord
    remember.value = true
  } else {
    remember.value = false
  }
  //清空tags
  existTags.value = []
  currentView.value = {}
})
const tabCut = (val) => {
  activeTab.value = val
}

const pwdReg =
  /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*.]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*.]+$)(?![0-9_!@#$%^&*.]+$)[a-zA-Z0-9_!@#$%^&*.]{8,15}$/
const validNewPwd = async (_rule, value: string) => {
  if (value.length < 8) {
    return Promise.reject("密码长度必须大于等于8位")
  } else if (!pwdReg.test(value)) {
    return Promise.reject("密码必须包含大小写字母、数字、特殊字符中的至少三种")
  } else {
    return Promise.resolve()
  }
}

const encrypt = (word) => {
  const keyBase64 = "o9szYIOq1rRMiouNhNvaq96lqUvCekxR"
  const key = CryptoJS.enc.Base64.parse(keyBase64)
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

const login = async () => {
  if (!userName.value || !passWord.value) {
    message.warning("请输入账户和密码！")
    return false
  }

  let loginId = userLocalStorage.get("loginId")

  if (!loginId) {
    loginId = uuid()
    userLocalStorage.set("loginId", loginId)
  }
  spinTip.value = "登录中..."
  spinning.value = true
  loginAPI({
    username: encrypt(userName.value),
    password: encrypt(passWord.value),
    code: code.value,
    loginId: loginId
  })
    .then(async (res) => {
      rememberPassword()
      if (res.using2FA) {
        spinning.value = false
        smsPhone.value = res.phone
        smsUserId.value = res.userId
        showSms.value = true
      } else {
        loginSuccess(res)
      }
    })
    .catch((error) => {
      console.error(error)
      spinning.value = false
      verifyImage.value = error.response.data.src
    })
}

/** 登录成功 */
async function loginSuccess(token: string) {
  spinning.value = true
  userLocalStorage.set("userToken", token)
  await getUserInfo()
  await getMenuTree()
  isJt.value = false
  message.success("登录成功！")
  route.push("/homePage")
  userLocalStorage.set("lockScreen", "false")
}

const rememberPassword = () => {
  if (remember.value) {
    userLocalStorage.set("loginFrom", { passWord: passWord.value, userName: userName.value })
  } else {
    userLocalStorage.remove("loginFrom")
  }
}
const getUserInfo = async () => {
  spinTip.value = "获取用户信息中..."
  let res = await getUsersInfoAPI()
  userInfo.value = res
  return res
}
const getMenuTree = async () => {
  spinTip.value = "加载菜单权限中..."
  let v = await getMenuData()
  menuTree.value = v
}

const forgetPasswordFromSubmit = async () => {
  await forgetPasswordFromRef.value.validateFields()
  if (forgetPasswordFrom.value.password !== forgetPasswordFrom.value.passwordOk) {
    message.warning("两次密码输入不一致，请检查!")
    return
  }
  confirmLoading.value = true
  try {
    await changePasswordAPI(forgetPasswordFrom.value)
    message.success("修改成功")
    visibleForgetPassword.value = false
    resetForgetPasswordFrom()
  } catch (error) {
    console.error(error)
  }
  confirmLoading.value = false
}

let num = ref(60)
let isDisable = ref(false)
const getMsgCode = async () => {
  if (!forgetPasswordFrom.value.username) {
    message.warning("请输入用户名!")
    return false
  }
  if (!forgetPasswordFrom.value.phone) {
    message.warning("请输入手机号!")
    return false
  }
  let v = await verifyUserNameAndPhoneAPI(
    forgetPasswordFrom.value.username,
    forgetPasswordFrom.value.phone
  )
  if (!v) {
    message.warning("用户名和手机号不匹配,请检查!")
    return
  }

  await sendChangePasswordSMSAPI(forgetPasswordFrom.value.phone)
  message.success("已发送验证码,请注意查收!")

  isDisable.value = true
  let t = setInterval(() => {
    num.value--
    if (num.value == 0) {
      num.value = 60
      isDisable.value = false
      clearInterval(t)
    }
  }, 1000)
}

const openChangePassword = () => {
  visibleForgetPassword.value = true
  resetForgetPasswordFrom()
}

const resetForgetPasswordFrom = () => {
  forgetPasswordFrom.value = {
    username: "",
    phone: "",
    code: "",
    password: "",
    passwordOk: ""
  }
  forgetPasswordFromRef.value && forgetPasswordFromRef.value.resetFields() //重置表单
}
</script>

<style lang="less" scoped>
.loginPage {
  height: 100%;
  overflow: hidden;

  .header_wrap {
    margin: 0 auto;
    padding: 0 30px;
    max-width: 1440px;
    height: 90px;

    .lt {
      display: flex;
      align-items: center;

      span {
        color: #fff;
        margin-left: 20px;
      }
    }

    .rt {
      ul {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      li i {
        color: #fff;
        cursor: pointer;
      }

      li {
        margin: 10px;
        font-size: 14px;
        color: @text2_color;
      }

      li:last-child {
        background: #e6f0fd;
        padding: 6px 10px;
        border-radius: 21px;

        span {
          color: @theme_color;
        }

        i {
          color: @theme_color;
          margin-right: 5px;
        }
      }
    }
  }

  .container_wrap {
    height: calc(100vh - 150px);
    background: url("@/assets/images/login_bg.png") no-repeat;

    .message_wrap {
      text-align: center;
      color: #fff;
      display: flex;
      align-items: center;
      padding-left: 180px;

      span {
        margin: 0 5px;
      }
    }

    .login-form-wrap {
      padding: 0 30px;
      margin: 0 auto;
      max-width: 1440px;
    }

    .login_form {
      width: 380px;
      background: #fff;
      padding: 20px;
      border-radius: 5px;
      float: right;
      margin-top: 150px;

      ul {
        display: flex;
        padding: 10px;
        border-bottom: 1px solid #ebebeb;
        margin-bottom: 20px;

        li {
          margin: 0 20px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .active {
          color: #0066ec;
          font-size: 16px;
        }
      }

      .login_input_wrap {
        .input_row {
          margin-bottom: 20px;
        }

        span {
          font-size: 16px;
          color: #ccc;
        }

        .verify_row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 20px;

          img {
            width: 60px;
          }

          input {
            margin: 0;
            width: 257px;
            margin-left: 20px;
          }
        }
      }

      .login_wx_wrap {
        text-align: center;

        img {
          width: 70%;
          height: 67%;
        }
      }

      .forget_password {
        display: flex;
        justify-content: space-between;
        padding: 0 3px;
      }

      .login_btn {
        margin-bottom: 20px;

        .btn {
          width: 100%;
        }
      }

      .register_link {
        display: flex;
        margin-bottom: 10px;

        span {
          line-height: 30px;
          color: #ababab;
          margin-right: 5px;
        }
      }
    }
  }

  .foot_wrap {
    p {
      text-align: center;
      color: @text2_color;
    }

    ul {
      text-align: center;

      li {
        display: inline-block;
      }

      li:not(:last-child):after {
        content: "|";
        margin: 0 10px;
        font-size: 12px;
        vertical-align: top;
        color: #ccc;
      }
    }
  }
}
</style>
