<template>
  <AppProvider>
    <a-card
      class="h-screen flex flex-col"
      :body-style="{ flex: 1, height: 0, paddingTop: '12px', paddingBottom: 0 }"
      :tab-list="tabList"
      :active-tab-key="activeKey"
      @tab-change="key => activeKey = key"
    >
      <ListPending v-if="activeKey === '1'" />
      <ListDone v-if="activeKey === '2'" />
    </a-card>
  </AppProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ListPending from './components/ListPending.vue'
import ListDone from './components/ListDone.vue'

const activeKey = ref('1')
const tabList = [
  {
    key: '1',
    tab: '待审核',
  },
  {
    key: '2',
    tab: '已审核',
  },
]
</script>

<style>
  #video_application .ant-tabs-content{
    height: 100%;
  }
</style>
