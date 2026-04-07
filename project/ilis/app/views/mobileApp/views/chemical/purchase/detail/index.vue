<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <van-sticky>
      <MobileTitleBar title="登记详情" left-arrow @click-left="router.go(-1)" />
    </van-sticky>

    <div class="p-3">
      <!-- 基本信息 -->
      <ListCard
        class="mb-3"
        :title="detailData.registerCode"
        :rows="[
          { label: '登记人', value: detailData.registrant },
          { label: '登记时间', value: detailData.registerTime },
          { label: '验收人', value: detailData.verifier },
          { label: '保管人', value: detailData.keepers },
        ]"
      >
      </ListCard>

      <!-- 化学品信息列表 -->
      <ListCard
        v-for="(item) in detailData.items"
        :key="item.id"
        class="mb-3"
        :rows="[
          { label: '化学名称', value: item.chemicalName },
          { label: '化学名称编号', value: item.chemicalCode },
          { label: '品名', value: item.productName },
          { label: '品名编号', value: item.productCode },
          { label: '供应商', value: item.supplier },
          { label: '规格', value: item.specification },
          { label: '购置数量', value: item.purchaseQuantity },
          { label: '单位', value: item.unit },
          { label: '购置日期', value: item.purchaseDate },
          { label: '生产日期', value: item.productionDate },
          { label: '失效日期', value: item.invalidDate },
          { label: '纯度', value: item.purity },
          { label: '浓度', value: item.concentration },
          { label: '备注', value: item.remark },
        ]"
      >
        <template #title>
          <div class="text-sm font-medium text-[#333] break-all">
            {{ item.chemicalName }}（{{ item.chemicalCode }}）
          </div>
        </template>
      </ListCard>

      <!-- 空状态 -->
      <van-empty v-if="!loading && detailData.items?.length === 0" description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PurchaseDetail } from '~/views/mobileApp/types/chemical/purchase'
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseRegisterDetail } from '~/views/mobileApp/provides/api/chemical.api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const detailData = ref<Partial<PurchaseDetail>>({
  registerCode: '',
  registrant: '',
  registerTime: '',
  verifier: '',
  items: [],
})

onMounted(() => {
  loadDetail()
})

async function loadDetail() {
  const { id } = route.params
  if (!id) {
    showToast('缺少参数')
    return
  }

  loading.value = true
  try {
    const res = await getPurchaseRegisterDetail(id as string)
    if (res.code !== 20010 && res.data) {
      detailData.value = res.data
      // 从明细项中回显保管人信息（取第一个有keepers的项）
      const firstItemWithKeepers = res.data.items?.find(item => item.keepers && item.keepers.length > 0)
      detailData.value.keepers = firstItemWithKeepers?.keepers?.map(keeper => keeper.name).join(',') || ''
    }
    else {
      showToast(res.message || '获取详情失败')
    }
  }
  catch (error: any) {
    console.error('获取详情失败:', error)
    showToast(error?.message || '获取详情失败')
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.van-cell) {
  padding: 12px 16px;
}

:deep(.van-cell__title) {
  color: #666;
  font-size: 14px;
}

:deep(.van-cell__value) {
  color: #333;
  font-size: 14px;
}
</style>
