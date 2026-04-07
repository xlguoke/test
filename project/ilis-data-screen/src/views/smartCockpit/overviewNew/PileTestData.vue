<template>
  <FrameBox>
    <template #title>
      <FrameTitle v-model:checked="filterDateVal" :options="filterDateOptions">
        基桩检测统计
        <template #filter-before>
          <a-select
            v-model:value="selectedProject"
            placeholder="请选择项目"
            :allow-clear="true"
            show-search
            class="w-1000 mr-[0.35rem]! h-66! customSelectClass"
            popup-class-name="commonPopupClass"
            option-filter-prop="label"
            :options="selectProjectOptions"
            @change="handleProjectChange"
          ></a-select>
        </template>
      </FrameTitle>
    </template>
    <div class="flex h-full gap-40 pt-40">
      <div class="flex-3 flex flex-col overflow-hidden">
        <DataTable
          style="padding-top: 0"
          :columns="columns"
          :loading="loading"
          :datas="souceData"
          check-id-field="ablock"
          @row-click="handleRowClick"
        >
          <template #operation="{ item }">
            <div class="text-[#00b7ff] hover:text-[#0099e6]">
              <a href="javascript:void(0)" class="!text-[#40E7D5]" @click.stop="detail(item)">
                查看
              </a>
            </div>
          </template>
          <template #number="{ item }">
            {{ item.index }}
          </template>
          <template #progress="{ item }">
            <ProcessBar :process="item.progress" />
          </template>
        </DataTable>
      </div>
      <div class="flex-[1.5] flex">
        <div class="w-full h-full flex" style="background: rgba(64, 231, 213, 0.1)">
          <ChartComponent ref="categoryTypeChartRef" class="flex-[1.5]" />
          <div class="flex-1 ring-legend">
            <div
              v-for="(item, index) in pilestatisticDetermineTypeLegend"
              :key="index"
              class="ring-legend-item"
            >
              <div class="ring-legend-icon" :style="`background:${item.color}`"></div>
              <div class="flex-2">{{ item.name }}</div>
              <div class="flex-2">{{ item.value }}</div>
              <div class="flex-1">{{ item.ratio }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PileTestDataDetail
      ref="pileTestDataDetail"
      :current-project="selectedProject"
      :current-block="selectedBlock"
      :current-project-name="selectedProjectName"
      :current-block-name="selectedBlockName"
      :currnte-date-type="filterDateVal"
    ></PileTestDataDetail>
  </FrameBox>
</template>
<script lang="ts" setup>
import dayjs from "dayjs"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import {
  FilterDateType,
  getPileProjects,
  getPilestatistic,
  getPilestatisticDetermineType,
  PilestatisticDetermineTypeQuery
} from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import ChartComponent from "@/components/smartCockpit/ChartComponent.vue"
import { onMounted, ref, watch } from "vue"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import DataTable from "@/components/smartCockpit/DataTable.vue"
import PileTestDataDetail from "./PileTestDataDetail.vue"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import { getRingChartOptions } from "../utils/defaultChartOptions"
import { clacChartPx } from "@/utils/utils"
import { defaultChartOptions } from ".."
import ProcessBar from "./ProcessBar.vue"

onMounted(() => {
  getPileProjectsData()
  getPilestatisticData()
})

const loading = ref(false)
const filterDateVal = ref(FilterDateType.周)
const filterDateOptions = [
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
]
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "1.5rem" },
  { title: "项目名称", key: "projectName", width: "4rem", align: "left" },
  { title: "标段名称", key: "ablockName", align: "left" },
  { title: "桥梁数量", key: "bridgeCount" },
  { title: "基桩总数", key: "pileCount" },
  { title: "已检桩数", key: "testedPileCount" },
  { title: "进度", key: "progress" },
  { title: "操作", key: "operation" }
])
const souceData = ref()

const selectedProject = ref("")
const selectedProjectName = ref("")
const selectedBlock = ref<string>()
const selectedBlockName = ref("")

watch([selectedProject, filterDateVal], () => {
  const dateStr = getDateStr()

  pilestatisticDetermineTypeQuery.value.projectId = selectedProject.value
  pilestatisticDetermineTypeQuery.value.ablock = undefined
  pilestatisticDetermineTypeQuery.value.timeStart = dateStr.startDate
  pilestatisticDetermineTypeQuery.value.timeEnd = dateStr.endDate

  getPilestatisticData()
  initPilestatisticDetermineType()
})

const pileTestDataDetail = ref()
const selectProjectOptions = ref([
  {
    label: "请选择项目",
    value: "",
    ablock: ""
  }
])

// 避免无下拉直接查看
function handleProjectChange(value: any, option: any) {
  selectedProjectName.value = option.label
}
// 获取下拉项目
async function getPileProjectsData() {
  try {
    const { data } = await getPileProjects()
    selectProjectOptions.value = data.map((item: any) => {
      return {
        label: item.projectName,
        value: item.projectId
      }
    })
  } catch (error) {
    console.log(error)
  }
}
async function getPilestatisticData() {
  const dateRange = getDateRangeHook(filterDateVal.value)
  const param = {
    timeStart: dateRange.startTime,
    timeEnd: dateRange.endTime,
    projectId: selectedProject.value
  }
  try {
    const { data } = await getPilestatistic(param)
    souceData.value = data.map((item: any, index: number) => {
      const progress =
        item.pileCount === 0
          ? 0 // 避免除以零，直接返回0%
          : (item.testedPileCount / item.pileCount) * 100
      return {
        ...item,
        progress,
        index: ++index
      }
    })
  } catch (error) {}
}

