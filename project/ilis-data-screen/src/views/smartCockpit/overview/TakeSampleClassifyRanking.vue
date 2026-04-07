<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle
        v-model:checked="filterVal"
        :options="filterDateOptions"
        @on-select="initRankingData"
      >
        收样分类统计TOP5
      </FrameTitle>
    </template>
    <TopRanking :header="rankingHead" :datas="rankingDatas" />
  </FrameBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import TopRanking, { type TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"

const filterDateOptions = [
  { label: "日", value: "0" },
  { label: "周", value: "1" },
  { label: "月", value: "2" },
  { label: "年", value: "3" }
]

const loading = ref(false)
const filterVal = ref("0")
const rankingHead: TopRankingHead[] = [
  { title: "样品类型", key: "unitName" },
  { title: "收样数量", key: "consignCount", isValue: true }
]
const rankingDatas = ref<any[]>([])
function initRankingData() {
  loading.value = true
  setTimeout(() => {
    rankingDatas.value = [
      { unitName: "委托单位1号", consignCount: 500 },
      { unitName: "委托单位2号", consignCount: 400 },
      { unitName: "委托单位3号", consignCount: 300 },
      { unitName: "委托单位4号", consignCount: 200 },
      { unitName: "委托单位5号", consignCount: 100 }
    ]
    loading.value = false
  }, 1500)
}
onMounted(() => {
  initRankingData()
})
</script>

<style></style>
