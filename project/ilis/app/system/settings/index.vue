<template>
  <IlisContainer app-id="js-setting-app">
    <IlisIndustryContainerTab>
      <Settings :catalog="catalogData" />
    </IlisIndustryContainerTab>
  </IlisContainer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Settings from './Settings.vue'

export interface Props {
  catalog: { id: string, name: string }[]
}

// 从 DOM 获取数据或使用默认值
const el = document.querySelector<HTMLElement>('#js-setting-app')
const catalogData = ref([])

if (el && el.dataset.catalog) {
  try {
    catalogData.value = JSON.parse(el.dataset.catalog)
  }
  catch (e) {
    console.warn('Failed to parse catalog data:', e)
  }
}
</script>
