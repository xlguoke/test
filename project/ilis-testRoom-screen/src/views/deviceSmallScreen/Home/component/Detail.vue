<template>
  <div class="detail-main">
    <div class="title">
      <div class="name">{{ data.name }}（{{ data.equipmentSn }}）</div>
      <div class="status-box">
        设备状态
        <span class="status" :style="{ '--statusColor': getBgColor(data.status) }">
          {{ data.status }}
        </span>
      </div>
    </div>
    <div class="content">
      <div class="line">
        <div class="label">规格型号</div>
        <div class="value">{{ data.standard }}</div>
      </div>
      <div class="line">
        <div class="label">量程</div>
        <div class="value">{{ data.eqRange }}</div>
      </div>
      <div class="line">
        <div class="label">精度</div>
        <div class="value">{{ data.accuracy }}</div>
      </div>
      <div class="line">
        <div class="label">设备保管人</div>
        <div class="value">{{ data.keeperName }}</div>
      </div>
      <div class="line">
        <div class="label">前次校验日期</div>
        <div class="value">
          {{ (data.preCheckDate && formatDate(data.preCheckDate)) || "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">下次校验日期</div>
        <div class="value">
          {{ (data.nextCheckDate && formatDate(data.nextCheckDate)) || "--" }}
        </div>
      </div>
      <div class="line">
        <div class="label">生产厂家</div>
        <div class="value">{{ data.factory }}</div>
      </div>
      <div class="line">
        <div class="label">厂家技术支持电话</div>
        <div class="value">{{ data.factorySupportTel }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDate } from "@/utils/utils"
import { DeviceEntity } from "../DeviceEntity"

defineProps<{
  data: DeviceEntity
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
.detail-main {
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(234deg, rgba(255, 255, 255, 0.02) 22%, rgba(255, 255, 255, 0) 93%);
  border: 2px solid #1a438f;
  padding: 0 66px;
  .title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 0;
    color: #eef5ff;
    font-size: 36px;
    text-align: center;
    background-image: linear-gradient(
      270deg,
      rgba(0, 102, 236, 0) 0%,
      #0066ec 50%,
      rgba(0, 102, 236, 0) 100%
    );
    background-repeat: no-repeat;
    background-position: bottom;
    background-size: 100% 2px;
    .status-box {
      font-size: 28px;
    }
    .status {
      position: relative;
      margin-left: 48px;
      &::before {
        content: "";
        position: absolute;
        top: 50%;
        left: -20px;
        transform: translateY(-50%);
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: var(--statusColor);
      }
    }
  }
  .content {
    padding-top: 24px;
    padding-bottom: 24px;
    .line {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      font-size: 28px;
      & + .line {
        margin-top: 15px;
      }
      .label {
        color: #355ea5;
        width: 240px;
      }
      .value {
        flex: 1;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
