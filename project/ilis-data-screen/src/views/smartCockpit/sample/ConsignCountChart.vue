<template>
  <FrameBox class="flex-1">
    <template #title>
      <FrameTitle v-model:checked="filterUseCountVal" :options="filterOptions" @on-select="init">
        委托数量走势
      </FrameTitle>
    </template>
    <div class="h-full flex flex-col">
      <div class="text-center pt-30 text-[0.36rem]">
        <span class="text[#E6FFFC]">本{{ period }}委托总数：</span>
        <span class="text-[#40E7D5]">{{ total }}</span>
      </div>
      <div class="flex-1 h-0">
        <ChartComponent ref="chartRef" />
      </div>
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { getCommomLineChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
const filterOptions = [
  { label: "周", value: "WEEK" },
  { label: "月", value: "MONTH" },
  { label: "年", value: "YEAR" }
]

const filterUseCountVal = ref("YEAR")
const total = ref(0)
const period = computed(() => {
  return filterOptions.find((d) => d.value === filterUseCountVal.value)?.label
})

// 设备使用次数TOP5
const chartRef = ref()
const options = getCommomLineChartOptions()

const init = useAutoRequestHooks({
  chartLoading: chartRef,
  api: (q) =>
    request({
      url: `api/dashboard/sgjc/sample-acceptance/consign/trend/filter?range=${q}`,
      method: "get"
    }),
  query: filterUseCountVal,
  setData: (res) => {
    const data = res.data
    const nums = data.map((i: any) => i.numMain)
    options.yAxis.name = "单位：（份）"
    options.xAxis.data = data.map((i: any) => i.name)
    options.series[0].label.show = true
    options.series[0].name = "委托数量"
    options.series[0].data = nums
    total.value = nums.reduce((a: number, b: number) => a + b, 0)
    chartRef.value.setOption(options)
  }
})
</script>
