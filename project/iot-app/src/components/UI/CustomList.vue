<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="暂无更多"
      @load="onLoad"
    >
      <slot :data="list"></slot>
      <van-empty
        v-if="list.length === 0 && !loading"
        :image="emptyImage"
      />
      <!-- <van-back-top /> -->
    </van-list>
  </van-pull-refresh>
</template>

<script lang="ts" setup>
import type { AxiosResponse } from 'axios'
import emptyImage from '@/assets/empty.svg'

const props = defineProps<{
  api: (q?: any) => Promise<AxiosResponse<any>>
  query?: Record<string, any>
  totalKey?: string
  sizeKey?: string
  listenDataUpdate?: (data: any) => any
}>()

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const size = ref(10)

async function onLoad() {
  try {
    const query = {
      page: page.value,
      [props.sizeKey || 'size']: size.value,
      ...props.query,
    }

    const { data } = await props.api(query)
    const rows = data.rows || []

    if (refreshing.value) {
      list.value = []
      refreshing.value = false
    }

    list.value = [...list.value, ...rows]
    page.value++

    loading.value = false

    if (list.value.length >= data[props.totalKey || 'count']) {
      finished.value = true
    }

    if (props.listenDataUpdate) {
      props.listenDataUpdate(list.value)
    }
  }
  catch (error) {
    finished.value = true
    loading.value = false
    throw error
  }
}

function onRefresh() {
  // 清空列表数据
  refreshing.value = true
  finished.value = false
  page.value = 1
  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  onLoad()
}

defineExpose({
  onRefresh,
})
</script>
