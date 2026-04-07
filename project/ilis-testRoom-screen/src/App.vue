<template>
  <router-view v-if="store.screenConfig.url || isWhiteRoute" />

  <van-watermark
    v-if="enableAuthWatermark"
    opacity="0.2"
    :gap-x="24"
    :text-color="watermarkColor"
    :gap-y="24"
    :width="220"
    :height="220"
    :full-page="true"
    :content="watermarkText"
  />

  <AppVersion
    v-if="
      !hideVersionPageList.some((i) => {
        return route.path.indexOf(i) !== -1
      })
    "
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useStore } from "./store"
import { ScreenConfigWhiteList } from "./router"
import AppVersion from "./components/AppVersion.vue"

const store = useStore()

const { isUpdateConf } = storeToRefs(store)

const router = useRouter()

const route = useRoute()

const hideVersionPageList = ["/functionRoom2"]

/** 根据智慧屏是否已授权展示水印 */
const enableAuthWatermark = computed(() => {
  const screenConfig = store.$state.screenConfig

  // 不展示水印的页面
  if (["/binding"].includes(route.path)) {
    return false
  }

  if (!screenConfig.id) {
    return false
  }

  // 无需屏幕配置逻辑的大屏
  if (!!ScreenConfigWhiteList.find((url) => location.href.indexOf(url) !== -1)) {
    return false
  }

  // 是否授权，且授权未过期
  // PS：授权过期日期可能不存在，若不存在，则认为永不过期
  if (screenConfig && screenConfig.license && screenConfig.license.authorized === true) {
    const authExpireDate = screenConfig.license.authExpireDate
    if (authExpireDate) {
      return !(new Date(authExpireDate).getTime() > new Date().getTime())
    } else {
      return false
    }
  }

  return true
})

/** 智慧屏水印颜色 */
const watermarkColor = computed(() => {
  if (["/functionRoom2"].includes(route.path)) {
    return "#333"
  }

  return "#dcdee0"
})

/** 智慧屏水印提示语 */
const watermarkText = computed(() => {
  const screenConfig = store.$state.screenConfig
  const authExpireDate = screenConfig && screenConfig.license && screenConfig.license.authExpireDate

  if (authExpireDate && new Date(authExpireDate).getTime() < new Date().getTime()) {
    return "授权已过期"
  }

  return "未授权使用"
})

// 无需屏幕配置的页面
const isWhiteRoute = computed(
  () => ScreenConfigWhiteList.includes(route.path) || ["/binding"].includes(route.path)
)

onMounted(async () => {
  // 无需屏幕配置逻辑的大屏
  if (!!ScreenConfigWhiteList.find((url) => location.href.indexOf(url) !== -1)) {
    return
  }
  const confUrl = await store.hasScreenConfig()
  if (!!confUrl) {
    isUpdateConf.value = true
    if (location.href !== confUrl && location.search.indexOf("functionRoomCheckId") == -1) {
      location.href = confUrl
    }
  } else {
    router.push("/binding")
  }
})
</script>

<style lang="less"></style>
