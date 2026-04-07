<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="使用登记"
        left-arrow
        @click-left="router.go(-1)"
      />

      <!-- 搜索栏组件 -->
      <van-search
        v-model="searchValue"
        placeholder="请输入出库批号/化学品编号/化学品名称"
        @search="onSearch"
        @clear="onSearch"
      />
    </van-sticky>

    <!-- 使用登记列表 -->
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
            { label: '出库批号', value: item.batchSn || '' },
            { label: '出库类型', value: item.type || '' },
            { label: '领用人', value: item.receivers || '' },
            { label: '出库量', value: String(item.amount || '') },
          ]"
        >
          <template #title>
            <!-- 标题行 -->
            <div class="flex items-start justify-between">
              <span class="text-sm font-medium text-[#333] break-all flex-1">
                {{ item.chemicalName || item.name }}
                <template v-if="item.sn">（{{ item.sn }}）</template>
              </span>
              <span
                class="text-xs ml-4"
                :class="item.status === '已领取' ? 'text-[#4caf50]' : 'text-[#ff9800]'"
              >
                {{ item.status }}
              </span>
            </div>
          </template>
          <template #footer>
            <div class="flex gap-2 justify-end pb-2">
              <van-button
                v-if="item.type === '检测申领' || item.type === '自配直接使用'"
                type="primary"
                size="small"
                @click="onAdd(item)"
              >
                新增
              </van-button>
              <van-button
                v-if="item.type === '配置溶液'"
                type="primary"
                size="small"
                @click="onAddLiquor(item)"
              >
                新增
              </van-button>
              <van-button
                type="default"
                size="small"
                @click="onViewUseRecord(item)"
              >
                使用记录
              </van-button>
              <van-button
                type="default"
                size="small"
                @click="onViewStorageRecord(item)"
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
import type { UseRegistrationItem, UseRegistrationQueryParams } from '~/views/mobileApp/types/chemical/use-registration'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getUseRegistrationList } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()

// 搜索相关
const searchValue = ref('')

// 列表相关
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<UseRegistrationItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 组件挂载时加载数据
onMounted(() => {
  fetchList()
})

// 获取列表数据
async function fetchList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    list.value = []
  }

  loading.value = true

  try {
    const params: UseRegistrationQueryParams = {
      page: page.value,
      size: pageSize.value,
      quickQry: searchValue.value,
    }

    const res = await getUseRegistrationList(params)

    if (res.code !== 20000) {
      throw new Error(res.message || '获取列表失败')
    }

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
  if (list.value.length > 0) {
    page.value++
  }
  fetchList()
}

function onSearch() {
  fetchList(true)
}

// 新增使用登记（检测申领/自配直接使用）
function onAdd(item: UseRegistrationItem) {
  router.push({
    path: '/chemical/use-registration/add',
    query: {
      id: item.id,
      type: 'normal',
      name: item.name,
      chemicalName: item.chemicalName,
      sn: item.sn,
      batchSn: item.batchSn,
      remainingAmount: String(item.remainingAmount),
    },
  })
}

// 新增使用登记（配置溶液）
function onAddLiquor(item: UseRegistrationItem) {
  router.push({
    path: '/chemical/use-registration/add',
    query: {
      id: item.id,
      type: 'liquor',
      name: item.name,
      chemicalName: item.chemicalName,
      sn: item.sn,
      batchSn: item.batchSn,
      remainingAmount: String(item.remainingAmount),
    },
  })
}

// 查看使用记录
function onViewUseRecord(item: UseRegistrationItem) {
  router.push({
    path: '/chemical/use-registration/use-record',
    query: {
      id: item.id,
      name: item.name,
      chemicalName: item.chemicalName,
      sn: item.sn,
    },
  })
}

// 查看出入库记录
function onViewStorageRecord(item: UseRegistrationItem) {
  router.push({
    path: '/chemical/use-registration/storage-record',
    query: {
      id: item.chemicalId,
      name: item.name,
      chemicalName: item.chemicalName,
      sn: item.sn,
    },
  })
}
</script>
