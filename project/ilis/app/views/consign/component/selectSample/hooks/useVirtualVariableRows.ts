import type { Ref } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'

/**
 * 虚拟滚动占位行接口
 * 用于在表格中创建顶部和底部的占位区域，模拟完整滚动高度
 */
export interface VirtualSpacerRow {
  /** 标记为虚拟占位行 */
  __virtualSpacer: true
  /** 占位行唯一标识 */
  id: string
  /** 占位行禁用选择 */
  disabled: true
  /** 标记为分组行样式 */
  isGroup: true
  /** 占位高度（像素） */
  spacerHeight: number
}

/**
 * 虚拟滚动配置选项
 * @template T 数据行类型
 */
interface UseVirtualVariableRowsOptions<T> {
  /** 数据行数组（响应式） */
  rows: Ref<T[]>
  /** 表格容器元素引用 */
  tableWrapRef: Ref<HTMLElement | undefined>
  /** 获取行唯一键的函数 */
  getRowKey: (row: T, index: number) => string
  /** 预估行高度（像素），默认48 */
  estimatedRowHeight?: number
  /** 视口外额外渲染行数，默认10 */
  overscan?: number
  /** 启用虚拟滚动的数据量阈值，小于此值不启用虚拟滚动，默认100 */
  virtualThreshold?: number
  /** 锚点间隔，默认20行 */
  anchorInterval?: number
}

/**
 * 判断是否为虚拟占位行
 * @param row 待判断的行数据
 * @returns 是否为虚拟占位行
 */
export function isVirtualSpacerRow(row: unknown): row is VirtualSpacerRow {
  return !!row && typeof row === 'object' && '__virtualSpacer' in row
}

/**
 * 动态高度虚拟滚动 Hook - 优化版
 *
 * 核心优化策略：
 * 1. 预估高度优先：滚动时使用预估高度快速计算，保证流畅
 * 2. 锚点缓存：每 N 行缓存一个锚点，减少计算量
 * 3. 增量更新：滚动停止后测量实际高度，只更新可见区域
 * 4. 平滑过渡：高度变化时渐变调整，避免跳动
 *
 * @template T 数据行类型
 * @param options 配置选项
 * @returns 虚拟滚动相关方法和状态
 */
