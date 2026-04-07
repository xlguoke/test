import type { SizeType } from 'ant-design-vue/es/config-provider/context'
import { theme } from 'ant-design-vue'
import { ThemeSettingEntity } from '~/system/settings/ThemeSettingEntity'

/**
 * # 主题Store ⚙️
 * - 管理应用的主题配置
 * - 支持浅色/深色模式
 * - 支持紧凑/常规布局
 * - 基于用户ID的持久化存储
 */
export const useThemeStore = defineStore('theme', () => {
  // 获取用户ID，用于持久化存储的key
  const getUserId = (): string => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo)
        return parsedUserInfo.userId || 'default'
      }
      catch {
        return 'default'
      }
    }
    return 'default'
  }

  const userId = getUserId()

  // 主题配置记录，键为用户ID
  const themeConfig = ref<Record<string, ThemeSettingEntity>>({ })
  themeConfig.value[userId] = ThemeSettingEntity.fromJSON(themeConfig.value?.[userId] || {})

  // 计算ant-design-vue的主题配置
  const antdThemeConfig = computed(() => {
    const config = themeConfig.value[userId] as Record<string, any> || {}
    const { mode, layoutMode } = config
    // 确定使用的算法
    const algorithms = []
    if (layoutMode === 'compact') {
      algorithms.push(theme.compactAlgorithm)
    }
    if (mode === 'dark') {
      algorithms.push(theme.darkAlgorithm)
    }

    const tokenKeys = Object.keys(config)?.filter(key => !['mode', 'layoutMode', 'preset'].includes(key))
    const token: Record<string, any> = {}
    tokenKeys.forEach((key) => {
      if (config[key]) {
        token[key] = config[key]
      }
    })

    return {
      components: {
        Table: {
          padding: 6,
          paddingSM: 6,
          paddingContentVerticalLG: 6,
          paddingXS: 6,
        },
      },
      token,
      algorithm: algorithms,
    }
  })

  // 组件默认尺寸
  const componentSize = ref<SizeType>('middle')

  watch(() => themeConfig.value, (newVal) => {
    if (!newVal[userId]) {
      return
    }
    const { mode } = newVal[userId]
    // 更新html的class
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(mode)
  }, { immediate: true, deep: true })

  /** # 重置主题配置为默认值 */
  function resetThemeConfig() {
    themeConfig.value[userId] = new ThemeSettingEntity()
  }

  const setThemeConfig = useDebounceFn((val: ThemeSettingEntity) => {
    if (JSON.stringify(val) === JSON.stringify(themeConfig.value[userId])) {
      return
    }
    themeConfig.value[userId] = ThemeSettingEntity.fromJSON(val)
  }, 50)

  return {
    themeConfig,
    antdThemeConfig,
    componentSize,
    userId,
    resetThemeConfig,
    setThemeConfig,
  }
}, {
  // 持久化配置
  persist: {
    key: 'themeConfig',
    storage: localStorage,
  },
})
