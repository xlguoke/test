<template>
  <div class="flex flex-col h-full gap-60">
    <div class="flex flex-1 gap-60">
      <!-- 人员概况 -->
      <PersonCount class="flex-1"></PersonCount>
      <!-- 人员资质 -->
      <!-- <PersonCertificateCount class="flex-1"></PersonCertificateCount> -->
      <!-- 人员职称 -->
      <PersonTitle class="flex-1"></PersonTitle>

      <div class="flex-2"></div>

      <!-- 生产中心人员数量 -->
      <PersonCountChart class="flex-2"></PersonCountChart>
    </div>

    <div class="flex flex-1 gap-60 h-0">
      <!-- 学历构成 -->
      <PersonEducationCountChart class="flex-1"></PersonEducationCountChart>

      <!-- 试验检测工程师持证情况 -->
      <PersonCertificateCountChart class="flex-1"></PersonCertificateCountChart>

      <!-- 助理试验检测工程师持证情况 -->
      <!-- <AidPersonCertificateCountChart class="flex-1"></AidPersonCertificateCountChart> -->

      <div class="flex-2"></div>

      <!-- 月度绩效考核 -->
      <KpiRank class="flex-2"></KpiRank>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonCount from "./PersonCount.vue"
import PersonTitle from "./PersonTitle.vue"
import PersonCountChart from "./PersonCountChart.vue"
import PersonEducationCountChart from "./PersonEducationCountChart.vue"
import PersonCertificateCountChart from "./PersonCertificateCountChart.vue"
import KpiRank from "./KpiRank.vue"
</script>
