<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '60rem',
  },
  height: {
    type: String,
    default: '40rem',
  },
})
const emits = defineEmits(['close'])

const layerRef = ref<HTMLElement | null>(null)
const pos = ref({ x: 0, y: 0 })
const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })

function onMouseDown(e: MouseEvent) {
  if (!layerRef.value)
    return
  dragging.value = true
  const rect = layerRef.value.getBoundingClientRect()
  offset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onTouchStart(e: TouchEvent) {
  if (!layerRef.value)
    return
  dragging.value = true
  const touch = e.touches[0]
  const rect = layerRef.value.getBoundingClientRect()
  offset.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  }
  document.addEventListener('touchmove', onTouchMove)
  document.addEventListener('touchend', onTouchEnd)
}

function onTouchMove(e: TouchEvent) {
  if (!dragging.value)
    return
  const touch = e.touches[0]
  pos.value = {
    x: touch.clientX - offset.value.x,
    y: touch.clientY - offset.value.y,
  }
}

function onTouchEnd() {
  dragging.value = false
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value)
    return
  // 计算新的位置
  pos.value = {
    x: e.clientX - offset.value.x,
    y: e.clientY - offset.value.y,
  }
}

function onMouseUp() {
  dragging.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  // 初始居中
  if (layerRef.value) {
    const rect = layerRef.value.getBoundingClientRect()
    const x = (window.innerWidth - rect.width) - 24
    const y = (window.innerHeight - rect.height) - 24
    pos.value = { x, y }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div
    ref="layerRef"
    class="base-layer"
    :style="{
      width,
      height,
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      position: 'fixed',
      margin: 0,
    }"
    @click.stop
  >
    <div
      class="base-layer-head"
      style="cursor: move; user-select: none;"
      @mousedown="onMouseDown"
      @touchstart="onTouchStart"
    >
      <div>{{ title }}</div>
      <van-icon name="cross" @click="emits('close')" />
    </div>
    <div class="base-layer-body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.base-layer {
  box-shadow: 0px 3px 8px 0px rgba(0, 102, 236, 0.1);
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 9999;

  .base-layer-head {
    padding: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.6rem;
    color: #3D3D3D;
    font-weight: bold;

    .van-icon {
      font-size: 2rem;
      cursor: pointer;
    }
  }

  .base-layer-body {
    padding: 0 1.6rem 1.6rem 1.6rem;
    flex: 1;
    height: 0;
  }
}
</style>
