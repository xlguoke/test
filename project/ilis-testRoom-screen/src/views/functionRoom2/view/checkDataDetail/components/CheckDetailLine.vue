<template>
  <div v-if="!data" class="line title">
    <div class="index1">巡查人员</div>
    <div class="index2">巡查时间</div>
    <div class="index3">取值温度</div>
    <div class="index4">取值湿度</div>
    <div class="index5">状态</div>
  </div>
  <div v-else class="line">
    <div class="index1">{{ data.a }}</div>
    <div class="index2">{{ data.a }}</div>
    <div class="index3">{{ data.a }}</div>
    <div class="index4">{{ data.a }}</div>
    <div class="index5">{{ data.a }}</div>
  </div>
</template>
<script lang="ts" setup>
interface CheckData {
  data?: any
}

defineProps<CheckData>()
</script>
<style lang="less" scoped>
.line {
  display: flex;
  align-items: center;
  height: 0.66rem;
  &.title {
    font-size: 0.28rem;
  }
  div {
    text-align: center;
  }
  .index1 {
    flex: 2;
  }
  .index2 {
    flex: 4;
  }
  .index3 {
    flex: 2;
  }
  .index4 {
    flex: 2;
  }
  .index5 {
    flex: 1;
  }
}
</style>
