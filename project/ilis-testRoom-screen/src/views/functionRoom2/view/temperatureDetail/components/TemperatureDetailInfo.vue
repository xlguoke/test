<template>
  <div>
    <CommonTitle>温湿度详情</CommonTitle>
    <div class="detail">
      <Container>
        <div class="top">
          <span class="l">
            <img src="@/assets/tColorIconBig.svg" class="icon" />
            <span>温度(℃)</span>
          </span>
          <span class="r">
            <i
              class="dot"
              :class="{
                'bg-red': webSocketData.humStatus === '超标'
              }"
            ></i>
            <span>{{ webSocketData.humStatus || "未知" }}</span>
          </span>
        </div>
        <DashBoard :start="0" :end="100" :data="50" type="hot"></DashBoard>
        <div class="bottom">
          <span class="label">标准范围</span>
          <span>{{ 1 }}℃~{{ 20 }}℃</span>
        </div>
      </Container>
      <Container>
        <div class="top">
          <span class="l">
            <img src="@/assets/rhColorIconBig.svg" class="icon" />
            <span>湿度(%RH)</span>
          </span>
          <span class="r">
            <i
              class="dot"
              :class="{
                'bg-red': webSocketData.humStatus === '超标'
              }"
            ></i>
            <span>{{ webSocketData.humStatus || "未知" }}</span>
          </span>
        </div>
        <DashBoard :start="0" :end="100" :data="50" type="cold"></DashBoard>
        <div class="bottom">
          <span class="label">标准范围</span>
          <span>{{ 1 }}%RH~{{ 20 }}%RH</span>
        </div>
      </Container>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
import { ref } from "vue"
import DashBoard from "./DashBoard.vue"

const webSocketData: Record<string, any> = ref({})
</script>
<style lang="less" scoped>
.detail {
  display: flex;
  justify-content: space-between;
  .top {
    margin-bottom: 0.75rem;
    display: flex;
    justify-content: space-between;
    .l,
    .r {
      display: flex;
      align-items: center;
      .icon {
        width: 0.4rem;
        height: 0.4rem;
      }
      .dot {
        margin-right: 0.14rem;
        display: inline-block;
        width: 0.16rem;
        height: 0.16rem;
        border-radius: 50%;
        --un-bg-opacity: 1;
        background-color: rgb(74 222 128 / var(--un-bg-opacity)); /* #4ade80 */
      }
    }
  }
  .bottom {
    height: 0.66rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0.16rem;
    background: rgba(255, 255, 255, 0.6);
    padding: 0.15rem 0.22rem;
    margin-top: 0.4rem;
    .label {
      color: #9da4aa;
    }
  }
}
</style>
