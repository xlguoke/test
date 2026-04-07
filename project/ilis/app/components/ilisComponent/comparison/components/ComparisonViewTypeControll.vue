<!-- 收起/展开控件 -->
<template>
  <div class="relative">
    <a-segmented
      :key="segmentedKey"
      :value="viewType"
      :options="viewTypeData"
      size="large"
      @change="handleChange"
    >
      <template #label="{ value }">
        <a-tooltip :title="value === '1' ? '单文件查看' : '双文件比对查看'">
          <div v-if="value === '1'" :class="viewType === '1' ? 'text-colorPrimary' : ''">
            <LayoutOutlined />
            单栏
          </div>
          <div v-else :class="viewType === '2' ? 'text-colorPrimary' : ''">
            <OneToOneOutlined />
            双栏
          </div>
        </a-tooltip>
      </template>
    </a-segmented>
    <!-- 保留页面选择 -->
    <Transition name="fade">
      <div v-if="visible" ref="target" class="absolute top-full right-0 z-20 p-[12px] translate-y-[10px]  w-[190px] h-[144px] rounded-[4px] bg-[var(--colorBgContainer)] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.12)]">
        <div class="mb-[12px]">
          请选择保留左边栏内容，还是右边栏内容。
        </div>
        <div class="w-full flex items-center justify-between">
          <!-- 保留左侧 -->
          <div
            class="w-[70px] h-[70px] p-[4px] border rounded-[4px] border-[#333333] flex items-center justify-center cursor-pointer select-none transition-all duration-200"
            :class="{ '!border-colorPrimary': hoveredSide === 'left' }"
            @mouseenter="hoveredSide = 'left'"
            @mouseleave="hoveredSide = null"
            @click="handleKeepLeft"
          >
            <div
              class="flex-1 h-full mr-[4px] border rounded-[4px] border-[#333333] transition-all duration-200"
              :class="{ '!border-colorPrimary bg-colorPrimary': hoveredSide === 'left' }"
            >
            </div>
            <div class="flex-1 h-full mr-[4px] border border-dashed rounded-[4px] border-[#DCDCDC]">
            </div>
          </div>
          <!-- 保留右侧 -->
          <div
            class="w-[70px] h-[70px] p-[4px] border rounded-[4px] border-[#333333] flex items-center justify-center cursor-pointer select-none transition-all duration-200"
            :class="{ '!border-colorPrimary': hoveredSide === 'right' }"
            @mouseenter="hoveredSide = 'right'"
            @mouseleave="hoveredSide = null"
            @click="handleKeepRight"
          >
            <div class="flex-1 h-full mr-[4px] border border-dashed rounded-[4px] border-[#DCDCDC]">
            </div>
            <div
              class="flex-1 h-full mr-[4px] border rounded-[4px] border-[#333333] transition-all duration-200"
              :class="{ '!border-colorPrimary bg-colorPrimary': hoveredSide === 'right' }"
            >
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import type { SegmentedValue } from 'ant-design-vue/es/segmented/src/segmented'
import type { IComparisonViewType } from '../../../../components/ilisComponent/comparison/interface/IComparisonViewType'
import { LayoutOutlined, OneToOneOutlined } from '@ant-design/icons-vue'
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

// Props
defineProps<{
  /** 查看方式(1:单文件查看 2:双文件比对查看) */
  viewType: IComparisonViewType
}>()

// Emits
const emit = defineEmits<{
  /** 查看方式变化事件 */
  'update:viewType': [value: IComparisonViewType]
  /** 选择保留页面事件 */
  'selectKeepSide': [side: 'left' | 'right']
}>()

const target = ref()

/** 查看方式数据 */
const viewTypeData = [{ value: '1' }, { value: '2' }]

/** 当前鼠标悬停的侧边 */
const hoveredSide = ref<'left' | 'right' | null>(null)

/** 查看方式是否可见 */
const visible = ref(false)

const segmentedKey = ref(Date.now())

onClickOutside(target, (_event) => {
  visible.value = false
  segmentedKey.value = Date.now()
})

/**
 * 处理查看方式变化
 * @param value 新的查看方式
 */
function handleChange(value: SegmentedValue) {
  const newValue = value as IComparisonViewType
  // 切换到单文件查看(1)时显示保留页面选择
  if (newValue === '1') {
    visible.value = true
  }
  else {
    visible.value = false
    emit('update:viewType', newValue)
  }
}

/**
 * 选择保留左侧页面
 */
function handleKeepLeft() {
  visible.value = false
  emit('selectKeepSide', 'left')
  emit('update:viewType', '1')
}

/**
 * 选择保留右侧页面
 */
function handleKeepRight() {
  visible.value = false
  emit('selectKeepSide', 'right')
  emit('update:viewType', '1')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
