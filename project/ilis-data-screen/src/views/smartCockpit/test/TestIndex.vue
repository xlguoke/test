<template>
  <FrameBox :loading="optionsLoading">
    <template #title>
      <FrameTitle
        v-model:checked="filterTestIndexVal"
        :options="filterNowOptions"
        @on-select="initOptions"
      >
        <template #filter-after>
          <a-range-picker
            v-model:value="filterDateVal"
            value-format="YYYY-MM-DD"
            class="ml-[0.32rem]! h-66! customDateClass"
            popup-class-name="commonDatePopupClass"
            allow-clean
            @change="initOptions"
          />
        </template>
        检测指标散点图
      </FrameTitle>
    </template>

    <div class="h-full flex flex-col gap-28">
      <div class="flex mt-32 items-center">
        <div class="flex flex-1 justify-center items-center gap-16">
          <div class="w-28 h-28 rounded-full" style="background: #0bfeff"></div>
          合格
          <div class="w-28 h-28 rounded-full ml-80" style="background: #ffd15c"></div>
          不合格
        </div>
        <div class="flex gap-40">
          <div class="flex gap-8">
            <a-select
              v-model:value="filterBigCategoryVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterBigCategoryOptions"
              placeholder="检测大类"
              show-search
              :filter-option="filterOption"
              @change="
                () => {
                  loadIndicatorSampleOptions().then(() => {
                    initOptionsBySample()
                  })
                }
              "
            />
            <a-select
              v-model:value="filterSampleVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterSampleOptions"
              placeholder="样品类型"
              show-search
              :filter-option="filterOption"
              @change="initOptionsBySample"
            />
            <a-select
              v-model:value="filterIndicatorVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterIndicatorOptions"
              placeholder="指标"
              show-search
              :filter-option="filterOption"
              @change="initTestIndexChart"
            />
          </div>
          <div class="flex gap-8">
            <a-select
              v-model:value="filterTypeVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterTypeOptions"
              placeholder="工程项目"
              @change="
                () => {
                  initTestIndexChart()
                }
              "
            />
            <a-select
              v-if="filterTypeVal === '工程项目'"
              v-model:value="filterProjectVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterProjectOptions"
              placeholder="请选择"
              show-search
              :filter-option="filterOption"
              allow-clear
              @change="initTestIndexChart"
            />
            <a-select
              v-else
              v-model:value="filterSupplierVal"
              class="w-320 customSelectClass"
              popup-class-name="commonPopupClass"
              :options="filterSupplierOptions"
              show-search
              :filter-option="filterOption"
              placeholder="请选择"
              allow-clear
              @change="initTestIndexChart"
            />
          </div>
        </div>
      </div>

      <ChartComponent ref="testIndexChartRef" class="flex-1" :enable-play="false" />
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
import { getTestIndexChartOptions } from "./testIndexChartOptions"
import {
  FilterDateType,
  getIndicatorCategoryList,
  getIndicatorData,
  getIndicatorPoints,
  getIndicatorSampleList,
  getProjectList,
  getSupplierList
} from "@/api/smartCockpit.test.api"
import { message } from "ant-design-vue"
import { IOption } from "@/interface/IOption"

const filterNowOptions = [
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
]

const filterTestIndexVal = ref(FilterDateType.月)

const filterDateVal = ref([])

const filterBigCategoryVal = ref()
const filterSampleVal = ref()
const filterIndicatorVal = ref()
const filterTypeVal = ref("工程项目")
const filterProjectVal = ref()
const filterSupplierVal = ref()

const filterBigCategoryOptions = ref<IOption[]>([])
const filterSampleOptions = ref<IOption[]>([])
const filterIndicatorOptions = ref<IOption[]>([])
const filterTypeOptions = ref([
  { label: "工程项目", value: "工程项目" },
  { label: "生产厂商", value: "生产厂商" }
])
const filterProjectOptions = ref<IOption[]>([])
const filterSupplierOptions = ref<IOption[]>([])

const optionsLoading = ref(false)

const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const testIndexChartRef = ref()

const testIndexChartOptions = getTestIndexChartOptions()

