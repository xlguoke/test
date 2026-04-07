<template>
  <div class="sub-title">
    <slot name="icon"></slot>
    <span class="sub-title-text">
      <slot></slot>
    </span>
    <img src="../../assets/images/smartCockpit/sub-title-icon2.svg" class="mr-8 h-28" />
    <img src="../../assets/images/smartCockpit/sub-title-icon.svg" class="h-28" />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.sub-title {
  display: flex;
  align-items: center;
  height: 0.6rem;
  margin: 0.4rem 0;
  padding: 0 0.4rem;

  .sub-title-text {
    font-size: 0.36rem;
    flex: 1;
    padding-left: 0.24rem;
  }
}
</style>
