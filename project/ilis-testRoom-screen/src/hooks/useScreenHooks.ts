import { useStore } from "@/store"
import { toRefs } from "vue"

export const useScreenHooks = () => {
  const { screenConfig } = toRefs(useStore())
  /**
   * 定时刷新数据
   */
  function refreshData(callback: () => void) {
    if (!screenConfig.value.frequencyRefresh) {
      return
    }
    setTimeout(
      () => {
        callback && callback()
        refreshData(callback)
      },
      screenConfig.value.frequencyRefresh ? screenConfig.value.frequencyRefresh * 1000 : 60 * 1000
    )
  }

  return {
    refreshData
  }
}
