import { shallowRef, ref, provide, Component, watch } from "vue"
import type { ComponentPublicInstance } from "vue"
import { CustomTab } from "../components"
import { message } from "ant-design-vue"
import { storeToRefs } from "pinia"
import { useStore } from "@/store"
import { functionRoomStore } from "@/store/functionRoom"
const { screenConfig } = storeToRefs(useStore())
const { customTabs } = storeToRefs(functionRoomStore())

export interface TabDTO {
  title: string
  key: string
  mainEntityId?: string
  component: Component
}
export type refItem = ComponentPublicInstance | Element | null

let timer: any = null
let refreshTimer: any = null
export function useCustomTabs(staticTabs: TabDTO[]) {
  const activeTab = ref(0)
  const tabs = shallowRef<TabDTO[]>(staticTabs)

  //自定义tab变更
  let oldTabs = ""
  watch(
    () => customTabs.value,
    (data) => {
      if (oldTabs === JSON.stringify(data)) return
      oldTabs = JSON.stringify(data)
      if (customTabs.value.length > 0) {
        const list = customTabs.value.map((d) => {
          return {
            title: d.name,
            key: d.id,
            mainEntityId: d.mainEntityId,
            component: CustomTab
          }
        })
        const allList = staticTabs.concat(list)
        tabs.value = allList
        if (activeTab.value > allList.length - 1) {
          activeTab.value = 0
        }
      }
    },
    { immediate: true }
  )

  // 切换tab
  function changeTab(key: string) {
    let ind = -1
    if (key === "RiskInformation") {
      ind = tabs.value.findIndex((d) => d.title.indexOf("风险告知") !== -1)
    } else {
      ind = tabs.value.findIndex((d) => d.key === key)
    }
    if (ind === -1) {
      return message.error("该功能暂未配置")
    }
    activeTab.value = ind
  }

  // 自动轮播，切换tab
  function startTimer() {
    stopTimer()
    if (!screenConfig.value.frequencyCarousel) return
    timer = setInterval(() => {
      activeTab.value++
      if (activeTab.value > tabs.value.length - 1) activeTab.value = 0
      changeTab(tabs.value[activeTab.value].key)
    }, screenConfig.value.frequencyCarousel * 1000)
  }

  function stopTimer() {
    timer && clearInterval(timer)
  }

  // 操作屏幕时,停止轮播
  document.addEventListener("touchstart", () => {
    stopTimer()
    stopRefreshTimer()
  })

  // 停止操作时,重写开始轮播
  document.addEventListener("touchend", () => {
    startTimer()
    startRefreshTimer()
  })

  // 聚焦input时,重写开始轮播
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.addedNodes.length > 0) {
        record.addedNodes.forEach((node) => {
          if (node.nodeName === "INPUT") {
            node.addEventListener("focus", () => {
              stopTimer()
              stopRefreshTimer()
            })

            node.addEventListener("blur", () => {
              startTimer()
              startRefreshTimer()
            })
          } else if (node.nodeName === "DIV") {
            const inputs = (node as any).getElementsByTagName("input")
            for (let i = 0; i < inputs.length; i++) {
              const input = inputs[i]
              input.addEventListener("focus", () => {
                stopTimer()
                stopRefreshTimer()
              })

              input.addEventListener("blur", () => {
                startTimer()
                startRefreshTimer()
              })
            }
          }
        })
      }
    })
  })
  observer.observe(document, { childList: true, subtree: true })

  // 动态设置component ref
  const refMap: Record<string, refItem> = {}
  function setRefMap(el: refItem, item: TabDTO) {
    if (el) {
      refMap[`${item.key}`] = el
    }
  }

  // 自动刷新
  function startRefreshTimer() {
    stopRefreshTimer()
    const { frequencyRefresh, frequencyCarousel } = screenConfig.value
    // 刷新频率为零或未配置、刷新频率大于等于轮播频率时,无需开启自动刷新
    if (!frequencyRefresh || frequencyRefresh >= frequencyCarousel) return
    refreshTimer = setInterval(() => {
      const key = tabs.value[activeTab.value].key
      const $component = refMap[`${key}`] as any
      $component && $component.refreshData && $component.refreshData()
    }, frequencyRefresh * 1000)
  }

  function stopRefreshTimer() {
    refreshTimer && clearInterval(refreshTimer)
  }

  startTimer()
  startRefreshTimer()
  provide("changeTab", changeTab)

  // 轮播频率变更
  watch(
    () => screenConfig.value.frequencyCarousel,
    () => {
      startTimer()
    }
  )

  // 自动刷新频率变更
  watch(
    () => screenConfig.value.frequencyRefresh,
    () => {
      startRefreshTimer()
    }
  )

  return { activeTab, tabs, setRefMap }
}
