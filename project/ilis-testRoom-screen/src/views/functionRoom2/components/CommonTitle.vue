<template>
  <div class="common_title">
    <span v-if="$slots.icon" class="icon">
      <slot name="icon"></slot>
    </span>
    <span class="text">
      <slot></slot>
    </span>
  </div>
</template>
<script lang="ts" setup></script>
<style lang="less" scoped>
.common_title {
  font-size: 0.28rem;
  display: flex;
  align-items: center;
  margin-bottom: 0.24rem;
  .icon {
    width: 0.32rem;
    height: 0.32rem;
    margin-right: 0.12rem;
  }
  .text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
