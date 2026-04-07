<template>
  <div class="scroll-x-container">
    <div ref="scrollXContent" class="scroll-x-content" :style="style">
      <slot></slot>
    </div>
    <div class="scroll-x-bar">
      <div ref="scrollXBarInner" class="scroll-x-bar-inner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

defineProps({
  style: {
    type: Object,
    default: () => ({})
  }
})

const scrollXContent = ref()
const scrollXBarInner = ref()

onMounted(() => {
  scrollXContent.value.addEventListener("scroll", (e: Event) => {
    const target = e.target as HTMLElement
    initScrollBar(target)
  })
})

function initScrollBar(target: HTMLElement) {
  const scrollWidth = target.scrollWidth - target.clientWidth
  const barLeft = (target.scrollLeft / scrollWidth) * 100
  scrollXBarInner.value.style.transform = `translateX(${barLeft}%)`
}
</script>

<style scoped lang="less">
.scroll-x-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .scroll-x-content {
    width: 100%;
    height: calc(100% + 0.24rem);
    padding-bottom: 0.3rem;
    overflow-x: auto;
  }

  .scroll-x-bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1rem;
    height: 8px;
    transform: translateX(-50%);
    background-color: #eee;
    border-radius: 10px;

    .scroll-x-bar-inner {
      width: 50%;
      height: 100%;
      background-color: #0066ec;
      border-radius: 5px;
    }
  }
}
</style>
