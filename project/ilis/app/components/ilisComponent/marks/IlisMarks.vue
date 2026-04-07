<template>
  <div class="flex flex-wrap gap-1">
    <a-tooltip v-for="(mark, i) in marks" :key="i" placement="top">
      <template #title>
        {{ mark.description }}
      </template>
      <div
        class="min-w-[20px] h-[20px] text-center leading-[18px] cursor-default"
        :class="`${mark.border !== false ? 'rounded-full' : 'rounded-sm'} ${mark.bg ? 'px-1' : ''}`"
        :style="{
          color: mark.color,
          border: mark.border !== false ? `1px solid ${mark.color}` : 'none',
          backgroundColor: mark.bg ? mark.bg : 'transparent',
        }"
      >
        {{ mark.mark }}
      </div>
    </a-tooltip>
  </div>
</template>

<script setup lang="ts">
export interface IlisMark {
  /** 显示标记 */
  mark: string
  /** 标记描述 */
  description: string
  /** 标记文本颜色 */
  color: string
  /** 是否显示边框 */
  border?: boolean
  /** 是否显示背景 */
  bg?: string
}

defineProps<{
  marks: IlisMark[]
}>()
</script>
