<template>
  <div class="screen-warp" style="width: 100%">
    <ScreenHeader />
    <div class="body-warp">
      <div class="left-warp">
        <TaskStatistics ref="taskStatisticsRef"></TaskStatistics>
        <TestDetectionStatistics
          v-if="unitCode === 'sxjt'"
          ref="testDetectionStatistics"
        ></TestDetectionStatistics>
        <SampleStatistics v-else ref="sampleStatisticsRef"></SampleStatistics>
        <!-- <TestDetectionStatistics ref="testDetectionStatistics"></TestDetectionStatistics> -->
        <ConsignParamNum ref="consignParamNumRef" class="down-card"></ConsignParamNum>
      </div>
      <div class="content-warp">
        <Video ref="videoRef" :is-broad-beam="isBroadBeam"></Video>
        <TaskList ref="taskListRef" class="down-card"></TaskList>
      </div>
      <div class="right-warp">
        <PersonStatisticsRank
          v-if="route.query.unitCode === 'ztlq'"
          ref="personStatisticsRankRef"
        ></PersonStatisticsRank>
        <PersonStatistics v-else ref="personStatisticsRef"></PersonStatistics>
        <DeviceStatistics ref="deviceStatisticsRef"></DeviceStatistics>
        <UseStatusBox ref="useStatusBoxRef" class="down-card"></UseStatusBox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue"
import ScreenHeader from "@/components/ScreenHeader.vue"
import TaskStatistics from "@/components/dataScreen/TaskStatistics.vue"
import SampleStatistics from "@/components/dataScreen/SampleStatistics.vue"
import ConsignParamNum from "@/components/dataScreen/ConsignParamNum.vue"
import Video from "@/components/dataScreen/Video.vue"
import TaskList from "@/components/dataScreen/TaskList.vue"
import PersonStatistics from "@/components/dataScreen/PersonStatistics.vue"
import DeviceStatistics from "@/components/dataScreen/DeviceStatistics.vue"
import UseStatusBox from "@/components/dataScreen/UseStatusBox.vue"
import { useRoute } from "vue-router"
import PersonStatisticsRank from "@/components/dataScreen/PersonStatisticsRank.vue"
import TestDetectionStatistics from "@/components/dataScreen/TestDetectionStatistics.vue"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"

window.onresize = () => {
  initPageScale()
}

const { unitCode } = useUnitDataHooks()

// 增加屏class，避免单位定制时样式时影响到其他屏
const bodyClassList = document.getElementsByTagName("body")[0].classList
if (!bodyClassList.contains("data-screen-wrap")) {
  bodyClassList.add("data-screen-wrap")
}

const route = useRoute()

const videoRef = ref()

const taskStatisticsRef = ref()

const sampleStatisticsRef = ref()

const testDetectionStatistics = ref()

const consignParamNumRef = ref()

const taskListRef = ref()

const personStatisticsRef = ref()

const personStatisticsRankRef = ref()

const deviceStatisticsRef = ref()

const useStatusBoxRef = ref()

// 宽比例屏幕
const isBroadBeam = ref(false)

// 初始化页面适配
const initPageScale = () => {
  const winW = window.innerWidth || document.body.clientWidth
  const winH = window.innerHeight || document.body.clientHeight
  let size = (winH / 1080) * 100
  const wh = winW / winH

  document.documentElement.style.fontSize = size + "px"
  // 设备宽高比大于2
  if (wh >= 2.1) {
    document.querySelector(".screen-warp")?.classList.add("broad-beam")
    isBroadBeam.value = true
  } else {
    document.querySelector(".screen-warp")?.classList.remove("broad-beam")
    isBroadBeam.value = false
  }

  if (route.query.unitCode === "ztlq") {
    isBroadBeam.value = false
  }
}

const getDatas = () => {
  videoRef.value?.getData()
  taskStatisticsRef.value?.getData()
  sampleStatisticsRef.value?.getData()
  testDetectionStatistics.value?.getData()
  consignParamNumRef.value?.getData()
  taskListRef.value?.getData()
  personStatisticsRef.value?.getData()
  personStatisticsRankRef.value?.getData()
  deviceStatisticsRef.value?.getData()
  useStatusBoxRef.value?.getData()
}

onMounted(() => {
  initPageScale()
  nextTick(() => {
    getDatas()
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
