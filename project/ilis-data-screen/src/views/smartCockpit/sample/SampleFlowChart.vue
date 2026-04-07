<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle v-model:checked="query.range" :options="filterOptions" @on-select="init">
        样品流转
      </FrameTitle>
    </template>
    <div class="flex flex-col h-full">
      <div class="flex flex-1 h-0">
        <div class="flex-1">
          <ChartComponent ref="roomCount1Ref" />
        </div>
        <div class="flex-1">
          <ChartComponent ref="roomCount2Ref" />
        </div>
      </div>
      <div class="flex p-30 h-[100px] bg-[#40E7D5]/10">
        <SampleFlowChartCount class="flex-1" title="样品库存" :count="sampleCount" />
        <SampleFlowChartCount class="flex-1" title="留样数量" :count="reservedSampleCount" />
      </div>
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import request from "@/utils/request.js"
import { getMinRingChartOptions } from "../utils/defaultChartOptions"
import { clacChartPx } from "@/utils/utils"
import SampleFlowChartCount from "./SampleFlowChartCount.vue"

const filterOptions = [
  { label: "日", value: "day" },
  { label: "周", value: "week" },
  { label: "月", value: "month" }
]
const query = ref({
  range: "week"
})
const loading = ref(false)

const roomCount1Ref = ref()
const roomCount2Ref = ref()
const roomCount1Options = getMinRingChartOptions("入库数量")
const roomCount2Options = getMinRingChartOptions("出库数量")
const sampleCount = ref(0)
const reservedSampleCount = ref(0)
const baseApi =
  "https://fdl.scsgjc.com:11443/webroot/service/publish/13b1777b-7c8d-4cd3-8f31-ad7f769ffdfe"

const init = useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: `${baseApi}/sample-collect`,
      method: "get",
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      },
      data: {
        params: []
      }
    }),
  setData: (res) => {
    if (!res.data) return
    const datas = res.data.filter((d) => d.type === query.value.range)
    const joinInfo = datas.filter((d) => d.name.includes("入库"))
    const gooutInfo = datas.filter((d) => d.name.includes("出库") || d.name.includes("领用"))
    const joinTotal = joinInfo.reduce((acc, cur) => acc + (cur.count || 0), 0)
    const gooutTotal = gooutInfo.reduce((acc, cur) => acc + (cur.count || 0), 0)
    const data = [{ name: "入库", value: joinTotal || 0 }]
    const data2 = [{ name: "出库", value: gooutTotal || 0 }]

    const all = res.data.filter((d) => d.type === "all")
    sampleCount.value = all.find((d) => d.name === "样品")?.count || 0
    reservedSampleCount.value = all.find((d) => d.name === "留样")?.count || 0

    roomCount1Options.series[0].radius = ["60%", "70%"]
    roomCount1Options.series[0].data = data
    roomCount1Options.series[0].bottom = clacChartPx(40)
    roomCount1Options.graphic.elements[0].bottom = clacChartPx(260)
    roomCount1Options.graphic.elements[1].bottom = clacChartPx(200)
    roomCount1Options.graphic.elements[2].style.width = clacChartPx(340)
    roomCount1Options.graphic.elements[2].style.height = clacChartPx(340)
    roomCount1Options.graphic.elements[2].bottom = clacChartPx(110)
    roomCount1Options.graphic.elements[0].style.text = joinTotal || 0
    roomCount1Options.legend.show = false
    roomCount1Ref.value.setOption(roomCount1Options)

    roomCount2Options.series[0].radius = ["60%", "70%"]
    roomCount2Options.series[0].data = data2
    roomCount2Options.series[0].bottom = clacChartPx(40)
    roomCount2Options.graphic.elements[0].bottom = clacChartPx(260)
    roomCount2Options.graphic.elements[1].bottom = clacChartPx(200)
    roomCount2Options.graphic.elements[2].style.width = clacChartPx(340)
    roomCount2Options.graphic.elements[2].style.height = clacChartPx(340)
    roomCount2Options.graphic.elements[2].bottom = clacChartPx(110)
    roomCount2Options.graphic.elements[0].style.text = gooutTotal || 0
    roomCount2Options.legend.show = false
    roomCount2Options.color = ["#FFD15C"]
    roomCount2Ref.value.setOption(roomCount2Options)
  }
})
</script>
