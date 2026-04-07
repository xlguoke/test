<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="化学品存量"
        left-arrow
        @click-left="router.go(-1)"
      />

      <!-- 搜索栏组件（无排序） -->
      <van-search
        v-model="searchValue"
        placeholder="请输入化学名称、化学品编号"
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
            { label: '品名', value: item.name || '' },
            { label: '品名编号', value: item.sn || '' },
            { label: '管理级别', value: item.manageLevel || '' },
            { label: '可用余量', value: String(item.amount || 0) },
            { label: '保管人', value: item.keepers || '' },
          ]"
          @click="onViewDetail(item)"
        >
          <template #title>
            <!-- 标题行 -->
            <div class="flex items-start justify-between">
              <span class="text-sm font-medium text-[#333] break-all flex-1">
                {{ item.categoryName }}
                <template v-if="item.sn">（{{ item.sn }}）</template>
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <van-button
                type="primary"
                size="small"
                @click.stop="onViewStorageRecord(item)"
              >
                出入库记录
              </van-button>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { ChemicalStockItem } from '~/views/mobileApp/types/chemical/stock'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getChemicalStockList } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()

// 列表数据
const list = ref<ChemicalStockItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const size = 10

// 搜索
const searchValue = ref('')

// 加载列表数据
async function onLoad() {
  if (refreshing.value) {
    list.value = []
    page.value = 1
    refreshing.value = false
  }

  const params: any = {
    page: page.value,
    size,
    quickQry: searchValue.value,
  }

  const res = await getChemicalStockList(params)

  if (res.code !== 20010) {
    const rows = res.data.rows || []
    list.value.push(...rows)
    page.value++

    if (list.value.length >= (res.data.count || 0)) {
      finished.value = true
    }
  }

  loading.value = false
}

// 刷新
function onRefresh() {
  finished.value = false
  loading.value = true
  page.value = 1
  list.value = []
  onLoad()
}

// 搜索
function onSearch() {
  finished.value = false
  loading.value = true
  page.value = 1
  list.value = []
  onLoad()
}

// 查看详情
function onViewDetail(item: ChemicalStockItem) {
  // 使用 sessionStorage 传递数据，避免 URL 长度限制
  sessionStorage.setItem(`chemical_stock_${item.id}`, JSON.stringify(item))
  router.push({
    path: '/chemical/stock/detail',
    query: {
      id: item.id,
    },
  })
}

// 查看出入库记录
function onViewStorageRecord(item: ChemicalStockItem) {
  router.push({
    path: '/chemical/stock/record',
    query: {
      id: item.id,
    },
  })
}
</script>
