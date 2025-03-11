import { useResizeObserver } from '@vueuse/core'

/**
 * 获取表格高度
 * @param isPagination 是否显示分页
 */
export function useTableHeight(isPagination?: boolean) {
  // 表格所在容器，需要自适应内容区高度，且获取容器高度
  const tableBoxRef = ref<HTMLElement>()
  // 表格高度
  const tableHeight = ref(300)
  let tabHeadH = 55 // 表头高度
  const paginationH = 24 + 25 // 分页高度 + 上下margin
  const pagination = isPagination === undefined ? true : isPagination

  function initTableHeight() {
    nextTick(() => {
      if (!tableBoxRef.value)
        return

      const tableHeader = tableBoxRef.value?.querySelector('.ant-table-header')
      if (tableHeader) {
        tabHeadH = tableHeader.clientHeight || 55 // 列过多时，表头可能换行
      }
      const h = tableBoxRef.value.clientHeight
      if (!h)
        return
      tableHeight.value = h - tabHeadH - (pagination ? paginationH : 0)
    })
  }

  useResizeObserver(document.body, initTableHeight)

  return {
    tableBoxRef,
    tableHeight,
    initTableHeight,
  }
}
