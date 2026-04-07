<template>
  <div class="h-full w-full flex items-center overflow-hidden">
    <!-- 左侧滚动按钮 -->
    <a-tooltip title="向左滚动">
      <a-button
        type="ghost"
        :disabled="!showLeftScroll"
        :icon="h(LeftOutlined)"
        @click="scrollLeft"
      />
    </a-tooltip>
    <i class="split"></i>
    <!-- 滚动容器 -->
    <div ref="scrollContainer" class="h-full flex-1 w-0 overflow-hidden relative">
      <div
        ref="tagContainer"
        class="h-full flex items-center transition-transform duration-300 ease-in-out"
        :style="{ transform: `translateX(${scrollOffset}px)` }"
        @contextmenu.prevent
      >
        <NavTagContextMenu :menu="contextMenuTarget">
          <TransitionGroup name="tag-list" tag="div" class="h-full flex items-center">
            <NavTag
              v-for="item in tagData"
              :key="item.data.id"
              :data="item"
              @click="setActiveMenu(item)"
              @dblclick="refreshMenu(item)"
              @contextmenu="openContextMenu($event, item)"
              @close="handleCloseMenu"
              @toggle-fix="handleToggleFix"
            />
          </TransitionGroup>
        </NavTagContextMenu>
      </div>
    </div>
    <i class="split"></i>

    <!-- 右侧滚动按钮 -->
    <a-tooltip title="向右滚动">
      <a-button
        type="ghost"
        :disabled="!showRightScroll"
        :icon="h(RightOutlined)"
        @click="scrollRight"
      />
    </a-tooltip>
    <i class="split"></i>
    <a-tooltip title="刷新">
      <a-button
        type="ghost"
        :icon="h(RedoOutlined)"
        :loading="refreshFlag"
        @click="refreshActiveMenu"
      />
    </a-tooltip>
    <i class="split"></i>
    <!-- 上下文菜单 -->
    <NavTagContextMenu :menu="activeMenu" :trigger="['hover']">
      <a-button type="ghost" :icon="h(DownOutlined)" />
    </NavTagContextMenu>
    <i class="split"></i>
    <a-tooltip title="帮助系统" placement="topRight">
      <a-button
        type="ghost"
        :icon="h(QuestionCircleOutlined)"
        @click="handleClickHelp?.()"
      />
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
import type { INavTag } from '../types/INavTag'
import { DownOutlined, LeftOutlined, QuestionCircleOutlined, RedoOutlined, RightOutlined } from '@ant-design/icons-vue'
import { theme } from 'ant-design-vue'
import { useMenuStore } from '~/store/menuStore'
import NavTag from './NavTag.vue'
import NavTagContextMenu from './NavTagContextMenu.vue'

const handleClickHelp = inject('handleClickHelp') as () => void

const { useToken } = theme
const { token } = useToken()

const { openMenus, activeMenu, refreshFlag } = storeToRefs(useMenuStore())
const { setActiveMenu, closeMenu, isFixed, toggleFix, refreshActiveMenu } = useMenuStore()

/**
 * # 计算标签数据 📊
 * 将菜单数据转换为 NavTag 组件需要的数据格式
 */
const tagData = computed(() => {
  return openMenus.value.map(menu => ({
    ...menu,
    active: menu.data.id === activeMenu.value?.data.id,
    fixed: isFixed(menu),
  })) as INavTag[]
})

// 滚动容器引用
const scrollContainer = ref<HTMLElement | null>(null)
const tagContainer = ref<HTMLElement | null>(null)

// 使用 useElementSize 监听容器大小变化
// 注意：使用函数形式确保在组件挂载后能够正确获取元素尺寸
const { width: containerWidth } = useElementSize(() => scrollContainer.value)

// 计算标签容器的实际内容宽度
const contentWidth = ref(0)

// 滚动偏移量
const scrollOffset = ref(0)

// 右键菜单状态
const contextMenuTarget = ref<any>(null)

