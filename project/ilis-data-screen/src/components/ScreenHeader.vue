<template>
  <div class="screen-header">
    <iframe
      width="300"
      scrolling="no"
      height="30"
      frameborder="0"
      allowtransparency="true"
      :src="tianqiSrc"
    ></iframe>
    <span class="font-ys">{{ unitInfo.name }}</span>
    <p class="head-right">
      <span v-if="unitInfo.address" class="address">{{ unitInfo.address }}</span>
      <span class="date">{{ nowDate }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { formatDate } from "@/utils/utils"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"

const { unitCode } = useUnitDataHooks()

const nowDate = ref("")
onMounted(() => {
  setInterval(() => {
    nowDate.value = formatDate("", 2)
  }, 1000)
})

/**
 * ## 单位信息
 * name: 单位名称
 * address: 单位市区
 * currentCity: 单位市区对应天气系统的变量值，新增单位时访问单位系统，选择对应的市区获取
 */
const unitInfo = computed(() => {
  if (location.href.includes("hbrd")) {
    return {
      name: "湖北瑞达科研检测有限公司",
      address: "武汉市",
      currentCity: "wuhan"
    }
  } else if (location.href.includes("whld")) {
    return {
      name: "武汉路达建设工程检测有限公司",
      address: "武汉市",
      currentCity: "wuhan"
    }
  } else if (location.href.includes("yljc")) {
    return {
      name: "云南云路工程检测有限公司",
      address: "安宁市",
      currentCity: "anning"
    }
  } else if (location.href.includes("jxtc")) {
    return {
      name: "江西天驰质量检测综合管理试验驾驶舱",
      address: "南昌市",
      currentCity: "nanchang"
    }
  } else if (location.href.includes("ztlq")) {
    return {
      name: "四川智通路桥工程技术有限责任公司",
      address: "成都市",
      currentCity: "chengdu"
    }
  } else if (location.href.includes("sxjt")) {
    return {
      name: "山西省交通建设工程质量检测中心",
      address: "太原市",
      currentCity: "taiyuan"
    }
  } else {
    return {
      name: "贵州黔程弘景工程咨询有限责任公司",
      address: "贵阳市",
      currentCity: "guiyang1"
    }
  }
})

const tianqiSrc = computed(() => {
  if (unitCode.value === "yljc") {
    return `https://i.tianqi.com?c=code&id=34&color=%23000000&icon=1&py=${unitInfo.value.currentCity}&site=14`
  }

  return `https://i.tianqi.com?c=code&id=34&color=%23FFFFFF&icon=1&py=${unitInfo.value.currentCity}&site=14`
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
