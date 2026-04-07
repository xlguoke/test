<!-- 比对容器组件 -->
<template>
  <div class="w-full h-full flex-1 border border-solid border-[var(--colorBorder)] p-2 relative bg-[var(--colorBgContainer)]">
    <!-- 关闭按钮 -->
    <button
      v-if="url"
      class="comparison-container-close-btn absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10 text-[#999] hover:text-[#333]"
      @click="handleClose"
    >
      ×
    </button>
    <div v-if="showCustomTool" class="absolute top-2 right-4 flex justify-end items-center z-10 bg-[#f9f9fa] w-[200px]">
      <a-tooltip title="内容弹出">
        <a-button type="ghost" :icon="h('i', { class: 'iconfont icon-a-zu655 !text-[24px] mt-[6px] text-[#151515]' })" :disabled="!url" @click="openInRightHalfScreen(url!)"></a-button>
      </a-tooltip>
      <a-tooltip title="问题标记">
        <a-button type="ghost" :icon="h('i', { class: 'iconfont icon-a-zu7022 !text-[24px] mt-[6px] text-[#151515]' })" @click="handleEditQuestion"></a-button>
      </a-tooltip>
    </div>
    <!-- iframe -->
    <iframe v-if="url" ref="iframeRef" :key="url" :src="url" frameborder="0" width="100%" height="100%"></iframe>

    <!-- 空容器占位符 -->
    <ComparisonHolder v-else-if="showHolderWhenEmpty" />

    <!-- 拖放区域 -->
    <ComparisonHolder
      v-if="showDropZone"
      class="bg-[var(--colorPrimaryBg)] cursor-copy text-[#fff]"
      @dragover.prevent
      @dragenter.prevent
      @drop="handleDrop"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import ComparisonHolder from './ComparisonHolder.vue'

const props = defineProps<{
  /** 容器ID（1或2） */
  containerId: number
  /** iframe的URL */
  url?: string
  /** 是否显示拖放区域 */
  showDropZone: boolean
  /** 当URL为空时是否显示占位符 */
  showHolderWhenEmpty?: boolean
  /** 当前容器是否是活跃的问题标记容器 */
  isActiveQuestionContainer?: boolean
}>()

const emit = defineEmits<{
  /** 拖放事件 */
  (e: 'drop', event: DragEvent, containerId: number): void
  /** 关闭事件 */
  (e: 'close', containerId: number): void
  /** 清空容器内容事件 */
  (e: 'clear', containerId: number): void
  /** 问题标记状态变化事件 */
  (e: 'questionToggle', containerId: number, isOpen: boolean): void
}>()

const iframeRef = ref<HTMLIFrameElement>()

/**
 * 处理拖放事件
 */
const handleDrop = (event: DragEvent) => emit('drop', event, props.containerId)

/**
 * 处理关闭事件
 */
const handleClose = () => emit('close', props.containerId)

// 使用 pdfjs 查看器时，渲染自定义工具
const showCustomTool = computed(() => props.url?.includes('pdfjs/web/viewer.html'))

// 使用计算属性根据父组件传递的状态来控制本地状态
const isOpenQuestionType = computed({
  get: () => props.isActiveQuestionContainer || false,
  set: (value) => {
    emit('questionToggle', props.containerId, value)
  },
})

// 监听父组件传递的活跃状态变化，确保实际调用iframe方法
watch(() => props.isActiveQuestionContainer, (newValue, oldValue) => {
  if (iframeRef.value?.contentWindow && newValue !== oldValue) {
    if (newValue) {
      // 打开问题标记
      iframeRef.value.contentWindow.$('#toolbarViewerRight .icon-open-close').click()
    }
    else {
      // 关闭问题标记
      iframeRef.value.contentWindow.$('#labelDataWrap .icon-open-close').click()
    }
  }
})

/** 在右侧半屏打开窗口的共用函数 */
function openInRightHalfScreen(url: string) {
  if (!url)
    return
  try {
    // 计算右侧半屏的位置和尺寸
    const screenWidth = window.screen.availWidth
    const screenHeight = window.screen.availHeight
    const leftPos = Math.floor(screenWidth / 2)
    const topPos = 0
    const width = Math.floor(screenWidth / 2)
    const height = screenHeight
    // 打开新窗口并放置在右侧半屏
    const newWindow = window.open(
      url,
      '_blank',
      `left=${leftPos},top=${topPos},width=${width},height=${height},toolbar=0,menubar=0,location=0,status=0,directories=0`,
    )
    // 打开成功后，通知父组件清空当前容器的URL
    if (newWindow)
      emit('clear', props.containerId)
    return newWindow
  }
  catch (err) {
    // 打印错误信息
    console.error('打开新窗口失败:', err)
    // 失败时回退到普通的新标签页打开
    return window.open(url, '_blank')
  }
}

function handleEditQuestion() {
  if (!iframeRef.value)
    return

  // 切换问题标记状态并通知父组件
  const newValue = !isOpenQuestionType.value
  isOpenQuestionType.value = newValue

  if (iframeRef.value.contentWindow) {
    if (newValue) {
      // 打开问题标记
      iframeRef.value.contentWindow.$('#toolbarViewerRight .icon-open-close').click()
    }
    else {
      // 关闭问题标记
      iframeRef.value.contentWindow.$('#labelDataWrap .icon-open-close').click()
    }
  }
}
</script>

<style scoped>
:deep(.ant-btn){
  display: flex;
  align-items: center;
  justify-content: center;
}
.comparison-container-close-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comparison-container-close-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
</style>
