<template>
  <div class="main commandCenterScreen">
    <ScreenHeader />
    <div v-if="isLoaded" class="main-content">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useEventListener } from "@vueuse/core"
import ScreenHeader from "./components/Header.vue"
import Footer from "./components/Footer.vue"
import { nextTick, onMounted, ref } from "vue"

const isLoaded = ref(false)

const debouncedFn = useDebounceFn(
  () => {
    isLoaded.value = false
    initfontSize()
  },
  500,
  { maxWait: 5000 }
)
useEventListener(window, "resize", debouncedFn)

onMounted(async () => {
  initfontSize()
})

const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth

  let size = (winW / 1920) * 100

  document.documentElement.style.fontSize = size + "px"

  nextTick(() => {
    isLoaded.value = true
  })
}

document.title = "指挥中心驾驶舱"
</script>

<style>
.commandCenterScreen {
  line-height: 1.5;
}
</style>
<style lang="less" scoped>
html {
  background: #00071f;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}

.main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 0.14rem;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 0.18rem 0.24rem 0 0.24rem;
  height: 0;
}
</style>
