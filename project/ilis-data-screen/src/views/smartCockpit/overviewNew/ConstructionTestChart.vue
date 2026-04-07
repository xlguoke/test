.
<template>
  <FrameBox :loading="pieLoading">
    <template #title>
      <FrameTitle>工地试验检测</FrameTitle>
    </template>
    <div class="w-full h-full flex flex-col">
      <div class="flex items-center justify-between mt-32">
        <a-select
          v-model:value="filterProjectVal"
          class="w-400 customSelectClass"
          popup-class-name="commonPopupClass"
          show-search
          option-filter-prop="label"
          :options="filterProjectOptions"
          placeholder="请选择项目"
          allow-clear
          @change="
            (val) => {
              filterBlockVal = undefined
              if (val) {
                getReportSectionData()
              } else {
                filterBlockOptions = []
              }
              getReportStatisticByprojectData()
            }
          "
        />
        <a-select
          v-model:value="filterBlockVal"
          class="w-400 customSelectClass"
          popup-class-name="commonPopupClass"
          show-search
          option-filter-prop="label"
          :options="filterBlockOptions"
          placeholder="请选择标段"
          allow-clear
          @change="
            (val) => {
              if (val) {
                getReportStatisticBysectionData()
              } else {
                getReportStatisticByprojectData()
              }
            }
          "
        />
      </div>
      <div class="flex flex-1 h-0 mt-32">
        <div class="pie-side pie-side-left">
          <div>
            <p>{{ pieDataDetail.RptCount }}</p>
            <p>自检报告</p>
          </div>
          <div>
            <p>{{ pieDataDetail.RptQualCount }}</p>
            <p>合格报告</p>
          </div>
          <div class="text-[#FFD15C]">
            <p>{{ pieDataDetail.RptFailCount }}</p>
            <p>不合格报告</p>
          </div>
          <div>
            <p>{{ reportHGV }}</p>
            <p>合格率</p>
          </div>
        </div>
        <div class="flex h-full ml-16 align-items">
          <img class="w-14" src="../../../assets/images/smartCockpit/pie-left-arrow.svg" />
        </div>
        <div class="flex-4 relative" style="bottom: -0.8rem; margin-bottom: -1rem">
          <PieChart3D
            v-if="!pieLoading && pieData"
            :pie-data="pieData"
            :disable-legend="true"
            :internal-diameter-ratio="0.7"
          />
        </div>
        <div class="flex h-full mr-16 align-items">
          <img class="w-14" src="../../../assets/images/smartCockpit/pie-right-arrow.svg" />
        </div>
        <div class="pie-side pie-side-right">
          <div>
            <p>{{ pieDataDetail.WwCount }}</p>
            <p>外委报告</p>
          </div>
          <div>
            <p>{{ pieDataDetail.WwQualCount }}</p>
            <p>合格报告</p>
          </div>
          <div class="text-[#FFD15C]">
            <p>{{ pieDataDetail.WwFailCount }}</p>
            <p>不合格报告</p>
          </div>
          <div>
            <p>{{ wwReportHGV }}</p>
            <p>合格率</p>
          </div>
        </div>
      </div>
    </div>
  </FrameBox>
</template>
<script lang="ts" setup>
import {
  getReportProjects,
  getReportSectionsn,
  getReportStatisticByproject,
  getReportStatisticBysection
} from "@/api/smartCockpit.test.api"
import PieChart3D from "@/components/PieChart3D.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { computed, onMounted, ref } from "vue"

const pieData = ref()
const pieLoading = ref(false)

const pieDataDetail = ref<{
  RptQualCount: number
  WwFailCount: number
  RptCount: number
  RptFailCount: number
  WwQualCount: number
  WwCount: number
}>({
  RptQualCount: 0,
  WwFailCount: 0,
  RptCount: 0,
  RptFailCount: 0,
  WwQualCount: 0,
  WwCount: 0
})

// 报告合格率
const reportHGV = computed(() => {
  if (pieDataDetail.value.RptCount) {
    return (
      ((pieDataDetail.value.RptQualCount / pieDataDetail.value.RptCount) * 100).toFixed(2) + "%"
    )
  }
  return "-"
})

// 外委报告合格率
const wwReportHGV = computed(() => {
  if (pieDataDetail.value.WwCount) {
    return ((pieDataDetail.value.WwQualCount / pieDataDetail.value.WwCount) * 100).toFixed(2) + "%"
  }
  return "-"
})

async function getReportStatisticByprojectData() {
  pieLoading.value = true
  const { data } = await getReportStatisticByproject(filterProjectVal.value).finally(() => {
    pieLoading.value = false
  })

  if (data.length > 0) {
    const rawData = data[0]

    pieDataDetail.value = rawData

    if (rawData.RptCount === 0 && rawData.WwCount === 0) {
      pieData.value = [
        {
          name: "报告",
          value: 0
        }
      ]
      return
    }

    pieData.value = [
      {
        name: "自检报告",
        value: rawData.RptCount
      },
      {
        name: "外委报告",
        value: rawData.WwCount
      }
    ]
  }
}

async function getReportStatisticBysectionData() {
  if (!filterBlockVal.value) {
    return
  }

  pieLoading.value = true
  const { data } = await getReportStatisticBysection(filterBlockVal.value).finally(() => {
    pieLoading.value = false
  })

  if (data.length > 0) {
    const rawData = data[0]
    pieDataDetail.value = rawData
    pieData.value = [
      {
        name: "自检报告",
        value: rawData.RptCount
      },
      {
        name: "外委报告",
        value: rawData.WwCount
      }
    ]
  }
}

const filterProjectVal = ref<string>()

const filterBlockVal = ref<string>()

const filterProjectOptions = ref([])

const filterBlockOptions = ref([])

async function getReportProjectData() {
  try {
    const { data } = await getReportProjects()
    filterProjectOptions.value = data.map((item: any) => ({
      label: item.ProjectName,
      value: item.ProjectKey
    }))
    console.log("工地试验检测 - 查询项目列表", filterProjectOptions.value)
  } catch (error) {
    console.log("查询项目列表失败", error)
  }
}

async function getReportSectionData() {
  try {
    const { data } = await getReportSectionsn(filterProjectVal.value)
    filterBlockOptions.value = data.map((item: any) => ({
      label: item.SectionName,
      value: item.SectionKey,
      ProjectKey: item.ProjectKey
    }))
  } catch (error) {
    console.log("查询项目列表失败", error)
  }
}

onMounted(() => {
  getReportProjectData()
  getReportStatisticByprojectData()
})
</script>
<style lang="less" scoped>
.pie-side {
  flex: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding-right: 0.24rem;

  & > div {
    p:first-child {
      font-size: 0.32rem;
      margin-bottom: 0.16rem;
      font-weight: bold;
    }

    p:last-child {
      font-size: 0.24rem;
      margin-bottom: 0;
    }
  }

  &.pie-side-left {
    text-align: right;
    border-right: solid 1px #28bc59;
    padding-right: 0.24rem;
  }

  &.pie-side-right {
    border-left: solid 1px #28bc59;
    padding-left: 0.24rem;
  }
}
</style>
