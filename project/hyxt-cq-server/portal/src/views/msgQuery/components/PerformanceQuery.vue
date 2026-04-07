<template>
  <a-tabs v-model:activeKey="activeName">
    <a-tab-pane key="0" tab="机构业绩">
      <PerformanceQueryUnit />
    </a-tab-pane>
    <!-- <a-tab-pane key="1" tab="人员业绩">
      <PerformanceQueryPersonnel />
    </a-tab-pane> -->
  </a-tabs>
</template>

<script setup lang="ts">
import { ref } from "vue"
import PerformanceQueryUnit from "./PerformanceQueryUnit.vue"
// import PerformanceQueryPersonnel from "./PerformanceQueryPersonnel.vue";

const activeName = ref<string>("0")
</script>

<style lang="less" scoped></style>
