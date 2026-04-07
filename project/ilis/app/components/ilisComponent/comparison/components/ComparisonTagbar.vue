<!-- Tag栏（文件栏） -->
<template>
  <div class="mb-3 relative p-[4px] bg-[var(--colorBgContainer)]">
    <!-- 文件标签栏 -->
    <div class="flex items-center h-[58px] pr-[12px]">
      <!-- 左滚动按钮 -->
      <a-tooltip title="向左滚动">
        <button
          class="mr-2 p-1 w-[40px] h-full hover:bg-gray-50 hover:text-colorPrimary transition-colors cursor-pointer"
          :class="{
            'opacity-50 !cursor-not-allowed': !scrollState.left,
          }"
          type="button"
          :disabled="!scrollState.left"
          @click="scrollLeft"
          @mousedown="autoScroll('left')"
          @mouseup="stopAutoScroll"
          @mouseleave="stopAutoScroll"
        >
          <LeftOutlined />
        </button>
      </a-tooltip>

      <!-- 滚动容器 -->
      <div
        ref="fileTabsContainer"
        class="flex-1 overflow-x-hidden relative"
        @scroll="handleScroll"
      >
        <div
          ref="fileTabsInner"
          class="flex whitespace-nowrap "
        >
          <slot
            name="fileTabs"
            :handle-click="handleClick"
            :handle-drag-start="handleDragStart"
            :handle-drag-end="handleDragEnd"
            :is-file-highlighted="isFileHighlighted"
          >
            <ComparisonTag
              v-for="item in props.fileItems" :key="item.url"
              :file="item"
              :is-highlighted="isFileHighlighted(item.id)"
              :is-dragging="props?.draggedFileId === item.id"
              :data-file-id="item.id"
              @click="handleClick(item.id)"
              @dragstart="handleDragStart(item.id)"
              @dragend="handleDragEnd"
            />
          </slot>
        </div>
      </div>

      <!-- 右滚动按钮 -->
      <a-tooltip title="向右滚动">
        <button
          class="ml-2 mr-[8px] p-1 w-[40px] h-full hover:bg-gray-50 hover:text-colorPrimary transition-colors"
          :disabled="!scrollState.right"
          :class="{
            'opacity-50 cursor-not-allowed': !scrollState.right,
          }"
          type="button"
          @click="scrollRight"
          @mousedown="autoScroll('right')"
          @mouseup="stopAutoScroll"
          @mouseleave="stopAutoScroll"
        >
          <RightOutlined />
        </button>
      </a-tooltip>
      <a-popover trigger="click" placement="bottomRight" arrow-point-at-center>
        <a-tooltip title="所有文件">
          <a-button :icon="h('img', { src: moreFileIcon, style: { width: '24px', height: '24px' }, alt: '所有文件' })" type="ghost"></a-button>
        </a-tooltip>
        <template #title>
          <a-input-search v-model:value.trim="searchText" placeholder="输入文件/链接名称搜索" class="mb-2" />
        </template>
        <template #content>
          <div class="max-h-[400px] overflow-auto grid grid-cols-1 w-full">
            <ComparisonTag
              v-for="item in props.fileItems?.filter((item) => item.title?.toLowerCase()?.includes(searchText.toLowerCase())) || []" :key="item.url"
              :file="item"
              :is-highlighted="isFileHighlighted(item.id)"
              :is-dragging="props?.draggedFileId === item.id"
              class="mb-2 !w-full"
              @click="handleClick(item.id)"
              @dragstart="handleDragStart(item.id)"
              @dragend="handleDragEnd"
            />
          </div>
        </template>
      </a-popover>
    </div>
    <!-- <a-alert
      class="!mt-2"
      message="系统要求批准阶段盲样，但本报告未生成盲样pdf，故无盲样文件可展示。tips: 如需展示，请退回检测，并重新提交以生成盲样PDF。"
      show-icon
    /> -->
  </div>
</template>

<script lang="ts" setup>
import type { IComparisonFile } from '../interface/IConparisonFile'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ComparisonTag from './ComparisonTag.vue'

// Props
const props = defineProps<{
  /** 拖动中的文件ID */
  draggedFileId: string | null
  /** 显示拖放区域 */
  showDropZone: boolean
  /** 文件列表 */
  fileItems: IComparisonFile[]
  /** 高亮的文件id集合 */
  highlightedFiles: Set<string>
}>()

// Emits
const emit = defineEmits<{
  /** 处理点击事件 */
  handleClick: [fileId: string]
  /** 处理拖动开始事件 */
  handleDragStart: [fileId: string]
  /** 处理拖动结束事件 */
  handleDragEnd: []
}>()

