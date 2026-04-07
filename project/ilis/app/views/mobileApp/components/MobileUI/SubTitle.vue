<template>
  <div class="mobile-custom-title" :class="{ 'border-b border-[#f0f0f0]': bordered }">
    <div class="left">
      <div class="bar"></div>
      <div class="title">
        <slot></slot>
      </div>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  bordered?: boolean
}>()
</script>

<style lang="less" scoped>
.mobile-custom-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  background-color: #fff;
  height: 50px;
  .left {
    display: flex;
    align-items: center;
    .bar {
      width: 4px;
      height: 14px;
      opacity: 1;
      margin-right: 8px;
      background: #0066EC;
      border-radius: 0 3px 3px 0;
    }

    .title {
      color: #151515;
      font-size: 14px;
      line-height: 22px;
      font-weight: bold;
    }
  }
}
</style>
