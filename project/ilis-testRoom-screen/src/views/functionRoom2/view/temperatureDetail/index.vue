<template>
  <div>
    <TemperatureDetailInfo></TemperatureDetailInfo>
    <TemperatureDetailDevice></TemperatureDetailDevice>
    <!-- <TemperatureDetailChart></TemperatureDetailChart> -->
  </div>
</template>
<script lang="ts" setup>
// import TemperatureDetailChart from "../components/TemperatureDetailChart.vue"
import TemperatureDetailDevice from "./components/TemperatureDetailDevice.vue"
import TemperatureDetailInfo from "./components/TemperatureDetailInfo.vue"
</script>
<style lang="less" scoped></style>