// 计算是否显示滚动按钮
const showLeftScroll = computed(() => scrollOffset.value < 0)

const showRightScroll = computed(() => {
  // 当内容宽度大于容器宽度，且还有剩余空间可以滚动时显示向右滚动按钮
  return contentWidth.value > containerWidth.value && Math.abs(scrollOffset.value) < Math.abs(contentWidth.value - containerWidth.value)
})

/**
 * # 向左滚动一页
 */
function scrollLeft() {
  if (!containerWidth.value)
    return
  scrollOffset.value = Math.min(scrollOffset.value + containerWidth.value, 0)
}

/**
 * # 向右滚动一页
 */
function scrollRight() {
  if (!containerWidth.value)
    return
  const maxOffset = Math.max(0, contentWidth.value - containerWidth.value)
  scrollOffset.value = Math.max(scrollOffset.value - containerWidth.value, -maxOffset)
}

/**
 * # 将指定标签滚动到可视区
 * 确保当前激活的菜单标签在滚动容器的可视区内
 */
function scrollToActiveMenu() {
  if (!scrollContainer.value || !tagContainer.value || !activeMenu.value?.data?.id || !containerWidth.value)
    return

  nextTick(() => {
    // 找到当前激活的菜单元素
    const activeElement = tagContainer.value!.querySelector(`[data-id="${activeMenu.value!.data.id}"]`) as HTMLElement
    if (!activeElement)
      return
    const elementLeft = activeElement.offsetLeft
    const elementWidth = activeElement.offsetWidth
    const currentOffset = Math.abs(scrollOffset.value)
    const maxOffset = Math.max(0, contentWidth.value - containerWidth.value)

    // 检查元素是否在可视区内
    if (elementLeft < currentOffset || elementLeft + elementWidth > currentOffset + containerWidth.value) {
      // 计算新的偏移量，确保元素在可视区中间位置
      const elementCenter = elementLeft + elementWidth / 2
      const containerCenter = containerWidth.value / 2
      const newOffset = Math.max(0, elementCenter - containerCenter)
      // 确保不超过最大滚动偏移量
      scrollOffset.value = -Math.min(newOffset, maxOffset)
    }
    if (openMenus.value.length < 4) {
      scrollOffset.value = 0
    }
  })
}

/**
 * # 刷新指定菜单
 * 双击标签时触发刷新操作
 */
function refreshMenu(menu: any) {
  setActiveMenu(menu)
  refreshActiveMenu()
}

/**
 * # 设置目标菜单菜单
 * 阻止浏览器默认右键菜单，显示自定义右键菜单
 */
function openContextMenu(event: MouseEvent, menu: any) {
  event.preventDefault() // 阻止浏览器默认右键菜单
  contextMenuTarget.value = menu
}

/**
 * # 关闭菜单处理函数 🔧
 * 适配 NavTag 组件的事件格式
 */
function handleCloseMenu(menu: any) {
  closeMenu(menu)
}

/** # iframe 内关闭当前菜单 */
(top as any).closeCurrentMenu = handleCloseMenu

/**
 * # 切换固定状态处理函数 🔧
 * 适配 NavTag 组件的事件格式
 */
function handleToggleFix(menu: any) {
  toggleFix(menu)
}

// 监听 openMenus 变化，确保新添加的菜单能够进入可视区
watch(() => [openMenus.value, activeMenu.value], () => {
  nextTick(() => {
    contentWidth.value = tagContainer.value?.scrollWidth || 0
    setTimeout(() => scrollToActiveMenu(), 100)
  })
}, { deep: true, immediate: true })

// 监听容器宽度变化，重新计算滚动状态
watch(() => [containerWidth.value, contentWidth.value], () => {
  nextTick(() => scrollToActiveMenu())
})
</script>

<style scoped lang="less">
.tag-list-enter-active,
.tag-list-leave-active {
  transition: all 0.3s ease;
}

.tag-list-enter-from,
.tag-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.split {
  width: 1px;
  height: 100%;
  background-color: v-bind('token.colorSplit');
}
</style>
