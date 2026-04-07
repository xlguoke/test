<template>
  <span>
    <img
      v-if="logoUrl"
      style="filter:drop-shadow(1000px 0 0 #fff);transform:translateX(-1000px);"
      :src="logoUrl"
      alt=""
      class="h-[60px] object-contain"
    >
  </span>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/store/themeStore'
import { EThemeMode } from '~/system/settings/ThemeSettingEntity'
import { getWebConfigs } from '../api'

const logoUrl = ref('')

const { themeConfig } = storeToRefs(useThemeStore())
const { userId } = useThemeStore()

const isDark = ref(false)

watch(() => themeConfig.value, (newVal) => {
  isDark.value = newVal?.[userId]?.mode === EThemeMode.DARK
}, { immediate: true, deep: true })

async function init() {
  const { data } = await getWebConfigs()
  if (data?.companyLogo) {
    logoUrl.value = data?.companyLogo_current || data.companyLogo
  }
  if (data.companyLogo)
    window.localStorage.setItem('unitCode', data.companyDeploy)

  window.localStorage.setItem('webConfigs', JSON.stringify(data))
}

init()
</script>
