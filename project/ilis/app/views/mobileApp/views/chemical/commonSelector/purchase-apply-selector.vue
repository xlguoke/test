<template>
  <!-- 采购申请选择器 Popup - 全屏显示 -->
  <van-popup
    v-model:show="visible"
    position="right"
    :style="{ height: '100%', width: '90%' }"
    @open="onOpen"
    @closed="onClosed"
  >
    <div class="h-screen flex flex-col bg-[#f5f5f5]">
      <!-- 顶部导航栏 -->
      <MobileTitleBar
        title="选择采购申请单"
        left-arrow
        @click-left="onCancel"
      />

      <!-- 采购申请列表组件 - 内置搜索功能 -->
      <div class="flex-1 overflow-y-auto">
        <PurchaseApplyList
          ref="purchaseApplyListRef"
          :mode="mode"
          :initial-selected="initialSelected"
        />
      </div>

      <!-- 底部确认按钮 -->
      <div class="flex-shrink-0 p-3 bg-white border-t border-[#f0f0f0]">
        <div class="flex items-center justify-between">
          <div class="text-sm text-[#666]">
            <template v-if="mode === 'checkbox'">
              已选择 <span class="text-[#1890ff] font-medium">{{ selectedCount }}</span> 项
            </template>
          </div>
          <div class="flex gap-2">
            <van-button size="small" class="px-8" @click="onCancel">
              取消
            </van-button>
            <van-button type="primary" class="px-8" size="small" @click="onConfirm">
              确认
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { PurchaseApplyListItem } from '~/views/mobileApp/types/chemical/storage-in'
import { computed, ref } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import PurchaseApplyList from '~/views/mobileApp/views/chemical/components/PurchaseApplyList.vue'

interface Props {
  /** 是否显示 */
  show: boolean
  /** 初始选中的数据（用于回显） */
  initialSelected?: PurchaseApplyListItem[]
  /** 模式：radio 或 checkbox */
  mode?: 'radio' | 'checkbox'
}

const props = withDefaults(defineProps<Props>(), {
  initialSelected: () => [],
  mode: 'checkbox',
})

const emit = defineEmits<{
  /** 更新显示状态 */
  'update:show': [value: boolean]
  /** 确认选择 */
  'confirm': [items: PurchaseApplyListItem[]]
  /** 取消选择 */
  'cancel': []
}>()

// 引用采购申请列表组件
const purchaseApplyListRef = ref<InstanceType<typeof PurchaseApplyList>>()

// 内部显示状态
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

// 选中数量
const selectedCount = computed(() => purchaseApplyListRef.value?.getSelectedData().length || 0)

// Popup 打开时
function onOpen() {
  // 组件会自动加载数据
}

// Popup 关闭时
function onClosed() {
  // 重置采购申请列表组件
  purchaseApplyListRef.value?.reset()
}

// 取消
function onCancel() {
  visible.value = false
  emit('cancel')
}

// 确认
function onConfirm() {
  const selectedData = purchaseApplyListRef.value?.getSelectedData() || []
  emit('confirm', selectedData)
  visible.value = false
}
</script>
