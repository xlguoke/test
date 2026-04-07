<template>
  <div class="w-full h-full relative">
    <div v-show="!isEmpty" ref="chartContainerRef" class="w-full h-full"></div>
    <div v-if="isEmpty" class="flex flex-col h-full items-center justify-center text-[#B4DBD6]">
      <img src="@/assets/images/smartCockpit/no-data.svg" class="w-280 h-280" />
      暂无数据
    </div>
    <slot name="legend"></slot>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts"
import * as ecStat from "echarts-stat"
import { onBeforeUnmount, onMounted, ref } from "vue"

const props = defineProps({
  enablePlay: {
    type: Boolean,
    default: false
  }
})

const chartContainerRef = ref()

const isEmpty = ref(false)

// echarts实例
let chart: echarts.EChartsType | null = null

// 自动播放逻辑
let autoPlayObj = {
  index: -1,
  timer: undefined,
  dataLength: 0
}

window.addEventListener("resize", () => {
  chart && chart.resize()
})

function showLoading() {
  isEmpty.value = false

  chart &&
    chart.showLoading({
      text: "加载中...",
      color: "#40E7D5",
      textColor: "#E6FFFC",
      maskColor: "rgba(255, 255, 255, 0.1)"
    })
}

function hideLoading() {
  chart && chart.hideLoading()
}

function setOption(options: any) {
  isEmpty.value = false

  chart && chart.setOption(options)

  checkEmpty(options)

  if (!props.enablePlay) {
    return
  }

  autoPlayObj.dataLength = options.series[0].data.length
  autoPlayObj.index = -1
  autoPlay()
}

function checkEmpty(options: any) {
  const series = options.series
  const dataset = options.dataset

  // 散点图
  if (dataset && dataset.length > 0) {
    const source = dataset[0].source
    if (!source.length) {
      isEmpty.value = true
    }
  }

  // 毕竟是个公共组件，为了稳妥起见，先处理简单类型的，后续可调整该判断
  if (series.length === 1) {
    const serieItem = series[0]

    if (["line", "pie", "bar"].includes(serieItem.type) && !serieItem.data.length) {
      isEmpty.value = true
    }
  }
}

function stopPlay() {
  clearInterval(autoPlayObj.timer)
  autoPlayObj.timer = undefined
}

function autoPlay() {
  if (!props.enablePlay) {
    return
  }

  stopPlay()

  autoPlayObj.timer = setInterval(() => {
    autoPlayObj.index++

    if (autoPlayObj.index >= autoPlayObj.dataLength) {
      autoPlayObj.index = 0
    }

    chart &&
      chart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: autoPlayObj.index
      })
  }, 5 * 1000) as any
}

onMounted(() => {
  if ((ecStat as any).transform) {
    const transform = (ecStat as any).transform
    echarts.registerTransform(transform.regression)
  }
  chart = echarts.init(chartContainerRef.value)

  chartContainerRef.value.addEventListener("mouseover", stopPlay)

  chartContainerRef.value.addEventListener("mouseout", autoPlay)
})

onBeforeUnmount(() => {
  stopPlay()
  chartContainerRef.value.removeEventListener("mouseover", stopPlay)
  chartContainerRef.value.removeEventListener("mouseout", autoPlay)
  chart && chart.dispose()
  chart = null
})

defineExpose({
  showLoading,
  hideLoading,
  setOption
})
</script>
