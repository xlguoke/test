<template>
  <div class="rounded-md bg-white p-4 h-full w-[38%] dark:!bg-[var(--colorBgContainer)]">
    <a-spin :spinning="loading">
      <BaseTitle class="mb-2">
        参与项目统计
        <template #right>
          <a-space :size="12" class="font-[400]">
            <a href="javascript:void(0)" :style="{ color: activeTime === 'ALL' ? '#1890ff' : 'inherit' }" @click="setTime(TimeType.ALL)">
              全部
            </a>
            <a
              href="javascript:void(0)"
              :style="{ color: activeTime === 'PRE_1_YEAR' ? '#1890ff' : 'inherit' }"
              @click="setTime(TimeType.PRE_1_YEAR)"
            >
              近一年
            </a>
          </a-space>
        </template>
      </BaseTitle>
      <div class="flex flex-col flex-1 h-0 box-border border-t border-gray-100 dark:!border-[var(--colorBorder)]">
        <div class="flex items-center justify-between px-8 my-4 rounded-md bg-[#F7FAFF] dark:!bg-[var(--colorFillContent)] leading-[80px]">
          <div class="flex items-center text-[16px]">
            <img :src="icon" class="w-6 h-6 mr-1">
            参与项目总数
          </div>
          <span class="text-[24px] font-bold">{{ numberWithCommas(statisticsList.length) }}</span>
        </div>
        <ul class="flex px-1 text-[#777] text-[16px] leading-[30px]">
          <li class="w-[80px] text-center">
            排名
          </li>
          <li class="flex-1">
            项目名称
          </li>
          <li class="td w-[120px]">
            参与任务总数
          </li>
          <li class="td w-[130px]">
            参与任务完成数
          </li>
        </ul>
        <ul class="flex-1 h-0 overflow-y-auto text-sm">
          <li v-for="(item, i) in statisticsList" :key="i" class="flex mt-4 leading-[22px] px-1">
            <p :class="`w-[80px] text-center color-${i} ${i < 3 ? 'font-bold' : ''}`">
              <span>TOP</span>
              {{ Number(i) + 1 }}
            </p>
            <p class="flex-1">
              {{ item.projectName || '' }}
            </p>
            <p class="td w-[120px]">
              {{ item.total || 0 }}
            </p>
            <p class="td w-[130px]">
              {{ item.completeTotal || 0 }}
            </p>
          </li>
        </ul>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { getInvolvedProjectStatistics, TimeType } from './api'

const icon = new URL('~/assets/img/icon-1.png', import.meta.url).href

const loading = ref(false)
const activeTime = ref<TimeType>(TimeType.ALL)
function setTime(time: TimeType) {
  activeTime.value = time
  getStatisticsList()
}

const statisticsList = ref<{
  projectName: string
  total: number
  completeTotal: number
}[]>([])

async function getStatisticsList() {
  try {
    loading.value = true
    const { data } = await getInvolvedProjectStatistics(activeTime.value)
    statisticsList.value = data || []
  }
  catch (error) {
    console.error(error)
    statisticsList.value = []
  }
  finally {
    loading.value = false
  }
}

function numberWithCommas(num: number) {
  if (!num)
    return '0'
  return num.toLocaleString()
}

onMounted(() => {
  getStatisticsList()
})
</script>

<style scoped>
.td {
  text-align: center;
}
.color-0 {
  color: #FFBD08;
}
.color-1 {
  color: #B5C1D1;
}
.color-2 {
  color: #FF7F00;
}
p{
  word-break: break-all;
}
:deep(.ant-spin-nested-loading),
:deep(.ant-spin-container) {
  height: 100%;
}
:deep(.ant-spin-container){
  display: flex;
  flex-direction: column;
}
</style>
