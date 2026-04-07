<template>
  <FrameBox class="flex-1" :loading="unqualifiedRankLoading">
    <template #title>
      <FrameTitle
        v-model:checked="filterUnQVal"
        :options="filterDateAllOptions"
        @on-select="initUnqualifiedRanking"
      >
        生产商不合格率排行
      </FrameTitle>
    </template>

    <TopRanking
      :loading="unqualifiedRankLoading"
      :header="unqualifiedRankingHead"
      :datas="unqualifiedRankingDatas"
    >
      <template #value="{ item }">{{ item.value * 100 }}%</template>
    </TopRanking>
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import TopRanking, { type TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
import { FilterDateType, getSupplierNonconformity } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

const filterDateAllOptions = [
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 },
  { label: "累计", value: FilterDateType.所有 }
]

// 生产商不合格率排行
const filterUnQVal = ref(FilterDateType.所有)
const unqualifiedRankLoading = ref(false)
const unqualifiedRankingHead: TopRankingHead[] = [
  { title: "生产商名称", key: "name" },
  { title: "不合格占比", key: "value", isValue: true }
]
const unqualifiedRankingDatas = ref<any[]>([])

const initUnqualifiedRanking = useAutoRequestHooks({
  loading: unqualifiedRankLoading,
  api: getSupplierNonconformity,
  query: filterUnQVal,
  setData: (res) => {
    const { name, value } = res.data

    unqualifiedRankingDatas.value = name.map((_name: string, index: number) => ({
      name: name[index],
      value: value[index],
      customShowPercent: value[index] * 100
    }))
  }
})
</script>

<style lang="less" scoped></style>