async function initTestIndexChart() {
  const dateData = getDateStr()

  testIndexChartRef.value.showLoading()

  const res = await getIndicatorPoints({
    startDate: dateData.startDate,
    endDate: dateData.endDate,
    sampleName: filterSampleVal.value,
    indicator: filterIndicatorVal.value,
    projectName: filterTypeVal.value === "工程项目" ? filterProjectVal.value : undefined,
    factory: filterTypeVal.value === "生产厂商" ? filterSupplierVal.value : undefined
  }).finally(() => {
    testIndexChartRef.value.hideLoading()
  })

  if (res.code === 20010) {
    return
  }

  const data = res.data || []

  if (data.length > 0) {
    cacheQueryData()
  }

  const source: any = []

  if (filterTestIndexVal.value === FilterDateType.年) {
    testIndexChartOptions.xAxis.max = 12
    testIndexChartOptions.xAxis.splitNumber = 12
    testIndexChartOptions.xAxis.axisLabel.formatter = function (value: string) {
      const val = Number(value)
      if (val === 0) {
        return ""
      }
      return `${dayjs().get("year")}-${Number(value) < 10 ? "0" + value : value}`
    }
    testIndexChartOptions.tooltip.formatter = function (dataItem) {
      const date = dayjs()
      let str = `<div>${dataItem.seriesName}`
      str += `<p>${date.get("year")}-${zero(dataItem.data[0])}：${dataItem.data[1]}</p>`
      return str + "</div>"
    }

    data.forEach((d: any) => {
      source.push([
        new Date(d.create_date).getMonth() + 1,
        d.testValue,
        d.qualified ? "#0BFEFF" : "#FFD15C"
      ])
    })
  } else {
    testIndexChartOptions.xAxis.max = 31
    testIndexChartOptions.xAxis.splitNumber = 31
    testIndexChartOptions.xAxis.axisLabel.formatter = function (value: string) {
      const val = Number(value)
      const date = dayjs()
      if (val === 0) {
        return ""
      }
      return `${date.get("year")}-${zero(date.get("month") + 1)}-${
        Number(value) < 10 ? "0" + value : value
      }`
    }
    testIndexChartOptions.tooltip.formatter = function (dataItem) {
      const date = dayjs()
      let str = `<div>${dataItem.seriesName}`
      str += `<p>${date.get("year")}-${zero(date.get("month") + 1)}-${zero(dataItem.data[0])}：${
        dataItem.data[1]
      }</p>`
      return str + "</div>"
    }

    data.forEach((d: any) => {
      source.push([
        new Date(d.create_date).getDate(),
        d.testValue,
        d.qualified ? "#0BFEFF" : "#FFD15C"
      ])
    })
  }

  testIndexChartOptions.dataset[0].source = source.length ? source : [[0, 0]]
  testIndexChartRef.value.setOption(testIndexChartOptions)
}

// 加载样品类型下拉
async function loadBigCategoryOptions() {
  const dateData = getDateStr()

  const res = await getIndicatorCategoryList({
    startDate: dateData.startDate,
    endDate: dateData.endDate
  })

  if (res.errCode === 0) {
    filterBigCategoryOptions.value = res.data.map((i: any) => ({
      label: i.bigCategoryName,
      value: i.bigCategoryName
    }))
  } else {
    filterBigCategoryOptions.value = []
    console.error("加载样检测大类下拉失败：", res.message)
  }

  if (
    filterBigCategoryVal.value &&
    !filterBigCategoryOptions.value.some((i) => i.value === filterBigCategoryVal.value)
  ) {
    message.warning(`当前时间条件下，不存在检测大类【${filterBigCategoryVal.value}】！`)
    filterBigCategoryVal.value = undefined
  }

  if (!filterBigCategoryVal.value && filterBigCategoryOptions.value.length > 0) {
    filterBigCategoryVal.value = filterBigCategoryOptions.value[0].value
  }
}

// 加载样品类型下拉
async function loadIndicatorSampleOptions() {
  const dateData = getDateStr()

  const res = await getIndicatorSampleList({
    startDate: dateData.startDate,
    endDate: dateData.endDate,
    bigCategoryName: filterBigCategoryVal.value
  })

  if (res.errCode === 0) {
    filterSampleOptions.value = res.data.map((i: any) => ({
      label: i.sampleName,
      value: i.sampleName
    }))
  } else {
    filterSampleOptions.value = []
    console.error("加载样品类型下拉失败：", res.message)
  }

  if (
    filterSampleVal.value &&
    !filterSampleOptions.value.some((i) => i.value === filterSampleVal.value)
  ) {
    message.warning(`当前时间条件下，不存在样品类型【${filterSampleVal.value}】！`)
    filterSampleVal.value = undefined
  }

  if (!filterSampleVal.value && filterSampleOptions.value.length > 0) {
    filterSampleVal.value = filterSampleOptions.value[0].value
  }
}

// 加载指标下拉
async function loadIndicatorOptions() {
  const dateData = getDateStr()

  const res = await getIndicatorData({
    sampleName: filterSampleVal.value,
    startDate: dateData.startDate,
    endDate: dateData.endDate
  })

  if (res.errCode === 0) {
    filterIndicatorOptions.value = res.data.map((i: any) => ({
      label: i.indicator,
      value: i.indicator
    }))
  } else {
    filterIndicatorOptions.value = []
    console.error("加载指标下拉失败：", res.message)
  }

  if (
    filterIndicatorVal.value &&
    !filterIndicatorOptions.value.some((i) => i.value === filterIndicatorVal.value)
  ) {
    // message.warning(`当前时间条件下，不存在指标【${filterIndicatorVal.value}】！`)
    filterIndicatorVal.value = undefined
  }

  if (!filterIndicatorVal.value && filterIndicatorOptions.value.length > 0) {
    filterIndicatorVal.value = filterIndicatorOptions.value[0].value
  }
}

