<template>
  <div class="flex h-full flex-col gap-50">
    <div class="flex flex-1 h-0 gap-50">
      <div class="flex-[1.5] flex gap-50">
        <!-- 人员统计 -->
        <PersonnelStatistics class="flex-1" />

        <!-- 车辆统计 -->
        <CarStatistics class="flex-1" />
      </div>

      <div class="flex-1"></div>

      <div class="flex-[1.5] flex gap-50">
        <!-- 会议室管理 -->
        <MeetingRoom class="flex-1" />

        <!-- 会议状态 -->
        <MeetingStatus class="flex-1" />
      </div>
    </div>

    <div class="flex flex-1 h-0 gap-50">
      <div class="flex gap-50 flex-[1.5]">
        <!-- 能耗分布 -->
        <EnergyDistribution class="flex-[1.5]" />

        <!-- 用电趋势 -->
        <UseElectricChart class="flex-1" />

        <!-- 用水趋势 -->
        <UseWaterChart class="flex-1" />
      </div>

      <div class="flex-1"></div>

      <!-- 视频实时监控 -->
      <VideoMonitoring class="flex-[1.5]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import VideoMonitoring from "./VideoMonitoring.vue"
import PersonnelStatistics from "./PersonnelStatistics.vue"
import CarStatistics from "./CarStatistics.vue"
import MeetingRoom from "./MeetingRoom.vue"
import MeetingStatus from "./MeetingStatus.vue"
import EnergyDistribution from "./EnergyDistribution.vue"
import UseElectricChart from "./UseElectricChart.vue"
import UseWaterChart from "./UseWaterChart.vue"
</script>

<style lang="less" scoped></style>
