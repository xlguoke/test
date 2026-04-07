<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>培训考核</FrameTitle>
    </template>
    <div class="absolute top-32 right-0 z-10">
      <a-date-picker v-model:value="date" picker="month" />
    </div>
    <ChartComponent ref="chartRef" />
  </FrameBox>
</template>
<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getBarWithLineChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"

const loading = ref(false)
const chartRef = ref()
const options = getBarWithLineChartOptions()
const date = ref()
useAutoRequestHooks({
  chartLoading: chartRef,
  api: () =>
    request({
      url: "/api/dashboard/sgjc/hr/training-assessment",
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const data = res.data
    options.yAxis.name = "培训次数（次）"
    options.xAxis.data = data.map((i: any) => i.name)
    options.series[0].data = data.map((i: any) => i.numMain)
    chartRef.value.setOption(options)
  }
})
</script>
