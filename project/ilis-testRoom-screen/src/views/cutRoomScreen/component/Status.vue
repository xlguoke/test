<template>
  <span class="status" :style="{ '--statusColor': getBgColor(status) }">{{ status }}</span>
</template>

<script setup lang="ts">
import { StatusType } from "@/views/deviceSmallScreen/Home/DeviceEntity"

defineProps<{
  status: StatusType
}>()
function getBgColor(str: string) {
  switch (str) {
    case "正常":
      return "#24b276"
    case "已停用":
    case "维修":
      return "#ffa800"
    case "报废":
      return "#ff0000"
    default:
      return "#24b276"
  }
}
</script>

<style lang="less" scoped>
.status {
  position: relative;
  font-size: 16px;
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -20px;
    transform: translateY(-50%);
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--statusColor);
    box-shadow: 0px 0px 6px 0px var(--statusColor);
  }
}
</style>