function handleRowClick(rowData: any) {
  if (rowData) {
    selectedBlock.value = rowData.ablock
  } else {
    selectedBlock.value = undefined
  }
  pilestatisticDetermineTypeQuery.value.ablock = selectedBlock.value
  initPilestatisticDetermineType()
}

async function detail(row: any) {
  // 通过行获取标段id
  selectedBlock.value = row?.ablock
  selectedProjectName.value = row?.projectName
  selectedBlockName.value = row?.ablockName
  pileTestDataDetail.value.showModal()
}

function getDateStr() {
  if (filterDateVal.value === FilterDateType.年) {
    return {
      startDate: `${dayjs().startOf("year").format("YYYY-MM-DD")} 00:00:00`,
      endDate: `${dayjs().endOf("year").format("YYYY-MM-DD")} 23:59:59`
    }
  }

  if (filterDateVal.value === FilterDateType.月) {
    return {
      startDate: `${dayjs().startOf("month").format("YYYY-MM-DD")} 00:00:00`,
      endDate: `${dayjs().endOf("month").format("YYYY-MM-DD")} 23:59:59`
    }
  }

  // 周
  return {
    startDate: `${dayjs().startOf("week").format("YYYY-MM-DD")} 00:00:00`,
    endDate: `${dayjs().endOf("week").format("YYYY-MM-DD")} 23:59:59`
  }
}

/**
 * 基桩类型分布
 */
const categoryTypeChartRef = ref()

const categoryTypeDefaultDate = getDateStr()

const pilestatisticDetermineTypeQuery = ref<PilestatisticDetermineTypeQuery>({
  projectId: selectedProject.value,
  ablock: selectedBlock.value,
  timeStart: categoryTypeDefaultDate.startDate,
  timeEnd: categoryTypeDefaultDate.endDate
})

const pilestatisticDetermineTypeOptions = getRingChartOptions("已检桩数") as any

const pilestatisticDetermineTypeLegend = ref<
  {
    name: string
    value: string
    ratio: string
    color: string
  }[]
>([])

const initPilestatisticDetermineType = useAutoRequestHooks({
  api: getPilestatisticDetermineType,
  query: pilestatisticDetermineTypeQuery,
  setData: (res) => {
    const { errCode, data } = res
    if (errCode === 0) {
      const nameObj = {
        "1": "Ⅰ类桩",
        "2": "Ⅱ类桩",
        "3": "Ⅲ类桩",
        "4": "Ⅳ类桩"
      }

      const transferData = data.map((i: any) => ({
        name: nameObj[i.determineType],
        value: i.pileCount
      }))

      const total = transferData.reduce((acc: number, curr: any) => acc + curr.value, 0)
      pilestatisticDetermineTypeLegend.value = transferData.map((item, index) => ({
        ...item,
        ratio: total ? ((item.value / total) * 100).toFixed(0) : 0,
        color: defaultChartOptions.color[index % defaultChartOptions.color.length]
      }))

      pilestatisticDetermineTypeOptions.legend.show = false
      pilestatisticDetermineTypeOptions.graphic.elements[0].bottom = clacChartPx(380)
      pilestatisticDetermineTypeOptions.graphic.elements[0].style.text = total
      pilestatisticDetermineTypeOptions.graphic.elements[1].bottom = clacChartPx(320)
      pilestatisticDetermineTypeOptions.graphic.elements[1].style.fill = "#fff"
      pilestatisticDetermineTypeOptions.graphic.elements[2].bottom = clacChartPx(138)
      pilestatisticDetermineTypeOptions.graphic.elements[2].style.width = clacChartPx(480)
      pilestatisticDetermineTypeOptions.graphic.elements[2].style.height = clacChartPx(480)
      pilestatisticDetermineTypeOptions.series[0].center = ["50%", "65%"]
      pilestatisticDetermineTypeOptions.series[0].data = transferData
      categoryTypeChartRef.value.setOption(pilestatisticDetermineTypeOptions)
    }
  }
})
</script>
<style scoped lang="less">
.custom-card {
  border: 1px solid;
  border-image: linear-gradient(to right, #40e7d5, rgba(64, 231, 213, 0.1)) 1;
  background: linear-gradient(270deg, rgba(64, 231, 213, 0) 0%, rgba(64, 231, 213, 0.2) 100%);
}

.ring-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.28rem;
  justify-content: center;
  padding-right: 0.32rem;
  flex-direction: column;

  .ring-legend-icon {
    width: 0.16rem;
    height: 0.16rem;
  }

  .ring-legend-item {
    display: flex;
    align-items: center;
    font-size: 0.28rem;
    gap: 0.16rem;
    color: #fff;
  }
}
</style>
