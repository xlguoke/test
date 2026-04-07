<template>
  <div class="theme-settings">
    <IlisForm
      :init-data="themeConfigBridge"
      :entity="ThemeSettingEntity"
      :cols="1"
      :label-col="{
        style: { width: '100px' },
      }"
    >
      <template #preset>
        <!-- 预设主题 -->
        <PresetThemeSelector
          v-model="selectedPreset"
          @select="handleThemeSelect"
        />
      </template>
    </IlisForm>
  </div>
</template>

<script setup lang='ts'>
import { storeToRefs } from 'pinia'
import { useThemeStore } from '~/store/themeStore'
import PresetThemeSelector from '~/system/settings/components/PresetThemeSelector.vue'
import { ThemeSettingEntity } from './ThemeSettingEntity'

const themeStore = useThemeStore()

const { themeConfig } = storeToRefs(themeStore)

const themeConfigBridge = ref(ThemeSettingEntity.fromJSON({ ...themeConfig.value[themeStore.userId] }))

watch(themeConfigBridge, (newVal) => {
  themeStore.setThemeConfig(newVal)
}, { deep: true })

watch(() => themeConfig.value[themeStore.userId], (newVal) => {
  themeConfigBridge.value = ThemeSettingEntity.fromJSON({ ...newVal })
}, { deep: true })

// 选中的预设主题
const selectedPreset = ref('')

// 处理主题选择
function handleThemeSelect(theme: any) {
  // 应用预设主题配置到当前数据
  const themeConfig = {
    ...themeConfigBridge.value,
    ...theme.config.token,
  }
  themeStore.setThemeConfig(ThemeSettingEntity.fromJSON(themeConfig))
}
</script>
