<template>
  <div class="flex flex-col h-full gap-60">
    <div class="flex flex-1 gap-60 h-0">
      <!-- 设备统计 -->
      <EquipmentCount class="flex-1"></EquipmentCount>
      <div class="flex-1"></div>

      <div class="flex-1 flex gap-60 h-full">
        <!-- 检校数量（近3月） -->
        <CheckCountChart class="flex-1"></CheckCountChart>

        <!-- 硬度室 -->
        <Room class="flex-1 h-full"></Room>
      </div>
    </div>

    <div class="flex flex-1 gap-60 h-0">
      <div class="flex-1 flex gap-60">
        <!-- 设备使用次数TOP5 -->
        <UseCountRank class="flex-1"></UseCountRank>

        <!-- 设备维修频率比TOP5-->
        <UseCountChart class="flex-1"></UseCountChart>
      </div>

      <div class="flex-1"></div>

      <div class="flex-1 flex gap-60 h-full">
        <!-- 外出超期 -->
        <CheckOutDate class="flex-1 h-full"></CheckOutDate>

        <!-- 检校提醒 -->
        <CheckRemind class="flex-1 h-full"></CheckRemind>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EquipmentCount from "./EquipmentCount.vue"
import CheckCountChart from "./CheckCountChart.vue"
import CheckOutDate from "./CheckOutDate.vue"
import CheckRemind from "./CheckRemind.vue"
import UseCountRank from "./UseCountRank.vue"
import UseCountChart from "./UseCountChart.vue"
import Room from "./Room.vue"
</script>

<style lang="less" scoped></style>
