<template>
  <div class="data-center">
    <Niceframe class="h-[19%]" top-line>
      <div class="flex justify-around items-center w-full h-full">
        <TestCount
          title="检测任务总数"
          @click="goTestPage('ilis2/testTaskController.do?list&page=testingAll')"
        >
          <template #icon>
            <img class="w-[88px]" src="@/assets/images/commandCenterScreen/test-icon-1.svg" />
          </template>
          <NumberScroll :value="testDataStatistics.total" />
        </TestCount>
        <TestCount
          title="待检测任务数"
          @click="
            goTestPage('ilis2/unAssignedTaskController.do?goListUnAssignedPage&page=waitingApply')
          "
        >
          <template #icon>
            <img class="w-[88px]" src="@/assets/images/commandCenterScreen/test-icon-2.svg" />
          </template>
          <NumberScroll :value="testDataStatistics.wait" />
        </TestCount>
        <TestCount
          title="在检测任务数"
          @click="goTestPage('ilis2/testTaskController.do?list&page=testing')"
        >
          <template #icon>
            <img class="w-[88px]" src="@/assets/images/commandCenterScreen/test-icon-3.svg" />
          </template>
          <NumberScroll :value="testDataStatistics.testing" />
        </TestCount>
        <TestCount
          title="完成任务数"
          @click="goTestPage('ilis2/testTaskController.do?list&page=reportApproved')"
        >
          <template #icon>
            <img class="w-[88px]" src="@/assets/images/commandCenterScreen/test-icon-4.svg" />
          </template>
          <NumberScroll :value="testDataStatistics.complete" />
        </TestCount>
      </div>
    </Niceframe>

    <div class="data-center-center h-[37%]">
      <Niceframe class="w-[480px] h-full" title="样品数量统计">
        <div class="flex relative flex-wrap px-4 pt-4 w-full h-full">
          <LoadingMask v-model:visible="sampleProcessLoading" />
          <DateFilter v-model:value="sampleProcessSection" @on-select="initSampleProcess" />
          <SampleCount title="全部样品">
            <template #icon>
              <img class="w-[80px]" src="@/assets/images/commandCenterScreen/sample-icon-1.svg" />
            </template>
            <NumberScroll :value="sampleProcessStatistics.total" />
          </SampleCount>
          <SampleCount title="在检样品" class="justify-end">
            <template #icon>
              <img class="w-[80px]" src="@/assets/images/commandCenterScreen/sample-icon-2.svg" />
            </template>
            <NumberScroll :value="sampleProcessStatistics.testing" />
          </SampleCount>
          <SampleCount title="留样样品">
            <template #icon>
              <img class="w-[80px]" src="@/assets/images/commandCenterScreen/sample-icon-3.svg" />
            </template>
            <NumberScroll :value="sampleProcessStatistics.keep" />
          </SampleCount>
          <SampleCount title="待检样品" class="justify-end">
            <template #icon>
              <img class="w-[80px]" src="@/assets/images/commandCenterScreen/sample-icon-4.svg" />
            </template>
            <NumberScroll :value="sampleProcessStatistics.wait" />
          </SampleCount>
        </div>
      </Niceframe>
      <Niceframe class="w-[420px] h-full" title="委托单位委托任务数量统计">
        <div class="relative h-full">
          <LoadingMask v-model:visible="consignTaskLoading" />
          <DateFilter v-model:value="consignTaskSection" @on-select="initConsignTaskChart()" />
          <BarChart ref="consignTaskRef" :options="{ dataZoom: consignTaskDataZoom }" />
        </div>
      </Niceframe>
      <Niceframe class="w-[420px] h-full" title="部门出具报告统计">
        <div class="relative h-full">
          <LoadingMask v-model:visible="departmentalReportLoading" />
          <DateFilter
            v-model:value="departmentalReportSection"
            @on-select="initDepartmentReportChart()"
          />
          <BarChart ref="departmentReportRef" :options="{ dataZoom: departmentReportDataZoom }" />
        </div>
      </Niceframe>
      <Niceframe class="w-[480px] h-full" title="人员出具报告统计">
        <div class="relative h-full">
          <LoadingMask v-model:visible="testerReportLoading" />
          <DateFilter v-model:value="testerReportSection" @on-select="initPersonReportChart()" />
          <BarChart ref="personReportRef" :options="{ dataZoom: personReportDataZoom }" />
        </div>
      </Niceframe>
    </div>

    <div class="data-center-bottom h-[43%]">
      <Niceframe class="w-[480px] h-full" title="委托任务类型排行">
        <div class="relative h-full overflow-hidden">
          <LoadingMask v-model:visible="sampleLeaderLoading" />
          <DateFilter v-model:value="sampleLeaderSection" @on-select="initConsignTaskTypeRank" />
          <RankList :data-source="consignTaskTypeList" />
        </div>
      </Niceframe>
      <Niceframe class="flex-1 h-full w-[0px]" title="检测任务统计" long-title>
        <div class="relative h-full">
          <LoadingMask v-model:visible="taskLoading" />
          <DateFilter v-model:value="taskSection" @on-select="initTestTaskChart()" />
          <BarChart ref="testTaskRef" />
        </div>
      </Niceframe>
      <Niceframe class="w-[480px] h-full" title="高频设备使用次数">
        <div class="relative h-full overflow-hidden">
          <LoadingMask v-model:visible="topDeviceUsageLoading" />
          <DateFilter v-model:value="topDeviceUsageSection" @on-select="initEqUseCountRank" />
          <RankList :data-source="eqUseCountList" />
        </div>
      </Niceframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref } from "vue"
