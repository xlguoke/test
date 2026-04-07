<template>
  <!-- 我的检测 -->
  <div class="flex flex-col flex-1 max-w-[500px] min-w-[300px] h-full">
    <div class="flex justify-between items-center text-[16px]">
      <span>{{ title }}</span>
      <a-space :size="12" class="font-[400]">
        <a href="javascript:void(0)" :style="{ color: activeTime === 'YEAR' ? '#1890ff' : 'inherit' }" @click="selectTime('YEAR')">
          本年
        </a>
        <a href="javascript:void(0)" :style="{ color: activeTime === 'MONTH' ? '#1890ff' : 'inherit' }" @click="selectTime('MONTH')">
          本月
        </a>
        <a href="javascript:void(0)" :style="{ color: activeTime === 'WEEK' ? '#1890ff' : 'inherit' }" @click="selectTime('WEEK')">
          本周
        </a>
      </a-space>
    </div>
    <div
      class="px-8 flex items-center justify-between my-3 h-[94px] dark:!bg-[var(--colorFillContent)] rounded-md"
      :style="{ backgroundColor: configData[type].bgColor }"
    >
      <div>
        <img width="22" height="22" :src="getPieImg(type)" class="block mb-2" />
        <div class="text-[16px]">
          {{ configData[type].text }}总数
        </div>
      </div>
      <div class="text-[32px] font-bold">
        <span v-if="configData[type].text === '检测'">{{ numberWithCommas(myTest.total) }}</span>
        <span v-else-if="configData[type].text === '审核'">{{ numberWithCommas(myAudit.total) }}</span>
        <span v-else-if="configData[type].text === '批准'">{{ numberWithCommas(myApprove.total) }}</span>
      </div>
    </div>
    <div class="flex-1 h-0">
      <echartBing
        :type="type"
        :data="getPieDataByType(type)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TimeType } from './api.ts'
import { ref } from 'vue'
import { configData, ConfigKey, getPersonWorkbenchesReportApprove, getPersonWorkbenchesReportAudit, getPersonWorkbenchesTask } from './api.ts'
import echartBing from './echartBing.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  totalText: {
    type: String,
    default: '总数',
  },
  type: {
    type: String as () => ConfigKey,
    default: ConfigKey.TEST,
  },
})

defineEmits(['updateData'])

// 定义数据接口
interface ReportData {
  total: number
  completed: number
  pending: number
}

interface PieChartData {
  completed: number
  pending: number
}

const myTest = ref<ReportData>({
  total: 0,
  completed: 0,
  pending: 0,
})

const myAudit = ref<ReportData>({
  total: 0,
  completed: 0,
  pending: 0,
})

const myApprove = ref<ReportData>({
  total: 0,
  completed: 0,
  pending: 0,
})

const testImg = new URL('~/assets/img/myTest.png', import.meta.url).href
const aduitImg = new URL('~/assets/img/myAudit.png', import.meta.url).href
const approveImg = new URL('~/assets/img/myApprove.png', import.meta.url).href
function getPieImg(type: ConfigKey) {
  switch (type) {
    case ConfigKey.TEST:
      return testImg
    case ConfigKey.AUDIT:
      return aduitImg
    case ConfigKey.APPROVE:
      return approveImg
    default:
      return ''
  }
}

function numberWithCommas(num: number) {
  if (!num)
    return '0'
  return num.toLocaleString()
}

// 根据类型获取饼图数据的计算函数
function getPieDataByType(type: ConfigKey): PieChartData {
  switch (type) {
    case ConfigKey.TEST:
      return {
        completed: myTest.value.completed,
        pending: myTest.value.pending,
      }
    case ConfigKey.AUDIT:
      return {
        completed: myAudit.value.completed,
        pending: myAudit.value.pending,
      }
    case ConfigKey.APPROVE:
      return {
        completed: myApprove.value.completed,
        pending: myApprove.value.pending,
      }
    default:
      return {
        completed: 0,
        pending: 0,
      }
  }
}

const activeTime = ref('YEAR')

watch(() => activeTime.value, () => {
  initData()
})

function selectTime(time: any) {
  activeTime.value = time
}

function initData() {
  Promise.all([
    getPersonWorkbenchesTask(activeTime.value as TimeType),
    getPersonWorkbenchesReportAudit(activeTime.value as TimeType),
    getPersonWorkbenchesReportApprove(activeTime.value as TimeType),
  ]).then((res) => {
    myTest.value.pending = res[0].data.value[0]
    myTest.value.completed = res[0].data.value[1]
    myTest.value.total = myTest.value.completed + myTest.value.pending
    myAudit.value.pending = res[1].data.value[0]
    myAudit.value.completed = res[1].data.value[1]
    myAudit.value.total = myAudit.value.completed + myAudit.value.pending
    myApprove.value.pending = res[2].data.value[0]
    myApprove.value.completed = res[2].data.value[1]
    myApprove.value.total = myApprove.value.completed + myApprove.value.pending
  })
}
initData()
</script>
