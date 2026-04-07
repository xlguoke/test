<template>
  <div class="frame-box">
    <slot name="title"></slot>
    <div class="frame-box-content">
      <slot></slot>
      <div v-if="loading" class="frame-box-loading">
        <div class="loading-spinner"></div>
        加载中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const loading = computed(() => props.loading)
</script>

<style lang="less" scoped>
.frame-box {
  display: flex;
  flex-direction: column;

  .frame-box-content {
    flex: 1;
    height: 0;
    position: relative;
  }

  .frame-box-loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    color: #e6fffc;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
}
.loading-spinner {
  width: 22px;
  height: 22px;
  border: 4px solid transparent;
  border-top-color: #0bffff;
  border-right-color: #0bffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
