<template>
  <div class="gap-4">
    <div
      v-for="theme in presetDarkThemes"
      :key="theme.name"
      class="cursor-pointer rounded-lg p-3 border-2 border-transparent duration-300 hover:border-gray-200 "
      :class="selectedPreset === theme.name ? '!border-blue-500 !shadow-blue-100' : ''"
      @click="selectPresetTheme(theme)"
    >
      <div
        class="flex items-center justify-center gap-2 w-full rounded-md border p-2"
        :style="{
          backgroundColor: theme.config.token.colorBgBase || '#ffffff',
          borderColor: theme.config.token.colorPrimary,
        }"
      >
        <div
          class="w-6 h-6 rounded-full border border-gray-200"
          :style="{ backgroundColor: theme.config.token.colorPrimary }"
        ></div>
        <div
          class="w-6 h-6 rounded-full border border-gray-200"
          :style="{ backgroundColor: theme.config.token.colorSuccess }"
        ></div>
        <div
          class="w-6 h-6 rounded-full border border-gray-200"
          :style="{ backgroundColor: theme.config.token.colorWarning }"
        ></div>
        <div
          class="w-6 h-6 rounded-full border border-gray-200"
          :style="{ backgroundColor: theme.config.token.colorError }"
        ></div>
        <div
          class="w-6 h-6 rounded-full border border-gray-200"
          :style="{ backgroundColor: theme.config.token.colorInfo }"
        ></div>
      </div>
      <div class="text-center text-xs mt-2">
        {{ theme.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { EThemeMode, ThemeSettingEntity } from '~/system/settings/ThemeSettingEntity'

// 预设主题类型
interface PresetTheme {
  name: string
  config: {
    token: {
      colorPrimary: string
      colorSuccess: string
      colorWarning: string
      colorError: string
      colorInfo?: string
      colorBgBase?: string
      borderRadius?: number
      fontSize?: number
    }
  }
}

// 定义组件props
interface Props {
  // 可选：当前选中的主题名称
  modelValue?: string
}

// 定义组件emit事件
interface Emits {
  // 选择主题时触发的事件
  (e: 'update:modelValue', value: string): void
  // 选择主题时触发的事件，携带主题配置
  (e: 'select', theme: PresetTheme): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 读取预设主题
const { state: presetDarkThemes } = useAsyncState(async () => {
  const themeFiles = import.meta.glob('~/assets/theme/dark/*.json', { eager: true })
  const themes: PresetTheme[] = []
  if (import.meta.env.DEV) {
    for (const path in themeFiles) {
      const config = themeFiles[path] as { default: any }
      const fileName = path.split('/').pop()?.replace('.json', '') || ''
      themes.push({
        name: fileName,
        config: {
          ...config.default,
          token: {
            ...config.default.token,
            mode: EThemeMode.DARK,
          },
        },
      })
    }
  }

  themes.unshift({
    name: '默认',
    config: {
      token: new ThemeSettingEntity(),
    },
  })

  return themes
}, [])

// 选中的预设主题
const selectedPreset = ref(props.modelValue || '')

// 选择预设主题
function selectPresetTheme(theme: PresetTheme) {
  selectedPreset.value = theme.name
  emit('update:modelValue', theme.name)
  emit('select', theme)
}
</script>
