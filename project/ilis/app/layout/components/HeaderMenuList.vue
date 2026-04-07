<template>
  <div>
    <a-menu
      mode="horizontal"
      :items="renderMenu"
      @click="handleMenuClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransformMenuTree } from '../api'
import { useMenuStore } from '~/store/menuStore'
import { useThemeStore } from '~/store/themeStore'
import { EMenuLayoutMode } from '~/system/settings/ThemeSettingEntity'

const { menuList, setSelectedMenu, setActiveMenu } = useMenuStore()

const { themeConfig } = storeToRefs(useThemeStore())
const { userId } = useThemeStore()

const renderMenu = computed(() => {
  if (themeConfig.value?.[userId]?.menuLayoutMode === EMenuLayoutMode.HORIZONTAL) {
    return menuList
  }
  return menuList?.map(i => ({
    ...i,
    children: undefined,
  }))
})

function handleMenuClick({ item }: any) {
  if ((item as TransformMenuTree).data?.subFunctions?.length) {
    setSelectedMenu(item as TransformMenuTree)
  }
  else {
    setActiveMenu(item as TransformMenuTree)
    setSelectedMenu(undefined)
  }
}
</script>

<style scoped>
:deep(.ant-menu){
  background: transparent !important;
  color: #fff !important;
}
/* :deep(.ant-menu-light .ant-menu-submenu-selected >.ant-menu-submenu-title){
  color: #fff !important;
} */
:deep(.ant-menu-item-selected){
  background: var(--colorBgContainer) !important;
}
:deep(.ant-menu-item:hover:not(.ant-menu-item-selected)){
  color: var(--colorPrimary);
  background: var(--colorBgContainer) !important;
}
:deep(.ant-menu-submenu-selected){
  color: var(--colorPrimary);
  background: var(--colorBgContainer) !important;
}
:deep(.anticon-ellipsis){
  &::after{
    content: '更多';
    margin-left: 5px;
  }
}
</style>
