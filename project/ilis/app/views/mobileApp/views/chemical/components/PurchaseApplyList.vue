<template>
  <div class="h-full flex flex-col shrink-0">
    <!-- 搜索栏 - 默认隐藏，通过 showSearch 控制 -->
    <div v-if="showSearch">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索申请单号/部门/申请人"
        @search="onSearch"
      />
    </div>

    <div class="px-3 pt-3 flex-1 h-0 overflow-auto">
      <!-- 全选 - 仅多选模式显示 -->
      <div v-if="mode === 'checkbox'" class="flex items-center mb-3">
        <van-checkbox :checked="isAllSelected" shape="square" @click="toggleAll">
          全选
        </van-checkbox>
      </div>

      <!-- 采购申请单列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          :finished-text="list.length ? '没有更多了' : ''"
          @load="onLoad"
        >
          <template
            v-for="item in list"
            :key="item.id"
          >
            <PurchaseApplyItemCard
              :item="item"
              :shape="mode === 'radio' ? 'round' : 'square'"
              :is-expanded="expandedIds.includes(item.id)"
              :checked="selectedRowKeys.includes(item.id)"
              @toggle-expand="toggleExpand(item.id)"
              @update:item="updateItem"
              @click="onSelect(item)"
            />
          </template>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty v-if="list.length === 0 && !loading" description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseApplyListItem } from '~/views/mobileApp/types/chemical/storage-in'
import { computed, ref, watch } from 'vue'
import { getPurchaseApplyList } from '~/views/mobileApp/provides/api/chemical.api'
import PurchaseApplyItemCard from './PurchaseApplyItemCard.vue'

interface Props {
  /** 初始选中的数据（用于回显） */
  initialSelected?: PurchaseApplyListItem[]
  /** 选择模式：radio-单选 checkbox-多选 */
  mode?: 'radio' | 'checkbox'
  /** 是否显示搜索栏 */
  showSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: () => [],
  mode: 'checkbox',
  showSearch: false,
})

// 列表数据
const list = ref<PurchaseApplyListItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 选中的完整数据（核心状态）
const selectedRows = ref<PurchaseApplyListItem[]>([])

// 展开的申请单ID列表
const expandedIds = ref<string[]>([])

// 计算属性：从 selectedRows 提取ID列表（实时计算）
const selectedRowKeys = computed(() => selectedRows.value.map(item => item.id))

// 全选状态（仅多选模式）
const isAllSelected = computed(() => {
  if (props.mode === 'radio' || list.value.length === 0)
    return false
  return list.value.every(item => selectedRowKeys.value.includes(item.id))
})

// 监听 initialSelected 变化，初始化选中状态
watch(() => props.initialSelected, (val) => {
  if (val && val.length > 0) {
    selectedRows.value = JSON.parse(JSON.stringify(val))
  }
  else {
    selectedRows.value = []
  }
}, { immediate: true })

// 选择/取消选择
function onSelect(item: PurchaseApplyListItem) {
  if (props.mode === 'radio') {
    // 单选模式
    if (selectedRowKeys.value.includes(item.id)) {
      selectedRows.value = []
    }
    else {
      selectedRows.value = [item]
    }
    return
  }

  // 多选模式
  const index = selectedRowKeys.value.indexOf(item.id)
  if (index > -1) {
    // 已选中 → 取消选中
    selectedRows.value = selectedRows.value.filter(i => i.id !== item.id)
  }
  else {
    // 未选中 → 添加选中
    selectedRows.value.push(item)
  }
}

// 切换全选（多选模式）
function toggleAll() {
  if (props.mode === 'radio')
    return

  if (isAllSelected.value) {
    // 取消全选：从选中列表中移除当前页所有项
    const currentPageIds = list.value.map(item => item.id)
    selectedRows.value = selectedRows.value.filter(item => !currentPageIds.includes(item.id))
  }
  else {
    // 全选：将当前页所有项添加到选中列表
    const currentPageItems = list.value.filter(item => !selectedRowKeys.value.includes(item.id))
    selectedRows.value.push(...currentPageItems)
  }
}

// 展开/收起详情
function toggleExpand(id: string) {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  }
  else {
    expandedIds.value.push(id)
  }
}

// 更新列表项数据（当子组件加载详情后）
function updateItem(updatedItem: PurchaseApplyListItem) {
  const index = list.value.findIndex(item => item.id === updatedItem.id)
  if (index > -1) {
    list.value[index] = updatedItem
  }
}

// 搜索
function onSearch() {
  page.value = 1
  list.value = []
  finished.value = false
  fetchData()
}

// 加载数据
async function onLoad() {
  if (finished.value)
    return
  await fetchData()
}

// 重置选择
function onReset() {
  selectedRows.value = []
  expandedIds.value = []
}

// 刷新数据
async function onRefresh() {
  page.value = 1
  list.value = []
  finished.value = false
  await fetchData()
  refreshing.value = false
}

// 获取数据
async function fetchData() {
  loading.value = true

  try {
    const params = {
      page: page.value,
      size: pageSize.value,
      keyword: searchKeyword.value || '',
      status: 'COMPLETED',
      requestType: 'CHEMICAL',
    }

    const res = await getPurchaseApplyList(params)

    if (res?.rows && res?.rows.length) {
      const rows = res.rows || []
      const count = res.count || 0

      if (page.value === 1) {
        list.value = rows
      }
      else {
        list.value.push(...rows)
      }

      if (list.value.length >= count) {
        finished.value = true
      }
      else {
        page.value++
      }
    }
    else {
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取采购申请单列表失败:', error)
    finished.value = true
  }
  finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  // 获取所有选中的数据（用于确认时获取）
  getSelectedData: () => selectedRows.value,
  // 获取所有选中的ID
  getSelectedIds: () => selectedRowKeys.value,
  // 重置选择
  reset: onReset,
  // 刷新列表
  refresh: onRefresh,
})
</script>
