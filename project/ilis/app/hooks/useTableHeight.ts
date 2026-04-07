import type { Ref } from 'vue'
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import { ref, watch } from 'vue'

/**
 * 获取表格高度
 * @param isPagination 是否显示分页
 * @param data 表格数据，用于监听数据变化触发高度重新计算
 * @param loading 表格加载状态，用于确保数据加载完成后计算高度
 */
export function useTableHeight(isPagination?: boolean, data?: Ref<any[]>, loading?: Ref<boolean>) {
  // 表格所在容器，需要自适应内容区高度，且获取容器高度
  const tableBoxRef = ref<HTMLElement>()
  // 表格高度
  const tableHeight = ref(300)
  const pagination = isPagination === undefined ? true : isPagination

  // 防抖延迟时间（毫秒）
  const DEBOUNCE_DELAY = 100

  // 表格高度计算函数
  function calculateTableHeight() {
    if (!tableBoxRef.value)
      return

    // 获取表格容器高度
    const containerHeight = tableBoxRef.value.clientHeight
    if (!containerHeight)
      return

    // 获取表头高度
    const tableHeader = tableBoxRef.value.querySelector('.ant-table-header')
    const tabHeadH = tableHeader?.clientHeight || 32 // 列过多时，表头可能换行

    // 获取分页器高度
    let paginationHeight = 0
    if (pagination) {
      const paginationDom = tableBoxRef.value.querySelector('.ant-pagination') as HTMLElement
      if (paginationDom) {
        paginationHeight = paginationDom.clientHeight + 8 // 8px 为分页器与表格内容的间距
      }
    }

    // 计算表格内容高度
    const calculatedHeight = containerHeight - tabHeadH - paginationHeight
    tableHeight.value = Math.max(calculatedHeight, 200) // 设置最小高度，避免高度为负数

    // 固定内容区高度
    const body = tableBoxRef.value.querySelector('.ant-table-body') as HTMLElement
    if (body) {
      body.style.height = `${tableHeight.value}px`
    }
  }

  // 使用@vueuse/core提供的useDebounceFn创建防抖函数
  const initTableHeight = useDebounceFn(() => {
    calculateTableHeight()
  }, DEBOUNCE_DELAY)

  // 监听容器变化
  watch(tableBoxRef, (dom) => {
    if (!dom)
      return
    useResizeObserver(dom, initTableHeight)
  })

  // 监听数据变化，重新计算高度
  watch([data, loading], () => {
    // 当数据加载完成后重新计算高度
    if (data && (!loading || loading.value === false)) {
      initTableHeight()
    }
  })

  return {
    tableBoxRef,
    tableHeight,
    initTableHeight,
  }
}
