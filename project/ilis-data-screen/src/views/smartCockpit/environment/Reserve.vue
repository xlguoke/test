<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle v-model:checked="filterPatrolVal" :options="filterDayOptions" @on-select="init">
        试验室温湿度预约
      </FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="souceData">
      <template #3="{ item }">
        <div>
          <div>{{ dayjs(item.start_date).format("YYYY-MM-DD HH:mm:ss") }} ~</div>
          <div>{{ dayjs(item.end_date).format("YYYY-MM-DD HH:mm:ss") }}</div>
        </div>
      </template>
      <template #4="{ item }">
        <div>
          <div>温度：{{ item.tem }}℃ ~ {{ item.maxTem }}℃</div>
          <div>湿度：{{ item.hum }}%RH ~ {{ item.maxHum }}%RH</div>
        </div>
      </template>
    </DataTable>
  </FrameBox>
</template>
<script setup lang="ts">
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import request from "@/utils/request"
import dayjs from "dayjs"
const filterDayOptions = [
  { label: "今日", value: "TODAY" },
  // { label: "明日", value: "TOMORROW" },
  { label: "近一周", value: "SEVEN_DAYS" }
]
const filterPatrolVal = ref("SEVEN_DAYS")
const loading = ref(false)
const columns = ref<DataTableHead[]>([
  { title: "功能室", key: "name", align: "left" },
  { title: "预约人员", key: "realname", width: "16%" },
  { title: "预约时间段  ", key: "3", align: "left", width: "35%" },
  { title: "目标温湿度", key: "4", align: "left", width: "35%" }
])
const souceData = ref<any[]>([])
const init = useAutoRequestHooks({
  loading: loading,
  api: (q) =>
    request({
      url: `/api/humiture/dashbord/res/${q}`,
      method: "get",
      query: filterPatrolVal
    }),
  query: filterPatrolVal,
  setData: (res) => {
    souceData.value = res.data
  }
})
</script>
