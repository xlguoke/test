<!-- 切换查看类型控件 -->
<template>
  <div class="w-full flex justify-end mb-3 bg-[#fff] p-[12px]">
    <a-segmented
      :value="props.viewType"
      :options="viewTypeData"
      @change="handleChange"
    >
      <template #label="{ value }">
        <LayoutOutlined v-if="value === '1'" />
        <OneToOneOutlined v-else />
      </template>
    </a-segmented>
  </div>
</template>

<script lang="ts" setup>
import type { SegmentedValue } from 'ant-design-vue/es/segmented/src/segmented'
import { LayoutOutlined, OneToOneOutlined } from '@ant-design/icons-vue'

// Props
const props = defineProps<{
  /** 查看方式(1:单文件查看 2:双文件比对查看) */
  viewType: string
}>()

// Emits
const emit = defineEmits<{
  /** 查看方式变化事件 */
  'update:viewType': [value: string]
}>()

// 查看方式数据
const viewTypeData = [{ value: '1' }, { value: '2' }]

/**
 * 处理查看方式变化
 * @param value 新的查看方式
 */
function handleChange(value: SegmentedValue) {
  emit('update:viewType', value as string)
}
</script>
