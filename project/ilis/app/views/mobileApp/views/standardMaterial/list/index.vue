<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <van-sticky>
      <MobileTitleBar
        title="标准物质管理"
        left-arrow
        @click-left="router.go(-1)"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>

      <MobileSearchBar
        :sort-actions="sortActions"
        :current-sort="currentSort"
        @sort-select="onSortSelect"
      >
        <van-search
          v-model="searchValue"
          placeholder="请输入标准物质名称/保管人"
          @search="onSearch"
          @clear="onSearch"
        />
      </MobileSearchBar>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="list.length ? '没有更多了' : ''"
        class="min-h-[200px]"
        @load="onLoad"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="bg-white px-4 py-3 border-b border-[#ebedf0] flex items-center justify-between"
          @click="goDetail(item)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <span class="text-sm font-medium text-[#333] break-all">{{ item.name }}</span>
              <van-tag v-if="item.priorityWeight === 2 || item.priorityWeight === 3" type="danger" class="ml-2 shrink-0">
                期
              </van-tag>
              <van-tag v-if="item.priorityWeight === 1 || item.priorityWeight === 3" color="#F59A23" class="ml-2 shrink-0">
                警
              </van-tag>
            </div>
            <div class="text-[13px] text-[#999] break-all mt-1">
              {{ item.specification }}
            </div>
          </div>
          <van-icon name="arrow" color="#999" size="16" class="ml-2 shrink-0" />
        </div>
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="list.length === 0 && !loading" description="暂无数据" />

    <StandardMaterialSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { StandardMaterialItem } from '../api'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileSearchBar from '~/views/mobileApp/components/MobileSearchBar/index.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getStandardMaterialList } from '../api'
import StandardMaterialSearch from '../components/StandardMaterialSearch.vue'

const router = useRouter()

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<StandardMaterialItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchValue = ref('')

const currentSort = ref('')
const sortActions = [
  { name: '按默认排序', value: '' },
  { name: '按生产日期倒序', value: 'productionDate_desc' },
  { name: '按生产日期正序', value: 'productionDate_asc' },
]

const filterVisible = ref(false)
const filterData = ref<Record<string, any>>({})

async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value - 1,
      size: pageSize.value,
      keyword: searchValue.value || undefined,
      ...filterData.value,
    }

    if (currentSort.value) {
      const [sort, order] = currentSort.value.split('_')
      params.sort = `${sort},${order}`
    }

    const res = await getStandardMaterialList(params as any)
    const rows = res.data?.content || []
    list.value = isRefresh ? rows : [...list.value, ...rows]
    total.value = res.data?.totalElements || 0

    if (list.value.length >= total.value || rows.length === 0) {
      finished.value = true
    }
    else {
      page.value++
    }
  }
  catch (error) {
    console.error(error)
    showToast('获取列表失败')
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

function onRefresh() {
  fetchList(true)
}

function onLoad() {
  fetchList()
}

function onSearch() {
  fetchList(true)
}

function onSortSelect(action: { name: string, value: string }) {
  currentSort.value = action.value
  fetchList(true)
}

function openFilter() {
  filterVisible.value = true
}

function onFilterConfirm(data: Record<string, any>) {
  filterData.value = data
  fetchList(true)
}

function goDetail(item: StandardMaterialItem) {
  router.push(`/standardMaterial/detail?id=${item.id}`)
}

onMounted(() => {
  fetchList()
})
</script>
