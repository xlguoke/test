<!-- 比对查看组件 -->
<template>
  <div ref="containerRef" class="w-full h-full flex flex-col ">
    <!-- 文件标签栏 -->
    <ComparisonTagbar
      :file-items="fileItems"
      :dragged-file-id="draggedFileId"
      :show-drop-zone="showDropZone"
      :highlighted-files="highlightedFiles"
      @handle-click="handleClick"
      @handle-drag-start="handleDragStart"
      @handle-drag-end="handleDragEnd"
    />

    <!-- 容器 -->
    <div
      class="flex flex-1 h-0 w-full gap-3 relative"
      :class="getContainerLayoutClasses()"
    >
      <div class="flex-1 flex h-full w-full gap-3">
        <!-- 容器1 -->
        <ComparisonContainer
          v-show="viewType === '2' || (viewType === '1' && keepSide !== 'right')"
          :container-id="1"
          :url="containers[1].url"
          :show-drop-zone="showDropZone"
          :show-holder-when-empty="true"
          :is-active-question-container="activeQuestionContainer === 1"
          :class="{ '!flex-[3]': activeQuestionContainer === 1, '!flex-[2]': activeQuestionContainer !== 1 }"
          @drop="handleDrop"
          @close="handleClose"
          @clear="handleClear"
          @question-toggle="handleQuestionToggle"
        />

        <!-- 容器2 -->
        <ComparisonContainer
          v-show="viewType === '2' || (viewType === '1' && keepSide === 'right')"
          :container-id="2"
          :url="containers[2].url"
          :show-drop-zone="showDropZone"
          :show-holder-when-empty="true"
          :is-active-question-container="activeQuestionContainer === 2"
          :class="{ '!flex-[3]': activeQuestionContainer === 2, '!flex-[2]': activeQuestionContainer !== 2 }"
          @drop="handleDrop"
          @close="handleClose"
          @clear="handleClear"
          @question-toggle="handleQuestionToggle"
        />
      </div>
      <!-- 操作按钮栏 -->
      <ComparisonActionBar
        :items="actionItems"
        :direction="direction"
        @mousedown="handleActionBarMouseDown"
      >
        <template #after>
          <slot name="action-after" :direction="direction"></slot>
        </template>
      </ComparisonActionBar>
      <!-- 拖动遮罩 -->
      <ComparisonDragOverlay
        :is-visible="isDragging"
        :active-position="activePosition"
        @mouseup="handleMouseUp"
        @position-activate="(position) => activePosition = position"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IActionDirection } from './interface/IActionDirection'
import type { IActionItem } from './interface/IActionItem'
import type { IComparisonViewType } from './interface/IComparisonViewType'
import type { IComparisonFile } from './interface/IConparisonFile'
import ComparisonContainer from './components/ComparisonContainer.vue'
import ComparisonDragOverlay from './components/ComparisonDragOverlay.vue'
// import ComparisonToggleBar from './components/ComparisonToggleBar.vue'
import ComparisonTagbar from './components/ComparisonTagbar.vue'

// 定义容器状态接口
interface ContainerState {
  url: string | undefined
  fileId: string | null
}

// Props
const props = defineProps<{
  /** 操作按钮列表 */
  actionItems: IActionItem[]
  /** 文件列表 */
  fileItems: IComparisonFile[]
  /** 查看方式(1:单文件查看 2:双文件比对查看) */
  viewType: IComparisonViewType
  /** 当从双文件模式切换到单文件模式时，保留的页面('left'或'right'或null) */
  keepSide?: 'left' | 'right' | null
}>()

const direction = ref<IActionDirection>('vertical')

// 存储当前高亮的文件id，支持多个文件同时高亮
const highlightedFiles = reactive(new Set<string>())

// 容器引用
const containerRef = ref<HTMLElement | null>(null)

// 拖动相关状态
const isDragging = ref(false)
const actionBarPosition = ref<'top' | 'bottom' | 'left' | 'right'>('right')
const activePosition = ref<'top' | 'bottom' | 'left' | 'right' | null>(null)

// 容器状态管理 - 使用统一对象管理两个容器的状态
const containers = reactive<Record<number, ContainerState>>({
  1: { url: undefined, fileId: null },
  2: { url: undefined, fileId: null },
})

// 拖放相关状态
const draggedFileId = ref<string | null>(null)
const showDropZone = ref(false)

// 问题标记相关状态
const activeQuestionContainer = ref<number | null>(null) // 当前打开问题标记的容器ID

// 监听查看方式变化
watch(() => props.viewType, (newType, oldType) => {
  if (newType === '1' && oldType === '2') {
    // 从双文件模式切换到单文件模式
    highlightedFiles.clear()

    // 根据用户选择保留的页面来决定高亮哪个容器的文件
    if (props.keepSide === 'right' && containers[2].fileId) {
      // 保留右侧页面：高亮容器2的文件
      highlightedFiles.add(containers[2].fileId)
    }
    else if (containers[1].fileId) {
      // 保留左侧页面或没有指定保留页面：高亮容器1的文件
      highlightedFiles.add(containers[1].fileId)
    }
    // 如果两个容器都没有内容，则不需要做任何处理
  }
  else if (newType === '2' && oldType === '1') {
    // 从单文件模式切换到双文件模式
    highlightedFiles.clear()
    // 高亮两个容器中存在的文件
    if (containers[1].fileId) {
      highlightedFiles.add(containers[1].fileId)
    }
    if (containers[2].fileId) {
      highlightedFiles.add(containers[2].fileId)
    }
  }
})

