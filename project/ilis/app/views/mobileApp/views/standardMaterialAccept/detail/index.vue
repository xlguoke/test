<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <MobileTitleBar
      title="购置验收详情"
      left-arrow
      @click-left="router.go(-1)"
    />
    <div class="p-3">
      <van-loading v-if="loading" vertical>
        加载中...
      </van-loading>
      <van-empty v-else-if="!detail" description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getPurchaseAcceptanceDetail } from '../api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detail = ref<any>(null)

onMounted(async () => {
  const id = route.query.id as string
  if (!id) {
    showToast('缺少参数')
    return
  }
  loading.value = true
  try {
    const res = await getPurchaseAcceptanceDetail(id)
    detail.value = res.data
  }
  catch (error) {
    console.error(error)
    showToast('获取详情失败')
  }
  finally {
    loading.value = false
  }
})
</script>
