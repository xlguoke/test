<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="出库登记"
        left-arrow
        @click-left="router.go(-1)"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>

      <!-- 搜索栏 -->
      <van-search
        v-model="searchValue"
        placeholder="请输入出库批号/品名/化学品编号"
        @search="onSearch"
        @clear="onSearch"
      />
    </van-sticky>

    <!-- 出库登记列表 -->
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
            { label: '出库批号', value: item.batchSn || '' },
            { label: '出库类型', value: item.type || '' },
            { label: '领取人', value: item.receivers || '' },
            { label: '申领数量', value: item.amount || '' },
          ]"
        >
          <template #title>
            <div class="flex items-start justify-between">
              <span class="text-sm font-medium text-[#333] break-all flex-1">
                {{ item.name }}
                <template v-if="item.sn">（{{ item.sn }}）</template>
              </span>
              <span
                class="text-xs ml-4"
                :class="getStatusClass(item.status)"
              >
                {{ item.status }}
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <template v-if="item.status === '创建中'">
                <van-button type="danger" size="small" @click="onDelete(item)">
                  删除
                </van-button>
                <van-button type="primary" size="small" @click="onEdit(item)">
                  编辑
                </van-button>
              </template>
              <template v-else-if="item.status === '已领取'">
                <van-button type="primary" size="small" @click="onReturn(item)">
                  返还入库
                </van-button>
              </template>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="goToAdd">
        新增出库
      </van-button>
    </div>

    <!-- 筛选弹窗 -->
    <StorageOutSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { StorageOutListItem, StorageOutListQueryParams } from '~/views/mobileApp/types/chemical/storage-out'
import { showConfirmDialog, showToast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { deleteStorageOut, getStorageOutList } from '~/views/mobileApp/provides/api/chemical.api'
import StorageOutSearch from './components/StorageOutSearch.vue'

const router = useRouter()

// 搜索值
const searchValue = ref('')
// 列表数据
const list = ref<StorageOutListItem[]>([])
// 加载状态
const loading = ref(false)
// 刷新状态
const refreshing = ref(false)
// 是否全部加载完成
const finished = ref(false)
// 当前页码
const page = ref(1)
// 每页数量
const pageSize = ref(10)
// 筛选弹窗显示状态
const filterVisible = ref(false)
// 筛选数据
const filterData = ref<Partial<StorageOutListQueryParams>>({})

// 获取状态样式
function getStatusClass(status: string) {
  switch (status) {
    case '创建中':
      return 'text-[#ff9800]'
    case '已领取':
      return 'text-[#2196f3]'
    case '已返还':
      return 'text-[#4caf50]'
    default:
      return 'text-[#999]'
  }
}

onMounted(() => {
  fetchData()
})

// 搜索
function onSearch() {
  fetchData(true)
}

// 打开筛选
function openFilter() {
  filterVisible.value = true
}

// 筛选确认
function onFilterConfirm(data: Partial<StorageOutListQueryParams>) {
  filterData.value = data
  fetchData(true)
}

// 加载数据
async function onLoad() {
  if (list.value.length > 0) {
    page.value++
  }
  await fetchData()
}

// 刷新数据
function onRefresh() {
  finished.value = false
  fetchData(true)
}

// 获取数据
async function fetchData(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
  }

  loading.value = true

  try {
    const params: StorageOutListQueryParams = {
      page: page.value,
      size: pageSize.value,
      quickQry: searchValue.value || '',
      ...filterData.value,
    }

    const res = await getStorageOutList(params)

    if (res.code !== 20000) {
      throw new Error(res.message || '获取列表失败')
    }

    const { rows, count } = res.data || { rows: [], count: 0 }
    list.value = isRefresh ? rows : [...list.value, ...rows]

    // 判断是否加载完成
    if (list.value.length >= count) {
      finished.value = true
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

// 删除
async function onDelete(item: StorageOutListItem) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该出库记录吗？',
    })

    const res = await deleteStorageOut(item.id)
    if (res.code !== 20010) {
      showToast('删除成功')
      onRefresh()
    }
    else {
      showToast(res.message || '删除失败')
    }
  }
  catch (error) {
    // 用户取消删除
    console.error(error)
  }
}

// 编辑
function onEdit(item: StorageOutListItem) {
  router.push({
    path: `/chemical/storage-out/edit/${item.id}`,
  })
}

// 返还入库
function onReturn(item: StorageOutListItem) {
  router.push({
    path: `/chemical/storage-out/return/${item.id}`,
    query: {
      remainingQuantity: String(item.remainingAmount || 0),
    },
  })
}

// 新增出库
function goToAdd() {
  router.push({
    path: '/chemical/storage-out/add',
  })
}
</script>
