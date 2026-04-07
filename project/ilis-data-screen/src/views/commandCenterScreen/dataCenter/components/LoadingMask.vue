<template>
  <div v-if="visible" class="loading-mask">
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const visible = computed(() => props.visible)
</script>

<style lang="less" scoped>
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e2e2;
  z-index: 20;
}

.loading-container {
  display: inline-block;
}

.loading-spinner {
  width: 0.32rem;
  height: 0.32rem;
  border: 0.04rem solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
