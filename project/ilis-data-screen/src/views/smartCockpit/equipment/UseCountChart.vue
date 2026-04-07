<template>
  <FrameBox class="flex-1">
    <template #title>
      <FrameTitle v-model:checked="filterUseCountVal" :options="filterOptions" @on-select="init">
        设备维修频率比TOP5
      </FrameTitle>
    </template>

    <ChartComponent v-show="!isEmpty" ref="chartRef" :enable-play="true" />
    <div v-if="isEmpty" class="flex flex-col h-full items-center justify-center text-[#B4DBD6]">
      <img src="@/assets/images/smartCockpit/no-data.svg" class="w-280 h-280" />
      暂无数据
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { getCommomBarChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
const filterOptions = [
  { label: "周", value: "WEEK" },
  { label: "月", value: "MONTH" },
  { label: "年", value: "YEAR" },
  { label: "累计", value: "ALL" }
]

const filterUseCountVal = ref("MONTH")

const chartRef = ref()
const options = getCommomBarChartOptions()

const isEmpty = ref(false)

const init = useAutoRequestHooks({
  chartLoading: chartRef,
  api: (q) =>
    request({
      url: `/api/eq/dashboard/repair/${q}`,
      method: "get"
    }),
  query: filterUseCountVal,
  setData: (res) => {
    const data = res.data
    options.yAxis.name = "维修频率比（%）"
    options.xAxis.data = data.map((i: any) => i.equipmentName)
    options.xAxis.axisLabel.formatter = function (value) {
      if (value && value.length > 5) {
        return value.slice(0, 5) + "..."
      }
      return value
    }
    options.xAxis.axisLabel.rotate = 30
    options.series[0].data = data.map((i: any) => (i.repairRate * 100).toFixed(2))
    options.yAxis.max = options.series[0].data?.every((i) => i === "0.00") ? 100 : "dataMax"
    if (options.series[0].data?.every((i) => i === "0.00")) {
      isEmpty.value = true
    }
    chartRef.value.setOption(options)
  }
})
</script>
