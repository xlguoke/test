<template>
  <FrameBox>
    <template #title>
      <FrameTitle
        v-model:checked="carFilterOptionsVal"
        :options="carFilterOptions"
        @on-select="carInit"
      >
        车辆统计
      </FrameTitle>
    </template>
    <div class="flex flex-col h-full">
      <div class="flex w-full py-30">
        <div class="flex-1 flex flex-col items-center">
          <span class="mb-10 text-[0.58rem] font-bold text-white">{{ useNum }}</span>
          <span>实时车辆数量</span>
        </div>
        <div class="flex-1 flex flex-col items-center">
          <span class="mb-10 text-[0.58rem] font-bold text-white">{{ idle }}</span>
          <span>空闲车位数量</span>
        </div>
      </div>
      <div class="flex-1">
        <ChartComponent ref="carChartRef" />
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { getDoubleLineAreaChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { getCarRecord, getParkingLotStatistics } from "@/api/smartCockpit.test.api"

// 车辆统计
const carChartRef = ref()
const carChartOptions = getDoubleLineAreaChartOptions()
const carFilterOptionsVal = ref("WEEK")
const carFilterOptions = ref([
  {
    label: "近一周",
    value: "WEEK"
  },
  {
    label: "近一月",
    value: "MONTH"
  }
])
const useNum = ref(0) //使用车位数
const idle = ref(0) //空闲车位数

useAutoRequestHooks({
  api: () => getParkingLotStatistics(),
  setData: (res) => {
    const data = res.data || []
    const dataItem = data[0] || {}

    useNum.value = dataItem.leftPlace || 0
    idle.value = dataItem.rightPlace || 0
  }
})

const carInit = useAutoRequestHooks({
  chartLoading: carChartRef,
  api: (q) => getCarRecord(q === "MONTH" ? 30 : 6),
  query: carFilterOptionsVal,
  setData: (res) => {
    const data = res.data || []

    carChartOptions.yAxis.name = "单位：车次"
    carChartOptions.legend = {
      data: ["入场", "出场"],
      itemStyle: {
        color: "transparent"
      },
      textStyle: {
        color: "#fff"
      }
    }
    carChartOptions.tooltip.formatter = "{b0}<br />{a0}: {c0}<br />{a1}: {c1}"
    carChartOptions.xAxis.data = data?.map((i) => i.record_date)
    carChartOptions.series[0].data = data?.map((i) => i.inNum)
    carChartOptions.series[0].name = "入场"
    carChartOptions.series[0].label.show = true

    carChartOptions.series[1].data = data?.map((i) => i.outNum)
    carChartOptions.series[1].name = "出场"
    carChartOptions.series[1].label.show = true
    carChartRef.value.setOption(carChartOptions)
  }
})
</script>

<style></style>
