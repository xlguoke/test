<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle v-model:checked="filterUseCountVal" :options="filterOptions" @on-select="init">
        样品分类统计TOP5
      </FrameTitle>
    </template>
    <TopRanking :header="rankingHead" :datas="rankingDatas" :loading="loading">
      <template #numMain="{ item }">
        {{ item.numMain }} {{ item.numMain !== "--" ? "组" : "" }}
      </template>
    </TopRanking>
  </FrameBox>
</template>
<script setup lang="ts">
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
const filterOptions = [
  { label: "日", value: "DAY" },
  { label: "周", value: "WEEK" },
  { label: "月", value: "MONTH" },
  { label: "年", value: "YEAR" }
]

const filterUseCountVal = ref("YEAR")

// 设备使用次数TOP5
const loading = ref(false)
const rankingHead: TopRankingHead[] = [
  { title: "样品类型", key: "name" },
  { title: "收样组数", key: "numMain", isValue: true }
]
const rankingDatas = ref<any[]>([])

const init = useAutoRequestHooks({
  loading,
  api: (q) =>
    request({
      url: `api/dashboard/sgjc/sample-acceptance/sample/category/top5/filter`,
      method: "get",
      params: { range: q }
    }),
  query: filterUseCountVal,
  setData: (res) => {
    rankingDatas.value = res.data
  }
})
</script>
