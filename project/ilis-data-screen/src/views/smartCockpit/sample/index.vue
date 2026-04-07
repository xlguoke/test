<template>
  <div class="flex flex-col h-full gap-60">
    <div class="flex flex-1 h-0 gap-60">
      <!-- 委托数量走势 -->
      <ConsignCountChart class="flex-1" />

      <!-- 收样数量走势 -->
      <SampleCountChart class="flex-1" />

      <div class="flex-2"></div>

      <div class="flex-2 flex gap-60">
        <!-- 样品流转 -->
        <SampleFlowChart class="flex-1" />

        <!-- 留样信息 -->
        <ReservedSampleWait class="flex-1" />
      </div>
    </div>

    <div class="flex flex-1 h-0 gap-60">
      <!-- 收样增长比TOP5 -->
      <ConsignSourceRanking class="flex-1" />

      <!-- 样品分类统计TOP5 -->
      <SampleClassifyRanking class="flex-1" />

      <div class="flex-2"></div>

      <SampleRoom class="flex-2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SampleRoom from "./SampleRoom.vue"
import ConsignCountChart from "./ConsignCountChart.vue"
import SampleCountChart from "./SampleCountChart.vue"
import ConsignSourceRanking from "./ConsignSourceRanking.vue"
import SampleClassifyRanking from "./SampleClassifyRanking.vue"
import SampleFlowChart from "./SampleFlowChart.vue"
import ReservedSampleWait from "./ReservedSampleWait.vue"
</script>

<style lang="less" scoped></style>
