<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>外出超期</FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="souceData">
      <template #returnTime="{ item }">
        <span
          :class="{
            'text-[#FF7575]': item.returnTime < Date.now()
          }"
        >
          {{ formatDate(item.returnTime) }}
        </span>
      </template>
    </DataTable>
  </FrameBox>
</template>
<script setup lang="ts">
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { ref } from "vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import request from "@/utils/request.js"
import { formatDate } from "@/utils/utils"
import { DataPlatConfig } from "@/api/smartCockpit.test.api"

const loading = ref(false)
const columns = ref<DataTableHead[]>([
  { title: "设备名称（编号）", key: "name", align: "left" },
  { title: "外出类型", key: "type", align: "left", width: "2rem" },
  { title: "预计归还日期", key: "returnTime", align: "left", width: "3rem" }
])
const souceData = ref<any[]>([])
const typeMap = ref<any>({
  test: "检测",
  send: "送检"
})

useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/eq/egress/overdue`,
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    souceData.value = datasource.map((i: any) => ({
      name: `${i.name}${i.equipmentSn ? `（${i.equipmentSn}）` : ""}`,
      type: typeMap.value[i.type],
      returnTime: i.returnTime
    }))
  }
})
</script>
