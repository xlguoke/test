<template>
  <a-card>
    <template #extra>
      <!-- 页码控制 -->
      <div class="flex items-center gap-2">
        <a-button
          size="small"
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          上一页
        </a-button>
        <span class="text-gray-600 flex items-center gap-1">
          <a-input-number
            v-model:value="gotoPageNum"
            style="width: 40px;"
            :min="1"
            :max="totalPages"
            size="small"
            @press-enter="gotoPage"
          /> / {{ totalPages }}
        </span>
        <a-button
          size="small"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          下一页
        </a-button>
      </div>
    </template>
    <!-- 加载状态 -->
    <a-spin
      :spinning="loading"
      tip="加载中..."
    >
      <!-- PDF容器 -->
      <div class="pdf-container-wrapper">
        <!-- PDF渲染区域 -->
        <div
          ref="pdfContainer"
          class="relative bg-white"
          @click="handleCanvasClick"
        >
          <!-- Canvas将由PDF2Image动态创建 -->
        </div>
        <!-- 签章图片（支持多章） -->
        <div
          v-for="seal in currentPageSeals"
          v-show="pdfLoaded"
          :key="seal.sealId"
          :ref="el => setSealRef((el as HTMLElement), seal.sealId)"
          class="absolute cursor-move select-none border border-dashed border-gray-300"
          :class="{
            'opacity-0': !pdfLoaded,
            'border-blue-500': selectedSealId === seal.sealId,
            'z-10': selectedSealId === seal.sealId,
          }"
          :style="{
            left: `${sealPositions[seal.sealId]?.x || 0}px`,
            bottom: `${sealPositions[seal.sealId]?.y || 0}px`,
            width: `${sealPositions[seal.sealId]?.width || 100}px`,
            height: `${sealPositions[seal.sealId]?.height || 100}px`,
          }"
          @mousedown="(e) => handleSealMouseDown(e, seal.sealId)"
        >
          <img
            :src="seal?.sealUrl"
            class="w-full h-full object-contain"
            :alt="`${seal?.sealName || '签章'}`"
            :title="seal?.sealName"
          />
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script lang="ts" setup>
// import { ArrowsAltOutlined } from '@ant-design/icons-vue'
import type { IReportSignatureFile, ISetSignaturePositionDTO } from '../api'
// @ts-expect-error 忽略PDF2Image类型检查错误，因为这玩意是js
import PDF2Image from '~/providers/libs/pdf2image'

const props = defineProps<{
  reportFile?: IReportSignatureFile
}>()

const changedReportFileIds = defineModel('changedReportFileIds', {
  type: Array as PropType<string[]>,
  default: () => [],
})

// PDF原始宽度从pt转换为px（基于标准96 DPI）
const ptToPxRatio = Number((96 / 72).toFixed(2))
// PDF缩放比例
const scaleRatio = ref(1)

const pdfContainer = ref<HTMLElement>()
// 多章ref管理
const sealRefs = ref<Record<string, HTMLElement>>({})

/**
 * 设置印章元素的引用
 */
function setSealRef(el: HTMLElement | null, sealId: string) {
  if (el) {
    sealRefs.value[sealId] = el
  }
  else {
    delete sealRefs.value[sealId]
  }
}
const loading = ref(false)
const pdfLoaded = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const gotoPageNum = ref(1)
const pdfViewer = ref<PDF2Image | null>(null)
const changeRecord = ref<Record<string, ISetSignaturePositionDTO>>({})

// 签章位置信息数组（支持多章，坐标以文件左下角为原点）
const sealPositions = ref<Record<string, { x: number, y: number, width: number, height: number }>>({})

// 获取当前页面的所有印章
const currentPageSeals = computed(() => props.reportFile?.pagePositions?.filter(pos => pos.pageNum === currentPage.value) || [])

// 当前选中的印章ID
const selectedSealId = ref<string>('')

// 当前正在拖拽的印章ID
const draggingSealId = ref<string | null>(null)

// 当前使用的文件URL
const currentFileUrl = ref(props.reportFile?.attachmentUrl)

// 拖拽相关状态
const dragStartPos = ref({ x: 0, y: 0 })
const sealStartPos = ref<Record<string, { x: number, y: number }>>({})

/**
 * 加载PDF文件
 */
function loadPDF() {
  if (!currentFileUrl.value || !pdfContainer.value)
    return

  loading.value = true
  pdfLoaded.value = false

  try {
    // 清除之前的实例
    if (pdfContainer.value) {
      pdfContainer.value.innerHTML = ''
    }

    // 加载第一页
    loadPdfFile(1)
  }
  catch (error) {
    console.error('加载PDF失败:', error)
    loading.value = false
  }
}

