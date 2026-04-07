<template>
  <Niceframe class="h-full w-full p-3" top-line>
    <div class="h-full w-full flex">
      <div class="w-[264px] mr-3 overflow-auto flex flex-col">
        <div class="lab-info">
          <div class="lab-info-li">
            <img src="../../../assets/images/commandCenterScreen/lab-icon.svg" />
            <p class="flex-1">全部试验室</p>
            <span>120个</span>
          </div>
          <div class="lab-info-li">
            <img src="../../../assets/images/commandCenterScreen/camera-icon.svg" />
            <p class="flex-1">摄像头试验室</p>
            <span>80个</span>
          </div>
        </div>
        <div class="lab-ul">
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
          <div class="lab-li">办公室</div>
        </div>
      </div>
      <div class="flex-1">
        <ComWvpVideo />
      </div>
    </div>
  </Niceframe>
</template>

<script setup lang="ts">
import ComWvpVideo from "@/components/ComWvpVideo.vue"
import Niceframe from "../components/Niceframe.vue"
</script>

<style lang="less" scoped>
.lab-ul {
  margin-top: 8px;
  background: rgba(0, 102, 236, 0.1);
}

.lab-li {
  height: 44px;
  padding: 12px 16px;
  color: #0d98fd;
  font-size: 14px;
  border: solid 1px transparent;
  cursor: pointer;
  position: relative;

  &.active,
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
      width: 8px;
      height: 16px;
      background: url("../../../assets/images/commandCenterScreen/li-arrow.svg") no-repeat center;
    }
  }
}

.lab-info {
  background: linear-gradient(270deg, rgba(0, 102, 236, 0) 0%, #0066ec 100%);
  border: 1px solid;
  border-right: 0;
  border-image: linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, #0199fc 100%) 1;

  .lab-info-li {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 12px 16px;
    color: #0d98fd;
    font-size: 14px;
    border: solid 1px transparent;
    cursor: pointer;
    color: #fff;

    img {
      margin-right: 12px;
    }

    span {
      color: #3cfcff;
    }
  }
}
</style>
