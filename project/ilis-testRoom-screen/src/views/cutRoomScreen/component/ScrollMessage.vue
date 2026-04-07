<template>
  <div class="scroll-message">
    <Tag v-for="(item, index) in data" :key="index" class="custom_tag">
      {{ item }}
    </Tag>
  </div>
</template>

<script setup lang="ts">
import Tag from "./Tag.vue"

defineProps<{
  data: Array<string>
}>()
</script>

<style lang="less" scoped>
.scroll-message {
  overflow-y: auto;
  max-height: 50px;
  .custom_tag {
    padding: 0 16px;
    height: 44px;
    line-height: 44px;
    width: 100%;
    font-size: 16px;
    display: flex;
    color: #ffac20;
    border: 1px solid #ffac20;
    justify-content: space-between;
    background-color: transparent !important;
    & + .custom_tag {
      margin-top: 12px;
    }
  }
}
</style>
