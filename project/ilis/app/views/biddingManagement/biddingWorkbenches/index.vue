<template>
  <IlisContainer
    app-id="biddingWorkbenches"
    :bordered="false"
    :body-style="{ padding: 0, background: 'var(--colorBgLayout)' }"
  >
    <div class="flex flex-col gap-2 h-full">
      <div :class="`${myCard} h-[45%]`">
        <BaseTitle class="mb-2">
          报告记录统计
        </BaseTitle>
        <div :class="`${myCardBody} gap-4 pt-3`">
          <!-- 我的检测 -->
          <reportDataBox title="我的检测" total-text="检测总数" :type="ConfigKey.TEST"></reportDataBox>
          <!-- 我的审核 -->
          <reportDataBox title="我的审核" total-text="审核总数" :type="ConfigKey.AUDIT"></reportDataBox>
          <!-- 我的批准 -->
          <reportDataBox title="我的批准" total-text="批准总数" :type="ConfigKey.APPROVE"></reportDataBox>
        </div>
      </div>

      <div class="flex gap-2 flex-1 h-0 box-border">
        <div :class="`${myCard} flex-1 h-full`">
          <BaseTitle class="mb-2">
            设备记录统计
            <template #right>
              <a-space :size="12" class="font-[400]">
                <a href="javascript:void(0)" :style="{ color: activeTime === 'ALL' ? '#1890ff' : 'inherit' }" @click="setTime(TimeType.ALL)">
                  全部
                </a>
                <a href="javascript:void(0)" :style="{ color: activeTime === 'PRE_1_YEAR' ? '#1890ff' : 'inherit' }" @click="setTime(TimeType.PRE_1_YEAR)">
                  近一年
                </a>
              </a-space>
            </template>
          </BaseTitle>
          <div :class="`${myCardBody} gap-12`">
            <echartBar class="chart-item" :time="activeTime" chart-type="rent" title="总借用设备次数" :icon="icon1" />
            <echartBar class="chart-item" :time="activeTime" chart-type="use" title="总使用设备次数" :icon="icon2" />
          </div>
        </div>

        <!-- 参与项目统计 -->
        <InvolvedProjectStatistics />
      </div>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { ConfigKey, TimeType } from './api'
import echartBar from './echartBar.vue'
import InvolvedProjectStatistics from './InvolvedProjectStatistics.vue'
import reportDataBox from './reportDataBox.vue'

const myCard = 'rounded-md bg-white p-4 flex flex-col dark:!bg-[var(--colorBgContainer)]'
const myCardBody = 'flex-1 h-0 flex justify-between box-border border-t border-gray-100 dark:!border-[var(--colorBorder)]'

const icon1 = new URL('~/assets/img/eq-jieyong.png', import.meta.url).href
const icon2 = new URL('~/assets/img/eq-shiyong.png', import.meta.url).href

const activeTime = ref<TimeType>(TimeType.ALL)
function setTime(time: TimeType) {
  activeTime.value = time
}
</script>

<style scoped>
:deep(.ant-btn){
  padding: 4px 8px !important;
}
</style>
