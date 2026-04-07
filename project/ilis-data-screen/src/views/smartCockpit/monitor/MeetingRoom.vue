<template>
  <FrameBox>
    <template #title>
      <FrameTitle>会议室管理</FrameTitle>
    </template>
    <div class="h-full flex gap-30">
      <div class="flex-1">
        <ChartComponent ref="roomCountChartRef" />
      </div>
      <div class="flex-1 text-nowrap">
        <DataTable :loading="loading" :columns="meetingRoom" :datas="meetingDatas">
          <template #meetingDate="{ item }">
            <div class="text-[0.12rem]">
              <div>{{ item.meetingDate }}</div>
              <div>{{ item.timeInterval }}</div>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import DataTable, { type DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import { ref } from "vue"
import { getMinRingChartOptions, getRingChartLegend } from "../utils/defaultChartOptions"
import { clacChartPx } from "@/utils/utils"

const roomCountChartRef = ref()
const roomCountChartOptions = getMinRingChartOptions("总会议室")
const baseApi =
  "https://fdl.scsgjc.com:11443/webroot/service/publish/13b1777b-7c8d-4cd3-8f31-ad7f769ffdfe"

useAutoRequestHooks({
  chartLoading: roomCountChartRef,
  api: () =>
    request({
      url: `${baseApi}/meeting`,
      method: "post",
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      },
      data: {
        params: []
      }
    }),
  setData: (res) => {
    if (!res.data) return
    const obj = res.data[0] || {}
    const data = [
      { name: "空闲", value: obj.noUse || 0 },
      { name: "使用", value: obj.use || 0 }
    ]

    roomCountChartOptions.series[0].radius = ["45%", "55%"]
    roomCountChartOptions.series[0].bottom = clacChartPx(60)
    roomCountChartOptions.series[0].data = data
    roomCountChartOptions.graphic.elements[0].style.text = obj.total || 0
    roomCountChartOptions.legend.formatter = getRingChartLegend(data)
    roomCountChartRef.value.setOption(roomCountChartOptions)
    roomCountChartRef.value.hideLoading()
  }
})

const loading = ref(false)
const meetingRoom = ref<DataTableHead[]>([
  { title: "会议室", key: "meetingTitle" },
  { title: "预约人", key: "meetingPerson" },
  { title: "预约时间", key: "meetingDate", width: "35%" }
])
const meetingDatas = ref<any>([])
useAutoRequestHooks({
  chartLoading: roomCountChartRef,
  api: () =>
    request({
      url: `${baseApi}/meeting/res`,
      method: "post",
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      },
      data: {
        params: []
      }
    }),
  setData: (res) => {
    if (!res.data) return
    const list = JSON.parse(res.data[0]?.dataValue || "[]")
    meetingDatas.value = list
  }
})
</script>

<style></style>
