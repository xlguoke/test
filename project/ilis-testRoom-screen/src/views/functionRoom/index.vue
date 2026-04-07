<template>
  <div class="test-room-container">
    <!-- <van-loading v-show="loading" color="#a4c1ff" size="0.5rem" vertical>加载中...</van-loading> -->
    <RoomTop :unit-name="unitName" />
    <RoomWrap class="flex-column">
      <RoomHeader :key="labInfo.name" :title="labInfo.name" />

      <RouterView />
    </RoomWrap>
    <div class="screen-num">屏幕编码:{{ screenConfig.sn }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from "vue"
import { storeToRefs } from "pinia"
import { RoomTop, RoomHeader, RoomWrap } from "./components"
import { useStore } from "@/store"
import { functionRoomStore } from "@/store/functionRoom"
const { screenConfig } = useStore()
const { labInfo, unitName } = storeToRefs(functionRoomStore())

onMounted(async () => {
  initfontSize()
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1080) * 100
  document.documentElement.style.fontSize = size + "px"
}
const loading = ref(false)
provide("loading", loading)
</script>

<style lang="less">
@import "./style/index.less";

.test-room-container {
  padding: 0 0.3rem;
  height: 100%;
  font-size: 0.32rem;

  .screen-num {
    height: 0.62rem;
    line-height: 0.62rem;
    text-align: center;
    font-size: 0.28rem;
    letter-spacing: 3px;
    color: #003684;
    .font-ys;
  }

  // 功能室绑定
  .unit-code-box {
    display: flex;
    align-items: center;
    color: #fff;

    .unit-code {
      font-size: 0.28rem;
      background-color: transparent;
      padding: 0.3rem;
      box-sizing: border-box;
      height: 0.5rem;
      border: 1px solid #1369b9;
      border-radius: 0.04rem;
      outline: none;
    }

    .screen-num {
      font-size: 0.36rem;
      color: #86cef0;
    }
  }
  .normal-hint {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.28rem;
    color: #eee;
  }

  .temp-num .count {
    height: 22px;
  }
}
</style>
