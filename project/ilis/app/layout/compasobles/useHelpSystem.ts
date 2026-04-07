import type { ILayoutParams } from '../types/ILayoutParams'
import { AnyDriverHelper } from '~/utils/AnyDriverHelper'

/** # 帮助系统配置常量 ⚙️ */
const HELP_SYSTEM_CONFIG = {
  /** 帮助系统元素ID */
  PORTAL_ELEMENT_ID: 'ewei-websdk-portal',
  DRAG_MASK_ID: 'dragMask',

  /** 帮助系统URL配置 */
  URLS: {
    LOCAL_HELP: 'https://hitekefu.ilis.cn/im/104eac.html',
    AI_CHATBOT: 'https://maxkb.ilis.cn/chat/api/embed',
    DEFAULT_HELP: 'https://help.ilis.cn/portal/21520/8IEQPEW7IDBSeGqIQIbkjy1Gmib2fmsi.js',
    HELP_SPACE: 'https://sp.ilis.cn/s/f66f3fc5-3893-4bc7-a81e-3e4dd220b8bf',
  } as const,

  /** 脚本加载配置 */
  SCRIPT_OPTIONS: {
    async: true,
    defer: true,
    force: true,
  } as const,

  /** 事件处理配置 */
  EVENT_CONFIG: {
    RESIZE_DEBOUNCE: 100,
    HIDE_MASK_DELAY: 500,
    ELEMENT_CHECK_INTERVAL: 500,
  } as const,
} as const

/** # 客服参数接口 ⚙️ */
interface IKeFuParams {
  source: string
  user_key: string | undefined
  user_name: string | undefined
  company_name: string | undefined
  phone: string | undefined
  email: string
}

/** # AI聊天机器人接口 ⚙️ */
interface IMaxKB {
  open: () => void
}

declare global {
  interface Window {
    keFuParam: IKeFuParams
    MaxKB?: IMaxKB
  }
}