import Niceframe from "../components/Niceframe.vue"
import DateFilter from "./components/DateFilter.vue"
import SampleCount from "./components/SampleCount.vue"
import TestCount from "./components/TestCount.vue"
import BarChart from "./components/BarChart.vue"
import RankList, { type RankListItem } from "./components/RankList.vue"
import {
  FilterSection,
  getSampleProcessStatistics,
  getTestDataStatistics,
  getConsignStatistics,
  getDepartmentalReportStatistics,
  getTesterReportStatistics,
  getTaskStatistics,
  getSampleLeaderboard,
  getTopDeviceUsageFrequency
} from "@/api/commandCenterScreen.api"
import LoadingMask from "./components/LoadingMask.vue"
import NumberScroll from "./components/NumberScroll.vue"
import { useDataZoomHooks } from "./hooks/useDataZoomHooks"

// 委托单位委托任务数量统计
const consignTaskRef = ref()

// 部门出具报告统计
const departmentReportRef = ref()

// 人员出具报告统计
const personReportRef = ref()

// 检测任务统计
const testTaskRef = ref()

const testDataStatistics = ref({
  total: 0,
  wait: 0,
  testing: 0,
  complete: 0
})

const sampleProcessStatistics = ref({
  total: 0,
  testing: 0,
  keep: 0,
  wait: 0
})

const sampleProcessLoading = ref(false)
const sampleProcessSection = ref<FilterSection>(FilterSection.全部)

const consignTaskLoading = ref(false)
const consignTaskSection = ref<FilterSection>(FilterSection.全部)

const departmentalReportLoading = ref(false)
const departmentalReportSection = ref<FilterSection>(FilterSection.全部)

const testerReportLoading = ref(false)
const testerReportSection = ref<FilterSection>(FilterSection.全部)

const taskLoading = ref(false)
const taskSection = ref<FilterSection>(FilterSection.全部)

const sampleLeaderLoading = ref(false)
const sampleLeaderSection = ref<FilterSection>(FilterSection.全部)

const topDeviceUsageLoading = ref(false)
const topDeviceUsageSection = ref<FilterSection>(FilterSection.全部)

const consignTaskTypeList = ref<RankListItem[]>([])

const eqUseCountList = ref<RankListItem[]>([])

const { dataZoom: consignTaskDataZoom, setDataZoom: setConsignTaskDataZoom } = useDataZoomHooks()

const { dataZoom: departmentReportDataZoom, setDataZoom: setDepartmentReportDataZoom } =
  useDataZoomHooks()

const { dataZoom: personReportDataZoom, setDataZoom: setPersonReportDataZoom } = useDataZoomHooks()

onMounted(() => {
  initTestDataStatistics()
  initSampleProcess()
  initConsignTaskChart()
  initDepartmentReportChart()
  initPersonReportChart()
  initTestTaskChart()
  initConsignTaskTypeRank()
  initEqUseCountRank()
})

function goTestPage(url: string) {
  window.open(`${location.origin}/${url}&sourceFormScreen=1`)
}

/** 渲染图表 */
function initChart(
  chartRef: Ref<any, any>,
  requestFun: (cb: (xData: string[], data: number[]) => void) => void
) {
  requestFun((xData: string[], data: number[]) => {
    chartRef.value.setData(xData, data)
  })
}

