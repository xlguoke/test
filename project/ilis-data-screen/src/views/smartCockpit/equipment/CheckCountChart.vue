<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>检校数量（近3月）</FrameTitle>
    </template>
    <PieChart3D v-if="!loading && data" :pie-data="data" :internal-diameter-ratio="0.7" />
  </FrameBox>
</template>
<script setup lang="ts">
import PieChart3D from "@/components/PieChart3D.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { DataPlatConfig } from "@/api/smartCockpit.test.api"

const data = ref()
const loading = ref(false)
useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/eq/three/check`,
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    data.value = datasource.map((i: any) => ({
      name: i.checkType,
      value: i.countNum
    }))
  }
})
</script>
