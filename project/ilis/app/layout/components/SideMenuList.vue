<template>
  <div
    class="h-full border-r border-[var(--colorSplit)] flex flex-col transition-all "
    :class="`${collapsed ? 'w-[80px]' : 'w-[200px]'}`"
  >
    <a-menu
      class="flex-1 overflow-y-auto w-full"
      :mode="themeConfig?.[userId]?.menuDisplayMode === EMenuDisplayMode.INSET ? 'inline' : undefined"
      :selected-keys="selectedKeys"
      :items="renderMenuList"
      :inline-collapsed="collapsed"
      @click="handleClickMenu"
    />
    <span>
      <a-tooltip :title="collapsed ? '展开菜单' : '折叠菜单'">
        <a-button
          type="ghost"
          size="large"
          @click="collapsed = !collapsed"
        >
          <MenuFoldOutlined v-if="!collapsed" />
          <MenuUnfoldOutlined v-else />
        </a-button>
      </a-tooltip>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { TransformMenuTree } from '../api'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useMenuStore } from '~/store/menuStore'
import { useThemeStore } from '~/store/themeStore'
import { EMenuDisplayMode, EMenuLayoutMode } from '~/system/settings/ThemeSettingEntity'

const { selectedMenu, selectedSubMenu, menuList, activeMenu } = storeToRefs(useMenuStore())

const { setActiveMenu, setSelectedMenu, setSelectedSubMenu } = useMenuStore()

const { themeConfig } = storeToRefs(useThemeStore())

const { userId } = useThemeStore()

const collapsed = ref(false)

const { width } = useWindowSize()

watch(() => width.value, (newVal) => {
  if (newVal < 1400) {
    collapsed.value = true
  }
  else {
    collapsed.value = false
  }
})

watch(() => themeConfig.value?.[userId]?.menuLayoutMode, (newVal) => {
  if ([
    EMenuLayoutMode.VERTICAL_DOUBLE,
    EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE,
  ].includes(newVal)) {
    collapsed.value = true
  }
  else {
    collapsed.value = false
  }
})

const renderMenuList = computed(() => {
  switch (themeConfig.value?.[userId]?.menuLayoutMode) {
    case EMenuLayoutMode.HORIZONTAL_VERTICAL:
      return menuList.value?.find(i => i.data.id === selectedMenu.value?.data.id)?.children
    case EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE:
      return menuList.value?.find(i => i.data.id === selectedMenu.value?.data.id)?.children?.map(i => ({ ...i, children: undefined }))
    case EMenuLayoutMode.VERTICAL_DOUBLE:
      return menuList.value?.map(i => ({ ...i, children: undefined }))
    case EMenuLayoutMode.VERTICAL:
      return menuList.value
    default:
      return []
  }
})

const selectedKeys = computed(() => {
  switch (themeConfig.value?.[userId]?.menuLayoutMode) {
    case EMenuLayoutMode.HORIZONTAL_VERTICAL:
      return activeMenu.value?.data ? [activeMenu.value.data.id] : []
    case EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE:
      return selectedSubMenu.value?.data ? [selectedSubMenu.value.data.id] : []
    case EMenuLayoutMode.VERTICAL_DOUBLE:
      return selectedMenu.value?.data ? [selectedMenu.value.data.id] : []
    default:
      return []
  }
})

function handleClickMenu({ item }: any) {
  const menu = item as TransformMenuTree
  switch (themeConfig.value?.[userId]?.menuLayoutMode) {
    case EMenuLayoutMode.HORIZONTAL_VERTICAL:
      setActiveMenu(menu)
      break
    case EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE:
      if (menu.data?.subFunctions?.length) {
        setSelectedSubMenu(menu)
      }
      else {
        setSelectedSubMenu(undefined)
        setActiveMenu(menu)
      }
      break
    case EMenuLayoutMode.VERTICAL_DOUBLE:
      if (menu.data?.subFunctions?.length) {
        setSelectedMenu(menu)
      }
      else {
        setSelectedMenu(undefined)
        setActiveMenu(menu)
      }
      break
    default:
      break
  }
}
</script>

<style scoped>
:deep(.ant-menu-item-selected){
  background: var(--colorPrimary) !important;
  color:#fff !important;
}
</style>
