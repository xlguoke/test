<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <van-sticky>
      <MobileTitleBar
        title="标准物质验收"
        left-arrow
        @click-left="router.go(-1)"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="list.length ? '没有更多了' : ''"
        class="p-3 pb-16 min-h-[200px]"
        @load="onLoad"
      >
        <ListCard
          v-for="item in list"
          :key="item.id"
          :body-style="{ display: 'flex', alignItems: 'center' }"
          @click="goDetail(item)"
        >
          <template #title>
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-[#333] break-all flex-1">标准物质购置验收</span>
              <van-tag :color="getStatusColor(item.status)" class="ml-2 shrink-0">
                {{ getStatusLabel(item.status) }}
              </van-tag>
            </div>
          </template>
          <template #default>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] leading-5 text-[#333333]">
                <div><span>标准物质种数：</span>{{ item.itemCount }}</div>
                <div><span>验收人：</span>{{ item.accepter || '-' }}</div>
                <div><span>创建人：</span>{{ item.createBy || '-' }}</div>
                <div><span>创建日期：</span>{{ dayjs(item.createDate).format('YYYY-MM-DD') }}</div>
              </div>
            </div>
            <van-icon name="arrow" color="#999" size="16" class="ml-2 shrink-0" />
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>

    <van-empty v-if="list.length === 0 && !loading" description="暂无数据" />

    <div class="fixed bottom-0 left-0 right-0 p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <van-button type="primary" block class="!rounded" @click="goToAdd">
        新增
      </van-button>
    </div>

    <StandardMaterialAcceptSearch
      v-model="filterVisible"
      :initial-data="filterData"
      @callback="onFilterConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import type { PurchaseAcceptanceItem } from '../api'
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseAcceptanceList, getStatusColor, getStatusLabel } from '../api'
import StandardMaterialAcceptSearch from '../components/StandardMaterialAcceptSearch.vue'

const router = useRouter()

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<PurchaseAcceptanceItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

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
      ...filterData.value,
    }

    const res = await getPurchaseAcceptanceList(params as any)
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

function openFilter() {
  filterVisible.value = true
}

function onFilterConfirm(data: Record<string, any>) {
  filterData.value = data
  fetchList(true)
}

function goDetail(item: PurchaseAcceptanceItem) {
  // 所有状态都通过id跳转，是否可编辑由add页面根据状态判断
  router.push(`/standardMaterialAccept/add?id=${item.id}`)
}

function goToAdd() {
  router.push('/standardMaterialAccept/add')
}

onMounted(() => {
  fetchList()
})
</script>
