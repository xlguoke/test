<template>
  <div>
    <!-- 搜索栏 -->
    <div class="flex bg-white border-b border-[#f0f0f0]">
      <div
        class="flex-1 flex items-center justify-center py-3 text-sm text-[#666] cursor-pointer active:bg-[#f5f5f5] border-r border-[#f0f0f0]"
        @click="toggleSearch"
      >
        <van-icon name="search" size="16" class="mr-1.5" />
        <span>搜索</span>
      </div>
      <div
        class="flex-1 flex items-center justify-center py-3 text-sm cursor-pointer active:bg-[#f5f5f5]"
        :class="currentSortValue ? 'text-[#1989fa]' : 'text-[#666]'"
        @click="openSort"
      >
        <i class="iconfont iconfont-sort mr-1.5" />
        <span>{{ currentSortLabel || '排序' }}</span>
      </div>
    </div>

    <!-- 模糊搜索输入框 -->
    <div v-show="showSearchInput">
      <slot />
    </div>

    <!-- 排序弹窗 -->
    <van-action-sheet
      v-model:show="sortVisible"
      title="排序"
      :actions="sortActionList"
      :round="false"
      @select="onSortSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface SortAction {
  name: string
  value: string
}

interface Props {
  /** 排序选项列表 */
  sortActions: SortAction[]
  /** 当前选中的排序值 */
  currentSort?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentSort: '',
})

const emit = defineEmits<{
  /** 搜索切换事件 */
  (e: 'toggleSearch'): void
  /** 排序选择事件 */
  (e: 'sortSelect', action: SortAction): void
}>()

// 搜索输入框显示状态
const showSearchInput = ref(false)
// 排序弹窗显示状态
const sortVisible = ref(false)

/** 当前排序标签 */
const currentSortLabel = computed(() => {
  if (!props.currentSort)
    return ''
  const action = props.sortActions.find(item => item.value === props.currentSort)
  return action?.name || ''
})

/** 当前排序值 */
const currentSortValue = computed(() => props.currentSort)

/** 带选中状态的排序选项列表 */
const sortActionList = computed(() => {
  return props.sortActions.map(action => ({
    ...action,
    color: action.value === props.currentSort ? '#1989fa' : undefined,
  }))
})

/** 切换搜索输入框显示 */
function toggleSearch() {
  showSearchInput.value = !showSearchInput.value
  emit('toggleSearch')
}

/** 打开排序弹窗 */
function openSort() {
  sortVisible.value = true
}

/** 排序选择回调 */
function onSortSelect(action: SortAction) {
  sortVisible.value = false
  emit('sortSelect', action)
}

/** 关闭搜索输入框 */
function closeSearch() {
  showSearchInput.value = false
}

/** 打开搜索输入框 */
function openSearch() {
  showSearchInput.value = true
}

// 暴露方法给父组件
defineExpose({
  closeSearch,
  openSearch,
  showSearchInput,
})
</script>
