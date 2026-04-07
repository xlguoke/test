<template>
  <div
    ref="draggableItem"
    class="ht-draggable-item"
    :style="dragStyle"
  >
    <slot name="before"></slot>
    <div class="ht-draggable-item-content">
      <slot></slot>
    </div>
    <slot name="after"></slot>
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
  transition: .2s;
}
.ht-draggable-item:last-child .ht-draggable-item-bar {
  display: none;
}
.ht-draggable-item-bar {
  width: 1px;
  margin: 0;
  height: 100%;
  background-color: var(--colorSplit);
  cursor: col-resize;
  user-select: none;
  position: relative;
}
.ht-draggable-item-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -6px;
  width: 13px;
  height: 100%;
  cursor: col-resize;
  z-index: 1;
}
.ht-draggable-item-bar:hover {
  background-color: var(--colorSplit);
  opacity: 0.5;
}
.ht-draggable-item-bar:active {
  background-color: var(--colorSplit);
  opacity: 0.5;
}
.ht-draggable-item-content {
  position: relative;
  margin-right: 12px;
  flex: 1;
  height: 100%;
  width: 0;
  overflow-y: auto;
  box-sizing: border-box;
}
.ht-draggable-item:not(:first-child) .ht-draggable-item-content{
  margin-left: 12px;
}
.ht-draggable-item:last-child .ht-draggable-item-content{
  margin-right: 0;
}

.draggable-item-mousedown .ht-draggable-item-content::after{
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
}
</style>
