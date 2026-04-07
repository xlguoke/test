<template>
  <div class="h-full w-full p-2">
    <template v-for="item in openMenus" :key="item.data.id">
      <iframe
        v-show="activeMenu?.data.id === item.data.id"
        :ref="(el) => setIframeRef(item.data.id, el as HTMLIFrameElement)"
        :src="item.data.functionUrl"
        class="h-full w-full border-0"
        frameborder="0"
        allowfullscreen
        @load="updateCssVariables"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '~/store/menuStore'
import { useThemeStore } from '~/store/themeStore'

const { openMenus, activeMenu, refreshFlag } = storeToRefs(useMenuStore())
refreshFlag.value = false
const iframeRefs = ref<Record<string, HTMLIFrameElement>>({})

function setIframeRef(id: string, el: HTMLIFrameElement) {
  iframeRefs.value[id] = el
}

function handleLoad() {
  refreshFlag.value = false
}

/** # 监听刷新状态变化，重载当前激活的iframe */
watch(refreshFlag, () => {
  if (!refreshFlag.value) {
    return
  }
  if (activeMenu.value?.data.id) {
    const iframe = iframeRefs.value[activeMenu.value.data.id]
    if (!iframe?.contentWindow) {
      return
    }
    iframe.removeEventListener('load', handleLoad)
    iframe.addEventListener('load', handleLoad)
    iframe.contentWindow.location.reload()
  }
})

const themeStore = useThemeStore()

// 监听主题配置变化,将当前root的属性设置到所有iframe中
watch(
  () => themeStore.themeConfig[themeStore.userId],
  () => {
    nextTick(updateCssVariables)
  },
  { deep: true, immediate: true },
)

/** # 将当前root的属性设置到所有iframe中 */
function updateCssVariables() {
  const root = document.documentElement
  for (const iframe of Object.values(iframeRefs.value)) {
    if (!iframe?.contentWindow) {
      continue
    }
    const contentWindow = iframe.contentWindow
    for (const prop of Object.keys(root.style)) {
      // 过滤掉空字符串的属性
      if (!prop) {
        continue
      }
      contentWindow.document?.documentElement?.style?.setProperty(root.style[prop as any], root.style.getPropertyValue(root.style[prop as any]))
    }
  }
}
</script>