/**
 * 加载指定页码的PDF页面
 * @param pageNumber 页码
 */
function loadPdfFile(pageNumber: number) {
  if (!currentFileUrl.value || !pdfContainer.value)
    return
  // 创建PDF2Image实例
  pdfViewer.value = new PDF2Image(currentFileUrl.value, pageNumber, pdfContainer.value)

  // 使用定时器检查PDF是否加载完成
  const interval = setInterval(() => {
    if (pdfViewer.value?.pdfDocument) {
      totalPages.value = pdfViewer.value.totalPage || 0
      currentPage.value = pageNumber
      gotoPageNum.value = pageNumber

      // 获取渲染的canvas元素并调整其尺寸与PDF保持一致
      nextTick(() => {
        const canvas = pdfContainer.value?.querySelector(`canvas.pageNum${pageNumber}`) as HTMLCanvasElement
        if (canvas) {
          // 获取父容器可用宽度
          const parentContainer = pdfContainer.value?.parentElement
          const containerWidth = parentContainer
            ? parentContainer.clientWidth
            : window.innerWidth

          // PDF原始宽度（pt单位）
          const pdfOriginalWidthPt = canvas.width

          // 将PDF原始宽度从pt转换为px（1pt ≈ 1.333px，基于96 DPI）
          const ptToPxRatio = 96 / 72
          const pdfOriginalWidthPx = pdfOriginalWidthPt * ptToPxRatio

          // 计算缩放比例，确保PDF在容器中正确显示
          const scaleFactor = Math.min(1, containerWidth / pdfOriginalWidthPx)
          const fixedWidth = Math.floor(pdfOriginalWidthPx * scaleFactor)

          // 计算原始宽高比
          const originalRatio = canvas.width / canvas.height

          // 根据固定宽度和原始比例计算高度（高度可变）
          const calculatedHeight = Math.floor(fixedWidth / originalRatio)

          // 1. 设置canvas样式尺寸：宽度固定为容器宽度，高度按比例计算
          canvas.classList.add('max-w-full')
          canvas.style.width = `${fixedWidth}px`
          canvas.style.height = `${calculatedHeight}px`

          // 2. 设置容器尺寸：宽度与canvas一致，高度按比例计算
          if (pdfContainer.value) {
            pdfContainer.value.classList.add('overflow-hidden')
            pdfContainer.value.style.width = `${fixedWidth}px`
            pdfContainer.value.style.height = `${calculatedHeight}px`
          }
        }

        pdfLoaded.value = true
        loading.value = false
        clearInterval(interval)
        setSealPosition()
        // 确保签章在可见区域内
        // 确保所有印章在可见区域内
        currentPageSeals.value.forEach((seal) => {
          if (sealPositions.value[seal.sealId]) {
            ensureSealInBounds(seal.sealId)
          }
        })
      })
    }
  }, 200)
}

function setSealPosition() {
  if (!pdfLoaded.value || !pdfContainer.value || !props.reportFile)
    return

  // 获取当前页面的canvas元素
  const currentCanvas = pdfContainer.value.querySelector(`.pageNum${currentPage.value}`) as HTMLCanvasElement
  if (!currentCanvas)
    return

  // 获取canvas的原始宽度（PDF实际宽度，pt单位）和显示宽度（px单位）
  const canvasOriginalWidthPt = currentCanvas.width
  const canvasDisplayWidthPx = currentCanvas.clientWidth

  // 计算实际缩放比例：原始像素宽度 / 显示像素宽度
  scaleRatio.value = (canvasOriginalWidthPt * ptToPxRatio) / canvasDisplayWidthPx

  // 清空当前页面的印章位置记录
  const tempSealPositions: Record<string, { x: number, y: number, width: number, height: number }> = {}

  // 当切换页码/文件时，更新所有签章位置
  const pageSeals = props.reportFile.pagePositions?.filter(pos => pos.pageNum === currentPage.value) || []

  pageSeals.forEach((seal) => {
    const recordKey = `[${props.reportFile!.reportFileId}]-[${seal.sealId}]-[${currentPage.value}]`

    tempSealPositions[seal.sealId] = {
      x: changeRecord.value[recordKey]?.locationX ?? (seal.locationX * ptToPxRatio / scaleRatio.value),
      y: changeRecord.value[recordKey]?.locationY ?? (seal.locationY * ptToPxRatio / scaleRatio.value),
      width: seal.width * ptToPxRatio,
      height: seal.height * ptToPxRatio,
    }
  })

  // 更新印章位置记录
  sealPositions.value = tempSealPositions
}

/**
 * 渲染指定页码的PDF页面
 * @param pageNum 页码
 */
