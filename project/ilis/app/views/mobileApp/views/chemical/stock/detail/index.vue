<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-20">
    <van-sticky>
      <MobileTitleBar
        title="化学品存量详情"
        left-arrow
        @click-left="router.back()"
      />
    </van-sticky>

    <!-- 化学品信息详情 -->
    <div class="p-4">
      <ListCard
        :rows="[
          { label: '品名', value: detail.name || '--' },
          { label: '品名编号', value: detail.sn || '--' },
          { label: '管理级别', value: detail.manageLevel || '--' },
          { label: '纯度', value: detail.purity || '--' },
          { label: '浓度', value: detail.concentration || '--' },
          { label: '计量单位', value: detail.unit || '--' },
          { label: '规格型号', value: detail.specification || '--' },
          { label: '用途', value: detail.effect || '--' },
          { label: '化学品来源', value: detail.sourceFrom || '--' },
          { label: '生产（配置）日期', value: formatDate(detail.productionDate) },
          { label: '失效日期', value: formatDate(detail.invalidDate) },
          { label: '可用余量', value: String(detail.amount ?? '--') },
          { label: '保管人', value: detail.keepers || '--' },
        ]"
      >
        <template #title>
          <div class="text-base font-medium text-[#333]">
            {{ detail.categoryName }}
            <template v-if="detail.sn">
              （{{ detail.sn }}）
            </template>
          </div>
        </template>
      </ListCard>
    </div>

    <!-- 底部按钮 -->
    <div class="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100">
      <van-button
        type="primary"
        block
        @click="onViewStorageRecord"
      >
        出入库记录
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChemicalStockItem } from '~/views/mobileApp/types/chemical/stock'
import { useDateFormat } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'

const route = useRoute()
const router = useRouter()
const chemicalId = route.query.id as string

// 详情数据 - 从列表页传入
const detail = ref<Partial<ChemicalStockItem>>({})

// 格式化日期
function formatDate(date?: string) {
  if (!date)
    return '--'
  return useDateFormat(date, 'YYYY-MM-DD').value
}

// 获取详情数据 - 从 sessionStorage 读取
function getDetail() {
  const dataStr = sessionStorage.getItem(`chemical_stock_${chemicalId}`)
  if (dataStr) {
    try {
      detail.value = JSON.parse(dataStr)
    }
    catch {
      detail.value = {}
    }
  }
}

// 查看出入库记录
function onViewStorageRecord() {
  router.push({
    path: '/chemical/stock/record',
    query: {
      id: chemicalId,
    },
  })
}

onMounted(() => {
  getDetail()
})

// 路由离开守卫 - 只有返回列表页时才清除数据
onBeforeRouteLeave((to) => {
  // 如果目标不是出入库记录页面，则清除数据
  if (!to.path.includes('/chemical/stock/record')) {
    sessionStorage.removeItem(`chemical_stock_${chemicalId}`)
  }
})
</script>
