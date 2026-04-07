<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>试验检测工程师持证情况</FrameTitle>
    </template>
    <PieChart3D v-if="!loading && data" :pie-data="data" :internal-diameter-ratio="0.7" />
  </FrameBox>
</template>
<script setup lang="ts">
import PieChart3D from "@/components/PieChart3D.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import request from "@/utils/request.js"

const data = ref()
const loading = ref(false)
useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/dashboard/sgjc/hr/certificate",
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    data.value = datasource.map((i: any) => ({
      name: i.name,
      value: i.numMain
    }))
  }
})
</script>
