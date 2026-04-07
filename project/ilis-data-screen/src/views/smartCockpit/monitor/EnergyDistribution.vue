<template>
  <FrameBox :loading="energyLoading">
    <template #title>
      <FrameTitle
        v-model:checked="peroidVal"
        :options="peroidFilterOptions"
        @on-select="energyInit"
      >
        能耗分布
      </FrameTitle>
    </template>
    <div class="absolute top-30 right-10 z-9999 flex gap-10 cursor-pointer">
      <span
        :class="{
          'text-white': energyType === 'YS'
        }"
        @click="energyType = 'YS'"
      >
        用水
      </span>
      <span
        :class="{
          'text-white': energyType === 'DL'
        }"
        @click="energyType = 'DL'"
      >
        用电
      </span>
    </div>
    <PieChart3D columns-three :pie-data="energyConsumption" :internal-diameter-ratio="0.7" />
  </FrameBox>
</template>

<script setup lang="ts">
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref, watch } from "vue"
import request from "@/utils/request.js"
import PieChart3D from "@/components/PieChart3D.vue"
import { useMonitor } from "./modules/useMonitor"

const { peroidVal, peroidFilterOptions, formatPeroidDate } = useMonitor()

// 能耗分布
const energyConsumption = ref(
  new Array(12).fill(1).map((i, index) => {
    return {
      name: `${index + 1}楼`,
      value: Math.ceil(Math.random() * 100)
    }
  })
)
const energyType = ref("YS")
const energyLoading = ref(false)

watch(
  () => energyType.value,
  () => {
    energyInit()
  }
)

const energyInit = useAutoRequestHooks({
  loading: energyLoading,
  api: (q) => {
    const api =
      energyType.value === "YS"
        ? "https://fdl.scsgjc.com:11443/webroot/service/publish/f2022f71-7161-4ba9-b0b7-c5d203cefd14/nhfb/ys"
        : "https://fdl.scsgjc.com:11443/webroot/service/publish/f2022f71-7161-4ba9-b0b7-c5d203cefd14/nhfb/dl"

    const query = formatPeroidDate(q)
    return request({
      url: api,
      method: "get",
      params: query,
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      }
    })
  },
  query: peroidVal,
  setData: (res) => {
    energyConsumption.value = res.data?.map((i) => {
      return {
        name: i.louceng,
        value: i.num
      }
    })
  }
})
</script>

<style></style>
