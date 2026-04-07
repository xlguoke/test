<template>
  <!-- 二维码弹窗 -->
  <van-popup
    v-model:show="show"
    style="border-radius: 0.16rem; background: rgba(255, 255, 255, 0.7)"
  >
    <div
      style="
        padding: 0.32rem 0;
        text-align: center;
        border-bottom: 1px solid #224059;
        position: relative;
      "
    >
      {{ params?.title || "扫码" }}
      <van-icon
        name="cross"
        style="position: absolute; right: 0.4rem; top: 0.4rem"
        size="0.24rem"
        @click="handleClose()"
      />
    </div>
    <div style="padding: 0.38rem 1.3rem">
      <img style="width: 3.8rem" :src="qrcodeUrl" alt="" />
    </div>
    <div style="text-align: center; margin-bottom: 0.46rem">
      {{ params?.tips || "请使用手机扫码" }}
    </div>
  </van-popup>
</template>
<script lang="ts" setup>
import { onUnmounted, ref } from "vue"
import request from "@/utils/request"
import { showSuccessToast } from "vant"
import QRCode from "qrcode"

interface IParams {
  /** # 标题 */
  title?: string
  // # 二维码提示信息 */
  tips?: string
}

const show = ref(false)

const text = ref("xxx")

const qrcodeUrl = ref()

const params = ref<IParams>()

let timer

let outTimer // 扫码超时ng

function stopLoop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleClose() {
  show.value = false
  stopLoop()
}

async function auth(q: IParams) {
  const data = await request.get("/api/intelligent/sampling/qr-code")
  console.log(data)

  // 停止之前的轮询
  stopLoop()
  // 设置新的参数
  params.value = q
  text.value = data
  qrcodeUrl.value = await QRCode.toDataURL(text.value, {
    text: text.value,
    width: 300,
    height: 300,
    colorDark: "#000000",
    colorLight: "#ffffff",
    errorCorrectionLevel: "H",
    margin: 1
  })
  // 显示二维码弹窗
  show.value = true
  // 两分钟不操作关闭
  outTimer = setTimeout(() => {
    handleClose()
  }, 2 * 60 * 1000)
  // 开始轮询
  console.log("开始轮询扫码结果")
  return new Promise((resolve, _reject) => {
    timer = setInterval(async () => {
      // 轮询扫码结果
      console.log("轮询扫码结果")
      request.get(`/api/intelligent/sampling/qr-code/${text.value}`).then((res) => {
        console.log(res, "扫码结果")

        if (res && !(res instanceof Object)) {
          resolve(res)
          showSuccessToast("一次性授权成功")
          handleClose()
          clearTimeout(outTimer)
        }
      })
    }, 1000)
  })
}

onUnmounted(() => {
  stopLoop()
})

defineExpose({
  auth
})
</script>
<style lang="less" scoped></style>
