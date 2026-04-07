<template>
  <div class="screen-warp" style="width: 100%">
    <ScreenHeader />
    <div class="body-warp">
      <div class="left-warp">
        <!-- 人员统计 -->
        <PersonStatistics ref="personStatisticsRef"></PersonStatistics>
        <!-- 设备统计 -->
        <DeviceStatistics ref="deviceStatisticsRef"></DeviceStatistics>
        <!-- 委托参数数量排行 -->
        <ConsignParamNum ref="consignParamNumRef" class="down-card"></ConsignParamNum>
      </div>
      <div class="content-warp">
        <!-- 视频监控 -->
        <Video ref="videoRef" :is-broad-beam="isBroadBeam"></Video>
        <!-- 试验检测数据统计 -->
        <TestDetectionChart ref="taskListRef" class="down-card"></TestDetectionChart>
      </div>
      <div class="right-warp">
        <!-- 样品统计 -->
        <SampleStatistics ref="sampleStatisticsRef"></SampleStatistics>
        <!-- 样品标样 -->
        <SampleStandard ref="sampleStandardRef"></SampleStandard>
        <!-- 试验检测 -->
        <TestDetection ref="useStatusBoxRef" class="down-card"></TestDetection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue"
import ScreenHeader from "@/components/ScreenHeader.vue"
import SampleStatistics from "@/components/dataScreen/SampleStatistics.vue"
import ConsignParamNum from "@/components/dataScreen/ConsignParamNum.vue"
import Video from "@/components/dataScreen/Video.vue"
import PersonStatistics from "@/components/dataScreen/PersonStatistics.vue"
import DeviceStatistics from "@/components/dataScreen/DeviceStatistics.vue"
import SampleStandard from "@/components/dataScreen/SampleStandard.vue"
import TestDetection from "@/components/dataScreen/TestDetection.vue"
import TestDetectionChart from "@/components/dataScreen/TestDetectionChart.vue"

window.onresize = () => {
  initPageScale()
}

const videoRef = ref()

const sampleStandardRef = ref()

const sampleStatisticsRef = ref()

const consignParamNumRef = ref()

const taskListRef = ref()

const personStatisticsRef = ref()

const deviceStatisticsRef = ref()

const useStatusBoxRef = ref()

/** # 是否为宽比例屏幕 */
const isBroadBeam = ref(false)

/**
 * # 初始化页面适配
 */
const initPageScale = () => {
  const winW = window.innerWidth || document.body.clientWidth
  const winH = window.innerHeight || document.body.clientHeight
  let size = (winH / 1080) * 100
  const wh = winW / winH

  document.documentElement.style.fontSize = size + "px"
  // 设备宽高比大于2
  if (wh >= 2) {
    document.querySelector(".screen-warp")?.classList.add("broad-beam")
    isBroadBeam.value = true
  } else {
    document.querySelector(".screen-warp")?.classList.remove("broad-beam")
    isBroadBeam.value = false
  }
}

const getDatas = () => {
  videoRef.value?.getData()
  sampleStandardRef.value?.getData()
  sampleStatisticsRef.value?.getData()
  consignParamNumRef.value?.getData()
  taskListRef.value?.getData()
  personStatisticsRef.value?.getData()
  deviceStatisticsRef.value?.getData()
  useStatusBoxRef.value?.getData()
}

onMounted(() => {
  initPageScale()
  nextTick(() => {
    setInterval(getDatas, 300000)
  })
})
</script>

<style lang="less" scoped>
@col-gap: 0.24rem;
@row-gap: 0.24rem;

.mg-t {
  margin-top: 20px;
}

.screen-warp {
  color: #fff;
  height: 100%;
  overflow-y: hidden;
}

.body-warp {
  padding: 0.12rem @row-gap @col-gap;
  height: calc(100% - 0.88rem);
  display: flex;
  row-gap: @row-gap;
  column-gap: @col-gap;
  box-sizing: border-box;
  .left-warp,
  .right-warp {
    width: 26%;
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: @row-gap;
  }
  .content-warp {
    flex: 1;
    display: flex;
    flex-direction: column;
    row-gap: @row-gap;
    width: 0;
    height: 100%;
  }

  .s-card {
    flex: 1;
    height: 0;
  }

  .down-card {
    flex: initial !important;
    height: 34% !important;
  }
}

:deep(.broad-beam) {
  .person-statistics {
    padding: 0 5%;
    .person-statistics-right {
      margin-left: -0.4rem;
    }
  }
  .device-statistics {
    padding: 0 0.2rem;
    .device-statistics-item-box {
      &.left {
        .device-statistics-info {
          margin-right: 0.7rem;
        }
      }
      &.right {
        .device-statistics-info {
          margin-left: 0.7rem;
        }
      }
    }
  }
}
</style>
