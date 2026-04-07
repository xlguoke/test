<template>
  <div class="screen-header">
    <iframe
      width="300"
      scrolling="no"
      height="30"
      frameborder="0"
      allowtransparency="true"
      src="https://i.tianqi.com?c=code&id=34&color=%23FFFFFF&icon=1&py=guiyang1&site=14"
    ></iframe>
    <span class="font-ys">贵州黔程弘景工程咨询有限责任公司</span>
    <p class="head-right">
      <span class="address">贵阳市</span>
      <span class="date">{{ nowDate }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { formatDate } from "@/utils/utils"
const nowDate = ref("")
onMounted(() => {
  setInterval(() => {
    nowDate.value = formatDate("", 2)
  }, 1000)
})
</script>

<style lang="less" scoped>
.screen-header {
  position: relative;
  height: 0.88rem;
  color: #bceaff;
  font-size: 0.42rem;
  line-height: 0.8rem;
  text-align: center;
  background: url("../assets/images/home-top-bg.png") no-repeat center center/100% 100%;
  iframe {
    position: absolute;
    left: 0.3rem;
    top: 0.15rem;
  }
  .head-right {
    position: absolute;
    right: 0.3rem;
    top: 0;
    text-align: right;
    color: #fff;
    font-size: 0.14rem;
    line-height: 0.7rem;
    .address {
      padding-left: 0.2rem;
      background: url("../assets/images/address.png") no-repeat 0 center/0.14rem 0.16rem;
    }
    .date {
      margin-left: 0.3rem;
      padding-left: 0.2rem;
      background: url("../assets/images/date.png") no-repeat 0 center/0.16rem 0.16rem;
    }
  }
}
</style>
