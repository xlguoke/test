<template>
  <div class="process-bar">
    <div
      class="process-bar-value"
      :style="{
        width: `${val}%`
      }"
    ></div>
    <span>{{ val }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  process: {
    type: Number,
    default: 0
  }
})

const val = computed(() => (props.process || 0).toFixed(2))
</script>

<style lang="less" scoped>
.process-bar {
  height: 0.4rem;
  position: relative;
  background: rgba(64, 231, 213, 0.1);
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.28rem;

  span {
    position: relative;
    z-index: 10;
  }

  .process-bar-value {
    width: 0%;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: #00b3a0;
  }
}
</style>
