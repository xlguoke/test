<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="采购登记"
        left-arrow
        @click-left="router.go(-1)"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>

      <!-- 搜索栏组件 -->
      <van-search
        v-model="searchValue"
        placeholder="请输入采购登记号/登记人/验收人查询"
        @search="onSearch"
        @clear="onSearch"
      />
    </van-sticky>

    <!-- 采购登记列表 -->
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
            { label: '登记人', value: item.registrant },
            { label: '登记时间', value: item.registerTime },
            { label: '验收人', value: item.verifier },
          ]"
          @click="goDetail(item)"
        >
          <template #title>
            <!-- 标题行 -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-[#333]">
                {{ item.registerCode }}
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <!-- <van-button
                v-if="item.status === 'IN_FILLING'"
                type="danger"
                size="small"
                @click.stop="onDelete(item)"
              >
                删除
              </van-button> -->
              <van-button
                v-if="item.status === 'IN_FILLING'"
                type="primary"
                size="small"
                @click.stop="onEdit(item)"
              >
                编辑
              </van-button>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <!-- 底部新增按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="goAdd">
        新增采购登记
      </van-button>
    </div>

    <!-- 筛选弹窗 -->
    <PurchaseSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseListItem, PurchaseListQueryParams } from '~/views/mobileApp/types/chemical/purchase'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseRegisterList } from '~/views/mobileApp/provides/api/chemical.api'
import PurchaseSearch from './components/PurchaseSearch.vue'

const router = useRouter()

// 搜索相关
const searchValue = ref('')

// 列表相关
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<PurchaseListItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选相关
const filterVisible = ref(false)
const filterData = ref<Partial<PurchaseListQueryParams>>({})

// 组件挂载时加载数据
onMounted(() => {
  fetchList()
})

// 获取列表数据
async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  loading.value = true

  try {
    const params: PurchaseListQueryParams = {
      page: page.value,
      size: pageSize.value,
      q: searchValue.value,
      ...filterData.value,
    }

    const res = await getPurchaseRegisterList(params)
    const rows = res.rows || []
    list.value = isRefresh ? rows : [...list.value, ...rows]
    total.value = res.count || 0

    // 判断是否加载完成
    if (list.value.length >= total.value || rows.length === 0) {
      finished.value = true
    }
    else {
      page.value++
    }
  }
  catch (error) {
    showToast((error as Error).message || '获取列表失败')
    console.error(error)
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
function onRefresh() {
  finished.value = false
  fetchList(true)
}

// 加载更多
function onLoad() {
  fetchList()
}

function onSearch() {
  fetchList(true)
}

function openFilter() {
  filterVisible.value = true
}

function onFilterConfirm(data: Partial<PurchaseListQueryParams>) {
  filterData.value = data
  fetchList(true)
}

// async function onDelete(item: PurchaseListItem) {
//   showConfirmDialog({
//     title: '提示',
//     message: `确定删除采购登记单 ${item.registerCode} 吗？`,
//   }).then(async () => {
//     try {
//       const res = await deletePurchaseRegister(item.id)
//       if (res.code !== 20010) {
//         showToast('删除成功')
//         fetchList(true)
//       }
//       else {
//         showToast(res.message || '删除失败')
//       }
//     }
//     catch (error) {
//       showToast('删除失败')
//       console.error(error)
//     }
//   }).catch(() => {})
// }

function onEdit(item: PurchaseListItem) {
  router.push({
    path: '/chemical/purchase/add',
    query: { id: item.id },
  })
}

function goDetail(item: PurchaseListItem) {
  router.push(`/chemical/purchase/detail/${item.id}`)
}

function goAdd() {
  router.push('/chemical/purchase/add')
}
</script>
