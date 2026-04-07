<script setup lang="ts">
import TestPackage from '../testtask-package/index.vue'
import SheetList from '../sheet-list/index.vue'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

const { isOnlineUdrPage } = useUdrStore()
</script>

<template>
  <div class="udr-main-left">
    <!-- 试验打包 -->
    <TestPackage v-if="isOnlineUdrPage" />
    <!-- 表格列表 -->
    <SheetList />
  </div>
</template>

<style lang="less" scoped>
.udr-main-left {
  display: flex;
  background: #fff;
  border-right: solid 1px #E5E6EB;
}
</style>
