<template>
  <div class="detail-header bg-[var(--colorBgContainer)] px-[12px] py-[4px] flex justify-between items-center">
    <div>
      <span class="font-bold text-[18px]">{{ title }}</span>
      <span v-if="subTitle" class="text-sm text-[#666]">{{ subTitle }}</span>
    </div>
    <div>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  /** 标题 */
  title: string
  /** 副标题 */
  subTitle?: string
}>()
</script>

<style scoped>
.detail-header{
  box-shadow: 0px 4px 10px 0px rgba(0, 102, 236, 0.1);
}
</style>
