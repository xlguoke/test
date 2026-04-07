<template>
  <div class="device-task">
    <div class="l">
      <div class="line">
        <div class="label">样品编号</div>
        <div class="value">{{ data?.testObjectCode || "--" }}</div>
      </div>
      <div class="line">
        <div class="label">试验人员</div>
        <div class="value">{{ data?.testUser || "--" }}</div>
      </div>
      <div class="line">
        <div class="label">任务开始时间</div>
        <div class="value">{{ (data?.taskStart && formatDate(data?.taskStart, 2)) || "--" }}</div>
      </div>
      <div class="line">
        <div class="label">预计结束时间</div>
        <div class="value">
          {{ (data?.taskEndPredict && formatDate(data?.taskEndPredict, 2)) || "--" }}
        </div>
      </div>
    </div>
    <div class="splite-line"></div>
    <div class="r">
      <div>当前试验进度</div>
      <div>预计耗时20min</div>
      <div class="step">
        <div
          v-for="(item, index) in 5"
          :key="index"
          class="step-item"
          :style="{ '--stepColor': getStepColor(index) }"
        ></div>
      </div>
      <div>查看详情 >></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TaskEntity } from ".."
import { formatDate } from "@/utils/utils"

defineProps<{
  data: TaskEntity
}>()
function getStepColor(index: number) {
  if (index <= 2) {
    return "#20C55C"
  }
  return "#fff"
}
</script>

<style lang="less" scoped>
.device-task {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0.08rem 0.12rem;
  font-size: 14px;
  color: #bceaff;
  background: linear-gradient(180deg, rgba(4, 161, 207, 0.5) 0%, rgba(0, 102, 236, 0.5) 100%);
  .l {
    flex: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
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
      }
    }
  }
  .splite-line {
    width: 2px;
    background: linear-gradient(180deg, rgba(4, 161, 207, 0.5) 0%, rgba(0, 102, 236, 0.5) 100%);
    border-top: 16px solid #fff;
    border-bottom: 6px solid #fff;
    margin: 0 16px;
  }
  .r {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .step {
      display: flex;
      gap: 1px;
      .step-item {
        flex: 1;
        width: 0.21rem;
        height: 0.04rem;
        background: var(--stepColor);
      }
    }
  }
}
</style>
