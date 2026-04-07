<template>
  <FrameBox class="flex-1" :loading="unqualifiedRankLoading">
    <template #title>
      <FrameTitle
        v-model:checked="filterDateVal"
        :options="filterDateAllOptions"
        @on-select="
          () => {
            setDateStr()
            // initManufacturerStability()
          }
        "
      >
        生产商-稳定性排行TOP5
      </FrameTitle>
    </template>

    <div class="h-full w-full flex flex-col">
      <div class="flex justify-end pt-24">
        <SampleParamSelector
          type="stability"
          :placeholder="defaultText"
          :query="selectorQuery"
          @on-select="onSelectIndicator"
        />
      </div>
      <TopRanking
        sort="asc"
        :loading="unqualifiedRankLoading"
        :header="unqualifiedRankingHead"
        :datas="unqualifiedRankingDatas"
      >
        <template #value="{ item }">{{ item.value }}</template>
      </TopRanking>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { zero } from "@/utils/utils"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import TopRanking, { type TopRankingHead } from "@/components/smartCockpit/TopRanking.vue"
import { FilterDateType, getSupplierStability } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import SampleParamSelector from "@/components/smartCockpit/SampleParamSelector.vue"

const filterDateAllOptions = [
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 },
  { label: "累计", value: FilterDateType.所有 }
]

const unqualifiedRankLoading = ref(false)
const unqualifiedRankingHead: TopRankingHead[] = [
  { title: "厂商名称", key: "name" },
  { title: "标准差（值）", key: "value", isValue: true }
]
const unqualifiedRankingDatas = ref<any[]>([])

const defaultText = ref("请选择样品/指标")

const filterDateVal = ref(FilterDateType.年)

const query = ref<{
  start?: string
  end?: string
  sampleName?: string
  paramName?: string
}>({})

const selectorQuery = ref<{
  start?: string
  end?: string
}>({})

function onSelectIndicator(data: { paramName?: string; sampleName?: string }) {
  if (data) {
    defaultText.value = "请选择样品/指标"
    query.value.sampleName = data.sampleName
    query.value.paramName = data.paramName
    initManufacturerStability()
  } else {
    defaultText.value = "请选择样品/指标"
    query.value.sampleName = undefined
    query.value.paramName = undefined
    unqualifiedRankingDatas.value = []
  }
}

function setDateStr() {
  if (filterDateVal.value === FilterDateType.年) {
    query.value.start = `${dayjs().get("year")}-01-01`
    query.value.end = `${dayjs().get("year")}-12-31`
  } else if (filterDateVal.value === FilterDateType.月) {
    query.value.start = `${dayjs().get("year")}-${zero(dayjs().get("month") + 1)}-01`
    query.value.end = `${dayjs().get("year")}-${zero(dayjs().get("month") + 1)}-31`
  } else {
    query.value.start = undefined
    query.value.end = undefined
  }

  selectorQuery.value = {
    start: query.value.start,
    end: query.value.end
  }
}

const initManufacturerStability = useAutoRequestHooks({
  loading: unqualifiedRankLoading,
  api: getSupplierStability,
  query: query,
  immediate: false,
  setData: (res) => {
    const data = (res.data || []).splice(0, 5)

    if (data.length > 0) {
      cacheQueryData()
    }

    const total = data.reduce((acc: number, curr: any) => acc + parseFloat(curr.stddevSamp), 0)
    unqualifiedRankingDatas.value = data.map((item) => ({
      name: item.factory,
      value: item.stddevSamp,
      customShowPercent: (item.stddevSamp / total) * 100
    }))
  }
})

function cacheQueryData() {
  localStorage.setItem(
    "smartCockpitTestStabilityQuery",
    JSON.stringify({
      sampleName: query.value.sampleName,
      paramName: query.value.paramName,
      filterDateVal: filterDateVal.value
    })
  )
}

const data = localStorage.getItem("smartCockpitTestStabilityQuery")

if (data) {
  const queryData = JSON.parse(data)
  query.value.sampleName = queryData.sampleName
  query.value.paramName = queryData.paramName
  filterDateVal.value = queryData.filterDateVal
} else {
  query.value.sampleName = "钢筋焊接网"
  query.value.paramName = "断后伸长率A(%)"
}

setDateStr()

// onMounted(() => {
//   initManufacturerStability()
// })
</script>

<style lang="less" scoped></style>
