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
  maxWidth: {
    type: Number,
  },
  /** 推拽控制器修改宽度值，将哪边设为固定宽度-控制器左右 */
  fixedWidth: {
    type: String as PropType<'left' | 'right'>,
    default: 'left',
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
    const item = document.querySelectorAll('.ht-draggable-item') as NodeListOf<HTMLElement>
    item.forEach((i) => {
      i.style.transition = 'unset'
      i.classList.add('draggable-item-mousedown')
    })
    dragItem.value = dragBar.value.parentNode as HTMLElement
    clientX.value = e.clientX
    if (props.fixedWidth === 'left') {
      oWidth.value = dragItem.value.clientWidth
    }
    else {
      nextDragItem.value = dragItem.value.nextElementSibling as HTMLElement
      oNextWidth.value = nextDragItem.value.clientWidth
    }
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
  if (props.fixedWidth === 'left') {
    if (width < props.minWidth)
      return

    if (props.maxWidth && width > props.maxWidth) {
      return
    }
    dragItem.value!.style.flex = 'initial'
    dragItem.value!.style.width = `${width}px`
  }
  else {
    if (nextWidth < props.minWidth)
      return
    nextDragItem.value!.style.flex = 'initial'
    nextDragItem.value!.style.width = `${nextWidth}px`
  }
}
function dragOver() {
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', dragMove)
    if (dragWrap.value)
      dragWrap.value.style.cursor = 'initial'
    const item = document.querySelectorAll('.ht-draggable-item') as NodeListOf<HTMLElement>
    item.forEach((i) => {
      i.style.transition = 'width .2s'
      i.classList.remove('draggable-item-mousedown')
    })
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
