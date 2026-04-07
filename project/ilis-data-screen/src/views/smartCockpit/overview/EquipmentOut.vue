<template>
  <FrameBox :loading="pieLoading">
    <template #title>
      <FrameTitle>设备外出</FrameTitle>
    </template>
    <PieChart3D
      v-if="pieData"
      :pie-data="pieData"
      :internal-diameter-ratio="0.7"
      :title="pieTitle"
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
const pieTitle = ref({
  name: "外出总数",
  value: 0
})
const pieLoading = ref(false)

useAutoRequestHooks({
  loading: pieLoading,
  api: () =>
    request({
      url: "/api/eq/dashboard/egress",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      pieData.value = data.map((i: any) => ({
        name: i.type,
        value: i.countNum
      }))
      pieTitle.value.value = pieData.value.reduce((acc: number, curr: any) => acc + curr.value, 0)
    }
  }
})
</script>

<style></style>
