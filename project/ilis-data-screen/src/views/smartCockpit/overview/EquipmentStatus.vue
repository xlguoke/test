<template>
  <FrameBox :loading="pieLoading">
    <template #title>
      <FrameTitle>设备状态</FrameTitle>
    </template>
    <PieChart3D
      v-if="pieData"
      :pie-data="pieData"
      :title="pieTitle"
      :internal-diameter-ratio="0.7"
    />
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import PieChart3D from "@/components/PieChart3D.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"

const pieData = ref()
const pieLoading = ref(false)
const pieTitle = ref({
  name: "设备总数",
  value: 0
})
useAutoRequestHooks({
  loading: pieLoading,
  api: () =>
    request({
      url: "/api/eq/dashboard/status",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      const keys = Object.keys(data)
      pieData.value = keys?.map((i: any) => ({
        name: i,
        value: data?.[i]
      }))
      pieTitle.value.value = pieData.value.reduce((acc: number, curr: any) => acc + curr.value, 0)
    }
  }
})
</script>

<style></style>