const moreFileIcon = new URL('~/assets/img/ilisConparison/more_file.svg', import.meta.url).href

// 文件标签栏滚动相关
const fileTabsContainer = ref<HTMLElement | null>(null)
const fileTabsInner = ref<HTMLElement | null>(null)

// 搜索文件
const searchText = ref('')

// 定时器ID
let scrollTimerId: ReturnType<typeof setInterval> | null = null

// 计算滚动按钮的显示状态
const scrollState = ref({
  left: false,
  right: false,
})

// 组件初始化时，确保默认显示的文件标签被高亮
onMounted(() => {
  // 初始化滚动状态
  nextTick(() => {
    updateScrollButtons()
  })
})

/**
 * 处理点击事件
 * @param fileId 文件唯一标识
 */
function handleClick(fileId: string) {
  emit('handleClick', fileId)
}

/**
 * 处理拖动开始事件
 * @param fileId 文件唯一标识
 */
function handleDragStart(fileId: string) {
  emit('handleDragStart', fileId)
}

/**
 * 处理拖动结束事件
 */
function handleDragEnd() {
  emit('handleDragEnd')
}

/**
 * 检查文件是否应该被高亮
 * @param fileId 文件唯一标识
 * @returns 是否高亮
 */
function isFileHighlighted(fileId: string): boolean {
  return props.highlightedFiles.has(fileId)
}

/**
 * 更新滚动按钮的显示状态
 */
function updateScrollButtons() {
  if (!fileTabsContainer.value || !fileTabsInner.value) {
    return { left: false, right: false }
  }
  const container = fileTabsContainer.value
  const inner = fileTabsInner.value
  scrollState.value = {
    left: container.scrollLeft > 0,
    right: container.scrollLeft < (inner.scrollWidth - container.clientWidth),
  }
}

/**
 * 滚动容器滚动事件
 */
function handleScroll() {
  updateScrollButtons()
}

/**
 * 滚动容器
 * @param direction 滚动方向
 * @param amount 滚动距离
 */
function scrollContainer(direction: 'left' | 'right', amount: number) {
  if (!fileTabsContainer.value || !fileTabsInner.value)
    return

  const container = fileTabsContainer.value
  const inner = fileTabsInner.value
  const maxScrollLeft = inner.scrollWidth - container.clientWidth
  let newScrollLeft

  if (direction === 'left') {
    newScrollLeft = Math.max(0, container.scrollLeft - amount)
  }
  else {
    newScrollLeft = Math.min(maxScrollLeft, container.scrollLeft + amount)
  }

  container.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth',
  })

  // 延迟更新按钮状态，确保滚动完成
  setTimeout(updateScrollButtons, 300)
}

/**
 * 向左滚动一页
 */
function scrollLeft() {
  if (!fileTabsContainer.value)
    return
  scrollContainer('left', fileTabsContainer.value.clientWidth)
}

/**
 * 向右滚动一页
 */
function scrollRight() {
  if (!fileTabsContainer.value)
    return
  scrollContainer('right', fileTabsContainer.value.clientWidth)
}

/**
 * 自动滚动
 * @param direction 滚动方向
 */
function autoScroll(direction: 'left' | 'right') {
  if (!fileTabsContainer.value)
    return

  // 清除之前的定时器
  if (scrollTimerId) {
    clearInterval(scrollTimerId)
  }

  // 设置新的定时器进行滚动
  scrollTimerId = setInterval(() => {
    scrollContainer(direction, 20)
  }, 20)
}

/**
 * 停止自动滚动
 */
function stopAutoScroll() {
  if (scrollTimerId) {
    clearInterval(scrollTimerId)
    scrollTimerId = null
  }
}

// 监听高亮文件变化，自动滚动到最新高亮的文件
watch(
  () => props.highlightedFiles,
  (newSet, oldSet) => {
    if (newSet.size === 0)
      return

    // 找出新增的高亮文件
    const newHighlightedFileId = Array.from(newSet).find(id => !oldSet.has(id))

    if (newHighlightedFileId && fileTabsContainer.value) {
      // 滚动到新增的高亮文件
      const fileElement = fileTabsContainer.value.querySelector(`[data-file-id="${newHighlightedFileId}"]`) as HTMLElement
      if (fileElement) {
        // 等待DOM更新完成后再滚动
        nextTick(() => {
          fileElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        })
      }
    }
  },
  { deep: true },
)

// 监听标签栏容器尺寸变化
onMounted(() => {
  if (fileTabsContainer.value) {
    const resizeObserver = new ResizeObserver(handleScroll)
    resizeObserver.observe(fileTabsContainer.value)

    onBeforeUnmount(() => {
      resizeObserver.unobserve(fileTabsContainer.value!)
    })
  }
})
</script>