// 组件初始化时，确保默认显示的文件标签被高亮
// onMounted(() => {
//   const defaultFile = props.fileItems[0]
//   if (defaultFile) {
//     containers[1] = { url: defaultFile.url, fileId: defaultFile.id }
//     highlightedFiles.add(defaultFile.id)
//   }
// })

watch(() => props.fileItems, () => {
  const defaultFile = props.fileItems[0]
  if (defaultFile) {
    containers[1] = { url: defaultFile.url, fileId: defaultFile.id }
    highlightedFiles.add(defaultFile.id)
  }
}, { immediate: true })

/**
 * 更新容器状态
 * @param containerId 容器ID
 * @param fileId 文件ID
 */
function updateContainerState(containerId: number, fileId: string) {
  // 获取文件URL
  const fileUrl = props.fileItems.find(item => item.id === fileId)?.url || ''
  const { fileId: oldFileId } = containers[containerId]

  // 移除当前容器之前的文件高亮
  if (oldFileId) {
    highlightedFiles.delete(oldFileId)
  }

  // 更新当前容器状态
  containers[containerId] = { url: fileUrl, fileId }
  highlightedFiles.add(fileId)

  // 检查文件是否存在于另一个容器，如果是则移除
  const otherContainerId = containerId === 1 ? 2 : 1
  if (containers[otherContainerId].fileId === fileId) {
    containers[otherContainerId] = { url: undefined, fileId: null }
  }
}

/**
 * 处理点击事件
 * @param fileId 文件唯一标识
 */
function handleClick(fileId: string) {
  // 在单文件模式下，点击文件会替换当前显示的容器内容
  // 根据keepSide决定更新哪个容器
  const targetContainerId = props.viewType === '1'
    ? (props.keepSide === 'right' ? 2 : 1)
    : 2
  updateContainerState(targetContainerId, fileId)
}

/**
 * 拖动开始事件
 * @param fileId 文件唯一标识
 */
function handleDragStart(fileId: string) {
  draggedFileId.value = fileId
  showDropZone.value = true
}

/**
 * 拖动结束事件
 */
function handleDragEnd() {
  draggedFileId.value = null
  showDropZone.value = false
}

/**
 * 拖放完成事件
 * @param event 拖放事件对象
 * @param containerId 容器ID
 */
function handleDrop(event: DragEvent, containerId: number) {
  event.preventDefault()

  // 获取拖动的文件ID
  const fileId = draggedFileId.value
  if (fileId) {
    updateContainerState(containerId, fileId)
    // 重置拖动状态
    draggedFileId.value = null
  }
}

/**
 * 处理操作栏鼠标按下事件
 * @param event 鼠标事件
 */
function handleActionBarMouseDown(event: MouseEvent) {
  // 检查是否点击了拖动句柄
  const target = event.target as HTMLElement
  if (target.closest('.comparison-action-bar-drag-handle')) {
    isDragging.value = true
  }
}

/**
 * 获取容器布局类
 * @returns 布局类对象
 */
function getContainerLayoutClasses() {
  // 优化布局类映射，使用更简洁的条件判断
  const isVertical = actionBarPosition.value === 'top' || actionBarPosition.value === 'bottom'
  const isReverse = actionBarPosition.value === 'top' || actionBarPosition.value === 'left'

  return {
    'flex-col': isVertical,
    'flex-row': !isVertical,
    'flex-col-reverse': isVertical && isReverse,
    'flex-row-reverse': !isVertical && isReverse,
  }
}

/**
 * 处理鼠标释放事件
 */
function handleMouseUp() {
  if (!isDragging.value) {
    return
  }
  isDragging.value = false

  // 如果有激活位置，更新操作栏位置和方向
  if (activePosition.value) {
    actionBarPosition.value = activePosition.value
    direction.value = activePosition.value === 'top' || activePosition.value === 'bottom' ? 'horizontal' : 'vertical'
  }

  // 重置激活位置
  activePosition.value = null
}

/**
 * 处理容器关闭事件
 * @param containerId 容器ID
 */
function handleClose(containerId: number) {
  const { fileId } = containers[containerId]

  // 移除文件高亮
  if (fileId) {
    highlightedFiles.delete(fileId)
  }

  // 清除容器内容
  containers[containerId] = { url: undefined, fileId: null }

  // 如果当前容器是活跃的问题标记容器，清除活跃状态
  if (activeQuestionContainer.value === containerId) {
    activeQuestionContainer.value = null
  }
}

/**
 * 处理容器清空事件
 * @param containerId 容器ID
 */
function handleClear(containerId: number) {
  const { fileId } = containers[containerId]

  // 移除文件高亮
  if (fileId) {
    highlightedFiles.delete(fileId)
  }

  // 清除容器内容
  containers[containerId] = { url: undefined, fileId: null }

  // 如果当前容器是活跃的问题标记容器，清除活跃状态
  if (activeQuestionContainer.value === containerId) {
    activeQuestionContainer.value = null
  }
}

/**
 * 处理问题标记切换事件
 * @param containerId 容器ID
 * @param isOpen 是否打开
 */
function handleQuestionToggle(containerId: number, isOpen: boolean) {
  if (isOpen) {
    // 如果要打开，关闭其他容器的问题标记
    activeQuestionContainer.value = containerId
  }
  else {
    // 如果要关闭，清除活跃状态
    activeQuestionContainer.value = null
  }
}
</script>
