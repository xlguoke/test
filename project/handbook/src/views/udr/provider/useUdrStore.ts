import { defineStore } from 'pinia'
import { UdrPageType } from '@/views/testTask/udr'

/**
 * udr页面数据控制
 */
const useUdrStore = defineStore('udrStore', {
  getters: {
    /** 在线udr */
    isOnlineUdrPage(state) {
      return state.udrPageType === UdrPageType.在线UDR
    },
    /** 离线udr */
    isOfflineUdrPage(state) {
      return state.udrPageType === UdrPageType.离线UDR
    },
    /** 模板udr */
    isTemplateUdrPage(state) {
      return state.udrPageType === UdrPageType.模板UDR
    },
    /** 左侧区域宽度 */
    leftWidth(state) {
      if (!state.panelManager.leftAreaOpen)
        return 0

      // 非在线udr不展示试验打包功能
      if (!this.isOnlineUdrPage)
        return 200

      return state.panelManager.testPackageOpen ? 520 : 248
    },
    /** 右侧区域宽度 */
    rightWidth(state) {
      if (state.panelManager.testTaskDetail)
        return 320

      if (state.panelManager.eqCollectionHistoryOpen)
        return 280

      return 0
    },
    topHeight(state) {
      return state.panelManager.actionBarOpen ? 48 : 0
    },
    bottomHeight() {
      return 0
    },
  },
  state: (): {
    // 当前UDR类型
    udrPageType: UdrPageType | null

    /** 功能面板控制 */
    panelManager: {
      /** 试验打包 */
      testPackageOpen: boolean
      /** 左侧区域（表格列表） */
      leftAreaOpen: boolean
      /** 历史数据采集 */
      eqCollectionHistoryOpen: boolean
      /** 操作栏 */
      actionBarOpen: boolean
      /** 试验详情 */
      testTaskDetail: boolean
    }

    /** 当前打开的的表格名称 */
    sheetName: string

    // udr启动参数
    udrStartParams: Record<string, any>

    // 当前打开的任务信息
    currentTestTask: {
      testTaskId: string
      testTaskName: string
    }

    // 是否在跳转出udr页面时，清除缓存
    // 作用：在udr页面跳转到其他页面时，不应该清除缓存，避免在返回udr页面时状态丢失，而在udr页面返回到试验列表时，应该清除缓存，避免打开其他udr还保留了上次打开的状态
    enableClearState: boolean
  } => ({
    udrPageType: null,

    panelManager: {
      testPackageOpen: false,
      leftAreaOpen: true,
      eqCollectionHistoryOpen: false,
      actionBarOpen: true,
      testTaskDetail: false,
    },

    sheetName: '',

    udrStartParams: {},

    currentTestTask: {
      testTaskId: '',
      testTaskName: '',
    },

    enableClearState: true,
  }),
  actions: {
    // 初始化界面
    init(udrPageType: UdrPageType) {
      this.udrPageType = udrPageType
      this.enableClearState = true

      // 每次打开，还原面板状态
      this.panelManager = {
        testPackageOpen: false,
        leftAreaOpen: true,
        eqCollectionHistoryOpen: false,
        actionBarOpen: true,
        testTaskDetail: false,
      }

      this.sheetName = ''
    },
    /** 获取当前试验任务id */
    getTestTaskId() {
      return this.currentTestTask.testTaskId
    },
  },
})

export { useUdrStore }
