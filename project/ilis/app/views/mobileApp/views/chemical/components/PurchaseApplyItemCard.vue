<template>
  <ListCard
    :shape="shape"
    :checked="checked"
    enable-checkbox
    @click="handleClick"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <p>{{ item.requestCode }}</p>
          <div class="flex items-center text-xs text-[#666] mt-1">
            <span>申请部门：{{ item.requestDepartment }}</span>
            <span class="ml-4">申请人：{{ item.applicant }}</span>
          </div>
        </div>

        <van-icon
          :name="isExpanded ? 'arrow-up' : 'arrow-down'"
          class="text-[#999]"
          @click.stop="handleToggleExpand"
        />
      </div>
    </template>
    <template #default>
      <!-- 展开的详细信息 -->
      <template v-if="isExpanded">
        <!-- 详情列表 -->
        <template v-if="detailItems && detailItems.length > 0">
          <div
            v-for="(detail, idx) in detailItems"
            :key="idx"
            class="pt-2"
          >
            <div class="grid grid-cols-2 gap-y-1 text-xs">
              <div class="text-[#666]">
                化学名称：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.name }}
              </div>
              <div class="text-[#666]">
                品名：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.name }}
              </div>
              <div class="text-[#666]">
                化学品编号：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.code }}
              </div>
              <div class="text-[#666]">
                规格：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.standard }}
              </div>
              <div class="text-[#666]">
                数量：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.amount }}
              </div>
              <div class="text-[#666]">
                单位：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.unit }}
              </div>
              <div class="text-[#666]">
                备注：
              </div>
              <div class="text-right text-[#333]">
                {{ detail.description || '--' }}
              </div>
            </div>
          </div>
        </template>

        <!-- 无数据 -->
        <div v-else class="py-4 text-center text-xs text-[#999]">
          暂无明细数据
        </div>
      </template>
    </template>
  </ListCard>
</template>

<script setup lang="ts">
import type { PurchaseApplyDetailSubItem, PurchaseApplyListItem } from '~/views/mobileApp/types/chemical/storage-in'
import { showLoadingToast } from 'vant'
import { computed } from 'vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { getPurchaseApplyDetail } from '~/views/mobileApp/provides/api/chemical.api'

interface Props {
  item: PurchaseApplyListItem
  shape: 'round' | 'square'
  checked: boolean
  isExpanded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'click': []
  'toggleExpand': []
  'update:item': [item: PurchaseApplyListItem]
}>()

// 详情数据
const detailItems = computed<PurchaseApplyDetailSubItem[]>(() => {
  return props.item.items || []
})

// 处理点击 - 选中数据同时加载详情
async function handleClick() {
  // 如果没有详情数据，先加载详情
  if (!props.item.items || props.item.items.length === 0) {
    await loadDetail()
  }
  emit('click')
}

// 处理展开/收起
async function handleToggleExpand() {
  // 如果当前是收起状态，且没有详情数据，则加载详情
  if (!props.isExpanded && (!props.item.items || props.item.items.length === 0)) {
    await loadDetail()
  }
  emit('toggleExpand')
}

// 加载详情数据
async function loadDetail() {
  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  try {
    const res = await getPurchaseApplyDetail(props.item.id)
    // API返回的是 ApiResponse<T> 结构，需要通过 .data 获取实际数据
    const detailData = res?.data
    if (detailData && detailData.items && detailData.items.length > 0) {
      // 更新item的items字段
      const updatedItem: PurchaseApplyListItem = {
        ...props.item,
        items: detailData.items,
      }
      emit('update:item', updatedItem)
    }
  }
  catch (error) {
    console.error('加载采购申请单详情失败:', error)
  }
  finally {
    loadingToast.close()
  }
}
</script>