// 检测数据统计
async function initTestDataStatistics() {
  const res = await getTestDataStatistics()

  res.data.forEach((item) => {
    if (item.name === "检测总数") {
      testDataStatistics.value.total = item.numMain
    }
    if (item.name === "待检测") {
      testDataStatistics.value.wait = item.numMain
    }
    if (item.name === "在检测") {
      testDataStatistics.value.testing = item.numMain
    }
    if (item.name === "完成数") {
      testDataStatistics.value.complete = item.numMain
    }
  })
}

// 样品数量统计
async function initSampleProcess() {
  sampleProcessLoading.value = true
  const res = await getSampleProcessStatistics(sampleProcessSection.value).finally(() => {
    sampleProcessLoading.value = false
  })

  res.data.forEach((item) => {
    if (item.name === "全部样品") {
      sampleProcessStatistics.value.total = item.numMain
    }
    if (item.name === "在检样品") {
      sampleProcessStatistics.value.testing = item.numMain
    }
    if (item.name === "留样样品") {
      sampleProcessStatistics.value.keep = item.numMain
    }
    if (item.name === "待检样品") {
      sampleProcessStatistics.value.wait = item.numMain
    }
  })
}

// 委托单位委托任务数量统计
function initConsignTaskChart() {
  initChart(consignTaskRef, async (cb) => {
    consignTaskLoading.value = true
    const res = await getConsignStatistics(consignTaskSection.value).finally(() => {
      consignTaskLoading.value = false
    })

    const data = res.data

    if (data.length > 5) {
      const step = (1 / data.length) * 100
      setConsignTaskDataZoom(5 * step)
    } else {
      setConsignTaskDataZoom(100)
    }

    cb(
      data.map((i) => i.name),
      data.map((i) => i.numMain)
    )
  })
}

// 部门出具报告统计
function initDepartmentReportChart() {
  initChart(departmentReportRef, async (cb) => {
    departmentalReportLoading.value = true
    const res = await getDepartmentalReportStatistics(departmentalReportSection.value).finally(
      () => {
        departmentalReportLoading.value = false
      }
    )

    const data = res.data

    if (data.length > 5) {
      const step = (1 / data.length) * 100
      setDepartmentReportDataZoom(5 * step)
    } else {
      setDepartmentReportDataZoom(100)
    }

    cb(
      data.map((i) => i.name),
      data.map((i) => i.numMain)
    )
  })
}

// 人员出具报告统计
function initPersonReportChart() {
  initChart(personReportRef, async (cb) => {
    testerReportLoading.value = true
    const res = await getTesterReportStatistics(testerReportSection.value).finally(() => {
      testerReportLoading.value = false
    })

    const data = res.data

    if (data.length > 5) {
      const step = (1 / data.length) * 100
      setPersonReportDataZoom(5 * step)
    } else {
      setPersonReportDataZoom(100)
    }

    cb(
      data.map((i) => i.name),
      data.map((i) => i.numMain)
    )
  })
}

// 检测任务统计
function initTestTaskChart() {
  initChart(testTaskRef, async (cb) => {
    taskLoading.value = true
    const res = await getTaskStatistics(taskSection.value).finally(() => {
      taskLoading.value = false
    })

    const data = res.data
    cb(
      data.map((i) => i.name),
      data.map((i) => i.numMain)
    )
  })
}

// 委托任务类型排行
async function initConsignTaskTypeRank() {
  sampleLeaderLoading.value = true
  const res = await getSampleLeaderboard(sampleLeaderSection.value).finally(() => {
    sampleLeaderLoading.value = false
  })

  const data = res.data
  const total = data.reduce((a, b) => a + b.numMain, 0)

  consignTaskTypeList.value = data.map((item) => ({
    label: item.name,
    value: item.numMain,
    process: (item.numMain / total) * 100
  }))
}

// 高频设备使用次数
async function initEqUseCountRank() {
  topDeviceUsageLoading.value = true
  const res = await getTopDeviceUsageFrequency(topDeviceUsageSection.value).finally(() => {
    topDeviceUsageLoading.value = false
  })

  const data = res.data
  const total = data.reduce((a, b) => a + b.numMain, 0)

  eqUseCountList.value = data.map((item) => ({
    label: item.name,
    value: item.numMain,
    process: (item.numMain / total) * 100
  }))
}
</script>

<style scoped lang="less">
.data-center {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-center-center {
  display: flex;
  align-items: center;
  gap: 24px;
}

.data-center-bottom {
  display: flex;
  align-items: center;
  gap: 24px;
}

.data-center-sample {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  padding: 0 32px;
  padding-top: 32px;
}
</style>
