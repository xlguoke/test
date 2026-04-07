<template>
  <div class="flex flex-col h-full gap-60">
    <div class="flex flex-1 gap-60">
      <!-- 学历构成 -->
      <PersonEducationCountChart class="flex-1" />

      <!-- 试验检测工程师持证情况 -->
      <PersonCertificateCountChart class="flex-1" />

      <div class="flex-2"></div>

      <!-- 收样数量走势 -->
      <SampleCountChart class="flex-1" />

      <!-- 收样分类统计TOP5 -->
      <SampleClassifyRanking class="flex-1" />
    </div>

    <div class="flex flex-1 gap-60">
      <!-- 设备状态 -->
      <EquipmentStatus class="flex-1" />

      <!-- 设备外出 -->
      <EquipmentOut class="flex-1" />

      <div class="flex-2"></div>

      <!-- 养护室环境变化趋势 -->
      <RoomChangeTrend class="flex-1" />

      <!-- 样品检测完成数量统计 -->
      <TestFinishCountRanking class="flex-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SampleCountChart from "@/views/smartCockpit/sample/SampleCountChart.vue"
import SampleClassifyRanking from "@/views/smartCockpit/sample/SampleClassifyRanking.vue"
import RoomChangeTrend from "../environment/RoomChangeTrend.vue"
import EquipmentStatus from "./EquipmentStatus.vue"
import EquipmentOut from "./EquipmentOut.vue"
import TestFinishCountRanking from "./TestFinishCountRanking.vue"
import PersonEducationCountChart from "../humanResources/PersonEducationCountChart.vue"
import PersonCertificateCountChart from "../humanResources/PersonCertificateCountChart.vue"
</script>

<style lang="less" scoped></style>
