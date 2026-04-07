<template>
  <FrameBox>
    <template #title>
      <FrameTitle>设备统计</FrameTitle>
    </template>

    <div class="flex h-full gap-60">
      <div class="flex-1 flex flex-col">
        <SubTitle>
          <template #icon>
            <img class="w-60" src="../../../assets/images/smartCockpit/icon-sbfl.svg" />
          </template>
          设备分类
        </SubTitle>
        <ChartComponent ref="eqTypeChartRef">
          <template #legend>
            <RingLegend :data="eqTypeChartLegend" />
          </template>
        </ChartComponent>
      </div>
      <div class="flex-1 flex flex-col">
        <SubTitle>
          <template #icon>
            <img class="w-60" src="../../../assets/images/smartCockpit/icon-sbzt.svg" />
          </template>
          设备状态
        </SubTitle>
        <ChartComponent ref="eqStatusChartRef">
          <template #legend>
            <RingLegend :data="eqStatusChartLegend" />
          </template>
        </ChartComponent>
      </div>
      <div class="flex-1 flex flex-col">
        <SubTitle>
          <template #icon>
            <img class="w-60" src="../../../assets/images/smartCockpit/icon-sbwc.svg" />
          </template>
          设备外出
        </SubTitle>
        <ChartComponent ref="eqEgressChartRef">
          <template #legend>
            <RingLegend :data="eqEgressChartLegend" />
          </template>
        </ChartComponent>
      </div>
      <div class="flex-1 flex flex-col">
        <SubTitle>
          <template #icon>
            <img class="w-60" src="../../../assets/images/smartCockpit/icon-sbdb.svg" />
          </template>
          调拨设备
        </SubTitle>
        <ChartComponent ref="eqAllocateChartRef">
          <template #legend>
            <RingLegend :data="eqAllocateChartLegend" />
          </template>
        </ChartComponent>
      </div>
    </div>
  </FrameBox>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { getRingChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import RingLegend from "./RingLegend.vue"

// 设备分类
const eqTypeChartRef = ref()
const eqTypeChartLegend = ref([])
const eqTypeChartOptions = getRingChartOptions("设备总数")
useAutoRequestHooks({
  chartLoading: eqTypeChartRef,
  api: () =>
    request({
      url: "/api/eq/dashboard/type",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      const transferData = data.map((i: any) => ({
        name: i.type,
        value: i.countNum
      }))
      eqTypeChartLegend.value = transferData
      eqTypeChartOptions.series[0].data = transferData
      const total = transferData.reduce((acc: number, curr: any) => acc + curr.value, 0)
      eqTypeChartOptions.graphic.elements[0].style.text = total
      eqTypeChartOptions.legend.show = false
      eqTypeChartOptions.graphic.elements[0].style.text = transferData.reduce(
        (acc: number, curr: any) => acc + curr.value,
        0
      )
      eqTypeChartRef.value.setOption(eqTypeChartOptions)
    }
  }
})

// 设备状态
const eqStatusChartRef = ref()
const eqStatusChartLegend = ref<any[]>([])
const eqStatusChartOptions = getRingChartOptions("设备总数")

useAutoRequestHooks({
  chartLoading: eqStatusChartRef,
  api: () =>
    request({
      url: "/api/eq/dashboard/status",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      const keys = Object.keys(data)
      const transferData = keys?.map((i: any) => ({
        name: i,
        value: data?.[i]
      }))
      eqStatusChartLegend.value = transferData
      eqStatusChartOptions.series[0].data = transferData
      eqStatusChartOptions.graphic.elements[0].style.text = transferData.reduce(
        (acc: number, curr: any) => acc + curr.value,
        0
      )
      eqStatusChartOptions.legend.show = false
      eqStatusChartRef.value.setOption(eqStatusChartOptions)
    }
  }
})

// 设备外出
const eqEgressChartRef = ref()
const eqEgressChartLegend = ref([])
const eqEgreeChartOptions = getRingChartOptions("外出总数")

useAutoRequestHooks({
  chartLoading: eqEgressChartRef,
  api: () =>
    request({
      url: "/api/eq/dashboard/egress",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      const transferData = data.map((i: any) => ({
        name: i.type,
        value: i.countNum
      }))
      eqEgressChartLegend.value = transferData
      eqEgreeChartOptions.series[0].data = transferData
      eqEgreeChartOptions.graphic.elements[0].style.text = transferData.reduce(
        (acc: number, curr: any) => acc + curr.value,
        0
      )
      eqEgreeChartOptions.legend.show = false
      eqEgressChartRef.value.setOption(eqEgreeChartOptions)
    }
  }
})

// 设备调拨
const eqAllocateChartRef = ref()
const eqAllocateChartLegend = ref([])
const eqAllocateChartOptions = getRingChartOptions("设备总数")

useAutoRequestHooks({
  chartLoading: eqAllocateChartRef,
  api: () =>
    request({
      url: "/api/eq/dashboard/transfer",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      const transferData = data.map((i: any) => ({
        name: Object.keys(i)[0],
        value: Object.values(i)[0]
      }))
      eqAllocateChartLegend.value = transferData
      eqAllocateChartOptions.series[0].data = transferData
      eqAllocateChartOptions.graphic.elements[0].style.text = transferData.reduce(
        (acc: number, curr: any) => acc + curr.value,
        0
      )
      eqAllocateChartOptions.legend.show = false
      eqAllocateChartRef.value.setOption(eqAllocateChartOptions)
    }
  }
})
</script>
