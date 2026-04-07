<template>
  <FrameBox>
    <template #title>
      <FrameTitle v-model:checked="filterRoomChangeVal" :options="filterHourOptions">
        养护室环境变化趋势
      </FrameTitle>
    </template>
    <div class="w-full h-full flex flex-col">
      <div class="flex items-center justify-end gap-14 mt-32">
        <!-- <a-select v-model:value="filterTypeVal" class="w-236" :options="filterTypeOptions" /> -->
        <a-select
          v-model:value="filterRoomVal"
          class="w-400 customSelectClass"
          popup-class-name="commonPopupClass"
          show-search
          :options="filterRoomOptions"
          :filter-option="filterOption"
        />
      </div>
      <div class="flex-1">
        <ChartComponent ref="roomChangeChartRef" :enable-play="true" />
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { onMounted, ref, watchEffect } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getDoubleLineAreaWithMarkChartOptions } from "../utils/defaultChartOptions"
import { deepCopy } from "@/utils/utils"
import request from "@/utils/request.js"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import * as echarts from "echarts"

const filterHourOptions = [
  { label: "12h", value: "12" },
  { label: "24h", value: "24" }
]

const filterRoomOptions = ref<any[]>([])

const AllRoom = ref<any[]>([])

async function getRoomRealTimeData() {
  const { data } = await request({
    url: "/api/humiture/dashbord/lab-list",
    method: "get",
    params: {
      page: 1,
      size: 1000,
      isIotLab: 1
    }
  })
  filterRoomOptions.value = data?.rows?.map((item) => ({
    label: item.name,
    value: item.id
  }))
  AllRoom.value = data?.rows || []
  filterRoomVal.value = filterRoomOptions.value?.[0]?.value
}

// 养护室环境变化趋势
const filterRoomChangeVal = ref("12")
const filterRoomVal = ref("")
const roomChangeChartRef = ref()
const roomChangeChartOptions = getDoubleLineAreaWithMarkChartOptions()

const url = `api/humiture/dashbord/env/change/${filterRoomVal.value}/${filterRoomChangeVal.value}`
const initRoomChangeChart = useAutoRequestHooks({
  immediate: false,
  chartLoading: roomChangeChartRef,
  api: () =>
    request({
      url: `/api/humiture/dashbord/env/change/${filterRoomVal.value}/${filterRoomChangeVal.value}`,
      method: "get"
    }),
  query: ref({}),
  setData: ({ data: res, code }) => {
    if (code === 20000) {
      roomChangeChartOptions.tooltip = {
        show: false
      }

      roomChangeChartOptions.yAxis = [
        deepCopy(roomChangeChartOptions.yAxis),
        deepCopy(roomChangeChartOptions.yAxis)
      ]
      roomChangeChartOptions.legend = {
        itemStyle: {
          color: "transparent"
        },
        textStyle: {
          color: "#fff"
        }
      }
      roomChangeChartOptions.yAxis[0].name = "单位：℃"
      roomChangeChartOptions.yAxis[1].name = "%RH"
      roomChangeChartOptions.xAxis = {
        type: "time",
        boundaryGap: false,
        splitNumber: 5,
        axisLabel: {
          color: "#E6FFFC",
          interval: 0,
          formatter: function (value) {
            return echarts.time.format(value, "{HH}:{mm}", false)
          }
        },
        axisLine: {
          lineStyle: {
            color: "#8EBFBA"
          }
        }
      }

      const data =
        res?.temperature?.map((i) => {
          return [i.ts, i.value]
        }) || []
      const data1 =
        res?.humidity?.map((i) => {
          return [i.ts, i.value]
        }) || []

      const currentRoom = AllRoom.value.find((i) => i.id === filterRoomVal.value)

      // 温度
      roomChangeChartOptions.series[0].data = data
      roomChangeChartOptions.series[0].name = "温度"
      roomChangeChartOptions.series[0].smooth = true
      roomChangeChartOptions.series[0].markLine.data[0].yAxis = currentRoom.minTemperature
      roomChangeChartOptions.series[0].markLine.data[1].yAxis = currentRoom.maxTemperature
      roomChangeChartOptions.yAxis[0].min = Math.min(
        ...data?.map(([_time, val]) => val),
        currentRoom.minTemperature
      )
      console.log(data)

      roomChangeChartOptions.yAxis[0].boundaryGap = false
      // 设置温度数据的y轴
      roomChangeChartOptions.series[0].yAxisIndex = 0

      // 湿度
      roomChangeChartOptions.series[1].data = data1
      roomChangeChartOptions.series[1].name = "湿度"
      roomChangeChartOptions.series[1].smooth = true
      roomChangeChartOptions.series[1].markLine.data[0].yAxis = currentRoom.minHumidity
      roomChangeChartOptions.series[1].markLine.data[1].yAxis = currentRoom.maxHumidity
      roomChangeChartOptions.yAxis[1].min = Math.min(
        ...data1?.map(([_time, val]) => val),
        currentRoom.minTemperature
      )
      roomChangeChartOptions.yAxis[0].boundaryGap = false

      // 设置湿度数据的y轴
      roomChangeChartOptions.series[1].yAxisIndex = 1

      roomChangeChartRef.value.setOption(roomChangeChartOptions)
      roomChangeChartRef.value.hideLoading()
    }
  }
})

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.trim().toLowerCase())
}

watchEffect(() => {
  if (filterRoomVal.value) {
    initRoomChangeChart()
  }
})

onMounted(async () => {
  await getRoomRealTimeData()
  initRoomChangeChart()
})
</script>
