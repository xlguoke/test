<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-4">
    <van-sticky>
      <MobileTitleBar
        title="出入库记录"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 记录列表 -->
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
            { label: '品名', value: item.name || '--' },
            { label: '品名编号', value: item.sn || '--' },
            { label: '关联任务', value: item.testTaskCodes || '--' },
            { label: '检测参数', value: item.testParams || '--' },
            { label: '出入库类型', value: formatType(item.type, item.inOrOut) },
            { label: '出入库批号', value: item.batchSn || '--' },
            { label: '变动时间', value: formatTime(item.completeOperationDate) },
            { label: '出库数量', value: item.outAmount ? String(item.outAmount) : '--' },
            { label: '入库数量', value: item.inAmount ? String(item.inAmount) : '--' },
            { label: '当次可用余量', value: item.afterAmount !== undefined ? String(item.afterAmount) : '--' },
            { label: '备注', value: item.remark || '--' },
          ]"
        >
          <template #title>
            <div class="text-sm font-medium text-[#333] break-all">
              {{ item.name }}
              <template v-if="item.sn">
                （{{ item.sn }}）
              </template>
            </div>
          </template>
        </ListCard>

        <!-- 空状态 -->
        <van-empty v-if="!loading && list.length === 0" description="暂无出入库记录" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { StorageRecordItem } from '~/views/mobileApp/types/chemical/stock'
import { useDateFormat } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getStorageRecordList } from '~/views/mobileApp/provides/api/chemical.api'

const route = useRoute()
const router = useRouter()
const chemicalId = route.query.id as string

// 列表数据
const list = ref<StorageRecordItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 格式化时间
function formatTime(time: string) {
  if (!time)
    return '--'
  return useDateFormat(time, 'YYYY-MM-DD HH:mm:ss').value
}

// 格式化出入库类型
function formatType(type: string, inOrOut: string) {
  if (!type)
    return '--'
  return `${type}${inOrOut || ''}`
}

// 加载列表数据
async function onLoad() {
  if (refreshing.value) {
    list.value = []
    refreshing.value = false
  }

  if (!chemicalId) {
    finished.value = true
    loading.value = false
    return
  }

  const res = await getStorageRecordList(chemicalId)

  if (res.code !== 20010) {
    const data = res.data || []
    list.value = data
    finished.value = true
  }

  loading.value = false
}

// 刷新
function onRefresh() {
  finished.value = false
  loading.value = true
  list.value = []
  onLoad()
}

onMounted(() => {
  loading.value = true
  onLoad()
})
</script>
