<template>
  <!-- 化学品/采购申请选择器 Popup - 全屏显示 -->
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
        title="新增采购登记"
        left-arrow
        @click-left="onCancel"
      />

      <!-- Tab 切换 -->
      <van-tabs v-model:active="activeTab" class="flex-1 flex flex-col h-0" sticky :offset-top="0">
        <van-tab title="化学品新增" class="h-full overflow-y-auto">
          <!-- 化学品列表组件 - 内置搜索功能 -->
          <ChemicalList
            ref="chemicalListRef"
            :mode="chemicalMode"
            show-search
            :initial-selected="initialSelectedChemicals"
          />
        </van-tab>

        <van-tab title="采购申请单新增" class="h-full overflow-y-auto">
          <!-- 采购申请列表组件 - 内置搜索功能 -->
          <PurchaseApplyList
            ref="purchaseApplyListRef"
            :mode="applyMode"
            show-search
            :initial-selected="initialSelectedApplies"
          />
        </van-tab>
      </van-tabs>

      <!-- 底部确认按钮 -->
      <div class="flex-shrink-0 p-3 bg-white border-t border-[#f0f0f0]">
        <div class="flex items-center justify-between">
          <div class="text-sm text-[#666]">
            <template v-if="activeTab === 0 && chemicalMode === 'checkbox'">
              已选择 <span class="text-[#1890ff] font-medium">{{ selectedChemicalCount }}</span> 项
            </template>
            <template v-if="activeTab === 1 && applyMode === 'checkbox'">
              已选择 <span class="text-[#1890ff] font-medium">{{ selectedApplyCount }}</span> 项
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
import type { ChemicalItem } from '~/views/mobileApp/views/chemical/components/ChemicalList.vue'
import { computed, ref } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ChemicalList from '~/views/mobileApp/views/chemical/components/ChemicalList.vue'
import PurchaseApplyList from '~/views/mobileApp/views/chemical/components/PurchaseApplyList.vue'

interface Props {
  /** 是否显示 */
  show: boolean
  /** 初始选中的化学品数据（用于回显） */
  initialSelectedChemicals?: ChemicalItem[]
  /** 初始选中的采购申请单数据（用于回显） */
  initialSelectedApplies?: PurchaseApplyListItem[]
  /** 化学品选择模式：radio 或 checkbox */
  chemicalMode?: 'radio' | 'checkbox'
  /** 采购申请单选择模式：radio 或 checkbox */
  applyMode?: 'radio' | 'checkbox'
  /** 默认激活的Tab：0-化学品 1-采购申请单 */
  defaultTab?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialSelectedChemicals: () => [],
  initialSelectedApplies: () => [],
  chemicalMode: 'checkbox',
  applyMode: 'checkbox',
  defaultTab: 0,
})

const emit = defineEmits<{
  /** 更新显示状态 */
  'update:show': [value: boolean]
  /** 确认选择 */
  'confirm': [data: { chemicals: ChemicalItem[], applies: PurchaseApplyListItem[] }]
  /** 取消选择 */
  'cancel': []
}>()

// 引用列表组件
const chemicalListRef = ref<InstanceType<typeof ChemicalList>>()
const purchaseApplyListRef = ref<InstanceType<typeof PurchaseApplyList>>()

// 内部显示状态
const visible = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
})

// 当前激活的 Tab
const activeTab = ref(props.defaultTab)

// 选中数量
const selectedChemicalCount = computed(() => chemicalListRef.value?.getSelectedData().length || 0)
const selectedApplyCount = computed(() => purchaseApplyListRef.value?.getSelectedData().length || 0)

// Popup 打开时
function onOpen() {
  activeTab.value = props.defaultTab
  // 组件会自动加载数据
}

// Popup 关闭时
function onClosed() {
  // 重置列表组件
  chemicalListRef.value?.reset()
  purchaseApplyListRef.value?.reset()
}

// 取消
function onCancel() {
  visible.value = false
  emit('cancel')
}

// 确认
function onConfirm() {
  const chemicals = chemicalListRef.value?.getSelectedData() || []
  const applies = purchaseApplyListRef.value?.getSelectedData() || []
  emit('confirm', { chemicals, applies })
  visible.value = false
}
</script>

<style scoped>
:deep(.van-tabs__wrap) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.van-tabs__content) {
  flex: 1;
  height: 0;
  overflow-y: auto;
}

:deep(.van-tab--active) {
  color: #1989fa;
}

:deep(.van-tabs__line) {
  background-color: #1989fa;
}
</style>
