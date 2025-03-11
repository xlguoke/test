<template>
  <div ref="dragWrap" class="ht-draggable">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  minWidth: {
    type: Number,
    default: 150,
  },
})

const dragWrap = ref()
const dragBar = ref<HTMLElement | null>(null)
const dragItem = ref<HTMLElement | null>(null)
const nextDragItem = ref<HTMLElement | null>(null)
const clientX = ref(0)
const oWidth = ref(0)
const oNextWidth = ref(0)

nextTick(() => {
  initDrag()
})

function initDrag() {
  document.addEventListener('mousedown', (e: MouseEvent) => {
    dragBar.value = e.target as HTMLElement
    const className = dragBar.value.className
    if (className !== 'ht-draggable-item-bar')
      return
    dragWrap.value.style.cursor = 'col-resize'
    dragItem.value = dragBar.value.parentNode as HTMLElement
    nextDragItem.value = dragItem.value.nextElementSibling as HTMLElement
    clientX.value = e.clientX
    oWidth.value = dragItem.value.clientWidth
    oNextWidth.value = nextDragItem.value.clientWidth
    document.addEventListener('mousemove', dragMove)
    dragOver()
  })
}
function dragMove(e: MouseEvent) {
  e.preventDefault()
  if (!dragBar.value)
    return
  const n = e.clientX - clientX.value
  const width = oWidth.value + n
  const nextWidth = oNextWidth.value - n
  if (width < props.minWidth || nextWidth < props.minWidth)
    return
  dragItem.value!.style.flex = 'initial'
  dragItem.value!.style.width = `${width}px`
  nextDragItem.value!.style.flex = 'initial'
  nextDragItem.value!.style.width = `${nextWidth}px`
}
function dragOver() {
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', dragMove)
    dragWrap.value.style.cursor = 'initial'
    dragBar.value = null
    dragItem.value = null
    nextDragItem.value = null
  })
}
</script>

<style scoped>
.ht-draggable {
  position: relative;
  display: flex;
  height: 100%;
}
</style>