export function useHelpSystem(params: ILayoutParams) {
  /** # 创建拖拽遮罩层 📝 */
  function createDragMask(): void {
    const dragMask = document.createElement('div')
    dragMask.id = HELP_SYSTEM_CONFIG.DRAG_MASK_ID
    dragMask.style.position = 'fixed'
    dragMask.style.top = '0'
    dragMask.style.bottom = '0'
    dragMask.style.left = '0'
    dragMask.style.right = '0'
    dragMask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    dragMask.style.zIndex = '9999'
    document.body.appendChild(dragMask)
  }

  /** # 移除拖拽遮罩层 📝 */
  function removeDragMask(): void {
    const dragMask = document.getElementById(HELP_SYSTEM_CONFIG.DRAG_MASK_ID)
    if (dragMask) {
      document.body.removeChild(dragMask)
    }
  }

  /** # 设置客服参数 ⚙️ */
  function setupKeFuParams(): void {
    window.keFuParam = {
      source: 'ILIS',
      user_key: params.mobilephone,
      user_name: params.realname,
      company_name: params.currentorgname,
      phone: params.mobilephone,
      email: '',
    }
    window._ewei_auto_fill_webchat_in_data_ = {
      externalId: `${params?.localcompanycode || ''}${params?.username || ''}`,
      name: params.realname,
      user_customField_161254: params.localcompany,
      user_customField_154228: params.currentorgname,
      mobilePhone: params.mobilephone,
    }
  }

  /** # 构建AI聊天机器人URL 🔗 */
  function buildAiChatbotUrl(): string {
    const baseUrl = HELP_SYSTEM_CONFIG.URLS.AI_CHATBOT
    const sparams = new URLSearchParams({
      protocol: 'https',
      host: 'maxkb.ilis.cn',
      token: '69ea4c2de0f3c5ec',

      asker: `${params.localcompanycode}:${params.realname}`,
      username: params.username || '',
      tenant: params.localcompanycode || '',
    })
    return `${baseUrl}?${sparams.toString()}`
  }

  /** # 绑定块级事件处理 📝 */
  function bindBlockEvent(): void {
    let hideTimer: NodeJS.Timeout | null = null

    const checkAndBindEvents = () => {
      const portalElement = document.getElementById(HELP_SYSTEM_CONFIG.PORTAL_ELEMENT_ID)
      if (!portalElement)
        return false

      /** # 清理定时器并绑定事件 ⚙️ */
      const cleanupTimer = () => {
        if (hideTimer) {
          clearTimeout(hideTimer)
          hideTimer = null
        }
      }

      /** # 鼠标按下事件处理 🖱️ */
      const handleMouseDown = () => {
        createDragMask()
      }

      /** # 鼠标抬起事件处理 🖱️ */
      const handleMouseUp = () => {
        removeDragMask()
      }

      /** # 鼠标离开事件处理 🖱️ */
      const handleMouseLeave = () => {
        cleanupTimer()
        hideTimer = setTimeout(removeDragMask, HELP_SYSTEM_CONFIG.EVENT_CONFIG.HIDE_MASK_DELAY)
      }

      /** # 鼠标进入事件处理 🖱️ */
      const handleMouseEnter = () => {
        cleanupTimer()
      }

      /** # 文档离开事件处理 📄 */
      const handleDocumentMouseLeave = () => {
        const mouseUpEvent = new Event('mouseup')
        portalElement.dispatchEvent(mouseUpEvent)
      }

      // 绑定事件监听器
      portalElement.addEventListener('mousedown', handleMouseDown)
      portalElement.addEventListener('mouseup', handleMouseUp)
      portalElement.addEventListener('mouseleave', handleMouseLeave)
      portalElement.addEventListener('mouseenter', handleMouseEnter)
      document.addEventListener('mouseleave', handleDocumentMouseLeave)

      return true
    }

    // 定期检查元素是否存在并绑定事件
    const timer = setInterval(() => {
      if (checkAndBindEvents()) {
        clearInterval(timer)
      }
    }, HELP_SYSTEM_CONFIG.EVENT_CONFIG.ELEMENT_CHECK_INTERVAL)
  }

  /** # 窗口大小调整事件处理 📏 */
  const handleResize = useDebounceFn(async () => {
    const portalElement = document.getElementById(HELP_SYSTEM_CONFIG.PORTAL_ELEMENT_ID)
    if (portalElement) {
      document.body.removeChild(portalElement)
      await AnyDriverHelper.createScriptByUrl(HELP_SYSTEM_CONFIG.URLS.DEFAULT_HELP, {
        ...HELP_SYSTEM_CONFIG.SCRIPT_OPTIONS,
        force: true,
      })
      bindBlockEvent()
    }
  }, HELP_SYSTEM_CONFIG.EVENT_CONFIG.RESIZE_DEBOUNCE)

  /** # 加载本地帮助系统 📚 */
  async function loadLocalHelp(): Promise<void> {
    await AnyDriverHelper.createScriptByUrl(HELP_SYSTEM_CONFIG.URLS.LOCAL_HELP)
  }

  /** # 加载AI聊天机器人 🤖 */
  async function loadAiChatbot(): Promise<void> {
    const chatbotUrl = buildAiChatbotUrl()
    await AnyDriverHelper.createScriptByUrl(chatbotUrl, {
      ...HELP_SYSTEM_CONFIG.SCRIPT_OPTIONS,
    })
  }

  /** # 加载默认帮助系统 📚 */
  async function loadDefaultHelp(): Promise<void> {
    await AnyDriverHelper.createScriptByUrl(HELP_SYSTEM_CONFIG.URLS.DEFAULT_HELP, {
      ...HELP_SYSTEM_CONFIG.SCRIPT_OPTIONS,
    })
    bindBlockEvent()
    window.addEventListener('resize', handleResize)
  }

  /** # 初始化帮助系统 🚀 */
  async function init(): Promise<void> {
    setupKeFuParams()
    // 帮助系统/AI Chatbot: controlled by env ILIS_HELP_MODE or USE_AI_HELP
    if (params.uselocalhelp?.toString() === 'true') {
      await loadLocalHelp()
    }
    else if (params.useaichatbot?.toString() === 'true') {
      await loadAiChatbot()
    }
    else {
      await loadDefaultHelp()
    }
  }

  /** # 处理帮助点击事件 🖱️ */
  function handleClickHelp(): void {
    // 优先尝试打开嵌入式AI聊天机器人
    if (params.useaichatbot?.toString() === 'true' && tryOpenAiChatbot()) {
      return
    }

    // 默认打开帮助空间
    window.open(HELP_SYSTEM_CONFIG.URLS.HELP_SPACE)
  }

  /** # 尝试打开AI聊天机器人 🤖 */
  function tryOpenAiChatbot(): boolean {
    try {
      if (window.MaxKB && typeof window.MaxKB.open === 'function') {
        window.MaxKB.open()
        return true
      }
    }
    catch (error) {
      console.error('打开MaxKB聊天机器人时出错:', error)
    }
    return false
  }

  return {
    init,
    handleClickHelp,
  }
}
