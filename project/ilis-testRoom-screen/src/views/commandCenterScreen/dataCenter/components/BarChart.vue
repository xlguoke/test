<template>
  <div ref="wrap" class="w-full h-full" @mouseover="onMouseOver" @mouseleave="onMouseLeave"></div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, ref } from "vue"
import * as echarts from "echarts"

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  }
})

const chartOptions: any = {
  tooltip: {
    show: true,
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  grid: {
    top: 48,
    left: 48,
    right: 16,
    bottom: 32
  },
  xAxis: {
    type: "category",
    data: [],
    axisTick: {
      show: false
    },
    axisLabel: {
      color: "#B4C0CC",
      fontSize: 12
    },
    axisLine: {
      lineStyle: {
        width: 2,
        color: "#3F4F5E"
      }
    }
  },
  yAxis: {
    type: "value",
    axisLabel: {
      color: "#B4C0CC",
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        type: "dashed",
        color: "#35414D"
      }
    }
  },
  series: [
    {
      data: [],
      type: "bar",
      barWidth: 16,
      itemStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(0, 85, 255, 0.2)"
            },
            {
              offset: 1,
              color: "rgba(7, 206, 250, 1)"
            }
          ],
          global: false
        }
      },
      label: {
        show: true,
        backgroundColor: "rgba(7, 206, 250, 1)",
        width: 16,
        height: 3,
        position: "top",
        offset: [0, 6],
        color: "transparent"
      }
    }
  ],
  ...props.options
}

let chartInstance: echarts.ECharts

let scrollTimer: any = null

const wrap = ref()

onMounted(() => {
  chartInstance = echarts.init(wrap.value)

  window.addEventListener("resize", () => {
    chartInstance.resize()
  })
})

function onMouseOver() {
  if (chartInstance) {
    clearAutoScroll()
  }
}

function onMouseLeave() {
  if (!scrollTimer) {
    autoScroll()
  }
}

function setData(xData: string[], data: number[]) {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }

  chartOptions.xAxis.data = xData
  chartOptions.series[0].data = data
  chartInstance.setOption(chartOptions)
  chartInstance.resize()

  autoScroll()
}

function clearAutoScroll() {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }
}

function autoScroll() {
  if (scrollTimer) {
    clearAutoScroll()
  }

  scrollTimer = setTimeout(() => {
    if (!chartOptions.dataZoom) {
      autoScroll()
      return
    }

    const data = chartOptions.series[0].data
    const step = (1 / data.length) * 100

    if (chartOptions.dataZoom[0].end === 100) {
      chartOptions.dataZoom[0].start = 0
      chartOptions.dataZoom[0].end = 5 * step
    } else {
      chartOptions.dataZoom[0].start += step
      chartOptions.dataZoom[0].end += step
    }

    if (chartOptions.dataZoom[0].end >= 100) {
      chartOptions.dataZoom[0].end = 100
    }

    chartInstance.setOption(chartOptions)

    autoScroll()
  }, 5000)
}

defineExpose({
  setData
})
</script>