// 加载工程项目下拉
async function loadIndicatorProjectOptions(ignoreDefault?: boolean) {
  const dateData = getDateStr()

  const res = await getProjectList({
    startDate: dateData.startDate,
    endDate: dateData.endDate,
    sampleName: filterSampleVal.value
  })

  if (res.errCode === 0) {
    filterProjectOptions.value = res.data.map((i: any) => ({
      label: i.projectName,
      value: i.projectName
    }))
  } else {
    filterProjectOptions.value = []
    console.error("加载工程项目下拉失败：", res.message)
  }

  if (
    filterProjectVal.value &&
    !filterProjectOptions.value.some((i) => i.value === filterProjectVal.value)
  ) {
    // message.warning(`当前筛选条件下，不存在工程项目【${filterProjectVal.value}】！`)
    filterProjectVal.value = undefined
  }

  if (ignoreDefault === true) {
    return
  }

  if (!filterProjectVal.value && filterProjectOptions.value.length > 0) {
    filterProjectVal.value = filterProjectOptions.value[0].value
  }
}

// 加载供应商下拉
async function loadIndicatorSupplierOptions(ignoreDefault?: boolean) {
  const dateData = getDateStr()

  const res = await getSupplierList({
    startDate: dateData.startDate,
    endDate: dateData.endDate,
    sampleName: filterSampleVal.value
  })

  if (res.errCode === 0) {
    filterSupplierOptions.value = res.data.map((i: any) => ({
      label: i.factory,
      value: i.factory
    }))
  } else {
    filterSupplierOptions.value = []
    console.error("加载供应商下拉失败：", res.message)
  }

  if (
    filterSupplierVal.value &&
    !filterSupplierOptions.value.some((i) => i.value === filterSupplierVal.value)
  ) {
    // message.warning(`当前筛选条件下，不存在供应商【${filterSupplierVal.value}】！`)
    filterSupplierVal.value = undefined
  }

  if (ignoreDefault === true) {
    return
  }

  if (!filterSupplierVal.value && filterSupplierOptions.value.length > 0) {
    filterSupplierVal.value = filterSupplierOptions.value[0].value
  }
}

function cacheQueryData() {
  localStorage.setItem(
    "smartCockpitTestIndexQuery",
    JSON.stringify({
      filterTestIndexVal: filterTestIndexVal.value,
      filterSampleVal: filterSampleVal.value,
      filterIndicatorVal: filterIndicatorVal.value,
      filterTypeVal: filterTypeVal.value,
      filterProjectVal: filterProjectVal.value,
      filterSupplierVal: filterSupplierVal.value,
      filterDateVal: filterDateVal.value,
      filterBigCategoryVal: filterBigCategoryVal.value
    })
  )
}

function init() {
  const data = localStorage.getItem("smartCockpitTestIndexQuery")
  if (data) {
    const queryData = JSON.parse(data)
    filterTestIndexVal.value = queryData.filterTestIndexVal
    filterSampleVal.value = queryData.filterSampleVal
    filterIndicatorVal.value = queryData.filterIndicatorVal
    filterTypeVal.value = queryData.filterTypeVal
    filterProjectVal.value = queryData.filterProjectVal
    filterSupplierVal.value = queryData.filterSupplierVal
    filterDateVal.value = queryData.filterDateVal || []
    filterBigCategoryVal.value = queryData.filterBigCategoryVal
  }

  // 如果有缓存数据，则不加载默认值
  initOptions(!!data)
}

function getDateStr() {
  if (filterDateVal.value && filterDateVal.value.length > 0) {
    return {
      startDate: filterDateVal.value[0],
      endDate: filterDateVal.value[1]
    }
  }

  if (filterTestIndexVal.value === FilterDateType.年) {
    return {
      startDate: `${dayjs().get("year")}-01-01`,
      endDate: `${dayjs().get("year")}-12-31`
    }
  }

  return {
    startDate: `${dayjs().get("year")}-${zero(dayjs().get("month") + 1)}-01`,
    endDate: `${dayjs().get("year")}-${zero(dayjs().get("month") + 1)}-31`
  }
}

// 加载所有下拉项
async function initOptions(ignoreDefault?: boolean) {
  await loadBigCategoryOptions()
  await loadIndicatorSampleOptions()
  await initOptionsBySample(ignoreDefault)
}

// 根据样品类型加载其他下拉项
async function initOptionsBySample(ignoreDefault?: boolean) {
  optionsLoading.value = true
  await Promise.all([
    loadIndicatorOptions(),
    loadIndicatorProjectOptions(ignoreDefault),
    loadIndicatorSupplierOptions(ignoreDefault)
  ]).finally(() => {
    optionsLoading.value = false
  })

  initTestIndexChart()
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped></style>
