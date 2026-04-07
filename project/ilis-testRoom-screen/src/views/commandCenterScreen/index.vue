<template>
  <div class="main">
    <ScreenHeader />
    <div class="main-content">
      <router-view></router-view>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import ScreenHeader from "./components/Header.vue"
import Footer from "./components/Footer.vue"
import { onMounted } from "vue"

window.onresize = () => {
  initfontSize()
}

onMounted(async () => {
  initfontSize()
})

const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth

  let size = (winW / 1920) * 100

  document.documentElement.style.fontSize = size + "px"
}

document.title = "指挥中心驾驶舱"
</script>

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
  font-size: 14px;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 18px 24px 0 24px;
  height: 0;
}
</style>
