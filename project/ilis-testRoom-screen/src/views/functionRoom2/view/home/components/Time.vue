<template>
  <div class="time">
    <div class="currentTime">{{ currentTime.slice(11, 16) }}</div>
    <div class="date">
      <span class="day">{{ `${currentTime.slice(5, 7)}月${currentTime.slice(8, 10)}日` }}</span>
      <span class="week">{{ getCurrentDayOfWeek() }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { formatDate } from "@/utils/utils"
import { ref } from "vue"

const currentTime = ref(formatDate(new Date(), 2))
setInterval(() => {
  currentTime.value = formatDate(new Date(), 2)
}, 1000)
/**
 * 获取当前星期几
 */
function getCurrentDayOfWeek() {
  const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
  const today = new Date()
  const dayIndex = today.getDay()
  return daysOfWeek[dayIndex]
}
</script>
<style lang="less" scoped>
.time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.currentTime {
  font-size: 0.5rem;
  line-height: 0.58rem;
  font-weight: bold;
}
.date {
  .day {
    margin-right: 0.24rem;
  }
}
</style>
