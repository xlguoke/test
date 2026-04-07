<template>
  <div v-if="overlayCount > 0" class="fixed inset-0 bg-black/50 z-50 pointer-events-auto"></div>
</template>

<script lang="ts" setup>
const overlayCount = ref(0)

window.top!.showGlobalOverlay = () => {
  overlayCount.value++
}

window.top!.hideGlobalOverlay = () => {
  if (overlayCount.value <= 0) {
    return
  }
  overlayCount.value--
}
</script>

<style scoped lang="less">
/* 全局遮罩层样式 */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black\/50 {
  background-color: rgba(0, 0, 0, 0.3);
}

.z-50 {
  /* 设置足够低的z-index，确保它不会挡住iframe内的layer弹窗 */
  /* 通常layer弹窗的z-index会设置得很高(如19891014)，所以这里设置较低值即可 */
  z-index: 10;
}

.pointer-events-auto {
  pointer-events: auto;
}
</style>
