<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="实时库存"
        left-arrow
        @click-left="router.go(-1)"
      />

      <!-- 搜索栏组件（无排序） -->
      <van-search
        v-model="searchValue"
        placeholder="请输入化学名称、化学名称编号"
        @search="onSearch"
        @clear="onSearch"
      />
    </van-sticky>

    <!-- 库存列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="p-3 min-h-[200px]"
        @load="onLoad"
      >
        <ListCard
          v-for="item in list"
          :key="item.id"
          :rows="[
            { label: '所属类别', value: item.chemicalType || '' },
            { label: '管理级别', value: item.manageLevel || '' },
            { label: '用途', value: item.effect || '' },
            { label: '纯度', value: item.purity || '' },
            { label: '浓度', value: item.concentration || '' },
            { label: '计量单位', value: item.unit || '' },
            { label: '可支配库存', value: String(item.amount || 0), color: item.amount <= item.warningAmount ? 'red' : '' },
            { label: '预警数量', value: String(item.warningAmount || 0) },
            { label: '最近一次更新时间', value: formatTime(item.lastUpdateTime) },
          ]"
        >
          <template #title>
            <!-- 标题行 -->
            <div class="flex items-start justify-between">
              <span class="text-sm font-medium text-[#333] break-all flex-1">
                {{ item.name }}
                <template v-if="item.sn">（{{ item.sn }}）</template>
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <van-button
                type="primary"
                size="small"
                @click="onViewLog(item)"
              >
                日志
              </van-button>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { InventoryItem, InventoryQueryParams } from '~/views/mobileApp/types/chemical/inventory'
import { useDateFormat } from '@vueuse/core'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getInventoryListByCategory } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()

// 搜索关键词
const searchValue = ref('')

// 列表数据
const list = ref<InventoryItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
const page = ref(1)
const pageSize = 10

// 格式化时间
function formatTime(time: string) {
  if (!time)
    return ''
  return useDateFormat(time, 'YYYY-MM-DD').value
}

// 加载列表数据
async function loadList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  if (finished.value && !isRefresh)
    return

  loading.value = true

  try {
    const params: InventoryQueryParams = {
      page: page.value,
      size: pageSize,
      quickQry: searchValue.value,
    }

    const res = await getInventoryListByCategory(params)

    if (res.code !== 20010) {
      const rows = res.data?.rows || []
      const count = res.data?.count || 0

      if (isRefresh) {
        list.value = rows
      }
      else {
        list.value.push(...rows)
      }

      // 判断是否加载完成
      if (list.value.length >= count || rows.length < pageSize) {
        finished.value = true
      }
      else {
        page.value++
      }
    }
    else {
      showToast(res.message || '获取数据失败')
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取库存列表失败:', error)
    showToast('获取数据失败')
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
function onRefresh() {
  loadList(true)
}

// 加载更多
function onLoad() {
  loadList(false)
}

// 搜索
function onSearch() {
  loadList(true)
}

// 查看日志
function onViewLog(item: InventoryItem) {
  router.push({
    path: '/chemical/inventory/log',
    query: {
      id: item.id,
    },
  })
}

onMounted(() => {
  loadList(true)
})
</script>
