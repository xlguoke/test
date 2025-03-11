<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
      :tab-list="props.tabList"
      :active-tab-key="props.activeTabKey"
      @tab-change="props.onTabChange"
    >
      <slot></slot>
    </a-card>
  </AppProvider>
</template>

<script lang="ts" setup>
import type { CardProps } from 'ant-design-vue'

const props = defineProps<{
  appId: string
} & CardProps>()

const appElement = document.getElementById(props.appId)
// 给应用节点添加宽高100%样式
appElement?.style.setProperty('width', '100%')
appElement?.style.setProperty('height', '100%')
</script>
