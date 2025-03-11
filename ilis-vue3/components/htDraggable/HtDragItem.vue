<template>
  <div
    ref="draggableItem"
    class="ht-draggable-item"
    :style="dragStyle"
  >
    <div class="ht-draggable-item-content">
      <slot></slot>
    </div>
    <p class="ht-draggable-item-bar"></p>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'

const props = defineProps({
  width: {
    type: [String, Number],
    default: '',
  },
})

function initWidth() {
  if (!props.width)
    return 'auto'
  const isStr = typeof props.width === 'string'
  return isStr ? props.width : `${props.width}px`
}

const dragStyle = computed(() => {
  const style: { [key: string]: string } = {}
  style.width = initWidth()
  if (!props.width) {
    style.flex = '1'
  }
  return style
})

const draggableItem = ref()
function resizeWidth() {
  if (!draggableItem.value)
    return
  draggableItem.value.style.width = initWidth()
  if (!props.width) {
    draggableItem.value.style.flex = '1'
  }
}
useResizeObserver(document.body, resizeWidth)
</script>

<style scoped>
.ht-draggable-item {
  height: 100%;
  display: flex;
}
.ht-draggable-item:last-child .ht-draggable-item-bar {
  display: none;
}
.ht-draggable-item-bar {
  width: 6px;
  margin: 0;
  height: 100%;
  background-color: #f5f5f5;
  cursor: col-resize;
  user-select: none;
}
.ht-draggable-item-bar:hover {
  background-color: #eee;
}
.ht-draggable-item-bar:active {
  background-color: #ddd;
}
.ht-draggable-item-content {
  margin: 0 8px;
  flex: 1;
  height: 100%;
  width: 0;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
