<template>
  <div class="device-task">
    <div class="line">
      <div class="label">申请人</div>
      <div class="value">{{ data?.createBy }}</div>
    </div>
    <div class="line">
      <div class="label">申请时间</div>
      <div class="value">{{ (data?.createDate && formatDate(data?.createDate)) || "--" }}</div>
    </div>
    <div class="line">
      <div class="label">维修状态</div>
      <div class="value">{{ MaintanceStatusDict.getLabelByKey(data?.status as string) }}</div>
    </div>
    <div class="line">
      <div class="label">故障现象</div>
      <div class="value">{{ data?.phenomenon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from "@/utils/utils"
import { MaintanceEntity, MaintanceStatusDict } from ".."

defineProps<{
  data: MaintanceEntity
}>()
</script>

<style lang="less" scoped>
.device-task {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 14px;
  color: #bceaff;
  background: linear-gradient(180deg, rgba(4, 161, 207, 0.5) 0%, rgba(0, 102, 236, 0.5) 100%);
  .line {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.2rem;
    .label {
      width: 1rem;
    }
    .value {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }
  }
}
</style>
