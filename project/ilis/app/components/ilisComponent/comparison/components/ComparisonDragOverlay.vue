<!-- 拖动遮罩组件 -->
<template>
  <div
    v-if="isVisible"
    class="absolute inset-0 bg-black/20 z-50"
    @mouseup="handleMouseUp"
  >
    <!-- 预设占位符 -->
    <div
      v-for="position in ['top', 'bottom', 'left', 'right']"
      :key="position"
      class="absolute transition-all duration-200 border-2 border-dashed z-10"
      :class="{
        'border-colorPrimary bg-colorPrimary/10 z-20': activePosition === position,
        'border-gray-300 bg-gray-100/50': activePosition !== position,
      }"
      :style="getPlaceholderStyle(position as any)"
      @mouseenter="handlePositionMouseEnter(position)"
    >
      <div class="w-full h-full flex items-center justify-center opacity-70">
        <span class="text-sm font-medium">
          {{ position === 'top' ? '顶部' : position === 'bottom' ? '底部' : position === 'left' ? '左侧' : '右侧' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  /** 是否可见 */
  isVisible: boolean
  /** 当前激活的位置 */
  activePosition: 'top' | 'bottom' | 'left' | 'right' | null
}>()

const emit = defineEmits<{
  /** 鼠标释放事件 */
  (e: 'mouseup'): void
  /** 位置激活事件 */
  (e: 'positionActivate', position: 'top' | 'bottom' | 'left' | 'right'): void
}>()

/**
 * 处理鼠标释放事件
 */
function handleMouseUp() {
  emit('mouseup')
}

/**
 * 处理位置鼠标进入事件
 * @param position 位置
 */
function handlePositionMouseEnter(position: string) {
  emit('positionActivate', position as 'top' | 'bottom' | 'left' | 'right')
}

/**
 * 获取占位符样式
 * @param position 位置
 * @returns 样式对象
 */
function getPlaceholderStyle(position: 'top' | 'bottom' | 'left' | 'right') {
  const style: Record<string, string | number> = {}

  switch (position) {
    case 'top':
      style.top = '0'
      style.left = '0'
      style.right = '0'
      style.height = '80px'
      break
    case 'bottom':
      style.bottom = '0'
      style.left = '0'
      style.right = '0'
      style.height = '80px'
      break
    case 'left':
      style.top = '0'
      style.left = '0'
      style.bottom = '0'
      style.width = '80px'
      break
    case 'right':
      style.top = '0'
      style.right = '0'
      style.bottom = '0'
      style.width = '80px'
      break
  }

  return style
}
</script>
