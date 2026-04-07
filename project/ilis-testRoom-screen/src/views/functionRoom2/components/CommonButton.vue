<template>
  <div :class="['btn', type]">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  type?: "info" | "primary" | "danger" | "danger-plain"
}>()
</script>
<style lang="less" scoped>
.btn {
  display: inline-block;
  cursor: pointer;
  white-space: nowrap;
  color: #0066ec;
  font-size: 0.28rem;
  text-align: center;
  padding: 0.12rem 0.32rem;
  border-radius: 0.12rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid #ffffff;
  &:active {
    opacity: 0.8;
  }
  &.info {
    color: #224059;
    border: 1px solid #ffffff;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.3476) 50%,
      rgba(255, 255, 255, 0.2) 100%
    );
  }
  &.primary {
    color: #fff;
    background: #0066ec;
  }
  &.danger {
    color: #fff;
    background: #ff4646;
  }
  &.danger-plain {
    color: #ff4646;
  }
}
</style>
