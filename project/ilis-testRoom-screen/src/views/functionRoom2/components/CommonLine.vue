<template>
  <div class="common-line">
    <div class="l" :style="`width: ${labelWidth || 'auto'};`">
      <slot name="icon"></slot>
      <slot name="label">{{ label }}</slot>
    </div>
    <div :class="['r', align]">
      <slot name="value">{{ initValue }}</slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue"

const props = defineProps<{
  label?: string
  value?: any
  align?: "left" | "right"
  labelWidth?: string
}>()

const initValue = computed(() => {
  const v = props.value
  return v === undefined || v === null || v === "" ? "--" : v
})
</script>
<style lang="less" scoped>
.common-line {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  word-break: break-all;
  .l {
    white-space: nowrap;
    margin-right: 0.01rem;
    color: #707c8c;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .r {
    flex: 1;
    width: 0;
    text-align: right;
    &.right {
      text-align: right;
    }
    &.left {
      text-align: left;
    }
  }
}
</style>
