<template>
  <div class="min-h-screen bg-[#f5f5f5] pb-24">
    <van-sticky>
      <MobileTitleBar
        title="标准物质详情"
        left-arrow
        @click-left="router.go(-1)"
      />
    </van-sticky>

    <van-loading v-if="pageLoading" class="mt-20" />

    <template v-else>
      <van-collapse v-model="activeNames">
        <van-collapse-item title="基础信息" name="1">
          <van-cell-group :border="false" class="custom-cell-group">
            <van-cell title="标准物质名称" :value="detail.name" />
            <van-cell title="规格型号" :value="detail.specification" />
            <van-cell title="生产厂家" :value="detail.manufacturer" />
            <van-cell title="生产日期" :value="detail.productionDate">
              <template #value>
                <span>{{ detail.productionDate }}</span>
                <van-tag v-if="detail.priorityWeight === 2 || detail.priorityWeight === 3" type="danger" class="ml-2">
                  期
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="有效期(月)" :value="detail.validPeriodMonths" />
            <van-cell title="计量单位" :value="detail.unit" />
            <van-cell title="单价" :value="detail.unitPrice != null ? `${detail.unitPrice.toFixed(2)}元/${detail.unit || ''}` : ''" />
            <van-cell title="标准值" :value="detail.standardValue" />
            <van-cell title="保管人" :value="detail.custodian" />
            <van-cell title="库存余量">
              <template #value>
                <span>{{ detail.inventoryQuantity != null ? `${detail.inventoryQuantity.toFixed(2)}${detail.unit || ''}` : '' }}</span>
                <van-tag v-if="detail.priorityWeight === 1 || detail.priorityWeight === 3" color="#F59A23" class="ml-2">
                  警
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="余量阈值" :value="detail.thresholdValue != null ? `${detail.thresholdValue.toFixed(2)}${detail.unit || ''}` : ''" />
            <van-cell title="最近购入时间" :value="detail.lastPurchaseDate" />
            <van-cell title="最近购入数量" :value="detail.lastPurchaseQuantity != null ? `${detail.lastPurchaseQuantity}${detail.unit || ''}` : ''" />
          </van-cell-group>
        </van-collapse-item>

        <van-collapse-item title="附件档案" name="2">
          <div class="p-3">
            <UploadWithQrKey
              v-if="detail.id"
              ref="uploadRef"
              :business-id="detail.id"
              business-type="REF_MATERIAL"
              :deletable="false"
              :show-upload="false"
            />
            <div v-if="!hasFiles" class="text-center text-gray-400 py-4">
              暂无附件
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </template>

    <div class="fixed bottom-0 left-0 right-0 p-3 px-4 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="flex flex-col gap-3">
        <van-button type="primary" block class="!rounded" @click="goInbound">
          入库登记
        </van-button>
        <van-button type="primary" block class="!rounded" @click="goOutbound">
          出库登记
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandardMaterialItem } from '../api'
import { showToast } from 'vant'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getLatestInboundRecord, getStandardMaterialDetail } from '../api'

const route = useRoute()
const router = useRouter()

const activeNames = ref([]) // 默认不展开
const detail = ref<StandardMaterialItem>({} as StandardMaterialItem)
const pageLoading = ref(true)
const uploadRef = ref<any>(null)

// 是否有附件
const hasFiles = computed(() => {
  return uploadRef.value?.fileList?.length > 0
})

async function fetchDetail() {
  const id = route.query.id as string
  if (!id) {
    showToast('缺少ID参数')
    return
  }

  pageLoading.value = true
  try {
    const [materialRes, purchaseRes] = await Promise.all([
      getStandardMaterialDetail(id),
      getLatestInboundRecord('PURCHASE', id),
    ])

    // 接口并行调用，一次发出多个请求
    if (materialRes.code === 20000 && materialRes.data) {
      detail.value = materialRes.data
    }
    else {
      showToast(materialRes.message || '获取详情失败')
    }
    if (purchaseRes.code === 20000 && purchaseRes.data) {
      detail.value.lastPurchaseDate = purchaseRes?.data?.purchaseDate
      detail.value.lastPurchaseQuantity = purchaseRes?.data?.quantity
    }
  }
  catch (error) {
    console.error(error)
    showToast('获取详情失败')
  }
  finally {
    pageLoading.value = false
  }
}

function goInbound() {
  router.push(`/standardMaterial/inbound?materialId=${detail.value.id}`)
}

function goOutbound() {
  router.push(`/standardMaterial/outbound?materialId=${detail.value.id}`)
}

onMounted(() => {
  fetchDetail()
})
</script>
