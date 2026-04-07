<template>
  <ComCard title="试验检测数据统计" is-long>
    <div class="test-detection-chart-wrap">
      <div class="controller">
        <span class="item" :class="{ active: !isFullYear }" @click="isFullYear = false">
          近一月
        </span>
        <span class="item" :class="{ active: isFullYear }" @click="isFullYear = true">近一年</span>
      </div>
      <div ref="chartRef" style="width: 100%; height: 100%"></div>
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import ComCard from "@/components/ComCard.vue"
import { onMounted, ref, watchEffect } from "vue"
import * as echarts from "echarts"
import { approvedReportStat, ApprovedReportStatTimeType } from "@/api/dataScreen.api"

const chartRef = ref()

const isFullYear = ref(false)

function computedPosition(length, xArraylength) {
  if (isFullYear.value) {
    return 100
  }
  if (xArraylength >= 10) {
    if (length <= 10) {
      return 35
    } else {
      return 100 - Math.floor((35 / length) * 100)
    }
  } else {
    return 100 //小于十条数据显示全部
  }
}

const getData = async () => {
  const type = isFullYear.value
    ? ApprovedReportStatTimeType.LAST_12_MONTHS
    : ApprovedReportStatTimeType.LAST_30_DAYS
  const { data, code } = await approvedReportStat(type)
  if (code !== 20000) return
  const xData =
    data?.map((d) => {
      if (isFullYear.value) {
        return d.chartDataKey
      } else {
        return d.chartDataKey?.slice(5, 10)
      }
    }) || []
  const yData = data?.map((d) => d.chartDataValue) || []
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      className: "custom-tooltip-box",
      extraCssText: "background: transparent",
      formatter: function (data) {
        let str = `<div class="echart-tooltip">${data[0].name}`
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          str += `<p>${d.seriesName}：${d.value}</p>`
        }
        return str + "</div>"
      }
    },
    grid: {
      top: 40,
      right: 30,
      bottom: 30,
      left: 40
    },
    xAxis: {
      type: "category",
      data: xData,
      boundaryGap: false,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: "#3F4F5E"
        }
      },
      axisLabel: {
        color: "#fff"
      }
    },
    yAxis: {
      type: "value",
      name: "单位：个",
      nameTextStyle: {
        color: "#fff"
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: "rgba(155,208,255,0.1)",
          type: "dashed"
        }
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: "#fff"
      }
    },
    dataZoom: [
      {
        type: "inside",
        show: true,
        handleSize: 2,
        start: 0,
        end: computedPosition(1, xData.length)
      }
    ],

    series: [
      {
        data: yData,
        name: "批准通过报告数量",
        type: "line",
        smooth: true,
        color: "#1890FF",
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "rgba(24, 144, 255, 0)"
              },
              {
                offset: 1,
                color: "rgba(24, 144, 255, 0.3)"
              }
            ]
          }
        }
      }
    ]
  }
  initChart(option)
}
function initChart(option: echarts.EChartsOption) {
  echarts.init(chartRef.value).setOption(option)
}

onMounted(() => {
  getData()
})

watchEffect(() => {
  getData()
})

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.test-detection-chart-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  .controller {
    position: absolute;
    z-index: 999;
    font-size: 0.14rem;
    right: 0;
    top: 0;
    .item {
      cursor: pointer;
      margin-right: 0.32rem;
      color: #b4c0cc;
      &.active {
        color: #fff;
        font-weight: bold;
      }
    }
  }
}
:deep(.custom-tooltip-box) {
  padding: 0 !important;
  border: none !important;

  .echart-tooltip {
    padding: 10px 15px;
    background-color: rgba(14, 159, 255, 0.2);
    border: 1px solid #1890ff;
    border-radius: 4px;
    color: #fff;
  }
}
</style>
