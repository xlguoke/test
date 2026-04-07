<template>
  <a-dropdown :trigger="['contextmenu']" v-bind="$attrs">
    <slot></slot>
    <template #overlay>
      <a-menu>
        <a-menu-item :disabled="menu?.data.functionName === '首页'" :icon="h(CloseOutlined)" @click="closeMenu(props.menu)">
          关闭
        </a-menu-item>
        <a-menu-item :icon="h(isFixed(props.menu) ? UnlockOutlined : LockOutlined)" @click="toggleFix(props.menu)">
          {{ isFixed(props.menu) ? '取消固定' : '固定' }}
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item :icon="h(VerticalRightOutlined)" @click="closeLeftMenus(props.menu)">
          关闭左侧菜单
        </a-menu-item>
        <a-menu-item :icon="h(VerticalLeftOutlined)" @click="closeRightMenus(props.menu)">
          关闭右侧菜单
        </a-menu-item>
        <a-menu-item :icon="h(BorderHorizontalOutlined)" @click="closeOtherMenus(props.menu)">
          关闭其他菜单
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item :icon="h(LinkOutlined)" @click="openInNewTab(props.menu)">
          在新标签页打开
        </a-menu-item>
        <a-menu-item :icon="h(ReloadOutlined)" @click="reloadMenu(props.menu)">
          重新加载
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import type { TransformMenuTree } from '../api'
import { BorderHorizontalOutlined, CloseOutlined, LinkOutlined, LockOutlined, ReloadOutlined, UnlockOutlined, VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons-vue'
import { useMenuStore } from '~/store/menuStore'

const props = defineProps<{
  menu?: TransformMenuTree
}>()

const { openMenus } = storeToRefs(useMenuStore())
const { closeMenu, toggleFix, isFixed, setActiveMenu, refreshActiveMenu } = useMenuStore()

/** # 关闭指定菜单右侧的所有未固定菜单 */
function closeRightMenus(menu?: TransformMenuTree) {
  if (!menu) {
    return
  }
  const index = openMenus.value.findIndex(item => item.data.id === menu.data.id)
  if (index > -1) {
    const menusToClose = openMenus.value.slice(index + 1).filter(item => !isFixed(item) && item.data?.functionName !== '首页')
    menusToClose.forEach(item => closeMenu(item))
  }
}

/** # 关闭指定菜单左侧的所有未固定菜单 */
function closeLeftMenus(menu?: TransformMenuTree) {
  if (!menu) {
    return
  }
  const index = openMenus.value.findIndex(item => item.data.id === menu.data.id)
  if (index > -1) {
    const menusToClose = openMenus.value.slice(0, index).filter(item => !isFixed(item) && item.data?.functionName !== '首页')
    menusToClose.forEach(item => closeMenu(item))
  }
}

/** # 关闭除指定菜单外的所有未固定菜单 */
function closeOtherMenus(menu?: TransformMenuTree) {
  if (!menu) {
    return
  }
  const menusToClose = openMenus.value.filter(item => item.data.id !== menu.data.id && !isFixed(item) && item.data?.functionName !== '首页')
  menusToClose.forEach(item => closeMenu(item))
}

/** # 在新标签页打开指定菜单的链接 */
function openInNewTab(menu?: TransformMenuTree) {
  if (!menu) {
    return
  }
  window.open(menu.data.functionUrl, '_blank')
}

/** # 重新加载指定菜单 */
function reloadMenu(menu?: TransformMenuTree) {
  if (!menu) {
    return
  }
  setActiveMenu(menu)
  refreshActiveMenu()
}
</script>
