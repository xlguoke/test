<template>
  <div v-if="fixed" class="h-[84px]"></div>
  <div
    class="mobile-action-bar"
    :class="{
      fixed,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang='ts'>
const props = defineProps({
  fixed: {
    type: Boolean,
    default: true,
  },
})

const fixed = computed(() => props.fixed)
</script>

<style lang="less" scoped>
.mobile-action-bar {
  padding: 16px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  border-top: solid 1px #f5f5f5;
  gap: 16px;

  :deep(.van-button) {
    border-radius: 0;
    flex: 1;
    height: 46px;
  }
}
</style>
