<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-4">
    <van-sticky>
      <MobileTitleBar
        title="日志"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 日志列表 -->
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
            { label: '处理意见', value: item.opinion || '--' },
            { label: '对象编号', value: item.objectSn || '--' },
            { label: '处理人', value: item.createName || '--' },
            { label: '时间', value: formatTime(item.createDate) },
          ]"
        >
          <template #title>
            <div class="text-sm font-medium text-[#333] break-all">
              内容：<span v-html="item.content || '--'" />
            </div>
          </template>
        </ListCard>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import type { LogItem } from '~/views/mobileApp/types/chemical/inventory'
import { useDateFormat } from '@vueuse/core'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getLogList } from '~/views/mobileApp/provides/api/chemical.api'

const router = useRouter()
const route = useRoute()

// 化学品信息
const dataId = ref('')

// 日志列表数据
const list = ref<LogItem[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 分页参数
const page = ref(1)

// 格式化时间
function formatTime(time: string) {
  if (!time)
    return '--'
  return useDateFormat(time, 'YYYY-MM-DD HH:mm:ss').value
}

// 加载日志列表
async function loadList(isRefresh = false) {
  if (isRefresh) {
    page.value = 1
    finished.value = false
  }

  if (finished.value && !isRefresh)
    return

  loading.value = true

  try {
    const res = await getLogList({
      id: dataId.value,
      objectType: '44',
      relationQry: false,
    })

    if (res.code !== 20010) {
      const data = res.data || []

      // 日志接口通常不分页，直接返回全部数据
      if (isRefresh) {
        list.value = data
      }
      else {
        list.value.push(...data)
      }

      // 日志接口通常不分页，直接标记为完成
      finished.value = true
    }
    else {
      showToast(res.message || '获取日志失败')
      finished.value = true
    }
  }
  catch (error) {
    console.error('获取日志列表失败:', error)
    showToast('获取日志失败')
    finished.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
function onRefresh() {
  loadList(true)
}

// 加载更多
function onLoad() {
  loadList(false)
}

onMounted(() => {
  // 获取页面参数
  const id = route.params.id as string

  if (id) {
    dataId.value = id
  }

  loadList(true)
})
</script>