export function useVirtualVariableRows<T>(options: UseVirtualVariableRowsOptions<T>) {
  // ==================== 配置参数 ====================
  /** 预估行高度（像素），用于快速计算和未测量行 */
  const estimatedRowHeight = options.estimatedRowHeight ?? 48
  /** 视口外额外渲染行数，避免滚动时出现空白 */
  const overscan = options.overscan ?? 10
  /** 启用虚拟滚动的数据量阈值，小于此值不启用虚拟滚动 */
  const virtualThreshold = options.virtualThreshold ?? 100
  /** 锚点间隔，每 N 行缓存一个偏移量锚点，用于加速偏移量计算 */
  const anchorInterval = options.anchorInterval ?? 20

  // ==================== 状态定义 ====================
  /** 表格 body 元素引用，用于监听滚动和测量 */
  const bodyEl = ref<HTMLElement>()
  /** 当前滚动位置（像素），驱动虚拟滚动计算 */
  const scrollTop = ref(0)
  /** 视口高度（像素），用于计算可见行数 */
  const viewportHeight = ref(300)

  /** 是否启用虚拟滚动：数据量小于阈值时禁用，直接渲染全部数据 */
  const isVirtualEnabled = computed(() => options.rows.value.length >= virtualThreshold)

  // ==================== 核心状态 ====================
  /** 当前可视区域起始行索引（包含 overscan） */
  const startIndex = ref(0)
  /** 当前可视区域结束行索引（包含 overscan） */
  const endIndex = ref(0)
  /** 顶部占位区域高度（像素），用于撑开滚动容器 */
  const topSpacerHeight = ref(0)
  /** 底部占位区域高度（像素），用于撑开滚动容器 */
  const bottomSpacerHeight = ref(0)
  /** 当前可视区域内的数据行，使用 shallowRef 减少响应式开销 */
  const visibleRows = shallowRef<T[]>([])

  // ==================== 高度管理 ====================
  /**
   * 实际测量高度缓存 Map
   * key: 行唯一标识（通过 getRowKey 生成）
   * value: 实际测量的行高度（像素）
   *
   * 说明：滚动停止后测量可见行高度并缓存，用于精确计算偏移量
   */
  const measuredHeights = new Map<string, number>()

  /**
   * 锚点偏移量缓存 Map
   * key: 行索引（anchorInterval 的倍数，如 0, 20, 40...）
   * value: 该行距离顶部的累计偏移量（像素）
   *
   * 说明：用于加速偏移量计算，从最近锚点开始只需遍历最多 anchorInterval 行
   */
  const anchorOffsets = new Map<number, number>()

  // ==================== 常量定义 ====================
  /** 顶部占位行的唯一标识 */
  const TOP_SPACER_KEY = '__virtual_spacer_top__'
  /** 底部占位行的唯一标识 */
  const BOTTOM_SPACER_KEY = '__virtual_spacer_bottom__'

  // ==================== 核心计算方法 ====================

  /**
   * 获取指定行的高度
   * 优先使用已测量的实际高度，否则返回预估高度
   *
   * @param row 数据行对象
   * @param index 行索引
   * @returns 行高度（像素）
   */
  function getRowHeight(row: T, index: number): number {
    const key = options.getRowKey(row, index)
    return measuredHeights.get(key) ?? estimatedRowHeight
  }

  /**
   * 通过索引获取行高
   * 用于不方便直接传入行对象的场景
   *
   * @param index 行索引
   * @returns 行高度（像素）
   */
  function getRowHeightByIndex(index: number): number {
    const rows = options.rows.value
    if (index < 0 || index >= rows.length)
      return estimatedRowHeight
    return getRowHeight(rows[index], index)
  }

  /**
   * 计算指定索引行的偏移量（距离顶部的累计高度）
   * 使用锚点优化：从最近的锚点开始计算，最多遍历 anchorInterval 行
   *
   * @param index 目标行索引
   * @returns 偏移量（像素）
   */
  function getOffset(index: number): number {
    if (index <= 0)
      return 0

    const rows = options.rows.value
    if (index > rows.length)
      index = rows.length

    // 找到最近的锚点索引（向下取整到 anchorInterval 的倍数）
    const anchorIndex = Math.floor(index / anchorInterval) * anchorInterval
    let sum = anchorOffsets.get(anchorIndex) ?? 0

    // 如果锚点未缓存，从头计算到锚点位置
    if (!anchorOffsets.has(anchorIndex)) {
      sum = 0
      for (let i = 0; i < anchorIndex && i < rows.length; i++) {
        sum += getRowHeight(rows[i], i)
      }
      anchorOffsets.set(anchorIndex, sum)
    }

    // 从锚点位置累加到目标索引
    for (let i = anchorIndex; i < index && i < rows.length; i++) {
      sum += getRowHeight(rows[i], i)
    }

    return sum
  }

  /**
   * 快速估算偏移量（用于滚动时）
   * 使用预估高度直接计算，时间复杂度 O(1)，保证滚动流畅
   *
   * @param index 行索引
   * @returns 估算的偏移量（像素）
   */
  function getEstimatedOffset(index: number): number {
    return index * estimatedRowHeight
  }

  /**
   * 快速估算起始索引（用于滚动时）
   * 根据滚动位置快速估算，时间复杂度 O(1)
   *
   * @param targetTop 目标滚动位置（像素）
   * @returns 估算的起始行索引
   */
  function getEstimatedStartIndex(targetTop: number): number {
    return Math.max(0, Math.floor(targetTop / estimatedRowHeight) - overscan)
  }

  /**
   * 精确查找起始索引（二分查找）
   * 使用实际高度（或预估）进行精确查找，时间复杂度 O(log n)
   * 用于滚动停止后精确修正位置
   *
   * @param targetTop 目标滚动位置（像素）
   * @returns 精确的起始行索引
   */
  function findStartIndex(targetTop: number): number {
    const rows = options.rows.value
    if (!rows.length)
      return 0

    let left = 0
    let right = rows.length - 1

    while (left <= right) {
      const mid = (left + right) >> 1
      const midTop = getOffset(mid)
      const rowHeight = getRowHeight(rows[mid], mid)
      const midBottom = midTop + rowHeight

      if (targetTop < midTop) {
        right = mid - 1
      }
      else if (targetTop >= midBottom) {
        left = mid + 1
      }
      else {
        return mid
      }
    }

    return Math.max(0, Math.min(rows.length - 1, left))
  }

  /**
   * 计算列表总高度
   * 累加所有行的实际高度（或预估高度）
   *
   * @returns 总高度（像素）
   */
  function calculateTotalHeight(): number {
    const rows = options.rows.value
    let sum = 0
    rows.forEach((row, index) => {
      sum += getRowHeight(row, index)
    })
    return sum
  }

  // ==================== 虚拟滚动状态更新 ====================

  /**
   * 快速更新虚拟滚动状态（滚动时使用）
   * 使用预估高度进行快速计算，保证滚动流畅度
   * 时间复杂度 O(1)，不依赖实际测量数据
   */
  function updateVirtualStateFast() {
    const rows = options.rows.value
    if (!rows.length) {
      startIndex.value = 0
      endIndex.value = 0
      topSpacerHeight.value = 0
      bottomSpacerHeight.value = 0
      visibleRows.value = []
      return
    }

    // 快速估算起始索引
    const rawStart = getEstimatedStartIndex(scrollTop.value)
    const newStartIndex = Math.max(0, rawStart)

    // 估算结束索引
    const visibleCount = Math.ceil(viewportHeight.value / estimatedRowHeight) + overscan * 2
    const newEndIndex = Math.min(rows.length, newStartIndex + visibleCount)

    // 计算占位高度（使用估算）
    const newTopSpacerHeight = getEstimatedOffset(newStartIndex)
    const totalHeight = rows.length * estimatedRowHeight
    const visibleHeight = (newEndIndex - newStartIndex) * estimatedRowHeight
    const newBottomSpacerHeight = Math.max(0, totalHeight - newTopSpacerHeight - visibleHeight)

    // 批量更新
    startIndex.value = newStartIndex
    endIndex.value = newEndIndex
    topSpacerHeight.value = newTopSpacerHeight
    bottomSpacerHeight.value = newBottomSpacerHeight

    // 更新可视数据（使用 markRaw）
    const newVisibleRows = rows.slice(newStartIndex, newEndIndex)
    visibleRows.value = newVisibleRows.map(row => markRaw(row as object) as T)
  }

  /**
   * 精确更新虚拟滚动状态（滚动停止后使用）
   * 使用实际测量高度进行精确计算，修正滚动位置
   * 时间复杂度 O(视口行数)，只在滚动停止后执行
   */
  function updateVirtualStatePrecise() {
    if (!isVirtualEnabled.value)
      return

    const rows = options.rows.value
    if (!rows.length)
      return

    // 使用二分查找精确确定起始索引
    const rawStart = findStartIndex(scrollTop.value)
    const newStartIndex = Math.max(0, rawStart - overscan)

    // 精确计算结束索引：累加行高直到超出视口底部
    const viewportBottom = scrollTop.value + viewportHeight.value + overscan * estimatedRowHeight
    let end = newStartIndex
    while (end < rows.length) {
      const offset = getOffset(end)
      const rowHeight = getRowHeightByIndex(end)
      if (offset + rowHeight >= viewportBottom) {
        break
      }
      end++
    }
    const newEndIndex = Math.min(rows.length, end + 1)

    // 使用实际测量的高度计算占位区域
    const newTopSpacerHeight = getOffset(newStartIndex)
    const totalHeight = calculateTotalHeight()
    const visibleHeight = getOffset(newEndIndex) - newTopSpacerHeight
    const newBottomSpacerHeight = Math.max(0, totalHeight - newTopSpacerHeight - visibleHeight)

    // 批量更新状态
    startIndex.value = newStartIndex
    endIndex.value = newEndIndex
    topSpacerHeight.value = newTopSpacerHeight
    bottomSpacerHeight.value = newBottomSpacerHeight

    // 更新可视数据（使用 markRaw 避免 Vue 代理）
    const newVisibleRows = rows.slice(newStartIndex, newEndIndex)
    visibleRows.value = newVisibleRows.map(row => markRaw(row as object) as T)
  }

  // ==================== 虚拟行计算 ====================

  /**
   * 虚拟滚动后的最终数据（包含占位行）
   * 小数据量时直接返回全部数据
   * 大数据量时返回：顶部占位 + 可视行 + 底部占位
   */
  const virtualRows = computed(() => {
    // 未启用虚拟滚动时，直接返回全部数据
    if (!isVirtualEnabled.value) {
      return options.rows.value as Array<T | VirtualSpacerRow>
    }

    const list: Array<T | VirtualSpacerRow> = []
    const topHeight = topSpacerHeight.value

    // 添加顶部占位行，撑开滚动区域
    if (topHeight > 0) {
      list.push({
        __virtualSpacer: true,
        id: TOP_SPACER_KEY,
        disabled: true,
        isGroup: true,
        spacerHeight: topHeight,
      })
    }

    // 添加实际可视数据行
    list.push(...visibleRows.value as Array<T>)

    // 添加底部占位行，撑开滚动区域
    const bottomHeight = bottomSpacerHeight.value
    if (bottomHeight > 0) {
      list.push({
        __virtualSpacer: true,
        id: BOTTOM_SPACER_KEY,
        disabled: true,
        isGroup: true,
        spacerHeight: bottomHeight,
      })
    }

    return list
  })

  // ==================== DOM 操作 ====================

  /**
   * 解析并缓存表格 body 元素
   * 从 tableWrapRef 中查找 .ant-table-body 元素
   */
  function resolveBodyEl() {
    const dom = options.tableWrapRef.value
    if (!dom) {
      bodyEl.value = undefined
      return
    }
    bodyEl.value = dom.querySelector('.ant-table-body') as HTMLElement | undefined
    if (bodyEl.value) {
      viewportHeight.value = bodyEl.value.clientHeight || viewportHeight.value
    }
  }

  // ==================== 行高测量（滚动停止后） ====================

  /**
   * 测量当前可见行的实际高度
   * 滚动停止后执行，将测量结果缓存到 measuredHeights
   * 只测量未测量过的行，避免重复计算
   *
   * @returns 是否有新的测量数据
   */
  function measureVisibleRows() {
    const body = bodyEl.value
    if (!body)
      return

    const rows = body.querySelectorAll('tbody > tr[data-row-key]')
    let hasNewMeasurement = false

    rows.forEach((tr) => {
      const key = tr.getAttribute('data-row-key') || ''
      if (!key || key === TOP_SPACER_KEY || key === BOTTOM_SPACER_KEY)
        return

      // 如果已经测量过，跳过
      if (measuredHeights.has(key))
        return

      const height = tr.getBoundingClientRect().height
      measuredHeights.set(key, height)
      hasNewMeasurement = true
    })

    // 如果有新测量，更新锚点缓存
    if (hasNewMeasurement) {
      updateAnchorOffsets()
    }

    return hasNewMeasurement
  }

  /**
   * 更新锚点偏移量缓存
   * 遍历所有行，在每 anchorInterval 行的位置记录累计偏移量
   * 用于加速后续的偏移量计算
   */
  function updateAnchorOffsets() {
    const rows = options.rows.value
    anchorOffsets.clear()

    let sum = 0
    for (let i = 0; i < rows.length; i++) {
      if (i % anchorInterval === 0) {
        anchorOffsets.set(i, sum)
      }
      sum += getRowHeight(rows[i], i)
    }
  }

  // ==================== 滚动控制 ====================

  /**
   * 滚动状态管理
   * 标记滚动开始，并设置滚动停止检测定时器
   * 滚动停止 150ms 后执行精确修正
   */
  const isScrolling = ref(false)
  /** 滚动停止检测定时器 ID */
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * 标记滚动状态
   * 滚动开始时设置为 true，滚动停止 150ms 后设置为 false
   * 并在滚动停止后执行行高测量和位置修正
   */
  function markScrolling() {
    isScrolling.value = true
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false
      // 滚动停止后：测量行高并精确修正
      const hasNewMeasurement = measureVisibleRows()
      if (hasNewMeasurement) {
        updateVirtualStatePrecise()
      }
    }, 150)
  }

  // ==================== RAF 批量更新 ====================

  /** 待处理的滚动位置 */
  let pendingScrollTop = 0
  /** 是否有待处理的滚动更新 */
  let isScrollPending = false

  /**
   * 使用 RAF 批量处理滚动更新
   * 避免频繁更新导致的性能问题
   * 确保更新与浏览器渲染帧同步
   */
  function scheduleScrollUpdate() {
    if (isScrollPending)
      return
    isScrollPending = true

    requestAnimationFrame(() => {
      scrollTop.value = pendingScrollTop
      // 滚动时使用快速更新（预估高度）
      updateVirtualStateFast()
      isScrollPending = false
    })
  }

  /**
   * 滚动事件处理函数
   * 记录滚动位置并触发批量更新
   *
   * @param event 滚动事件对象
   */
  function handleScroll(event: Event) {
    pendingScrollTop = (event.target as HTMLElement).scrollTop
    markScrolling()
    scheduleScrollUpdate()
  }

  // 绑定滚动事件监听，使用 passive 模式提升滚动性能
  useEventListener(() => bodyEl.value, 'scroll', handleScroll, { passive: true })

  // ==================== 容器大小监听 ====================

  /**
   * 监听表格容器大小变化
   * 容器高度变化时重新计算虚拟滚动状态
   */
  useResizeObserver(() => bodyEl.value, (entries) => {
    const entry = entries[0]
    if (!entry)
      return
    viewportHeight.value = Math.max(200, entry.contentRect.height)
    updateVirtualStateFast()
  })

  // ==================== 数据监听 ====================

  /**
   * 监听数据变化
   * 数据变化时更新锚点缓存并重新计算虚拟滚动状态
   */
  watch(() => options.rows.value, () => {
    // 数据变化时，保留已测量的行高缓存（如果行 key 不变）
    // 更新锚点偏移量缓存
    updateAnchorOffsets()
    updateVirtualStateFast()
  }, { immediate: true, deep: false })

  /**
   * 监听表格容器引用变化
   * 容器变化时重新解析 DOM 并计算状态
   */
  watch(() => options.tableWrapRef.value, async () => {
    await nextTick()
    resolveBodyEl()
    updateVirtualStateFast()
  }, { immediate: true })

  // ==================== 公共方法 ====================

  /**
   * 重置虚拟滚动状态
   * 清空所有缓存，滚动位置归零，重新计算状态
   * 适用于数据重大变化或需要重新初始化时
   */
  function reset() {
    const body = bodyEl.value
    scrollTop.value = 0
    if (body) {
      body.scrollTop = 0
    }
    measuredHeights.clear()
    anchorOffsets.clear()
    updateVirtualStateFast()
  }

  /**
   * 立即同步行高（用于编辑场景）
   * 编辑行内容后调用，立即测量并更新布局
   * 适用于行高度因编辑操作而改变的场景
   */
  async function syncRowHeights() {
    await nextTick()
    measureVisibleRows()
    updateVirtualStatePrecise()
  }

  /**
   * 强制重新测量所有行高
   * 清空所有缓存，从头开始重新测量
   * 适用于预估高度与实际高度偏差较大时
   */
  function remeasureAll() {
    measuredHeights.clear()
    anchorOffsets.clear()
    updateAnchorOffsets()
    updateVirtualStateFast()
  }

  // ==================== 返回值 ====================

  return {
    /** 虚拟滚动后的数据（包含占位行），用于表格渲染 */
    virtualRows,
    /** 重置虚拟滚动状态，清空缓存 */
    reset,
    /** 判断是否为虚拟占位行 */
    isVirtualSpacerRow,
    /** 立即同步行高（编辑后调用） */
    syncRowHeights,
    /** 强制重新测量所有行高 */
    remeasureAll,
    /** 是否启用虚拟滚动（只读） */
    isVirtualEnabled: readonly(isVirtualEnabled),
    /** 是否正在滚动（只读），可用于优化 UI */
    isScrolling: readonly(isScrolling),
    /** 当前可视区域起始索引（调试用，只读） */
    _startIndex: readonly(startIndex),
    /** 当前可视区域结束索引（调试用，只读） */
    _endIndex: readonly(endIndex),
    /** 已测量行数（调试用，只读） */
    _measuredCount: computed(() => measuredHeights.size),
  }
}

export default useVirtualVariableRows
