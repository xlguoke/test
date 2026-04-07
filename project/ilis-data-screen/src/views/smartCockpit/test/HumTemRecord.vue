<template>
  <FrameBox class="flex-1 h-0" :loading="testHumRecordLoading">
    <template #title>
      <FrameTitle
        v-model:checked="filterTestHumRecordVal"
        :options="filterTestHumRecordOptions"
        @on-select="initTestHumRecord"
      >
        试验温湿度记录
      </FrameTitle>
    </template>

    <DataTable
      :columns="testHumRecordColumns"
      :datas="testHumRecordDatas"
      :loading="testHumRecordLoading"
    />
  </FrameBox>
</template>

<script setup lang="ts">
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import DataTable, { type DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import { getTemHumRecord } from "@/api/smartCockpit.test.api"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"

// 试验温湿度记录
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

const testHumRecordColumns = ref<DataTableHead[]>([
  { title: "任务编号", key: "testTaskCode", align: "left" },
  { title: "样品名称", key: "sampleName", align: "left" },
  { title: "样品编号", key: "testObjectCode", align: "left" },
  { title: "环境条件", key: "testConditions", align: "left" },
  { title: "时间", key: "testDate", align: "left" }
])
const testHumRecordDatas = ref<any[]>([])
const testHumRecordLoading = ref(false)

const initTestHumRecord = useAutoRequestHooks({
  loading: testHumRecordLoading,
  api: getTemHumRecord,
  query: filterTestHumRecordVal,
  setData: (res) => {
    testHumRecordDatas.value = res.data.rows
  }
})
</script>

<style lang="less" scoped></style>
