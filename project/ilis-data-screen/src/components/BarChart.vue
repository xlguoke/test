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
    },
    backgroundColor: "rgba(0, 41, 96, 0.7)",
    borderColor: "rgba(0, 102, 236, 1)",
    borderRadius: 2,
    textStyle: {
      color: "#FFFFFF",
      fontSize: "0.12rem"
    },
    extraCssText: "width:1.26rem; height:0.84rem;",
    formatter: function (params: any) {
      let res = ""
      const titleStr = `<div>${params[0].axisValue}</div>`
      res += titleStr
      params.forEach((item: any) => {
        let color = ""
        if (item.seriesName === "检测数量") {
          color = "#1890FF"
        } else if (item.seriesName === "合格率") {
          color = "#F3BC52"
        }
        res += ` <div class="tip-item">
                  <span class="tip-color-marker" style="background-color:${color}"></span>
                  <span style="vertical-align: middle;">${item.seriesName}：${item.value}</span>
                </div>`
      })
      res = `<div class="tip-box">${res}</div>`
      return res
    }
  },
  grid: {
    top: 35,
    left: 35,
    right: 50,
    bottom: 20
  },
  // 添加图例配置
  legend: {
    show: true,
    data: ["检测数量", "合格率"],
    textStyle: {
      color: "#B4C0CC",
      fontSize: "0.14rem"
    },
    itemGap: 25,
    icon: "rect",
    itemHeight: 6,
    itemWidth: 12
  },
  xAxis: {
    type: "category",
    data: [],
    axisTick: {
      show: false
    },
    axisLabel: {
      color: "#B4C0CC",
      fontSize: "0.14rem"
    },
    axisLine: {
      lineStyle: {
        width: "0.02rem",
        color: "#3F4F5E"
      }
    }
  },
  yAxis: [
    {
      type: "value",
      name: "检测数量",
      position: "left",
      nameTextStyle: {
        color: "#B4C0CC",
        fontSize: "0.14rem"
      },
      axisLabel: {
        color: "#B4C0CC",
        fontSize: "0.12rem"
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#35414D"
        }
      }
    },
    // 右侧Y轴
    {
      type: "value",
      name: "合格率",
      nameTextStyle: {
        color: "#B4C0CC",
        fontSize: "0.14rem",
        padding: [0, 0, 0, 40]
      },
      nameLocation: "end",
      position: "right",
      axisLabel: {
        color: "#B4C0CC",
        fontSize: "0.12rem",
        formatter: "{value}%"
      },
      splitLine: {
        show: false // 不显示网格线，避免与左侧冲突
      },
      axisLine: {
        lineStyle: {
          width: 2,
          color: "#3F4F5E"
        }
      }
    }
  ],
  series: [
    {
      name: "检测数量",
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
    },
    // 折线图
    {
      name: "合格率",
      data: [],
      type: "line", // 折线图类型
      yAxisIndex: 1, // 关联右侧Y轴
      symbol: "circle", // 数据点样式
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: "#F3BC52" // 折线颜色
      },
      itemStyle: {
        color: "#F3BC52" // 数据点颜色
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

  // 初始化时强制设置尺寸为容器尺寸
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      chartInstance.resize({ width, height })
    }
  })

  resizeObserver.observe(wrap.value)

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

function setData(xData: string[], data: number[], lineData?: number[]) {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }

  chartOptions.xAxis.data = xData
  chartOptions.series[0].data = data
  if (lineData) {
    chartOptions.series[1].data = lineData
  }
  chartInstance.setOption(chartOptions)

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
<style lang="less">
.tip-box {
  font-size: 0.12rem;
  display: flex;
  flex-direction: column;
  gap: 0.04rem;
}

.tip-title {
  line-height: 0.2rem; /* 行高20px */
}

.tip-item {
  font-size: 0.12rem;
  line-height: 0.2rem; /* 行高20px */
}

.tip-color-marker {
  width: 0.04rem;
  height: 0.04rem;
  border-radius: 0.02rem;
  margin-right: 0.05rem;
  vertical-align: middle;
  display: inline-block;
}

.legend-item {
  font-size: 0.14rem;
}

.axis-label {
  font-size: 0.14rem;
}

.y-axis-name {
  font-size: 0.15rem;
}
</style>
