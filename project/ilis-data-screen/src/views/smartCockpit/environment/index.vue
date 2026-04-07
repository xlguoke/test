<template>
  <div class="flex h-full gap-60">
    <div class="flex flex-[1.2] flex-col gap-60 h-full">
      <div class="flex flex-1 gap-60">
        <!-- 养护箱实时环境 -->
        <RoomRealTimeData class="flex-2"></RoomRealTimeData>
        <!-- 养护室环境变化趋势 -->
        <RoomChangeTrend class="flex-2" />
      </div>
      <!-- 试验温湿度记录 -->
      <TempRecord class="flex-1 h-0"></TempRecord>
    </div>

    <div class="flex-1"></div>

    <div class="flex flex-col flex-1 gap-60 h-full">
      <div class="flex-1 flex gap-60 h-0">
        <!-- 环境设备实时在线情况 -->
        <RoomOnlineSituation class="flex-1"></RoomOnlineSituation>
        <!-- 试验室温湿度预约 -->
        <Reserve class="flex-1" />
      </div>
      <div class="h-0 flex-1">
        <!-- 温湿度自动采集 -->
        <CheckBook class="flex-1 h-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RoomRealTimeData from "./RoomRealTimeData.vue"
import RoomOnlineSituation from "./RoomOnlineSituation.vue"
import TempRecord from "./TempRecord.vue"
import Reserve from "./Reserve.vue"
import CheckBook from "./CheckBook.vue"
import RoomChangeTrend from "./RoomChangeTrend.vue"
</script>
