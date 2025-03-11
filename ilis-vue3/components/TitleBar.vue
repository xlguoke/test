<template>
  <div class="title-bar">
    <slot></slot>
  </div>
</template>

<script setup lang='ts'>
</script>

<style lang="less" scoped>
.title-bar {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 13px;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 16px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background: #0066ec;
    margin-right: 8px;
  }
}
</style>
