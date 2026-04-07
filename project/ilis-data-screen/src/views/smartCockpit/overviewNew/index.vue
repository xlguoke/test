<template>
  <div class="flex h-full gap-60">
    <div class="flex flex-1 flex-col gap-60 h-full">
      <div class="flex flex-1 gap-60 h-0">
        <!-- 基桩检测统计 -->
        <PileTestData class="flex-2"></PileTestData>
        <!-- 隧道预警统计 -->
        <!-- <TunnelWarningData class="flex-2" /> -->
      </div>
      <div class="flex flex-1 gap-60 h-0">
        <!-- 隧道预警统计 -->
        <TunnelWarningData class="flex-1 w-0" />
        <!-- 工地试验检测 -->
        <ConstructionTestChart class="flex-1 w-0" />
      </div>
    </div>

    <div class="flex-1">
      <CompanyVideoArea />
    </div>

    <div class="flex flex-col flex-1 gap-60 h-full">
      <div class="flex-1 flex gap-60 h-0">
        <!-- 母体试验室告警 -->
        <MotherLabWarningData class="flex-1"></MotherLabWarningData>
        <!-- 工地试验室预警 -->
        <ConstructionLabWarningData class="flex-1" />
      </div>
      <div class="flex flex-1 gap-60 h-0">
        <!-- 飞检实体工程 -->
        <FlyCheckProjectData class="flex-1 h-full" />
        <!-- 工地试验室检查 -->
        <ConstructionLabCheckData class="flex-1 h-full" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import CompanyVideoArea from "./CompanyVideoArea.vue"
import ConstructionLabCheckData from "./ConstructionLabCheckData.vue"
import ConstructionLabWarningData from "./ConstructionLabWarningData.vue"
import ConstructionTestChart from "./ConstructionTestChart.vue"
import FlyCheckProjectData from "./FlyCheckProjectData.vue"
import MotherLabWarningData from "./MotherLabWarningData.vue"
import PileTestData from "./PileTestData.vue"
import TunnelWarningData from "./TunnelWarningData.vue"
</script>
<style></style>
