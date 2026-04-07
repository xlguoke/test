<template>
  <FrameBox>
    <template #title>
      <FrameTitle v-model:checked="peroidVal" :options="peroidFilterOptions" @on-select="initWater">
        用水趋势
      </FrameTitle>
    </template>
    <ChartComponent ref="waterChartRef" />
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useMonitor } from "./modules/useMonitor"
import { getCommomLineChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import dayjs from "dayjs"
import request from "@/utils/request.js"

const { peroidVal, peroidFilterOptions, formatPeroidDate } = useMonitor()
const waterChartRef = ref()
const waterChartOptions = getCommomLineChartOptions()
const initWater = useAutoRequestHooks({
  chartLoading: waterChartRef,
  api: (q) =>
    request({
      url: `https://fdl.scsgjc.com:11443/webroot/service/publish/f2022f71-7161-4ba9-b0b7-c5d203cefd14/nhfb/mrys`,
      method: "get",
      params: formatPeroidDate(q),
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      }
    }),
  query: peroidVal,
  setData: (res) => {
    waterChartOptions.yAxis.name = "单位：m³"
    waterChartOptions.xAxis.data = res.data?.map((i) => {
      return dayjs(i.time).format("MM-DD")
    })
    waterChartOptions.series[0].data = res.data?.map((i) => i.num)
    waterChartOptions.series[0].label.show = true
    waterChartRef.value.setOption(waterChartOptions)
  }
})
</script>

<style></style>
