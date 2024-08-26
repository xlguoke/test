<script setup lang='ts'>
import { ref } from 'vue'
import { useDateFormat, useNow } from '@vueuse/core'
import { Lunar } from 'lunar-javascript'
import { storeToRefs } from 'pinia'
import permissions from '@/stores/permissions'

const { userInfo } = storeToRefs(permissions())

const formatDate = useDateFormat(useNow(), 'YYYY年MM月DD日 dddd')
const d = Lunar.fromDate(new Date())
const lunarDate = ref(`${d.getMonthInChinese()}月${d.getDayInChinese()}`)
const ganzi = ref(`${d.getYearInGanZhi()}${d.getMonthInGanZhi()}${d.getDayInChinese()}`)
</script>

<template>
  <a-card class="user-card">
    <div class="py-3 flex justify-between items-center">
      <div>
        <span class="mr-3 text-xl font-bold">{{ userInfo.username }}</span>
        您好！祝您今天工作顺利！
        <p class="mt-2 mb-0">
          {{ userInfo.title }}
        </p>
      </div>
      <div class="text-right">
        <p class="my-0">
          {{ formatDate }}
        </p>
        <p class="my-0">
          {{ lunarDate }}
          【{{ ganzi }}】
        </p>
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.user-card {
  background: url('@/assets/images/bg-1.png') no-repeat 0 0/100% 100%;
}
.user-card :deep(.ant-card-body) {
  padding: 8px 24px;
}
</style>
