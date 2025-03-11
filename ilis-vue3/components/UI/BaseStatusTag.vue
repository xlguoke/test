<template>
  <a-tooltip color="#fff" placement="right">
    <template #title>
      <div class="text-[#aaaaaa] text-3">
        <slot v-if="!title"></slot>
        {{ title }}
      </div>
    </template>
    <a-tag :color="color">
      <slot></slot>
    </a-tag>
  </a-tooltip>
</template>

<script lang="ts" setup>
defineProps<{
  /**
   * # tag颜色
   */
  color?: string
  /**
   * # tooltip文本
   */
  title?: string
}>()
</script>
