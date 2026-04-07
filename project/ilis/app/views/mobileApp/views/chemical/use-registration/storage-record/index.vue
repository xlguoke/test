<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-4">
    <van-sticky>
      <MobileTitleBar
        title="出入库记录"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 出入库记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="bg-white mt-2 mx-3 rounded-lg overflow-hidden"
        >
          <!-- 记录内容 -->
          <div class="p-3 text-sm">
            <div class="grid grid-cols-2 gap-y-2">
              <div class="text-gray-500">
                品名编号：
              </div>
              <div class="text-right">
                {{ item.sn }}
              </div>

              <div class="text-gray-500">
                品名：
              </div>
              <div class="text-right">
                {{ item.name }}
              </div>

              <div class="text-gray-500">
                关联任务：
              </div>
              <div class="text-right">
                {{ item.testTaskCodes || '--' }}
              </div>

              <div class="text-gray-500">
                检测参数：
              </div>
              <div class="text-right">
                {{ item.testParams || '--' }}
              </div>

              <div class="text-gray-500">
                出入库类型：
              </div>
              <div class="text-right">
                {{ item.type }}{{ item.inOrOut }}
              </div>

              <div class="text-gray-500">
                出入库批号：
              </div>
              <div class="text-right">
                {{ item.batchSn }}
              </div>

              <div class="text-gray-500">
                变动时间：
              </div>
              <div class="text-right">
                {{ formatTime(item.completeOperationDate) }}
              </div>

              <div class="text-gray-500">
                出库数量：
              </div>
              <div class="text-right">
                {{ item.outAmount || '--' }}
              </div>

              <div class="text-gray-500">
                入库数量：
              </div>
              <div class="text-right">
                {{ item.inAmount || '--' }}
              </div>

              <div class="text-gray-500">
                当次可用余量：
              </div>
              <div class="text-right">
                {{ item.afterAmount }}
              </div>

              <div class="text-gray-500">
                备注：
              </div>
              <div class="text-right">
                {{ item.remark || '--' }}
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { StorageRecordItem } from '~/views/mobileApp/types/chemical/use-registration'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getStorageRecordList } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()
const route = useRoute()

// 页面参数
const inventoryId = ref('')

// 列表数据
const list = ref<StorageRecordItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 格式化时间
function formatTime(time: string) {
  if (!time)
    return '--'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 获取数据
async function fetchData() {
  loading.value = true

  try {
    const res = await getStorageRecordList(inventoryId.value)

    if (res.code !== 20000) {
      throw new Error(res.message || '获取出入库记录失败')
    }

    list.value = res.data || []
    finished.value = true
  }
  catch (error) {
    showToast((error as Error).message || '获取出入库记录失败')
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
  await fetchData()
}

// 刷新
async function onRefresh() {
  finished.value = false
  await fetchData()
}

onMounted(() => {
  const id = route.query.id as string
  if (id) {
    inventoryId.value = id
    fetchData()
  }
})
</script>
