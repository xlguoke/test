<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle>留样信息</FrameTitle>
    </template>
    <DataTable :loading="loading" :columns="columns" :datas="datas">
      <template #numBottom="{ item }">
        <span :class="{ 'text-[#FF7575]': item.unValid }">{{ item.numBottom || "--" }}</span>
      </template>
    </DataTable>
  </FrameBox>
</template>

<script setup lang="ts">
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import DataTable, { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import { ref } from "vue"
import request from "@/utils/request.js"
import { useDateFormat } from "@vueuse/core"

// 试件龄期管理
const columns = ref<DataTableHead[]>([
  { title: "样品名称", key: "name", align: "left" },
  { title: "样品编号", key: "sampleCode", align: "left" },
  { title: "留样地点", key: "location" },
  { title: "留样到期日期", key: "expirationDate" }
])
const datas = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const now = useDateFormat(new Date(), "YYYY-MM-DD").value
const baseApi =
  "https://fdl.scsgjc.com:11443/webroot/service/publish/13b1777b-7c8d-4cd3-8f31-ad7f769ffdfe"

// 列表
useAutoRequestHooks({
  loading,
  api: () =>
    request({
      url: `${baseApi}/keep-sample`,
      method: "get",
      headers: {
        Authorization: "AppCode d10e7546-c635-4d9c-a751-84d62a28f245"
      }
    }),
  setData: (res) => {
    console.log(res)
    res.data.forEach((d) => {
      d.expirationDate = d.expirationDate ? d.expirationDate : "--"
      // 是否超期
      if (d.expirationDate && new Date(d.expirationDate).getTime() <= new Date(now).getTime()) {
        d.unValid = true
      }
    })
    total.value = res.totalNum
    datas.value = res.data || []
  }
})
</script>

<style></style>
