<template>
  <FrameBox class="flex-1">
    <template #title>
      <FrameTitle
        v-model:checked="filterDateVal"
        :options="filterDateAllOptions"
        @on-select="
          () => {
            setDateStr()
            // initManufacturerFailure()
          }
        "
      >
        生产商-不合格率TOP10
      </FrameTitle>
    </template>

    <div class="h-full w-full flex flex-col">
      <div class="flex justify-end pt-24">
        <SampleParamSelector
          type="nonconformity"
          :query="selectorQuery"
          @on-select="onSelectParam"
        />
      </div>
      <ChartComponent ref="sampleRankChartRef" :enable-play="true" />
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import { zero } from "@/utils/utils"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { onMounted, ref } from "vue"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { getCommomBarChartOptions } from "../utils/defaultChartOptions"
import { FilterDateType, getSupplierNonconformity } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import SampleParamSelector from "@/components/smartCockpit/SampleParamSelector.vue"

const filterDateAllOptions = [
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 },
  { label: "累计", value: FilterDateType.所有 }
]

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

const sampleRankChartRef = ref()
const sampleRankChartOptions = getCommomBarChartOptions()

function onSelectParam(data: { paramName?: string; sampleName?: string }) {
  if (data) {
    query.value.sampleName = data.sampleName
    query.value.paramName = data.paramName
  } else {
    query.value.sampleName = undefined
    query.value.paramName = undefined
  }
  setDateStr()
  initManufacturerFailure()
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

const initManufacturerFailure = useAutoRequestHooks({
  chartLoading: sampleRankChartRef,
  api: getSupplierNonconformity,
  query: query,
  immediate: false,
  setData: (res) => {
    const data = res.data.splice(0, 10)

    if (data.length > 0) {
      cacheQueryData()
    }

    sampleRankChartOptions.tooltip.formatter = function (data) {
      const seriesName = ""
      let str = `<div>${seriesName.includes("series") ? "" : seriesName}`
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        str += `<p>${d.name}：${d.value * 100}%</p>`
      }
      return str + "</div>"
    }
    sampleRankChartOptions.yAxis.name = "不合格率（%）"
    sampleRankChartOptions.yAxis.axisLabel.formatter = function (name) {
      return name * 100
    }
    sampleRankChartOptions.xAxis.axisLabel.formatter = function (value) {
      if (value && value.length > 5) {
        return value.slice(0, 5) + "..."
      }
      return value
    }
    sampleRankChartOptions.xAxis.axisLabel.rotate = 30
    sampleRankChartOptions.xAxis.data = data.map((i) => i.factory)
    sampleRankChartOptions.series[0].data = data.map((i) => i.rate.toFixed(2))
    sampleRankChartOptions.series[0].name = "厂商"
    sampleRankChartRef.value.setOption(sampleRankChartOptions)
    sampleRankChartRef.value.hideLoading()
  }
})

function cacheQueryData() {
  localStorage.setItem(
    "smartCockpitTestNonconformityQuery",
    JSON.stringify({
      sampleName: query.value.sampleName,
      paramName: query.value.paramName,
      filterDateVal: filterDateVal.value
    })
  )
}

const data = localStorage.getItem("smartCockpitTestNonconformityQuery")

if (data) {
  const queryData = JSON.parse(data)
  query.value.sampleName = queryData.sampleName
  query.value.paramName = queryData.paramName
  filterDateVal.value = queryData.filterDateVal
}
setDateStr()

onMounted(() => {
  initManufacturerFailure()
})
</script>

<style lang="less" scoped></style>
