<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle>
        月度绩效考核
        <template #filter-before>
          <a-select
            v-model:value="query.department"
            placeholder="全部"
            class="w-420 mr-[0.32rem]! h-66! customSelectClass"
            popup-class-name="commonPopupClass"
            :options="selectOptions"
            @change="handleDepartmentChange"
          ></a-select>
        </template>
        <template #filter-after>
          <a-range-picker
            v-model:value="date"
            value-format="YYYY-MM-DD"
            disabled
            class="ml-[0.32rem]! h-66! customDateClass"
          />
        </template>
      </FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="souceData"></DataTable>
  </FrameBox>
</template>
<script setup lang="ts">
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref } from "vue"
import request from "@/utils/request.js"
import { DataPlatConfig } from "@/api/smartCockpit.test.api"

const loading = ref(false)

const columns = ref<DataTableHead[]>([
  { title: "检测人员", key: "testPerson", align: "left" },
  { title: "检测小组", key: "testGroup", align: "left" },
  { title: "绩效得分", key: "score", align: "left" },
  { title: "排名", key: "rank", align: "left" }
])

const selectOptions = ref<
  {
    label: string
    value: string
    startDate: string
    endDate: string
  }[]
>([])

const souceData = ref<any[]>([])

const date = ref<string[]>([])

async function getDepartmentData() {
  const res = await request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/department-cycle`,
    method: "get"
  })
  selectOptions.value = res?.data?.map((i) => {
    return {
      label: i.department,
      value: i.department,
      startDate: i.startDate,
      endDate: i.endDate
    }
  })

  if (selectOptions.value.length > 0) {
    const defaultItem = selectOptions.value[0]
    query.value.department = defaultItem.value
    query.value.startDate = defaultItem.startDate
    query.value.endDate = defaultItem.endDate
    date.value = [defaultItem.startDate || "", defaultItem.endDate || ""]

    init()
  }
}
getDepartmentData()

const query = ref<{
  startDate?: string
  endDate?: string
  department?: string
}>({})

const init = useAutoRequestHooks({
  loading: loading,
  immediate: false,
  api: (q) =>
    request({
      url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/performance-appraisal`,
      method: "get",
      params: q
    }),
  query,
  setData: (res) => {
    console.log(res)

    const sortedData = [...res.data].sort((a, b) => b.score - a.score)
    let currentRank = 1
    let prevScore = null

    sortedData.forEach((item) => {
      if (prevScore === null) {
        item.rank = currentRank
      } else if (item.score === prevScore) {
        item.rank = currentRank
      } else {
        currentRank++
        item.rank = currentRank
      }
      prevScore = item.score
    })

    souceData.value = sortedData
  }
})

function handleDepartmentChange(val) {
  const item = selectOptions.value.find((i) => i.value === val)

  if (item) {
    query.value.department = item.value
    query.value.startDate = item.startDate
    query.value.endDate = item.endDate
    date.value = [item.startDate || "", item.endDate || ""]

    init()
  }
}
</script>
