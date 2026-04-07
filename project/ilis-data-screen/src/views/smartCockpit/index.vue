<template>
  <a-config-provider :locale="locale" :theme="theme">
    <div
      :style="{ width: screenWidth + 'px', height: screenHeight + 'px' }"
      class="smart-cockpit-main"
    >
      <ScreenHeader />
      <div v-if="isLoaded" class="smart-cockpit-body">
        <router-view />
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { useDebounceFn, useEventListener } from "@vueuse/core"
import { onMounted, ref, nextTick } from "vue"
import ScreenHeader from "@/components/smartCockpit/Header.vue"
import zhCN from "ant-design-vue/es/locale/zh_CN"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import { theme } from "./index"
import { getUrlParam } from "@/utils/utils"

localStorage.setItem("unitCode", getUrlParam("unitCode") || "sgjc")

const locale = zhCN

dayjs.locale("zh-cn")

const debouncedFn = useDebounceFn(
  () => {
    isLoaded.value = false
    initPageScale()
  },
  500,
  { maxWait: 5000 }
)
useEventListener(window, "resize", debouncedFn)

const standardScreenWidth = 8192

const standardScreenHeight = 2304

const isLoaded = ref(false)

const screenWidth = ref(8192)

const screenHeight = ref(2304)

/**
 * # 初始化页面适配
 */
const initPageScale = () => {
  const winH = window.innerHeight || document.body.clientHeight
  const size = (winH / standardScreenHeight) * 100

  screenHeight.value = winH
  screenWidth.value = (standardScreenWidth / standardScreenHeight) * winH

  document.documentElement.style.fontSize = size + "px"

  nextTick(() => {
    isLoaded.value = true
  })
}

onMounted(() => {
  initPageScale()
})
</script>

<style lang="less" scoped>
.smart-cockpit-main {
  background: url("../../assets/images/smartCockpit/bg.png") center no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
}

.smart-cockpit-body {
  flex: 1;
  height: 0;
  padding: 0.8rem;
  font-family: Source Han Sans;
  font-size: 0.32rem;
  color: #b4dbd6;
}
</style>

<style lang="less">
.smart-cockpit-tooltip {
  background-color: rgba(0, 85, 76, 0.8) !important;
  color: #fff !important;
  padding: 8px !important;
  border: 0 !important;
  border-radius: 2px !important;
  display: none;

  p {
    margin: 0;
  }
}
</style>
