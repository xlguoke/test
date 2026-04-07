<template>
  <div class="border-warp">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
.border-warp {
  position: relative;
  padding: 0.2rem 0.3rem;
  box-sizing: border-box;
  height: calc(100% - 1.52rem);
  border: 1px dashed #1369b9;
  border-radius: 0.22rem;
  background: url(@/assets/images/left.png) 0 0/0.18rem 5.5rem no-repeat,
    url(@/assets/images/right.png) right bottom/0.18rem 5.5rem no-repeat;
}
</style>
