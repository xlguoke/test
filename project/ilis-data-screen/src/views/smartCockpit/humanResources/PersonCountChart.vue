<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>生产中心人员数量</FrameTitle>
    </template>
    <ChartComponent ref="chartRef" :enable-play="true" />
  </FrameBox>
</template>
<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getCommomBarChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"

const loading = ref(false)
const chartRef = ref()
// 人员职称
const options = getCommomBarChartOptions()

useAutoRequestHooks({
  chartLoading: chartRef,
  api: () =>
    request({
      url: "/api/dashboard/sgjc/hr/department",
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const data = res.data
    options.yAxis.name = "单位（人）"
    options.xAxis.data = data.map((i: any) => i.name)
    options.series[0].data = data.map((i: any) => i.numMain)
    chartRef.value.setOption(options)
  }
})
</script>
