<template>
  <FrameBox class="flex-1">
    <template #title>
      <FrameTitle
        v-model:checked="filterCompleteCountVal"
        :options="filterDateOptions"
        @on-select="initUseCountChart"
      >
        各类材料完成数量统计TOP20
      </FrameTitle>
    </template>

    <ChartComponent ref="completeCountChartRef" :enable-play="true" />
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getYellowBarChartOptions } from "../utils/defaultChartOptions"
import { FilterDateType, getSampleStatistics } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const filterDateOptions = [
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 },
  { label: "累计", value: FilterDateType.所有 }
]

// 各类材料完成数量统计
const filterCompleteCountVal = ref(FilterDateType.年)
const completeCountChartRef = ref()
const completeCountChartOptions = getYellowBarChartOptions()

const initUseCountChart = useAutoRequestHooks({
  chartLoading: completeCountChartRef,
  api: getSampleStatistics,
  query: filterCompleteCountVal,
  setData: (res) => {
    const data = res.data.slice(0, 20)

    completeCountChartOptions.yAxis.name = "组数：组"
    completeCountChartOptions.xAxis.axisLabel.formatter = function (value) {
      if (value && value.length > 5) {
        return value.slice(0, 5) + "..."
      }
      return value
    }
    completeCountChartOptions.tooltip.formatter = function (data) {
      const seriesName = ""
      let str = `<div>${seriesName.includes("series") ? "" : seriesName}`
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        str += `<p>${d.name}：${d.value}组</p>`
      }
      return str + "</div>"
    }
    completeCountChartOptions.xAxis.axisLabel.rotate = 30
    completeCountChartOptions.xAxis.data = data.map((i: any) => i.sampleName)
    completeCountChartOptions.series[0].data = data.map((i: any) => i.count)
    completeCountChartOptions.series[0].name = "材料"
    completeCountChartRef.value.setOption(completeCountChartOptions)
  }
})
</script>

<style lang="less" scoped></style>
