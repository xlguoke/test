<template>
  <div
    class="h-full overflow-y-auto border-r border-[var(--colorSplit)] flex flex-col transition-all "
    :class="`${collapsed ? 'w-[80px]' : 'w-[200px]'}`"
  >
    <a-menu
      class="flex-1 overflow-y-auto w-full"
      :mode="themeConfig?.[userId]?.menuDisplayMode === EMenuDisplayMode.INSET ? 'inline' : undefined"
      :selected-keys="activeMenu?.data ? [activeMenu.data.id] : []"
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
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useMenuStore } from '~/store/menuStore'
import { useThemeStore } from '~/store/themeStore'
import { EMenuDisplayMode, EMenuLayoutMode } from '~/system/settings/ThemeSettingEntity'

const { selectedMenu, selectedSubMenu, menuList, activeMenu } = storeToRefs(useMenuStore())

const { setActiveMenu } = useMenuStore()

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

const renderMenuList = computed(() => {
  switch (themeConfig.value?.[userId]?.menuLayoutMode) {
    case EMenuLayoutMode.HORIZONTAL_VERTICAL_DOUBLE:
      return menuList.value
        ?.find(i => i.data.id === selectedMenu.value?.data.id)
        ?.children
        ?.find(i => i.data.id === selectedSubMenu.value?.data.id)
        ?.children
    case EMenuLayoutMode.VERTICAL_DOUBLE:
      return menuList.value?.find(i => i.data.id === selectedMenu.value?.data.id)?.children
    default:
      return []
  }
})

function handleClickMenu({ item }: any) {
  setActiveMenu(item)
}
</script>
