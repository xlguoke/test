<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>检定不合格</FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="souceData" />
  </FrameBox>
</template>
<script setup lang="ts">
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import dayjs from "dayjs"

const loading = ref(false)
const columns = ref<DataTableHead[]>([
  { title: "设备名称（编号）", key: "name", align: "left" },
  { title: "检定日期", key: "time", align: "left" }
])
const souceData = ref<any[]>([])
useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/eq/dashboard/check/unqualified",
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    souceData.value = datasource.map((i: any) => ({
      name: `${i.name}${i.equipmentSn ? `（${i.equipmentSn}）` : ""}`,
      time: dayjs(i.checkTime).format("YYYY-MM-DD")
    }))
  }
})
</script>
