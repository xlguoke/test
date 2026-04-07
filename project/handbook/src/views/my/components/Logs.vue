<script setup lang="ts">
import { ref } from 'vue'
import { readLogEntries } from 'custodian'
import NoData from '@/components/noData/index.vue'

const entries = ref<FileEntry[]>([])
const err = ref(null)
readLogEntries()
  .then(logEntries => (entries.value = logEntries))
  .catch(e => (err.value = e))
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />
    <div class="pd">
      <van-cell-group v-if="entries.length > 0">
        <RouterLink v-for="(item, index) in entries" :key="index" :to="`/my/logs/${item.name}`">
          <van-cell class="my-list" :title="item.name" is-link />
        </RouterLink>
      </van-cell-group>
      <NoData v-else />
    </div>
  </div>
</template>

<style scoped lang="less">
::v-deep .my-list {
  .van-cell__title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
