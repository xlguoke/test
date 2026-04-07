<!-- 操作按钮 -->
<template>
  <div
    class="flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--colorPrimaryBgHover)] rounded-[4px]"
    :class="direction === 'vertical' ? 'w-full' : 'h-full' "
  >
    <component :is="icon" class="w-[36px] h-[36px] mb-[4px]" />
    <span class="text-sm font-medium text-center">{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  /** 操作按钮图标 */
  icon: string | (() => VNode)
  /** 操作按钮文本 */
  label: string
  /** 按钮展示结构（左右/上下） */
  direction: 'horizontal' | 'vertical'
}>(), {
  direction: 'vertical',
})
</script>
