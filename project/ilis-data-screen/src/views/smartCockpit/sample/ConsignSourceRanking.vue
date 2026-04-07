<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle v-model:checked="query.type" :options="filterOptions" @on-select="init">
        收样增长比TOP5
      </FrameTitle>
    </template>
    <TopRanking :header="rankingHead" :datas="rankingDatas" :loading="loading">
      <template #numMain="{ item }">
        <span :style="`color:${item.color}`">{{ item.numMain }}</span>
      </template>
    </TopRanking>
  </FrameBox>
</template>
<script setup lang="ts">
import { computed, ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import TopRanking, { TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
const filterOptions = [
  { label: "同比", value: "YOY" },
  { label: "环比", value: "MOM" }
]

const query = ref({
  type: "YOY"
})

// 设备使用次数TOP5
const loading = ref(false)
const rankingHead = computed<TopRankingHead[]>(() => [
  { title: "样品类型", key: "name" },
  {
    title: `${query.value.type === "YOY" ? "同比" : "环比"}增长`,
    key: "numMain",
    isValue: true
  }
])
const rankingDatas = ref<any[]>([])

const init = useAutoRequestHooks({
  loading,
  api: (q) =>
    request({
      url: `api/dashboard/sgjc/sample-acceptance/sample/growth/ratio`,
      method: "get",
      params: q
    }),
  query,
  setData: (res) => {
    res.data.forEach((d: any) => {
      const num = (Math.abs(d.numMain) * 100).toFixed(2)
      if (!d.numMain) {
        d.color = "#fff"
        d.numMain = "--"
      } else if (d.numMain > 0) {
        d.color = "#FF7575"
        d.numMain = `↑ ${num}%`
      } else {
        d.color = "#28BC59"
        d.numMain = `↓ ${num}%`
      }
    })
    rankingDatas.value = res.data
  }
})
</script>
