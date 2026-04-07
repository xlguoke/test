<template>
  <FrameBox class="flex-1">
    <template #title>
      <FrameTitle>样品排队周期</FrameTitle>
    </template>

    <ChartComponent ref="sampleRankChartRef" :enable-play="true" />
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getYellowBarChartOptions } from "../utils/defaultChartOptions"
import { getSampleQueue } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

// 样品排队周期
const sampleRankChartRef = ref()
const sampleRankChartOptions = getYellowBarChartOptions()

useAutoRequestHooks({
  chartLoading: sampleRankChartRef,
  api: getSampleQueue,
  setData: (res) => {
    const { name, value } = res.data
    sampleRankChartOptions.yAxis.name = "周期（天）"
    sampleRankChartOptions.xAxis.data = name
    sampleRankChartOptions.series[0].data = value
    sampleRankChartOptions.series[0].name = "周期"
    sampleRankChartRef.value.setOption(sampleRankChartOptions)
    sampleRankChartRef.value.hideLoading()
  }
})
</script>

<style lang="less" scoped></style>
