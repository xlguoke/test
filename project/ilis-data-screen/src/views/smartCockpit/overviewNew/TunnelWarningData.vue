<template>
  <FrameBox>
    <template #title>
      <FrameTitle
        v-model:checked="filterVal"
        :options="filterDateOptions"
        @on-select="handleDateChange"
      >
        隧道预警统计
      </FrameTitle>
    </template>
    <div class="flex h-full flex-col">
      <div class="pt-30 flex justify-end">
        <a-select
          v-model:value="selectedProject"
          placeholder="请选择项目"
          show-search
          :allow-clear="true"
          option-filter-prop="label"
          class="w-420 customSelectClass"
          popup-class-name="commonPopupClass"
          :options="selectOptions"
          :loading="loading"
          @change="handleProjectChange"
        ></a-select>
      </div>

      <div class="flex-1">
        <DataTable :columns="columns" :loading="loading" :datas="souceData">
          <template #number="{ item }">
            {{ item.number }}
          </template>
          <template #operation="{ item }">
            <div class="text-[#00b7ff] hover:text-[#0099e6]">
              <a href="javascript:void(0)" class="!text-[#40E7D5]" @click="detail(item)">查看</a>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
    <TunnelWarningDetail
      ref="tunnelWarningDetail"
      :project-options="selectOptions"
      :selected-project="selectedProject"
      :selected-block="selectedBlock"
      :date-filter-val="filterVal"
    />
  </FrameBox>
</template>
<script lang="ts" setup>
import {
  FilterDateType,
  getTunelwarningProjects,
  getTunelwarningStatistic
} from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import { computed, onMounted, ref } from "vue"
import TunnelWarningDetail from "./TunnelWarningDetail.vue"

onMounted(() => {
  initSelectProject()
  InitTunelwarningStatistic()
})
const loading = ref(false)
const filterVal = ref(FilterDateType.年)
const filterDateOptions = [
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
]
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "1.5rem" },
  { title: "项目名称", key: "lineName", width: "4rem" },
  { title: "标段名称", key: "blockName" },
  { title: "预警数量", key: "warningCount" },
  { title: "操作", key: "operation" }
])
const souceData = ref([])

const selectOptions = ref([])
const selectedProject = ref<string | undefined>(undefined)
const selectedBlock = ref<string | undefined>(undefined)
const param = computed(() => {
  return getDateRangeHook(filterVal.value)
})
const tunnelWarningDetail = ref()
function detail(row: any) {
  // 通过行 => 获取选中标段
  selectedBlock.value = row.blockName
  selectedProject.value = row.lineName
  tunnelWarningDetail.value.showModal()
}

// 初始化项目下拉列表
async function initSelectProject() {
  try {
    loading.value = true
    const { data } = await getTunelwarningProjects()
    selectOptions.value = data
      .filter((item: any) => item.lineName)
      .map((item: any) => {
        return {
          label: item.lineName,
          value: item.lineName
        }
      })
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 初始化一级页面表格数据 => 滚动展示todo
async function InitTunelwarningStatistic() {
  try {
    loading.value = true
    const params = {
      timeStart: param.value.startTime,
      timeEnd: param.value.endTime,
      projectName: selectedProject.value
    }
    const { data } = await getTunelwarningStatistic(params)
    souceData.value = data.map((item: any, index: number) => {
      return {
        lineName: item.lineName,
        number: ++index,
        blockName: item.blockName,
        warningCount: item.warningCount
      }
    })
    console.log(souceData.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

function handleDateChange() {
  InitTunelwarningStatistic()
}
// 项目筛选
function handleProjectChange() {
  // 重新获取列表数据
  InitTunelwarningStatistic()
}
</script>
<style></style>
