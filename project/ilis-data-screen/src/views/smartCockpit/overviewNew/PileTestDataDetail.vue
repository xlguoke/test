<template>
  <CommonModal ref="pop" modal-title="已检桩统计">
    <template #table>
      <StaticTable :columns="columns" :loading="loading" :datas="souceData">
        <template #number="{ item }">
          {{ item.index }}
        </template>
      </StaticTable>
    </template>
    <template #pagination>
      <Pagination
        :show-total="(total) => `共${total}条`"
        :total-count="totalCount"
        :page-num="pageNum"
        @update:page-num="handlePageChange"
      />
    </template>
    <template #function>
      <div class="flex justify-start gap-[3rem]">
        <span>项目名称：{{ currentProjectName }}</span>
        <span>标段名称：{{ currentBlockName }}</span>
      </div>
    </template>
  </CommonModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import CommonModal from "./CommonModal.vue"
import { FilterDateType, getPilestatisticByBridge } from "@/api/smartCockpit.test.api"
import Pagination from "@/components/smartCockpit/Pagination.vue"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import { DataTableHead } from "@/components/smartCockpit/StaticTable.vue"

const props = withDefaults(
  defineProps<{
    currentProject: string
    currentBlock: string | undefined
    currentProjectName: string
    currentBlockName: string
    currnteDateType: string
  }>(),
  { currnteDateType: FilterDateType.周 }
)
const souceData = ref([])
const currentProject = computed(() => props.currentProject)
const currentBlock = computed(() => props.currentBlock)
const currentProjectName = computed(() => props.currentProjectName)
const currentBlockName = computed(() => props.currentBlockName)
const currnteDateType = computed(() => props.currnteDateType)
const totalCount = ref(10)
const pageNum = ref(1)
const pageSize = ref(10)

function handlePageChange(newPageNum: any) {
  pageNum.value = newPageNum
  getPilestatisticDataByBridge()
}

watch(
  [currentProject, currentBlock, currnteDateType],
  () => {
    pageNum.value = 1
    getPilestatisticDataByBridge()
  },
  { immediate: true }
)

async function getPilestatisticDataByBridge() {
  const dataRange = getDateRangeHook(currnteDateType.value)
  const param = {
    ablock: currentBlock.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    timeStart: dataRange.startTime,
    timeEnd: dataRange.endTime
  }
  try {
    const { data, totalNum } = await getPilestatisticByBridge(param)

    souceData.value = (() => {
      let index = pageNum.value === 1 ? 1 : (pageNum.value - 1) * pageSize.value + 1
      return data.map((item: any) => {
        return {
          ...item,
          type1Count: item.type1Count ? item.type1Count : "0",
          type2Count: item.type2Count ? item.type2Count : "0",
          type3Count: item.type3Count ? item.type3Count : "0",
          type4Count: item.type4Count ? item.type4Count : "0",
          index: index++
        }
      })
    })()
    totalCount.value = totalNum
  } catch (error) {
    console.log(error)
  }
}
const loading = ref(false)
const pop = ref()
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "3rem" },
  { title: "桥梁名称", key: "bridgeName", align: "center", width: "6rem" },
  { title: "已检桩总数", key: "testedPileCount" },
  { title: "Ⅰ类已检桩数", key: "type1Count" },
  { title: "Ⅱ类已检桩数", key: "type2Count" },
  { title: "Ⅲ类已检桩数", key: "type3Count" },
  { title: "IV类已检桩数", key: "type4Count" }
])

// 显示函数
function showModal() {
  pageNum.value = 1
  pop.value.showModal()
}
defineExpose({ showModal })
// 梳理详情页面需要什么
</script>
