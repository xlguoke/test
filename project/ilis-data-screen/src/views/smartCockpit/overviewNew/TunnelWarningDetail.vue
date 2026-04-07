<template>
  <CommonModal ref="pop" modal-title="隧道预警信息">
    <template #function>
      <div class="flex justify-between">
        <div class="flex gap-32">
          <div class="flex items-center">
            <span>项目名称：</span>
            <a-select
              v-model:value="param.projectName"
              class="w-420 mr-[0.32rem]! h-66! customSelectClass"
              :options="projectOptions"
              :loading="loading"
              @change="handleProjectChange"
            ></a-select>
          </div>
          <div class="flex items-center">
            <span>标段名称：</span>
            <a-select
              v-model:value="param.blockName"
              placeholder="请选择标段名称"
              class="w-420 mr-[0.32rem]! h-66! customSelectClass"
              :options="blockOptions"
              :loading="loading"
            ></a-select>
          </div>
          <div class="flex items-center">
            <span>测点状态：</span>
            <a-select
              v-model:value="param.isTesting"
              :allow-clear="true"
              placeholder="请选择观测点状态"
              class="w-420 mr-[0.32rem]! h-66! customSelectClass"
              :options="testingOptions"
              :loading="loading"
              @change="handleTestingChange"
            ></a-select>
          </div>
          <div class="flex items-center">
            <span>预警状态：</span>
            <a-select
              v-model:value="param.warningLevel"
              :allow-clear="true"
              placeholder="请选择预警状态"
              class="w-420 mr-[0.32rem]! h-66! customSelectClass"
              :options="warningOptions"
              :loading="loading"
              @change="handleWarningChange"
            ></a-select>
          </div>
          <div class="flex items-center">
            <span>处理状态：</span>
            <a-select
              v-model:value="param.handleState"
              :allow-clear="true"
              placeholder="请选择处理状态"
              class="w-420 mr-[0.32rem]! h-66! customSelectClass"
              :options="handleStateOptions"
              :loading="loading"
              @change="handleStateChange"
            ></a-select>
          </div>
        </div>
        <div class="flex">
          <DateFilterSplit
            date-filter-title="预警时间："
            :filter-options="filterOptions"
            :current-value="param.dateFilterVal"
            @change-date-filter="handleChangeDateFilter"
          ></DateFilterSplit>
        </div>
      </div>
    </template>
    <template #table>
      <StaticTable
        class="flex-1"
        :datas="souceData"
        :loading="tableLoading"
        :columns="columns"
        :pagination="true"
      >
        <template #number="{ item }">
          {{ item.index }}
        </template>
        <template #constructionOrder="{ item }">
          <span>{{ structionOrderRender(item.constructionOrder) }}</span>
        </template>
        <template #geologicalType="{ item }">
          <span v-if="item.geologicalType == 2">一般地质</span>
          <span v-else>特殊地质</span>
        </template>
        <template #isTesting="{ item }">
          <span v-if="item.isTesting === 'true'">在测</span>
          <span v-else-if="item.isTesting === 'false'">停测</span>
        </template>
        <template #handleState="{ item }">
          <span v-if="item.handleState == 1">处理中</span>
          <span v-else-if="item.handleState == 2">已处理</span>
          <span v-else-if="item.handleState == 0">未处理</span>
        </template>
        <template #warningLevel="{ item }">
          <span
            class="inline-block rounded-full align-middle"
            :class="getDotColorClass(item.warningLevel)"
            :style="{ width: '0.45rem', height: '0.45rem' }"
          ></span>
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
import { computed, ref, watch } from "vue"
import CommonModal from "./CommonModal.vue"
import DateFilterSplit from "./DateFilterSplit.vue"
import {
  FilterDateType,
  getTunelwarningBlocks,
  getTunelwarningPagination
} from "@/api/smartCockpit.test.api"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import Pagination from "@/components/smartCockpit/Pagination.vue"

const props = withDefaults(
  defineProps<{
    projectOptions: any[] // 项目列表
    // blockOptions: any[] // 标段列表
    selectedProject: string | undefined // 选中项目
    selectedBlock: string | undefined // 选中标段
    dateFilterVal: FilterDateType
  }>(),
  {
    projectOptions: () => [],
    blockOptions: () => []
  }
)

const getDotColorClass = (level: any) => {
  switch (level) {
    case 0:
      return "bg-green-500"
    case 1:
      return "bg-yellow-400"
    case 2:
      return "bg-orange-500"
    case 3:
      return "bg-red-500"
    default:
      return "bg-gray-200"
  }
}
const blockOptions = ref([
  {
    label: "",
    value: ""
  }
])
const pop = ref()
const projectOptions = computed(() => props.projectOptions)

