<!-- 操作栏 -->
<template>
  <div
    ref="rootElement"
    class="flex items-center justify-start"
    :class="direction === 'vertical' ? 'flex-col w-[80px]' : 'flex-row h-[80px]'"
    @mousedown="handleMouseDown"
  >
    <!-- 操作区（用于拖动） -->
    <div v-if="direction === 'vertical'" draggable class="w-full rounded-[4px_4px_0px_0px] bg-[#EAEEF6] flex items-center justify-center gap-[2px] py-[4px] select-none cursor-grab active:cursor-grabbing hover:bg-[#DEE4ED] transition-colors comparison-action-bar-drag-handle">
      <i v-for="i in 10" :key="i" class="inline-block w-[1px] h-[8px] bg-[#BDC5D1]  "></i>
    </div>
    <div v-else draggable class="h-full rounded-[4px_0px_0px_4px] bg-[#EAEEF6] flex flex-col items-center justify-center gap-[2px] px-[4px] select-none cursor-grab active:cursor-grabbing hover:bg-[#DEE4ED] transition-colors comparison-action-bar-drag-handle">
      <i v-for="i in 10" :key="i" class="inline-block h-[1px] w-[8px] bg-[#BDC5D1]  "></i>
    </div>
    <div
      class="flex-1 flex items-center justify-start bg-[var(--colorBgContainer)] rounded-[0px_0px_4px_4px] overflow-auto"
      :class="direction === 'vertical' ? 'flex-col w-full  px-[12px] py-[16px]' : 'flex-row h-full px-[16px] py-[12px]'"
    >
      <slot>
        <template
          v-for="(item, index) in items"
          :key="index"
        >
          <template v-if="item.isShow ? item.isShow() : true">
            <ComparisonActionButton
              :icon="item.icon"
              :label="item.label"
              :direction="direction"
              @click="item.onClick"
            />
            <template v-if="index < items.length - 1">
              <div v-if="direction === 'vertical'" class="h-[1px] w-full bg-[var(--colorBgContainer)] my-[14px]"></div>
              <div v-else class="w-[1px] h-full bg-[var(--colorBgContainer)] mx-[14px]"></div>
            </template>
          </template>
        </template>
      </slot>
    </div>
    <slot name="after">
    </slot>
  </div>
</template>

<script lang="ts" setup>
import type { IActionDirection } from '../interface/IActionDirection'
import type { IActionItem } from '../interface/IActionItem'
import ComparisonActionButton from './ComparisonActionButton.vue'

withDefaults(defineProps<{
  /** 操作按钮列表 */
  items: IActionItem[]
  /** 按钮展示结构（左右/上下） */
  direction: IActionDirection
}>(), {
  direction: 'vertical',
})

// 定义事件
const emit = defineEmits<{
  /** 鼠标按下事件 */
  mousedown: [event: MouseEvent]
  /** 鼠标移动事件 */
  mousemove: [event: MouseEvent]
  /** 鼠标释放事件 */
  mouseup: [event: MouseEvent]
}>()

// 组件根元素引用
const rootElement = ref<HTMLElement | null>(null)
// 克隆元素引用
const cloneElement = ref<HTMLElement | null>(null)
// 鼠标初始位置
const mouseStartPos = ref<{ x: number, y: number } | null>(null)
// 是否正在拖拽
const isDragging = ref(false)

/**
 * # 鼠标按下事件处理 ⚙️
 * - 隐藏原始组件
 * - 创建克隆元素
 * - 添加鼠标移动和释放事件监听器
 */
function handleMouseDown(event: MouseEvent) {
  // 检查是否点击了拖动句柄
  const target = event.target as HTMLElement
  if (!target.closest('.comparison-action-bar-drag-handle')) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  // 隐藏原始组件
  if (rootElement.value) {
    rootElement.value.style.opacity = '0'
  }

  // 创建克隆元素
  createCloneElement(event)

  // 设置拖拽状态
  isDragging.value = true

  // 记录鼠标初始位置
  mouseStartPos.value = {
    x: event.clientX,
    y: event.clientY,
  }

  // 添加鼠标移动和释放事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('dragstart', handleDragStart)

  // 触发自定义事件
  emit('mousedown', event)
}

/**
 * # 创建克隆元素 ⚙️
 * - 克隆原始组件的内容和样式
 * - 添加到文档中并设置初始位置
 */
function createCloneElement(_event: MouseEvent) {
  if (!rootElement.value)
    return

  // 克隆元素
  const clone = rootElement.value.cloneNode(true) as HTMLElement

  // 设置克隆元素样式
  clone.style.position = 'fixed'
  clone.style.pointerEvents = 'none'
  clone.style.zIndex = '9999'
  clone.style.opacity = '0.9'
  clone.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'

  // 计算初始位置
  const rect = rootElement.value.getBoundingClientRect()
  clone.style.left = `${rect.left}px`
  clone.style.top = `${rect.top}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`

  // 添加到文档
  document.body.appendChild(clone)
  cloneElement.value = clone
}

/**
 * # 鼠标移动事件处理 ⚙️
 * - 更新克隆元素位置跟随鼠标移动
 */
function handleMouseMove(event: MouseEvent) {
  if (!isDragging.value || !cloneElement.value || !mouseStartPos.value)
    return

  // 更新克隆元素位置
  const deltaX = event.clientX - mouseStartPos.value.x
  const deltaY = event.clientY - mouseStartPos.value.y

  const rect = rootElement.value!.getBoundingClientRect()
  cloneElement.value.style.left = `${rect.left + deltaX}px`
  cloneElement.value.style.top = `${rect.top + deltaY}px`

  // 触发自定义事件
  emit('mousemove', event)
}

/**
 * # 鼠标释放事件处理 ⚙️
 * - 移除克隆元素
 * - 显示原始组件
 * - 清理事件监听器
 */
function handleMouseUp(event: MouseEvent) {
  if (!isDragging.value)
    return

  // 移除克隆元素
  if (cloneElement.value) {
    document.body.removeChild(cloneElement.value)
    cloneElement.value = null
  }

  // 显示原始组件
  if (rootElement.value) {
    rootElement.value.style.opacity = '1'
  }

  // 重置状态
  isDragging.value = false
  mouseStartPos.value = null

  // 清理事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('dragstart', handleDragStart)

  // 触发自定义事件
  emit('mouseup', event)
}

/**
 * # 拖拽开始事件处理 ⚙️
 * - 阻止默认拖拽行为
 */
function handleDragStart(event: DragEvent) {
  event.preventDefault()
}

// 在组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('dragstart', handleDragStart)

  // 移除克隆元素
  if (cloneElement.value && document.body.contains(cloneElement.value)) {
    document.body.removeChild(cloneElement.value)
  }
})
</script>

<style scoped>
/* 滚动条 */
::-webkit-scrollbar {
  width: 2px;
}
</style>