function renderPage(pageNum: number) {
  if (!pdfContainer.value)
    return

  try {
    // 设置加载状态
    loading.value = true
    pdfLoaded.value = false

    // 清除宽度设置，让新页面能够根据固定宽度重新计算高度
    pdfContainer.value.style.width = 'auto'
    pdfContainer.value.classList.add('overflow-hidden')

    // 清空PDF容器，但保留高度设置
    pdfContainer.value.innerHTML = ''
    pdfContainer.value.style.width = 'auto'

    // 加载指定页码
    loadPdfFile(pageNum)
  }
  catch (error) {
    console.error('渲染PDF页面失败:', error)
    loading.value = false
  }
}

/**
 * # 确保签章在可视区域内 🎯
 * 适配左下角为原点的坐标系，调整边界检查逻辑
 * @param sealId 印章ID
 */
function ensureSealInBounds(sealId: string) {
  if (!pdfContainer.value || !sealPositions.value[sealId] || !props.reportFile)
    return

  // 获取当前页面的canvas元素
  const currentCanvas = pdfContainer.value.querySelector(`.pageNum${currentPage.value}`)
  if (!currentCanvas)
    return

  const rect = currentCanvas.getBoundingClientRect()
  const position = sealPositions.value[sealId]

  // 适配左下角为原点的坐标系
  // x坐标依然从左边界开始计算
  const maxX = rect.width - position.width
  // y坐标现在从底部开始计算，maxY是从底部到顶部的最大距离
  const maxY = rect.height - position.height

  // 限制x坐标在有效范围内
  position.x = Number(Math.max(0, Math.min(position.x, maxX)).toFixed(2))
  // 限制y坐标在有效范围内（现在是从底部开始计算）
  position.y = Number(Math.max(0, Math.min(position.y, maxY)).toFixed(2))

  // updatePositionEmit(sealId)
}

/**
 * # 记录坐标信息（px） ⚡
 * @param sealId 印章ID
 */
function updatePositionEmit(sealId: string) {
  if (!pdfLoaded.value || !props.reportFile || !sealPositions.value[sealId])
    return

  const position = sealPositions.value[sealId]
  changeRecord.value[`[${props.reportFile!.reportFileId}]-[${sealId}]-[${currentPage.value}]`] = {
    reportId: props.reportFile!.reportId,
    reportFileId: props.reportFile!.reportFileId,
    reportFileMarkId: props.reportFile!.reportFileMarkId,
    sealId,
    locationX: position.x,
    locationY: position.y,
    pageNum: currentPage.value,
  }
}

/**
 * 上一页
 */
function prevPage() {
  if (currentPage.value <= 1)
    return

  const pageNum = currentPage.value - 1
  renderPage(pageNum)
}

/**
 * 下一页
 */
function nextPage() {
  if (currentPage.value >= totalPages.value)
    return

  const pageNum = currentPage.value + 1
  renderPage(pageNum)
}

/**
 * 跳转到指定页码
 */
function gotoPage() {
  let pageNum = gotoPageNum.value
  if (pageNum < 1)
    pageNum = 1
  if (pageNum > totalPages.value)
    pageNum = totalPages.value

  renderPage(pageNum)
}

/**
 * 处理签章鼠标按下事件
 * @param e 鼠标事件
 * @param sealId 印章ID
 */
