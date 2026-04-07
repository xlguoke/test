<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle
        v-model:checked="filterConsignSourceVal"
        :options="filterDateOptions"
        @on-select="init"
      >
        设备使用次数TOP5
      </FrameTitle>
    </template>
    <TopRanking v-if="!loading" :loading="loading" :header="header" :datas="data" />
  </FrameBox>
</template>

<script setup lang="ts">
import TopRanking, { TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
const filterDateOptions = [
  { label: "月", value: "MONTH" },
  { label: "年", value: "YEAR" },
  { label: "累计", value: "ALL" }
]

const loading = ref(false)
const filterConsignSourceVal = ref("MONTH")
const header: TopRankingHead[] = [
  { title: "设备名称（编号）", key: "unitName" },
  { title: "使用次数", key: "consignCount", isValue: true }
]
const data = ref<any[]>([])
const init = useAutoRequestHooks({
  loading: loading,
  api: (q) =>
    request({
      url: `/api/eq/dashboard/use/${q}`,
      method: "get"
    }),
  query: filterConsignSourceVal,
  setData: (res) => {
    data.value = res.data?.map((i: any) => ({
      unitName: i.eqSn ? `${i.equipmentName}（${i.eqSn}）` : i.equipmentName,
      consignCount: i.countNum
    }))
  }
})
</script>
