<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>学历构成</FrameTitle>
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
      url: "/api/dashboard/sgjc/hr/degree",
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    data.value = datasource.map((i: any) => ({
      name: i.name,
      value: i.numMain
    }))
    // data.value = [
    //   {
    //     name: "博士研究生",
    //     value: 1
    //   },
    //   {
    //     name: "高中",
    //     value: 4
    //   },
    //   {
    //     name: "初中",
    //     value: 5
    //   },
    //   {
    //     name: "大专",
    //     value: 14
    //   },
    //   {
    //     name: "硕士研究生",
    //     value: 35
    //   },
    //   {
    //     name: "本科",
    //     value: 154
    //   }
    // ]
  }
})
</script>
