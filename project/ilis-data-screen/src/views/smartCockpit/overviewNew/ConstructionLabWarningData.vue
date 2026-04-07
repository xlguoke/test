<template>
  <FrameBox>
    <template #title>
      <!-- <FrameTitle
        v-model:checked="filterDateVal"
        :options="filterDateOptions"
        @on-select="dateFilterChange"
      >
        工地试验室预警
      </FrameTitle> -->
      <FrameTitle>工地试验室预警</FrameTitle>
      <!-- <div class="w-ful flex flex-col">
        <div class="flex items-center justify-end gap-14 mt-32">
          <a-select
            v-model:value="filterWarnTypeVal"
            placeholder="请选择预警类型"
            :allow-clear="true"
            class="w-400 customSelectClass"
            popup-class-name="commonPopupClass"
            :options="WarnTypeOptions"
            @change="handleWarnTypeChange"
          />
        </div>
      </div> -->
    </template>
    <div class="flex h-full flex-col">
      <DataTable :columns="columns" :loading="loading" :datas="souceData">
        <template #number="{ item }">
          {{ item.index }}
        </template>
        <template #WarnType="{ item }">
          <span v-if="item.WarnType == 1">设备离线</span>
          <span v-else-if="item.WarnType == 2">不合格数据</span>
          <span v-else>超极值数据</span>
        </template>
      </DataTable>
    </div>
  </FrameBox>
</template>
<script lang="ts" setup>
import { FilterDateType, getLaboratoryWarning } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import { ref } from "vue"

const loading = ref(false)
const filterDateVal = ref(FilterDateType.所有)
const filterWarnTypeVal = ref<number | undefined | string>(undefined)

const WarnTypeOptions = [
  { label: "设备离线", value: 1 },
  { label: "不合格数据", value: 2 },
  { label: "超极值数据", value: 3 }
]
const filterDateOptions = [
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 },
  { label: "累计", value: FilterDateType.所有 }
]

// 配置表格列
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "1.5rem" },
  { title: "项目名称", key: "ProjectName" },
  { title: "标段", key: "SectionName" },
  { title: "预警类型", key: "WarnType" },
  { title: "预警内容", key: "WarnContent", align: "left" },
  { title: "预警时间", key: "WarnDate" }
])

const souceData = ref([])

function handleWarnTypeChange() {
  getLaboratoryWarningList()
}

// 日期筛选
function dateFilterChange() {
  getLaboratoryWarningList()
}

async function getLaboratoryWarningList() {
  const dataRange = getDateRangeHook(filterDateVal.value)
  const params = {
    WarnType: filterWarnTypeVal.value ?? "",
    timeStart: dataRange.startTime,
    timeEnd: dataRange.endTime
  }
  const { data } = await getLaboratoryWarning(params)
  souceData.value = (() => {
    let index = 1
    return data.map((item: any) => {
      return {
        ...item,
        index: index++
      }
    })
  })()
}

useAutoRequestHooks({
  api: getLaboratoryWarningList,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setData: () => {}
})
</script>
<style></style>
