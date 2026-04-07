<template>
  <FrameBox class="flex-1" :loading="loading">
    <template #title>
      <FrameTitle>试件龄期管理</FrameTitle>
    </template>
    <div class="h-full flex flex-col">
      <ul class="flex justify-around !mb-0 !mt-30">
        <li v-for="(d, i) in statisticsDatas" :key="i" @click="clickStatistics(i)">
          <FrameIcon
            :icon="''"
            :class="`w-158 h-158 ${activeInd === i ? 'active' : 'un-animation'}`"
          >
            <span class="text-[0.52rem] text-white font-bold">{{ d.numMain }}</span>
          </FrameIcon>
          <div class="mt-20 text-center">{{ d.name }}</div>
        </li>
      </ul>
      <div class="flex-1 h-0">
        <DataTable :loading="loading" :columns="columns" :datas="datas" :on-end="changeStatistics">
          <template #numSupplement="{ item }">
            {{ showNumSupplement(item.numSupplement) }}
          </template>
        </DataTable>
      </div>
    </div>
  </FrameBox>
</template>

<script setup lang="ts">
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import DataTable, { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import { computed, onMounted, ref } from "vue"
import request from "@/utils/request.js"

const statisticsKeys = ["TODAY", "WITHIN_THREE_DAYS", "OVERDUE"]
const statisticsDatas = ref<any>([])
const activeInd = ref(0)
const activeKey = computed(() => statisticsKeys[activeInd.value])

// 试件龄期管理
const columns = ref<DataTableHead[]>([
  { title: "样品名称", key: "name", align: "left" },
  { title: "试件编号", key: "numMain", align: "left" },
  { title: "龄期状态", key: "numSupplement" }
])
const datas = ref<any[]>([])
const loading = ref(false)
// 龄期状态显示
function showNumSupplement(num: number) {
  const hour = num % 24
  const day = (num - hour) / 24
  if (num < 0) {
    return `已过期${day ? `${-day}天` : ""}${-hour}小时`
  }
  return `${day ? `${day}天` : ""}${hour}小时后过期`
}

// 获取数据：暂不考虑分页，大屏十分钟刷新一次数据，滚动不会超过200条数据
async function getDatas() {
  try {
    loading.value = true
    const res = await request({
      url: `api/dashboard/sgjc/sample-acceptance/sample/aging/remind`,
      method: "get",
      params: {
        page: 1,
        size: 500,
        period: activeKey.value
      }
    })
    loading.value = false
    datas.value = res.rows
  } catch (e) {
    loading.value = false
    datas.value = []
  }
}

// 切换龄期统计
function clickStatistics(ind: number) {
  activeInd.value = ind
  getDatas()
}
function changeStatistics() {
  if (activeInd.value === statisticsKeys.length - 1) {
    activeInd.value = 0
  } else {
    activeInd.value++
  }
  getDatas()
}

const isFirst = ref(true)
// 龄期统计
useAutoRequestHooks({
  loading,
  api: () =>
    request({
      url: `api/dashboard/sgjc/sample-acceptance/sample/aging/statistics`,
      method: "get"
    }),
  setData: (res) => {
    // 借用hooks中的定时刷新，更新列表数据
    if (!isFirst.value) {
      activeInd.value = 0
      getDatas()
    }
    statisticsDatas.value = res.data || []
    isFirst.value = false
  }
})

onMounted(() => {
  getDatas()
})
</script>

<style></style>
