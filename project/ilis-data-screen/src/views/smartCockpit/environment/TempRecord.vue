<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle
        v-model:checked="filterTestHumRecordVal"
        :options="filterTestHumRecordOptions"
        @on-select="initTestHumRecord"
      >
        试验温湿度记录
        <template #filter-before>
          <div class="mr-128">
            <div v-if="filterTestHumRecordExceededOptions.length" class="frame-title-filter">
              <div
                v-for="(item, index) in filterTestHumRecordExceededOptions"
                :key="index"
                :class="{
                  active: item.value === filterTestHumRecordExceededVal
                }"
                @click="onSelect(item)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </template>
      </FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="filteredData">
      <template #testConditions="{ item }">
        <span>温度：</span>
        <span>
          {{
            item.temperatureWhenTestMin === item.temperatureWhenTestMax
              ? `${item?.temperatureWhenTestMax || "-"} ℃`
              : `${item?.temperatureWhenTestMin || "-"}℃~${item?.temperatureWhenTestMax || "-"}℃`
          }}
        </span>
        &nbsp;&nbsp;
        <span>湿度：</span>
        <span>
          {{
            item.humidityWhenTestMin === item.humidityWhenTestMax
              ? `${item?.humidityWhenTestMax || "-"} %RH`
              : `${item?.humidityWhenTestMin || "-"}%RH~${item?.humidityWhenTestMax || "-"}%RH`
          }}
        </span>
      </template>
      <template #isOver="{ item }">
        {{ getIsOver(item) }}
      </template>
      <template #time="{ item }">
        <div v-if="item.recordTimeStart === item.recordTimeEnd">
          {{ dayjs(item.recordTimeStart).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
        <div v-else>
          {{ dayjs(item.recordTimeStart).format("YYYY-MM-DD HH:mm:ss") || "-" }}
          ~
          {{ dayjs(item.recordTimeEnd).format("YYYY-MM-DD HH:mm:ss") || "-" }}
        </div>
      </template>
    </DataTable>
  </FrameBox>
</template>
<script setup lang="ts">
import { getTemHumRecord } from "@/api/smartCockpit.test.api"
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import dayjs from "dayjs"
import { IOption } from "@/interface/IOption"

const loading = ref(false)
const columns = ref<DataTableHead[]>([
  { title: "任务编号", key: "testTaskCode", align: "left" },
  { title: "样品名称", key: "sampleName", align: "left" },
  { title: "检测参数", key: "paramName", align: "left" },
  { title: "功能室", key: "labName", align: "left" },
  { title: "环境条件", key: "testConditions", align: "left", width: "8rem" },
  { title: "是否超标", key: "isOver", align: "left", width: "2rem" },
  { title: "记录时间", key: "time", align: "left", width: "4.1rem" }
])
const souceData = ref<any[]>()
const filteredData = ref<any[]>()
const filterTestHumRecordExceededOptions: Array<IOption> = [
  {
    label: "全部",
    value: "ALL"
  },
  {
    label: "超标",
    value: "EXCEEDED"
  },
  {
    label: "正常",
    value: "NORMAL"
  }
]
const filterTestHumRecordOptions = [
  {
    label: "今日",
    value: "DAY"
  },
  {
    label: "昨日",
    value: "YESTERDAY"
  },
  {
    label: "近7日",
    value: "PRE_7_DAY"
  }
]

const filterTestHumRecordVal = ref("PRE_7_DAY")
const filterTestHumRecordExceededVal = ref("ALL")
function onSelect(option: any) {
  filterTestHumRecordExceededVal.value = option.value
  let result = souceData.value
  if (option.value === "NORMAL") {
    result = result?.filter((item) => getIsOver(item) === "否")
  } else if (option.value === "EXCEEDED") {
    result = result?.filter((item) => getIsOver(item) === "是")
  }

  filteredData.value = result
}

// todo初始化表格数据
const initTestHumRecord = useAutoRequestHooks({
  loading: loading,
  api: getTemHumRecord,
  query: filterTestHumRecordVal,
  setData: (res) => {
    souceData.value = res.data.rows
    filteredData.value = souceData.value
  }
})

function _isDefined(val: any): boolean {
  return val !== null && val !== undefined && val !== ""
}

function _isOver(val: any, min: any, max: any): boolean {
  if (!_isDefined(val)) return false

  const minDefined = _isDefined(min)
  const maxDefined = _isDefined(max)

  if (minDefined && maxDefined) {
    return val < min || val > max
  } else if (minDefined) {
    return val < min
  } else if (maxDefined) {
    return val > max
  }
  // 两者均未定义时视为无需检查，返回 false
  return false
}

// 主逻辑函数
function getIsOver(item: any): "是" | "否" {
  // 检查是否有任何范围定义
  const hasAnyRange =
    _isDefined(item.minTemperature) ||
    _isDefined(item.maxTemperature) ||
    _isDefined(item.minHumidity) ||
    _isDefined(item.maxHumidity)

  if (!hasAnyRange) return "否"

  // 检查任一测试值超限
  const isOver =
    _isOver(item.temperatureWhenTestMin, item.minTemperature, item.maxTemperature) ||
    _isOver(item.temperatureWhenTestMax, item.minTemperature, item.maxTemperature) ||
    _isOver(item.humidityWhenTestMin, item.minHumidity, item.maxHumidity) ||
    _isOver(item.humidityWhenTestMax, item.minHumidity, item.maxHumidity)

  return isOver ? "是" : "否"
}
</script>
<style lang="less" scoped>
.frame-title-filter {
  height: 0.66rem;
  display: flex;
  align-items: center;
  background: rgba(76, 184, 176, 0.1);
  border: 1px solid #4cb8b0;

  & > div {
    font-family: Source Han Sans;
    font-size: 0.36rem;
    font-weight: 500;
    font-variation-settings: "opsz" auto;
    color: #ffffff;
    padding: 0 0.28rem;
    cursor: pointer;
    color: #73cbc5;
    height: 100%;
    display: flex;
    align-items: center;

    &.active,
    &:hover {
      background: #4cb8b0;
      color: #fff;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
}
</style>
