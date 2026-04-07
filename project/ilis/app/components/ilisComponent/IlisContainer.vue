<template>
  <AppProvider>
    <a-card
      :class="className"
      :body-style="{ flex: 1, height: 0, padding: '16px', overflowY: 'auto', ...(props.bodyStyle || {}) }"
      :tab-list="props.tabList"
      :active-tab-key="props.activeTabKey"
      :bordered="bordered"
      @tab-change="props.onTabChange"
    >
      <slot></slot>
    </a-card>
  </AppProvider>
</template>

<script lang="ts" setup>
import type { CardProps } from 'ant-design-vue'

const props = withDefaults(defineProps<{
  appId: string
  wrapClassName?: string
} & CardProps>(), {
  bordered: true,
})

const className = computed(() => {
  if (props.wrapClassName) {
    return `h-full flex flex-col ${props.wrapClassName}`
  }
  return `h-full flex flex-col`
})

const appElement = document.getElementById(props.appId)
// 给应用节点添加宽高100%样式
appElement?.style.setProperty('width', '100%')
appElement?.style.setProperty('height', '100%')
</script>
