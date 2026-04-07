<template>
  <div style="height: 60px; overflow: hidden">
    <a-row v-if="!isJt" class="header_wrap" justify="space-between" align="middle">
      <a-col :span="12" class="lt">
        <img src="@/assets/images/logo.png" alt="logo" />
      </a-col>
      <a-col :span="12" class="rt">
        <ul>
          <!-- <li>
          <i class="iconfont icon-xiaoxizhongxin" style="font-size: 20px;"></i>
        </li> -->
          <li @click="Locking">
            <i class="iconfont icon-suoding" style="font-size: 20px"></i>
          </li>
          <li @click="fullScreen">
            <i class="iconfont icon-quanping_o" style="font-size: 22px"></i>
          </li>
          <li>
            <a-avatar :src="avatarUrl">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
          </li>
          <li>
            <a-dropdown>
              <a class="user_down" @click.prevent>
                欢迎你！{{ userInfo.name }}
                <i class="iconfont icon-xiala"></i>
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="/userInfo?k=user">用户信息</router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/userInfo?k=pwd">修改密码</router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" @click="logout">退出登录</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </li>
        </ul>
      </a-col>

      <a-modal
        v-model:visible="lockVisible"
        :centered="true"
        width="450"
        :closable="false"
        :mask-closable="false"
        :footer="null"
        :mask-style="{ 'background-color': ' rgba(0, 0, 0, 0.8)' }"
        :keyboard="false"
      >
        <a-alert
          style="margin: 10px 0"
          message="屏幕已被锁定，请输入账户密码进行解锁!"
          type="info"
          show-icon
        />
        <a-input-password
          v-model:value="passWord"
          class="input_row"
          size="large"
          placeholder="请输入账户密码，按 “回车键” 进行解锁"
          @keypress.enter="unlock"
        >
          <template #prefix>
            <span class="iconfont icon-mima1"></span>
          </template>
        </a-input-password>
      </a-modal>
    </a-row>
    <div v-else class="jt-head">
      <iframe :src="jtHeadUrl" width="100%" height="40px">请使用支持iframe的浏览器</iframe>
    </div>
  </div>
</template>
<script setup lang="ts">
import { message, Modal } from "ant-design-vue"
import { createVNode, ref, onMounted, watch } from "vue"
import { ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons-vue"
import { storeToRefs } from "pinia"
import userInfoStore from "@/stores/userInfo"
import { loginOutAPI, loginOutLogAPI } from "@/api/login.api"
import { verifyPasswordAPI } from "@/api/common.api"
import { clearAllCookie, userLocalStorage } from "@/assets/js/common"
import { getMinioFileUrl } from "@/config/minio.config"
import { Base64 } from "js-base64"
import Crypto from "crypto-js"

const { userInfo, isJt, jtHeadUrl } = storeToRefs(userInfoStore())

let lockVisible = ref(false)
onMounted(() => {
  let islock = userLocalStorage.get("lockScreen")
  islock ? (lockVisible.value = true) : (lockVisible.value = false)
})

const avatarUrl = ref()
watch(
  userInfo,
  async () => {
    avatarUrl.value = await getMinioFileUrl(userInfo.value.avatar)
  },
  {
    immediate: true
  }
)

let passWord = ref("")

const Locking = () => {
  passWord.value = ""
  lockVisible.value = true
  userLocalStorage.set("lockScreen", "true")
}
const unlock = async () => {
  if (!passWord.value) {
    message.warning("请输入密码进行解锁!")
    return
  }
  const base64Pw = Base64.encode(passWord.value)
  let res = await verifyPasswordAPI(base64Pw)
  const encrypt = Crypto.MD5(passWord.value + "lucky").toString()
  if (encrypt === res) {
    lockVisible.value = false
    userLocalStorage.set("lockScreen", "false")
  } else {
    message.warning("密码错误!")
  }
}

const fullScreen = () => {
  const el: any = document.documentElement
  if (el.RequestFullScreen) {
    el.RequestFullScreen()
  }
  //兼容火狐
  console.log(el.mozRequestFullScreen)
  if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen()
  }
  //兼容谷歌等可以webkitRequestFullScreen也可以webkitRequestFullscreen
  if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen()
  }
  //兼容IE,只能写msRequestFullscreen
  if (el.msRequestFullscreen) {
    el.msRequestFullscreen()
  }
}
const logout = () => {
  Modal.confirm({
    title: "是否退出系统?",
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode("div", { style: "color:#333;" }, "请检查操作数据是否保存完好！"),
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      await loginOutLogAPI(userInfo.value.id).catch((err) => {
        console.log(err)
      })
      await loginOutAPI().catch((err) => {
        console.log(err)
      })
      let loginFrom = userLocalStorage.get("loginFrom")
      localStorage.clear()
      sessionStorage.clear()
      clearAllCookie()
      if (loginFrom) {
        userLocalStorage.set("loginFrom", loginFrom)
      }
      window.location.href = import.meta.env.VITE_BASE_PATH || "/"
    },
    onCancel() {
      console.log("Cancel")
    },
    class: "test"
  })
}
</script>

<style lang="less" scoped>
.jt-head {
  height: 100%;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
.header_wrap {
  height: 60px;
  background: @theme_color;
  padding: 0 10px;

  .lt {
    display: flex;
    align-items: center;
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

      .user_down {
        color: #fff;
      }
    }

    .el-dropdown-link {
      cursor: pointer;
      color: #fff;
      display: flex;
      align-items: center;
    }
  }
}
</style>
