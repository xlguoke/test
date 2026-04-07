<template>
  <div class="device-info">
    <div class="title">
      <span class="t">{{ data?.name }}{{ data?.equipmentSn && `（${data?.equipmentSn}）` }}</span>
      <Status :status="data?.status"></Status>
    </div>
    <div class="desc">
      <div class="line">
        <div class="label">规格型号</div>
        <div class="value">{{ data?.standard }}</div>
      </div>
      <div class="line">
        <div class="label">设备保管人</div>
        <div class="value">{{ data?.keeperName }}</div>
      </div>
      <div class="line">
        <div class="label">距下次检校</div>
        <div class="value">{{ getDays(data.nextCheckDate) }}</div>
      </div>
      <div class="line">
        <div class="label">生产厂家</div>
        <div class="value">{{ data?.factory }}</div>
      </div>
      <div class="line">
        <div class="label">厂家技术支持电话</div>
        <div class="value">{{ data?.factorySupportTel }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeviceEntity } from "@/views/deviceSmallScreen/Home/DeviceEntity"

import Status from "./Status.vue"

defineProps<{
  data: DeviceEntity
}>()

/**
 * 获取当前时间到传入时间的天数
 */
function getDays(date: string | number) {
  if (!date) return ""
  const now = new Date()
  const targetDate = new Date(date)
  const timeDifference = targetDate.getTime() - now.getTime()
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
  return daysDifference > 0 ? `${daysDifference}天` : 0
}
</script>

<style lang="less" scoped>
.device-info {
  padding: 0 12px;
  .title {
    display: flex;
    justify-content: space-between;
    gap: 0.3rem;
    padding-bottom: 14px;
    font-size: 16px;
    text-shadow: 0px 0px 2px #3d91ff;
    background-image: url("@/assets/images/cutRoomScreen/borderStart.svg"),
      url("@/assets/images/cutRoomScreen/border.svg"),
      url("@/assets/images/cutRoomScreen/rectangle.svg");
    background-repeat: no-repeat;
    background-position: bottom left, bottom left, bottom right;
    background-size: auto, calc(100% - 20px), auto;

    .t {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .desc {
    padding: 16px 0;
    .line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      & + .line {
        margin-top: 12px;
      }
      gap: 0.2rem;
      .label {
        width: 1.2rem;
        color: #355ea5;
        font-size: 14px;
      }
      .value {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: right;
        color: #eef5ff;
        text-shadow: 0px 0px 6px #0066ec;
        font-size: 14px;
      }
    }
  }
}
</style>
