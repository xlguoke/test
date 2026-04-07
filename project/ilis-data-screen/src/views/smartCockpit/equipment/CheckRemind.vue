<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>检校提醒</FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="souceData">
      <template #next="{ item }">
        <span :class="`text-[${getFormat(item.days)?.color}]`">
          {{ formatDate(item.next) }}
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
  { title: "检校类型", key: "type", align: "left", width: "2rem" },
  { title: "下次检校日期", key: "next", align: "left", width: "3rem" }
])
const souceData = ref<any[]>([])
useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/eq/check/remind`,
      method: "get"
    }),
  query: ref({}),
  setData: (res) => {
    const datasource = res.data
    souceData.value = datasource.map((i: any) => ({
      name: `${i.name}${i.equipmentSn ? `（${i.equipmentSn}）` : ""}`,
      type: i.checkType,
      next: i.nextCheckDate,
      days: i.dayNum
    }))
  }
})

function getFormat(days: number) {
  if (!days) {
    return {
      color: "#B4C0CC",
      text: ""
    }
  }
  if (days > 0) {
    return {
      color: "#fff",
      text: `${days}天到期`
    }
  }
  if (days < 0) {
    return {
      color: "#FF7575",
      text: `已超期${Math.abs(days)}天`
    }
  }
  if (days === 0) {
    return {
      color: "#FFD15C",
      text: "今日到期"
    }
  }
}
</script>
