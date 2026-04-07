<template>
  <div>
    <div class="t">
      <div class="name">{{ screenConfig.name }}</div>
      <Time></Time>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useStore } from "@/store"
import { toRefs } from "vue"
import Time from "./Time.vue"

const { screenConfig } = toRefs(useStore())
</script>
<style lang="less" scoped>
.t {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.64rem;
    line-height: 0.8rem;
    font-weight: bold;
    margin-right: 0.5rem;
  }
}
</style>
