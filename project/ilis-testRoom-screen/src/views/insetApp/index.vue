<template>
  <div style="height: 100vh; width: 100vw">
    <iframe
      ref="iframeRef"
      style="display: block; width: 100%; height: 100%"
      :src="iframeSrc"
      frameborder="0"
    ></iframe>
  </div>

  <!-- 扫码登录 -->
  <ScanLogin ref="scanLoginRef" />
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from "vue"
import { useRouter } from "vue-router"
import ScanLogin from "@/views/functionRoom2/components/ScanLogin.vue"
import { functionRoom2Store } from "@/store/functionRoom2"
import { userStore } from "@/store/user"

const router = useRouter()

const scanLoginRef = ref()

const iframeSrc = ref()

iframeSrc.value = router.currentRoute.value.query.url

const iframeRef = ref()

const { userInfo } = toRefs(userStore())

const { authConfig } = toRefs(functionRoom2Store())

function back() {
  router.back()
}

function login() {
  // router.push({
  //   name: "login",
  //   query: {
  //     redirectURL: router.currentRoute.value.fullPath
  //   }
  // })
  console.log("触发了login")
}

watch(
  userInfo,
  () => {
    try {
      ;(window as any).isAuth = !!userInfo.value
      ;(window as any).authConfig = authConfig.value
      iframeRef.value.contentWindow.location.reload()
    } catch (e) {
      console.log(e)
    }
  },
  { deep: true }
)
;(window as any).back = back
;(window as any).login = login

onMounted(() => {
  ;(window as any).onScanLogin = scanLoginRef.value.auth
  ;(window as any).isAuth = !!userInfo.value
  ;(window as any).authConfig = authConfig.value
})
</script>
