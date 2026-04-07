<template>
  <Niceframe class="h-full w-full p-3" top-line>
    <div class="h-full w-full flex">
      <div class="w-264 mr-12 overflow-auto monitor-ul">
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
        <div class="monitor-li">办公室</div>
      </div>
      <div class="flex-1">
        <ComWvpVideo
          :configs="{
            wss_flv: 'https://123.com',
            ws_flv: 'http://123.com'
          }"
        />
      </div>
    </div>
  </Niceframe>
</template>

<script setup lang="ts">
import ComWvpVideo from "@/components/ComWvpVideo.vue"
import Niceframe from "../components/Niceframe.vue"
</script>

<style lang="less" scoped>
.monitor-ul {
  background: rgba(0, 102, 236, 0.1);
}

.monitor-li {
  height: 0.44rem;
  padding: 0.12rem 0.16rem;
  color: #0d98fd;
  font-size: 0.14rem;
  border: solid 1px transparent;
  cursor: pointer;
  position: relative;

  &:hover {
    color: #fff;
    background: linear-gradient(270deg, rgba(0, 102, 236, 0) 0%, #0066ec 100%);
    border: 1px solid;
    border-image: linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, #0199fc 100%) 1;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 1px;
      transform: translateY(-50%);
      display: block;
      width: 0.08rem;
      height: 0.16rem;
      background: url("../../../assets/images/commandCenterScreen/li-arrow.svg") no-repeat center;
    }
  }
}
</style>
