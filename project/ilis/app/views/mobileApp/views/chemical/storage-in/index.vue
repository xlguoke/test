<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="入库登记"
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
      <MobileSearchBar
        :sort-actions="sortActions"
        :current-sort="currentSort"
        @sort-select="onSortSelect"
      >
        <van-search
          v-model="searchValue"
          placeholder="请输入化学名称/化学品编号/入库批号"
          @search="onSearch"
          @clear="onSearch"
        />
      </MobileSearchBar>
    </van-sticky>

    <!-- 入库登记列表 -->
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
            { label: '存放位置', value: item.storageLocation || '' },
            { label: '入库数量', value: item.inventoryAmount || '' },
            { label: '保管人', value: item.keepers || '' },
            { label: '入库日期', value: item.putawayDate || '' },
          ]"
        >
          <template #title>
            <!-- 标题行 -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-[#333]">
                {{ item.name }}
                <template v-if="item.sn">（{{ item.sn }}）</template>
              </span>
              <span
                class="text-xs"
                :class="item.inventoryStatus === '创建中' ? 'text-[#ff9800]' : 'text-[#4caf50]'"
              >
                {{ item.inventoryStatus }}
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <van-button
                v-if="item.inventoryStatus === '创建中'"
                type="danger"
                size="small"
                @click="onDelete(item)"
              >
                删除
              </van-button>
              <van-button
                v-if="item.inventoryStatus === '创建中'"
                type="primary"
                size="small"
                @click="onEdit(item)"
              >
                编辑
              </van-button>
              <van-button
                v-else
                type="danger"
                size="small"
                @click="onDelete(item)"
              >
                删除
              </van-button>
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex gap-3">
        <van-button type="primary" block class="!rounded" @click="goToAdd">
          采购新增
        </van-button>
        <van-button type="primary" block class="!rounded" @click="goToApplyAdd">
          按采购申请新增
        </van-button>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <StorageInSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { StorageInListItem, StorageInListQueryParams } from '~/views/mobileApp/types/chemical/storage-in'
import { showConfirmDialog, showToast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileSearchBar from '~/views/mobileApp/components/MobileSearchBar/index.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { deleteStorageIn, getStorageInList } from '~/views/mobileApp/provides/api/chemical.api'
import StorageInSearch from './components/StorageInSearch.vue'

const router = useRouter()

// 搜索相关
const searchValue = ref('')

// 列表相关
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<StorageInListItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 排序相关
const currentSort = ref('')
const sortActions = [
  { name: '按默认排序', value: '' },
  { name: '按入库日期倒序', value: 'putawayDate_desc' },
  { name: '按入库日期正序', value: 'putawayDate_asc' },
]

// 筛选相关
const filterVisible = ref(false)
const filterData = ref<Partial<StorageInListQueryParams>>({})

// 获取列表数据
async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
  }

  loading.value = true

  try {
    const params: StorageInListQueryParams = {
      page: page.value,
      size: pageSize.value,
      quickQry: searchValue.value,
      ...filterData.value,
    }

    // 处理排序参数
    if (currentSort.value) {
      const [orderBy, order] = currentSort.value.split('_')
      params.orderBy = orderBy
      params.order = order as 'asc' | 'desc'
    }

    const res = await getStorageInList(params)

    const { rows, count } = res.data || { rows: [], count: 0 }
    list.value = isRefresh ? rows : [...list.value, ...rows]
    total.value = count

    // 判断是否加载完成
    if (list.value.length >= count) {
      finished.value = true
    }
  }
  catch (error) {
    showToast((error as Error).message || '获取列表失败')
    console.error(error)
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
  if (list.value.length > 0) {
    page.value++
  }
  fetchList()
}

function onSearch() {
  fetchList(true)
}

/** 排序选择回调 */
function onSortSelect(action: { name: string, value: string }) {
  currentSort.value = action.value
  fetchList(true)
}

function openFilter() {
  filterVisible.value = true
}

function onFilterConfirm(data: Partial<StorageInListQueryParams>) {
  filterData.value = data
  fetchList(true)
}

async function onDelete(item: StorageInListItem) {
  showConfirmDialog({
    title: '提示',
    message: `确定删除 ${item.name} 的入库记录吗？`,
  }).then(async () => {
    try {
      const res = await deleteStorageIn(item.id)
      if (res.code !== 20010) {
        showToast('删除成功')
        fetchList(true)
      }
      else {
        showToast(res.message || '删除失败')
      }
    }
    catch (error) {
      showToast('删除失败')
      console.error(error)
    }
  }).catch(() => {})
}

function onEdit(item: StorageInListItem) {
  router.push(`/chemical/storage-in/edit/${item.id}`)
}

function goToAdd() {
  router.push('/chemical/storage-in/add')
}

function goToApplyAdd() {
  router.push('/chemical/storage-in/apply-add')
}
</script>