function handleSealMouseDown(e: MouseEvent, sealId: string) {
  e.preventDefault()
  draggingSealId.value = sealId
  selectedSealId.value = sealId

  dragStartPos.value = {
    x: e.clientX,
    y: e.clientY,
  }

  if (sealPositions.value[sealId]) {
    sealStartPos.value[sealId] = {
      x: sealPositions.value[sealId].x,
      y: sealPositions.value[sealId].y,
    }
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

/**
 * # 处理鼠标移动（拖拽） 🖱️
 * 适配左下角为原点的坐标系，反转Y坐标增量方向
 */
function handleMouseMove(e: MouseEvent) {
  if (!draggingSealId.value || !sealPositions.value[draggingSealId.value])
    return

  const deltaX = e.clientX - dragStartPos.value.x
  // 在左下角坐标系中，鼠标向下移动对应y值减小，所以需要反转deltaY
  const deltaY = dragStartPos.value.y - e.clientY

  const sealId = draggingSealId.value
  const startPos = sealStartPos.value[sealId]

  if (startPos) {
    sealPositions.value[sealId].x = Number((startPos.x + deltaX).toFixed(2))
    sealPositions.value[sealId].y = Number((startPos.y + deltaY).toFixed(2))
    changedReportFileIds.value = [...new Set([...changedReportFileIds.value, props.reportFile!.reportFileId])]
    ensureSealInBounds(sealId)
    updatePositionEmit(sealId)
  }
}

/**
 * 处理鼠标松开（拖拽）
 */
function handleMouseUp() {
  // 确保拖拽结束后更新选中状态的样式层级
  if (draggingSealId.value) {
    const element = sealRefs.value[draggingSealId.value]
    if (element) {
      // 移除可能存在的拖拽时的特殊样式
      element.style.zIndex = '10' // 确保选中的印章在最上层
    }
  }
  draggingSealId.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

/**
 * 处理画布点击事件，取消选中状态
 */
function handleCanvasClick(e: MouseEvent) {
  // 如果点击的是画布本身（不是印章），取消选中状态
  if (e.target === pdfContainer.value || e.target === pdfContainer.value?.firstChild) {
    selectedSealId.value = ''
    // 更新所有印章的样式
    Object.values(sealRefs.value).forEach((el) => {
      el.style.zIndex = '1'
      el.classList.remove('border-blue-500')
    })
  }
}

// 监听文件URL变化
watch(() => props.reportFile, (newVal) => {
  if (newVal) {
    currentFileUrl.value = newVal.attachmentUrl
    loadPDF()
  }
})

/**
 * # 处理窗口大小变化 ⚙️
 * 当窗口尺寸改变时，重新渲染PDF以保持固定宽度、高度自适应的显示效果
 */
function handleResize() {
  if (pdfLoaded.value) {
    // 清除当前宽度设置，让重新渲染时能够根据新的容器宽度计算
    if (pdfContainer.value) {
      pdfContainer.value.style.width = 'auto'
    }
    renderPage(currentPage.value)
  }
}

// 组件卸载时清理事件监听器
function cleanup() {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 清理PDF2Image实例
  if (pdfContainer.value) {
    pdfContainer.value.innerHTML = ''
  }
  pdfViewer.value = null
}

async function initPDFjs() {
  // 修复Array.prototype问题
  fixArrayPrototype()

  await Promise.all([
    createScript('pdf.js'),
    createScript('pdf.worker.js'),
  ])
}

/**
 * # 修复Array.prototype问题 ⚙️
 * 删除Array.prototype上的意外可枚举属性，避免PDF.js初始化错误
 * 同时提供安全的替代方法
 */
function fixArrayPrototype() {
  // 检查并删除可能存在的removeByValue方法
  if (Object.prototype.hasOwnProperty.call(Array.prototype, 'removeByValue')) {
    // @ts-expect-error 忽略removeByValue属性的类型错误
    delete Array.prototype.removeByValue
  }
}

function createScript(jsname: string) {
  const baseUrl = import.meta.env.VITE_ILIS_DRIVERS

  return new Promise<void>((resolve) => {
    const _id = jsname.replace('.', '')
    if (document.getElementById(_id))
      return resolve()
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${baseUrl}/pdfjs/${jsname}`
    script.id = _id
    document.body.appendChild(script)
    script.onload = () => {
      resolve()
    }
  })
}

function resetSealPosition(reportFileId: string) {
  // 清除所有该文件的印章位置记录
  const keys = Object.keys(changeRecord.value)
  keys.forEach((key) => {
    if (key.includes(reportFileId)) {
      delete changeRecord.value[key]
    }
  })

  // 清空印章位置引用
  sealRefs.value = {}
  sealPositions.value = {}

  // 重置选中状态
  selectedSealId.value = ''
  draggingSealId.value = null

  changedReportFileIds.value = changedReportFileIds.value?.filter(id => !id.includes(reportFileId)) || []
  renderPage(1)
}

function getTransformChangedSealPosition() {
  if (!Object.keys(changeRecord.value)?.length) {
    return null
  }
  const positionsAll: ISetSignaturePositionDTO[] = Object.values(changeRecord.value)
  // 对坐标数据加以转换（当前存储的是缩放后的，并且是基于px单位的，需要转换为相对于PDF容器的坐标）
  const transformPositions = positionsAll.map(item => ({
    ...item,
    locationX: Number((item.locationX * scaleRatio.value / ptToPxRatio).toFixed(2)),
    locationY: Number((item.locationY * scaleRatio.value / ptToPxRatio).toFixed(2)),
  }))
  return transformPositions
}

// 组件挂载时加载PDF
onMounted(async () => {
  await initPDFjs() // 确保PDF.js已初始化
  await loadPDF()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cleanup()
})

// 暴露方法和数据给父组件
defineExpose({
  resetSealPosition,
  getTransformChangedSealPosition,
})
</script>

<style scoped>
/* 用于canvas的特殊样式 */
:deep(canvas) {
  display: block;
  margin: 0 auto;
  pointer-events: auto;
}

/* 确保PDF容器有正确的定位 */
.pdf-container-wrapper {
  position: relative;
  min-height: 500px;
}
</style>
