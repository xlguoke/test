<template>
  <div>
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/qushiIcon.png"
          alt=""
        />
      </template>
      温湿度趋势图
    </CommonTitle>
    <Container>
      <div class="chart">
        <div ref="chartRef" style="width: 100%; height: 100%"></div>
      </div>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from "vue"
import * as echarts from "echarts"
import { onMounted } from "vue"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import Container from "@/views/functionRoom2/components/Container.vue"

const chartRef = ref()

const chartInstance = ref()

const xData = [
  "08-01",
  "08-02",
  "08-03",
  "08-04",
  "08-05",
  "08-06",
  "08-07",
  "08-08",
  "08-09",
  "08-10",
  "08-11",
  "08-12"
]

const tData = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130]

const rhData = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 20, 30]

const chartOption = computed(() => {
  return {
    lenged: {},
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
      top: 30,
      right: 30,
      bottom: 20,
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
          color: "#224059"
        }
      },
      axisLabel: {
        color: "#224059"
      }
    },
    yAxis: [
      {
        type: "value",
        name: "单位：℃/%rh",
        nameTextStyle: {
          color: "#224059"
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
          color: "#224059"
        }
      },
      {
        type: "value",
        nameTextStyle: {
          color: "#224059"
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
          color: "#224059"
        }
      }
    ],
    series: [
      {
        data: tData,
        name: "温度",
        yAxisIndex: 0,
        type: "line",
        smooth: true,
        color: "#58F0B9",
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
                color: "rgba(243, 188, 82, 0)"
              },
              {
                offset: 1,
                color: "rgba(243, 188, 82, 0.3)"
              }
            ]
          }
        }
      },
      {
        data: rhData,
        name: "湿度",
        yAxisIndex: 1,
        type: "line",
        smooth: true,
        color: "#539EFF",
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
})

watchEffect(() => {
  nextTick(() => {
    chartInstance.value.setOption(chartOption.value)
  })
})

onMounted(() => {
  chartInstance.value = echarts.init(chartRef.value)
})
</script>
<style lang="less" scoped>
.chart {
  width: 100%;
  height: 4.8rem;
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
