<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle
        v-model:checked="filterVal"
        :options="filterDateOptions"
        @on-select="initUseCountChart"
      >
        样品检测完成数量统计
      </FrameTitle>
    </template>
    <TopRanking :loading="loading" :header="rankingHead" :datas="rankingDatas">
      <template #consignCount="{ item }">{{ item.consignCount }} 组</template>
    </TopRanking>
  </FrameBox>
</template>

<script setup lang="ts">
import { ref } from "vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import TopRanking, { type TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
import { FilterDateType, getSampleStatistics } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const filterDateOptions = [
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
]
const loading = ref(false)
const filterVal = ref(FilterDateType.年)
const rankingHead: TopRankingHead[] = [
  { title: "样品类型", key: "unitName" },
  { title: "完成组数", key: "consignCount", isValue: true }
]
const rankingDatas = ref<any[]>([])
const initUseCountChart = useAutoRequestHooks({
  loading: loading,
  api: getSampleStatistics,
  query: filterVal,
  setData: (res) => {
    const data = res.data.slice(0, 5)
    rankingDatas.value = data.map((i: any) => {
      return {
        unitName: i.sampleName,
        consignCount: i.count
      }
    })
  }
})
</script>

<style></style>
