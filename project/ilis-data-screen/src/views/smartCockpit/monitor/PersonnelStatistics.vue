<template>
  <FrameBox>
    <template #title>
      <FrameTitle>人员统计</FrameTitle>
    </template>
    <div class="px-110 h-full flex gap-50">
      <div class="flex-1 flex flex-col justify-around w-1/2">
        <div class="flex align-center gap-30">
          <FrameIcon icon="" class="!w-160 !h-160">
            <img src="@/assets/images/smartCockpit/icon-person-2.svg" class="size-80" />
          </FrameIcon>
          <div class="flex flex-col justify-center">
            <span>当前楼宇人数</span>
            <span class="mt-10 font-bold text-[0.58rem] text-white">
              {{ personStatistics.staff }}
            </span>
          </div>
        </div>
        <div class="flex align-center gap-30">
          <FrameIcon icon="" class="!w-160 !h-160">
            <img src="@/assets/images/smartCockpit/icon-person-3.svg" class="size-80" />
          </FrameIcon>
          <div class="flex flex-col justify-center">
            <span>员工人数</span>
            <span class="mt-10 font-bold text-[0.58rem] text-white">
              {{ personStatistics.all }}
            </span>
          </div>
        </div>
        <div class="flex align-center gap-30">
          <FrameIcon icon="" class="!w-160 !h-160">
            <img src="@/assets/images/smartCockpit/icon-person-1.svg" class="size-80" />
          </FrameIcon>
          <div class="flex flex-col justify-center">
            <span>访客人数</span>
            <span class="mt-10 font-bold text-[0.58rem] text-white">
              {{ personStatistics.visitor }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex-1">
        <ChartComponent ref="personCountChartRef" />
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import FrameIcon from "@/components/smartCockpit/FrameIcon.vue"
import { ref } from "vue"
import { getMinRingChartOptions } from "../utils/defaultChartOptions"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { clacChartPx } from "@/utils/utils"
import { getUserStatistics } from "@/api/smartCockpit.test.api"

// 人员统计
const personCountChartRef = ref()
const personCountChartOptions: any = getMinRingChartOptions("总人数")
// 人员统计
const personStatistics = ref({
  all: 0, //总人数
  staff: 0, //单位人数
  visitor: 0 //访客
})
useAutoRequestHooks({
  chartLoading: personCountChartRef,
  api: () => getUserStatistics(),
  setData: (res) => {
    const data = {
      staff: 0,
      visitor: 0,
      all: 0
    }

    res.data.forEach((item) => {
      if (item.type === "staff") {
        data.staff = item.num
      } else if (item.type === "visitor") {
        data.visitor = item.num
      } else if (item.type === "all") {
        data.all = item.num
      }
    })

    personStatistics.value = data
    personCountChartOptions.series[0].radius = ["56%", "66%"]
    personCountChartOptions.legend = { show: false }
    personCountChartOptions.series[0].bottom = clacChartPx(30)
    personCountChartOptions.series[0].data = [{ value: data.all, name: "总人数" }]
    personCountChartOptions.graphic.elements[0].style.text = data.all
    // personCountChartOptions.legend.formatter = getRingChartLegend(data)
    personCountChartRef.value.setOption(personCountChartOptions)
  }
})
</script>

<style></style>
