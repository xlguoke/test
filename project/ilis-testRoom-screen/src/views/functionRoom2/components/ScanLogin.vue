<template>
  <van-dialog
    v-model:show="loginVisible"
    width="80%"
    :title="title"
    confirm-button-text="关闭"
    :teleport="layoutEle"
    destroy-on-close
    @close="onClose"
  >
    <div
      class="w-[5rem] h-[5rem] mx-auto flex items-center justify-center mt-[0.48rem] mb-[0.48rem]"
    >
      <img v-if="qrCodeUrl" :src="qrCodeUrl" />
    </div>
  </van-dialog>
</template>
<script lang="ts" setup>
import { checkQrCodeAuth, getAuthQrCode, getCurrentUserInfo } from "@/api/functionRoom2.api"
import { userStore } from "@/store/user"
import { message } from "ant-design-vue"
import { onMounted, ref, toRefs } from "vue"
import QRCode from "qrcode"
import { showDialog, showLoadingToast } from "vant"

let layoutEle: HTMLElement | null

const checkFlag = ref(false)

const user = userStore()

const { userInfo, token } = toRefs(userStore())

const title = ref("请使用ILIS APP扫码登录")

const loginVisible = ref(false)

const qrCodeUrl = ref("")

let checkTimer: any = null

async function checkLogin(key, cb) {
  if (loginVisible.value === false) {
    return
  }

  const res = await checkQrCodeAuth(key)

  if (res) {
    if (typeof res === "string") {
      const toastLoading = showLoadingToast("登录中...")
      getCurrentUserInfo(res)
        .then((data) => {
          if (data.code !== 20010) {
            user.scanLogin(data.data, res)
            user.checkAuthLoginOut()
            message.success("登录成功！")

            loginVisible.value = false
            window.location.reload()

            // 登录后直接刷新页面，不再进行下面的继续操作，后续如果拓展，可以改改
            // cb && cb(data.data, res)
            // loginVisible.value = false
          } else {
            showDialog({
              title: "提示",
              message: data.message || data.msg || "登录失败！"
            })
          }
        })
        .finally(() => {
          toastLoading.close()
        })
    } else {
      showDialog({
        title: "提示",
        message: res.message
      })
      loginVisible.value = false
    }
    return
  }

  checkTimer = setTimeout(() => {
    checkLogin(key, cb)
  }, 2000)
}

function onClose() {
  checkFlag.value = false
  qrCodeUrl.value = ""

  clearTimeout(checkTimer)
  checkTimer = null
}

async function genQrCode(): Promise<string> {
  const content = await getAuthQrCode()

  QRCode.toDataURL(content, {
    text: content,
    width: 300,
    height: 300,
    colorDark: "#000000", // 二维码色
    colorLight: "#ffffff", // 背景色
    errorCorrectionLevel: "H"
  }).then((url) => {
    qrCodeUrl.value = url
  })

  return content
}

async function auth(options: { title?: string; needAuth?: boolean } = {}, cb) {
  // 是否需要授权
  if (options.needAuth === false) {
    cb(userInfo.value, token.value)
    return
  }

  if (!!userInfo.value) {
    cb(userInfo.value, token.value)
    return
  }

  title.value = options.title || "请使用ILIS APP扫码登录"
  loginVisible.value = true
  checkFlag.value = true

  const key = await genQrCode()

  checkLogin(key, cb)
}

onMounted(() => {
  layoutEle = document.querySelector("#app .layout")
})

defineExpose({
  auth
})
</script>

<style lang="less" scoped>
.account {
  display: flex;
  justify-content: flex-end;
}
</style>
