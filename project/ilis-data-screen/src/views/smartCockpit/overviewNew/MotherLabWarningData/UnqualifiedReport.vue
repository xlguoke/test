<template>
  <CommonModal ref="pop" modal-title="不合格报告记录">
    <template #function>
      <div class="flex justify-end">
        <DateFilterSplit
          date-filter-title="报告日期"
          :filter-options="filterDateOptions"
          :current-value="filterDateVal"
          @change-date-filter="handleChangeDateFilter"
        ></DateFilterSplit>
      </div>
    </template>
    <template #table>
      <StaticTable :datas="souceData" :loading="loading" :columns="columns" :pagination="true">
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
  </CommonModal>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import CommonModal from "../CommonModal.vue"
import DateFilterSplit from "../DateFilterSplit.vue"
import { FilterDateType, getUnqualifiedReportPage } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import Pagination from "@/components/smartCockpit/Pagination.vue"
import { getDateRangeHook } from "@/hooks/useDateHooks"
onMounted(() => {
  getUnqualifiedReportPageData()
})

const props = withDefaults(
  defineProps<{
    visible?: boolean
    currentFilterDate: FilterDateType
  }>(),
  {
    currentFilterDate: FilterDateType.周
  }
)
const pop = ref()
const filterDateOptions = ref([
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
])
// 从父组件同步，需要修改
const filterDateVal = ref(props.currentFilterDate)

// 监听父组件修改日期
watch(
  () => props.currentFilterDate,
  (val) => {
    console.log("watch", val)
    console.log("souceData", souceData.value)
    filterDateVal.value = val
  }
)
// 监听子组件修改日期
watch(
  () => filterDateVal.value,
  (val) => {
    console.log("watch", val)
    pageNum.value = 1
    // filterDateVal.value = val 避免自我赋值
    getUnqualifiedReportPageData()
  }
)

const loading = ref(false)
const souceData = ref([])
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "left", width: "1.5rem" },
  { title: "样品名称", key: "test_sample_display_name", width: "6rem" },
  { title: "样品编号", key: "test_object_code", width: "6rem" },
  { title: "报告编号", key: "report_number", width: "6rem" },
  { title: "报告日期", key: "review_date", width: "6rem" },
  { title: "结论", key: "verdict", align: "left" }
])
const totalCount = ref(10)
const pageNum = ref(1)
const pageSize = ref(10)

// 初始化列表数据
async function getUnqualifiedReportPageData() {
  const dateRange = getDateRangeHook(filterDateVal.value)
  const newParam = {
    startTime: dateRange.startTime,
    endTime: dateRange.endTime,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  try {
    loading.value = true
    const { data, totalNum } = await getUnqualifiedReportPage(newParam).finally(() => {
      loading.value = false
    })

    souceData.value = (() => {
      let index = pageNum.value === 1 ? 1 : (pageNum.value - 1) * pageSize.value + 1
      return data.map((item: any) => {
        return {
          ...item,
          index: index++
        }
      })
    })()
    console.log("souceData", souceData)
    totalCount.value = totalNum
  } catch (error) {
    console.log(error)
  }
}

function handleChangeDateFilter(newFilterDateVal: FilterDateType) {
  filterDateVal.value = newFilterDateVal
}
function handlePageChange(newPage: any) {
  // 通知父组件刷新数据
  pageNum.value = newPage
  getUnqualifiedReportPageData()
}
function showModal() {
  pageNum.value = 1
  getUnqualifiedReportPageData()
  console.log("打开弹窗")
  pop.value.showModal()
}

defineExpose({
  showModal
})
</script>
<style scoped></style>
