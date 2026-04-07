<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    destroy-on-close
  >
    <div class="h-full flex flex-col bg-[#f5f5f5]">
      <MobileTitleBar
        title="采购申请列表"
        left-arrow
        @click-left="handleClose"
      >
        <template #right>
          <div class="text-white text-sm px-2 py-1" @click="openFilter">
            筛选
          </div>
        </template>
      </MobileTitleBar>

      <div class="flex-1 overflow-y-auto">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            :finished-text="list.length ? '没有更多了' : ''"
            class="p-3 pb-4 min-h-[200px]"
            @load="onLoad"
          >
            <ListCard
              v-for="item in list"
              :key="item.id"
              :body-style="{ display: 'flex', alignItems: 'center' }"
              @click="goToDetail(item)"
            >
              <template #title>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-[#333] break-all flex-1">标准物质采购申请</span>
                  <van-tag :color="getStatusColor(item.status as any)" class="ml-2 shrink-0">
                    {{ getStatusLabel(item.status as any) }}
                  </van-tag>
                </div>
              </template>
              <template #default>
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] leading-5 text-[#333333]">
                    <div><span>标准物质种数：</span>{{ item.itemCount || 0 }}</div>
                    <div><span>申请人：</span>{{ item.applicantName || '-' }}</div>
                    <div><span>填写日期：</span>{{ dayjs(item.createDate).format('YYYY-MM-DD') || '-' }}</div>
                  </div>
                </div>
                <van-icon name="arrow" color="#999" size="16" class="ml-2 shrink-0" />
              </template>
            </ListCard>
          </van-list>
        </van-pull-refresh>

        <van-empty v-if="list.length === 0 && !loading" description="暂无数据" />
      </div>

      <PurchaseApplySearch
        v-model="filterVisible"
        :initial-data="filterData"
        @callback="onFilterConfirm"
      />
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseApplyList, getStatusColor, getStatusLabel } from '../api'
import PurchaseApplySearch from './PurchaseApplySearch.vue'

interface PurchaseApplyItem {
  id: string
  title?: string
  itemCount?: number
  applicantName?: string
  createDate?: string
  status: string
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'select': [item: PurchaseApplyItem]
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<PurchaseApplyItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterVisible = ref(false)
const filterData = ref<Record<string, any>>({})

// 监听显示状态，打开时加载数据
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchList(true)
  }
})

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
      isAccepted: 0,
      ...filterData.value,
    }

    const res = await getPurchaseApplyList(params as any)
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

function goToDetail(item: PurchaseApplyItem) {
  emit('select', item)
}

function handleClose() {
  visible.value = false
}
</script>
