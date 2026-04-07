<template>
  <FrameBox>
    <template #title>
      <FrameTitle
        v-model:checked="peroidVal"
        :options="peroidFilterOptions"
        @on-select="initElectric"
      >
        用电趋势
      </FrameTitle>
    </template>
    <ChartComponent ref="electricChartRef" />
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
const electricChartRef = ref()
const electricChartOptions = getCommomLineChartOptions()
const initElectric = useAutoRequestHooks({
  chartLoading: electricChartRef,
  api: (q) =>
    request({
      url: `https://fdl.scsgjc.com:11443/webroot/service/publish/f2022f71-7161-4ba9-b0b7-c5d203cefd14/nhfb/mryd`,
      method: "get",
      params: formatPeroidDate(q),
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      }
    }),
  query: peroidVal,
  setData: (res) => {
    electricChartOptions.yAxis.name = "单位：kWh"
    electricChartOptions.xAxis.data = res.data?.map((i) => {
      return dayjs(i.time).format("MM-DD")
    })

    electricChartOptions.series[0].data = res.data?.map((i) => i.num)
    electricChartOptions.series[0].label.show = true
    electricChartRef.value.setOption(electricChartOptions)
  }
})
</script>

<style></style>
