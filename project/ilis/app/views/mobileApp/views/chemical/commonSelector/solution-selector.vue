<template>
  <!-- 溶液选择器 Popup - 全屏显示 -->
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ height: '100%', width: '90%' }"
    destroy-on-close
    @opened="onOpen"
    @closed="onClosed"
  >
    <div class="h-screen flex flex-col bg-[#f5f5f5]">
      <!-- 顶部导航栏 -->
      <MobileTitleBar
        title="选择配置溶液"
        left-arrow
        @click-left="onCancel"
      />

      <!-- 搜索栏 -->
      <van-search
        v-model="searchValue"
        placeholder="搜索溶液编号/溶液名称"
        @search="onSearch"
      />

      <!-- 列表内容 -->
      <div class="flex-1 overflow-y-auto">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-checkbox-group v-model="selectedIds">
              <div
                v-for="item in list"
                :key="item.id"
                class="bg-white mb-2 p-3"
                @click="toggleSelect(item)"
              >
                <div class="flex items-start">
                  <van-checkbox
                    :name="item.id"
                    class="mt-0.5 mr-3"
                    @click.stop
                  />
                  <div class="flex-1">
                    <div class="font-medium text-sm mb-1">
                      {{ item.name }}
                      <span class="text-xs text-gray-400">({{ item.sn }})</span>
                    </div>
                    <div class="text-xs text-gray-500 space-y-1">
                      <div>分类：{{ item.categoryName || '-' }}</div>
                      <div>浓度：{{ item.concentration || '-' }}</div>
                      <div>配制量：{{ item.confectAmount || '-' }}</div>
                      <div>配制依据：{{ item.confectAccordance || '-' }}</div>
                      <div>配制介质：{{ item.confectMedium || '-' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </van-checkbox-group>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 底部操作栏 -->
      <div class="flex-shrink-0 bg-white p-3 border-t border-[#f0f0f0]">
        <div class="flex items-center justify-between">
          <div class="text-sm text-[#666]">
            已选择 <span class="text-[#1890ff] font-medium">{{ selectedIds.length }}</span> 项
          </div>
          <div class="flex gap-2">
            <van-button size="small" class="px-8" @click="onCancel">
              取消
            </van-button>
            <van-button type="primary" class="px-8" size="small" @click="onConfirm">
              确认
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { SolutionItem } from '~/views/mobileApp/types/chemical/common-selector'
import { showToast } from 'vant'
import { computed, ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getSolutionList } from '~/views/mobileApp/provides/api/chemical.api'

interface Props {
  // 是否显示
  show: boolean
  // 初始选中的数据（用于回显）
  initialSelected?: SolutionItem[]
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: () => [],
})

const emit = defineEmits<{
  // 更新显示状态
  'update:show': [value: boolean]
  // 确认选择
  'confirm': [solutions: SolutionItem[]]
  // 取消选择
  'cancel': []
}>()

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

// 搜索关键词
const searchValue = ref('')

// 列表数据
const list = ref<SolutionItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 选中的溶液
const selectedIds = ref<string[]>([])
const tempSelectedSolutions = ref<SolutionItem[]>([])

// 初始化选中状态
watch(() => props.show, (val) => {
  if (val && props.initialSelected) {
    selectedIds.value = props.initialSelected.map(s => s.id)
    tempSelectedSolutions.value = [...props.initialSelected]
  }
}, { immediate: true })

// 获取溶液列表
async function fetchSolutionList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
  }

  loading.value = true

  try {
    const res = await getSolutionList({
      page: page.value,
      size: pageSize.value,
      quickQry: searchValue.value,
      status: '已领取',
    })

    if (res.code !== 20010) {
      const data = res.data?.rows || []
      list.value = isRefresh ? data : [...list.value, ...data]

      // 判断是否加载完成
      if (data.length < pageSize.value) {
        finished.value = true
      }
    }
    else {
      showToast(res.message || '获取溶液列表失败')
      finished.value = true
    }
  }
  catch (error) {
    showToast('获取溶液列表失败')
    console.error(error)
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载数据
async function onLoad() {
  if (finished.value) {
    return
  }
  if (list.value.length > 0) {
    page.value++
  }
  await fetchSolutionList()
}

// 刷新
async function onRefresh() {
  finished.value = false
  await fetchSolutionList(true)
}

// 搜索
function onSearch() {
  onRefresh()
}

// 切换选中状态
function toggleSelect(item: SolutionItem) {
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
    const solutionIndex = tempSelectedSolutions.value.findIndex(s => s.id === item.id)
    if (solutionIndex > -1) {
      tempSelectedSolutions.value.splice(solutionIndex, 1)
    }
  }
  else {
    selectedIds.value.push(item.id)
    if (!tempSelectedSolutions.value.find(s => s.id === item.id)) {
      tempSelectedSolutions.value.push(item)
    }
  }
}

// 清空选择
// function onClear() {
//   selectedIds.value = []
//   tempSelectedSolutions.value = []
// }

// Popup 打开时
function onOpen() {
  fetchSolutionList(true)
}

// Popup 关闭时
function onClosed() {
  // 清空搜索
  searchValue.value = ''
}

// 取消
function onCancel() {
  visible.value = false
  emit('cancel')
  // 恢复初始状态
  if (props.initialSelected) {
    selectedIds.value = props.initialSelected.map(s => s.id)
    tempSelectedSolutions.value = [...props.initialSelected]
  }
  else {
    selectedIds.value = []
    tempSelectedSolutions.value = []
  }
}

// 确认
function onConfirm() {
  // 过滤出选中的溶液
  const selectedSolutions = tempSelectedSolutions.value.filter(
    s => selectedIds.value.includes(s.id),
  )
  emit('confirm', selectedSolutions)
  visible.value = false
}
</script>
