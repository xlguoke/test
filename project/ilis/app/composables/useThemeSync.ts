import { theme } from 'ant-design-vue'
import { watch } from 'vue'
import { useThemeStore } from '~/store/themeStore'

/** # 主题同步Hook ⚙️ */
export function useThemeSync() {
  const {
    isSupported,
    data,
    post,
    isClosed,
  } = useBroadcastChannel({ name: 'ilis-theme-config-changed' })

  const themeStore = useThemeStore()
  const { useToken } = theme
  const { token } = useToken()

  const key = `theme_${themeStore.userId}_${Date.now()}`

  /** # 发送主题配置变更广播 */
  function sendThemeConfigChangedBroadcast() {
    if (!isSupported && isClosed.value) {
      console.warn('广播通道未支持或已关闭，主题无法正常同步')
      return
    }

    post({
      type: 'THEME_CONFIG_CHANGED',
      userId: themeStore.userId,
      timestamp: Date.now(),
      key,
      config: JSON.stringify(themeStore.themeConfig[themeStore.userId]),
    })
  }

  /**
   * # 更新CSS变量
   * 可以根据需要添加其他颜色的同步
   */
  function updateCssVariables() {
    const root = document.documentElement
    root.style.setProperty('--colorPrimary', token.value.colorPrimary)
    root.style.setProperty('--colorPrimaryBg', token.value.colorPrimaryBg)
    root.style.setProperty('--colorPrimaryBgHover', token.value.colorPrimaryBgHover)
    root.style.setProperty('--colorPrimaryHover', token.value.colorPrimaryHover)
    root.style.setProperty('--colorError', token.value.colorError)
    root.style.setProperty('--colorErrorBg', token.value.colorErrorBg)
    root.style.setProperty('--colorSuccess', token.value.colorSuccess)
    root.style.setProperty('--colorWarning', token.value.colorWarning)
    root.style.setProperty('--colorInfo', token.value.colorInfo)
    root.style.setProperty('--colorText', token.value.colorText)
    root.style.setProperty('--colorTextDisabled', token.value.colorTextDisabled)
    root.style.setProperty('--colorSplit', token.value.colorSplit)
    root.style.setProperty('--colorBorder', token.value.colorBorder)
    root.style.setProperty('--colorBgLayout', token.value.colorBgLayout)
    root.style.setProperty('--colorBgContainer', token.value.colorBgContainer)
    root.style.setProperty('--colorBgElevated', token.value.colorBgElevated)
    root.style.setProperty('--colorFillAlter', token.value.colorFillAlter)
    root.style.setProperty('--colorFillContent', token.value.colorFillContent)
    root.style.setProperty('--colorFillSecondary', token.value.colorFillSecondary)
    root.style.setProperty('--colorFillContentHover', token.value.colorFillContentHover)
    root.style.setProperty('--borderRadius', `${token.value.borderRadius}px`)
    root.style.setProperty('--borderRadiusLG', `${token.value.borderRadiusLG}px`)
    root.style.setProperty('--fontSizeSM', `${token.value.fontSizeSM}px`) // 小号字体
    root.style.setProperty('--fontSize', `${token.value.fontSize}px`) // 基准字体
    root.style.setProperty('--fontSizeLG', `${token.value.fontSizeLG}px`) // 大号字体
    root.style.setProperty('--boxShadow', token.value.boxShadow) // 阴影
    root.style.setProperty('--boxShadowSecondary', token.value.boxShadowSecondary) // 阴影
  }

  watch(
    () => data.value,
    (newVal) => {
      const data = newVal as any
      if (data?.type === 'THEME_CONFIG_CHANGED'
        && data?.userId === themeStore.userId
        && data?.key !== key) {
        // 收到广播后重新加载主题配置
        try {
          themeStore.setThemeConfig(JSON.parse(data.config))
        }
        catch (error) {
          console.error('解析主题配置失败', error)
        }
      }
    },
  )

  // 监听主题配置变化
  watch(
    () => themeStore.themeConfig[themeStore.userId],
    () => {
      nextTick(updateCssVariables)
      sendThemeConfigChangedBroadcast()
    },
    { deep: true, immediate: true },
  )
}