const testingOptions = ref([
  { label: "在测", value: 1 }, // true
  { label: "停测", value: 0 } // false
])
const warningOptions = ref([
  { label: "绿", value: 0 },
  { label: "黄", value: 1 },
  { label: "橙", value: 2 },
  { label: "红", value: 3 }
])
const handleStateOptions = ref([
  { label: "未处理", value: 0 },
  { label: "处理中", value: 1 },
  { label: "已处理", value: 2 }
])
const filterOptions = ref([
  { label: "日", value: FilterDateType.天 },
  { label: "周", value: FilterDateType.周 },
  { label: "月", value: FilterDateType.月 },
  { label: "年", value: FilterDateType.年 }
])
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", align: "center", width: "2rem" },
  { title: "预警时间", key: "warningTime" },
  { title: "标段", key: "lineName" },
  { title: "隧道", key: "tunnelName" },
  { title: "工点", key: "pointName" },
  { title: "测点名称", key: "measurePointName" },
  { title: "施工工序", key: "constructionOrder" },
  { title: "地质类型", key: "geologicalType" },
  { title: "状态", key: "isTesting" },
  { title: "测量值", key: "data" },
  { title: "累计值", key: "measureU0" },
  { title: "差值", key: "measureU0" },
  { title: "预警状态", key: "warningLevel" },
  { title: "预警原因", key: "warningReason" },
  { title: "处理状态", key: "handleState" }
])
const souceData = ref([])
const totalCount = ref(10)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const tableLoading = ref(false)

// 监听props的变化
watch(
  () => props,
  (newVal) => {
    param.value.projectName = newVal.selectedProject
    param.value.blockName = newVal.selectedBlock
    param.value.dateFilterVal = newVal.dateFilterVal
    getBlocksListInit()
  },
  {
    deep: true
  }
)
const param = ref({
  projectName: props.selectedProject,
  blockName: props.selectedBlock,
  dateFilterVal: props.dateFilterVal,
  isTesting: undefined,
  warningLevel: undefined,
  handleState: undefined
})

// 深度监听param对象的所有属性变化
watch(
  () => [
    param.value.dateFilterVal,
    param.value.isTesting,
    param.value.warningLevel,
    param.value.handleState,
    param.value.blockName
  ],
  () => {
    pageNum.value = 1
    getTunelwarningList()
  },
  { deep: true }
)
async function getBlocksListInit() {
  try {
    const { data } = await getTunelwarningBlocks(param.value.projectName)
    blockOptions.value = data
      .filter((item: any) => item.blockName)
      .map((item: any) => {
        return {
          label: item.blockName,
          value: item.blockName
        }
      })
  } catch (error) {
    console.log(error)
  }
}
async function getBlocksList() {
  try {
    tableLoading.value = true
    const { data } = await getTunelwarningBlocks(param.value.projectName).finally(() => {
      tableLoading.value = false
    })
    blockOptions.value = data
      .filter((item: any) => item.blockName)
      .map((item: any) => {
        return {
          label: item.blockName,
          value: item.blockName
        }
      })
    if (blockOptions.value.length > 0) param.value.blockName = blockOptions.value[0].value
  } catch (error) {
    console.log(error)
  }
}
function structionOrderRender(type: any) {
  if (type == 1) return "开挖中"
  else if (type == 2) return "开挖中->台阶法：分部1"
  else if (type == 3) return "开挖中->台阶法：分部2"
  else if (type == 4) return "开挖中->三阶法：分部1"
  else if (type == 5) return "开挖中->三阶法：分部2"
  else if (type == 6) return "开挖中->三阶法：分部3"
  else if (type == 7) return "仰拱开挖"
  else if (type == 8) return "仰拱封闭"
}
function handleChangeDateFilter(filterType: FilterDateType) {
  param.value.dateFilterVal = filterType
}
function handlePageChange(newPage: number) {
  pageNum.value = newPage
  getTunelwarningList()
}
// 获取预警统计信息列表
async function getTunelwarningList() {
  const dataRange = getDateRangeHook(param.value.dateFilterVal)
  const params = {
    ...param.value,
    timeStart: dataRange.startTime,
    timeEnd: dataRange.endTime,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  try {
    const { data, totalNum } = await getTunelwarningPagination(params)
    totalCount.value = totalNum
    souceData.value = (() => {
      let index = pageNum.value === 1 ? 1 : (pageNum.value - 1) * pageSize.value + 1
      return data.map((item: any) => {
        return {
          ...item,
          index: index++
        }
      })
    })()
  } catch (error) {
    console.log(error)
  }
}

function handleProjectChange() {
  getBlocksList()
  // 调用接口
}
function handleTestingChange() {
  // 调用接口
}
function handleWarningChange() {
  // 调用接口
}
function handleStateChange() {
  // 调用接口
}

function showModal() {
  pageNum.value = 1
  pop.value.showModal()
}
defineExpose({
  showModal
})
</script>
