<template>
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ width: '100%', height: '100%' }"
    destroy-on-close
  >
    <div class="h-full flex flex-col bg-[#f5f5f5]">
      <MobileTitleBar
        title="选择标准物质"
        left-arrow
        @click-left="handleClose"
      />

      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-4 text-center text-[#999]">
          <van-loading>加载中...</van-loading>
        </div>

        <div v-else-if="detailItems.length === 0" class="p-4">
          <van-empty description="暂无采购明细" />
        </div>

        <div v-else class="p-3">
          <div
            v-for="item in detailItems"
            :key="item.id"
            class="bg-white rounded-lg mb-3 p-3 flex items-start"
            @click="toggleSelect(item.id)"
          >
            <van-checkbox
              :model-value="selectedIds.includes(item.id)"
              shape="square"
              class="mt-1 mr-3 shrink-0"
              @click.stop
              @update:model-value="(checked: boolean) => handleCheckChange(item.id, checked)"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[#333] break-all">
                {{ item.materialName }} - {{ item.quantity }}{{ item.unit || '' }}
              </div>
              <div class="text-xs text-[#999] mt-1 break-all">
                {{ item.materialSpecification || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)] shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center" @click="toggleSelectAll">
            <van-checkbox v-model="isAllSelected" @click.stop>
              全选
            </van-checkbox>
          </div>
          <van-button type="primary" class="!rounded px-8" :disabled="selectedIds.length === 0" @click="handleConfirm">
            确定({{ selectedIds.length }})
          </van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { showLoadingToast, showToast } from 'vant'
import { computed, ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getPurchaseApplyDetail, getStandardMaterialLedgerDetail } from '../api'

interface PurchaseApplyDetailItem {
  id: string
  materialId?: string
  materialName: string
  materialSpecification: string
  quantity: number
  unitPrice?: number
  unit?: string
  amount?: number
  custodian?: string
  manufacturer?: string
  productionDate?: string
  remark?: string
}

const props = defineProps<{
  show: boolean
  applyId: string
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [items: any[]]
  'back': []
}>()

const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

const loading = ref(false)
const detailItems = ref<PurchaseApplyDetailItem[]>([])
const selectedIds = ref<string[]>([])

const isAllSelected = computed({
  get: () => detailItems.value.length > 0 && selectedIds.value.length === detailItems.value.length,
  set: (val) => {
    if (val) {
      selectedIds.value = detailItems.value.map(item => item.id)
    }
    else {
      selectedIds.value = []
    }
  },
})

// 监听显示状态和applyId变化
watch(() => [props.show, props.applyId], ([newShow, newApplyId]) => {
  if (newShow && newApplyId) {
    selectedIds.value = []
    fetchDetail()
  }
})

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  }
  else {
    selectedIds.value.push(id)
  }
}

function handleCheckChange(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id)
    }
  }
  else {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  }
  else {
    selectedIds.value = detailItems.value.map(item => item.id)
  }
}

async function fetchDetail() {
  if (!props.applyId) {
    showToast('缺少采购申请ID')
    return
  }

  loading.value = true
  try {
    const res = await getPurchaseApplyDetail(props.applyId)
    if (res.data && res.data.applyItems) {
      detailItems.value = res.data.applyItems.map((item: any) => ({
        id: item.id,
        materialId: item.materialId,
        materialName: item.materialName || '',
        materialSpecification: item.materialSpecification || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice,
        unit: item.unit,
        amount: item.amount,
        custodian: item.custodian,
        manufacturer: item.manufacturer,
        productionDate: item.productionDate,
        remark: item.remark,
      }))
    }
  }
  catch (error) {
    console.error(error)
    showToast('获取采购明细失败')
  }
  finally {
    loading.value = false
  }
}

async function handleConfirm() {
  if (selectedIds.value.length === 0) {
    showToast('请至少选择一条数据')
    return
  }

  const loadingToast = showLoadingToast({
    message: '处理中...',
    forbidClick: true,
    duration: 0,
  })

  try {
    const selectedItems: any[] = []

    for (const id of selectedIds.value) {
      const item = detailItems.value.find(d => d.id === id)
      if (!item)
        continue

      let manufacturer = item.manufacturer || ''
      let productionDate = item.productionDate || ''
      let custodian = item.custodian || ''
      let unit = item.unit || ''

      if (item.materialId) {
        try {
          const { data } = await getStandardMaterialLedgerDetail(item.materialId)
          if (data) {
            manufacturer = manufacturer || data.manufacturer || ''
            productionDate = productionDate || data.productionDate || ''
            custodian = custodian || data.custodian || ''
            unit = unit || data.unit || ''
          }
        }
        catch (e) {
          console.error('获取标准物质详情失败:', e)
        }
      }

      selectedItems.push({
        applyItemId: item.id,
        materialId: item.materialId,
        materialName: item.materialName,
        materialSpecification: item.materialSpecification,
        manufacturer,
        productionDate,
        unitPrice: item.unitPrice,
        unit,
        quantity: item.quantity,
        custodian,
        purchaseDate: dayjs().format('YYYY-MM-DD'),
        remark: item.remark || '',
        isCustomMaterial: !item.materialId,
        isCustomSpecification: false,
      })
    }

    loadingToast.close()
    emit('confirm', selectedItems)
    visible.value = false
  }
  catch (error) {
    console.error(error)
    loadingToast.close()
    showToast('处理失败')
  }
}

function handleClose() {
  emit('back')
}
</script>
