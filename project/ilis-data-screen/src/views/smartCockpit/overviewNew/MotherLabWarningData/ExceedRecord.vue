<template>
  <CommonModal ref="pop" modal-title="试验过程中温湿度超标记录">
    <template #function>
      <div class="flex justify-between">
        <a-select
          v-model:value="selectedRoom"
          :allow-clear="true"
          option-filter-prop="label"
          placeholder="请选择功能室"
          class="w-480 customSelectClass"
          popup-class-name="commonPopupClass"
          :options="selectOptions"
          show-search
          :loading="loading"
        ></a-select>

        <DateFilterSplit
          date-filter-title="记录时间"
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
        <template #recordDate="{ item }">
          {{ item.recordDate ? formatDate(item.recordDate) : "-" }}
        </template>
        <template #standardTemHum="{ item }">
          温度（°C）：{{ item.standardMinTem }}~{{ item.standardMaxTem }}； 湿度（%RH）：{{
            item.standardMinHum
          }}~{{ item.standardMaxHum }}
        </template>
        <template #nowTemHun="{ item }">
          温度（°C）：{{ item.tem }}； 湿度（%RH）：{{ item.hum }}
        </template>
        <template #record="{ item }">
          <span class="text-red-500">{{ countRecord(item) }}</span>
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
import { FilterDateType, getHumitureOver, getRoom } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import Pagination from "@/components/smartCockpit/Pagination.vue"
import { formatDate } from "@/utils/utils"
onMounted(() => {
  getHumitureOverData()
  getRoomData()
})

const props = withDefaults(
  defineProps<{
    currentFilterDate: FilterDateType
  }>(),
  {
    currentFilterDate: FilterDateType.周
  }
)

const selectedRoom = ref<string>()
const selectOptions = ref([
  {
    label: "请选择功能室",
    value: ""
  }
])

const pop = ref()
const filterDateOptions = ref([
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
    getHumitureOverData()
  }
)

watch(
  () => selectedRoom.value,
  (val) => {
    console.log("roomID", val)
    pageNum.value = 1
    getHumitureOverData()
  }
)

function countRecord(data: any) {
  const messages: string[] = []
  // 检查温度
  if (data.tem < data.standardMinTem || data.tem > data.standardMaxTem) {
    messages.push("温度超标")
  }

  // 检查湿度
  if (data.hum < data.standardMinHum || data.hum > data.standardMaxHum) {
    messages.push("湿度超标")
  }
  return messages.length > 0 ? messages.join("，") : "环境指标正常"
}
const loading = ref(false)
const souceData = ref([])
const columns = ref<DataTableHead[]>([
  { title: "序号", key: "number", width: "2rem" },
  { title: "记录时间", key: "recordDate", width: "2rem" },
  { title: "任务编号", key: "testTaskCode" },
  { title: "样品名称", key: "testSampleName", width: "2rem" },
  { title: "样品编号", key: "testSampleCode" },
  { title: "试验参数", key: "testParamName", width: "2rem" },
  { title: "试验人员", key: "taskUser", width: "2rem" },
  { title: "功能室", key: "laboratoryName", width: "2rem" },
  { title: "标准温湿度", key: "standardTemHum", width: "4rem" }, // todo
  { title: "实时温湿度", key: "nowTemHun", width: "4rem" },
  { title: "超标记录", key: "record" }
])
const totalCount = ref(10)
const pageNum = ref(1)
const pageSize = ref(10)

// 初始化下拉数据
async function getRoomData() {
  const param = {
    page: 1,
    size: 999
  }
  const res = await getRoom(param)
  if (res.success) {
    const options = res.obj.rows
    selectOptions.value = options.map((item: any) => {
      return {
        value: item.id,
        label: item.name
      }
    })
  }
}

// 初始化列表数据
async function getHumitureOverData() {
  loading.value = true
  const newParam = {
    page: pageNum.value,
    size: pageSize.value,
    laboratoryId: selectedRoom.value
  }
  try {
    const { data } = await getHumitureOver(filterDateVal.value, newParam)
    if (!data.rows) {
      souceData.value = []
      return
    }
    souceData.value = (() => {
      let index = pageNum.value === 1 ? 1 : (pageNum.value - 1) * pageSize.value + 1
      return data.rows.map((item: any) => {
        return {
          ...item,
          index: index++
        }
      })
    })()
    totalCount.value = data.total
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

function handleChangeDateFilter(newFilterDateVal: FilterDateType) {
  filterDateVal.value = newFilterDateVal
}
function handlePageChange(newPage: any) {
  // 通知父组件刷新数据
  pageNum.value = newPage
  getHumitureOverData()
}
function showModal() {
  pageNum.value = 1
  getHumitureOverData()
  pop.value.showModal()
}

defineExpose({
  showModal
})
</script>
<style scoped></style>
