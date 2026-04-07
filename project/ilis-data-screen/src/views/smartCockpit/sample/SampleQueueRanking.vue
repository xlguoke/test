<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle>样品排队</FrameTitle>
    </template>
    <TopRanking :header="rankingHead" :datas="rankingDatas" :loading="loading" />
  </FrameBox>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"

// 设备使用次数TOP5
const loading = ref(false)
const rankingHead: TopRankingHead[] = [
  { title: "样品类型", key: "name" },
  { title: "排队天数", key: "numMain", isValue: true }
]
const rankingDatas = ref<any[]>([])

useAutoRequestHooks({
  loading,
  api: () =>
    request({
      url: `api/dashboard/sgjc/sample-acceptance/sample/queue`,
      method: "get"
    }),
  setData: (res) => {
    res.data.forEach((d: any) => {
      if (d.numMain !== "--") {
        d.numMain = `${d.numMain}天`
      }
    })
    rankingDatas.value = res.data
  }
})
</script>
