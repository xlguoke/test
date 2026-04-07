<template>
  <a-spin :spinning="spinning">
    <div :class="`relative h-full flex ${isRow ? '' : 'flex-col'} gap-${gap} ${overflowHidden ? 'overflow-hidden' : 'overflow-auto'}`">
      <slot></slot>
    </div>
  </a-spin>
</template>

<script lang="ts" setup>
defineProps({
  /** 间距 */
  gap: {
    type: Number,
    default: 2,
  },
  /** 显示 loading */
  spinning: {
    type: Boolean,
    default: false,
  },
  /** 溢出隐藏：内容区单独设置滚动条，且高度变高时，父容器会闪现滚动条 */
  overflowHidden: Boolean,
  /** 横向排列 */
  isRow: Boolean,
})
</script>

<style scoped>
/* a-spin组件高度设为100% */
.ant-spin-nested-loading,
:deep(.ant-spin-container) {
  height: 100% !important;
  overflow: hidden;
}
</style>
