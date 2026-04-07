<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px', paddingTop: 0 }"
    >
      <a-flex class="h-full" vertical>
        <a-tabs v-model:active-key="status">
          <a-tab-pane :key="PageStatusEnum.待提交" tab="待提交"></a-tab-pane>
          <a-tab-pane :key="PageStatusEnum.已提交" tab="已提交"></a-tab-pane>
        </a-tabs>
        <div class="flex-1">
          <CreateList v-if="status === PageStatusEnum.待提交" />
          <SubmitList v-if="status === PageStatusEnum.已提交" />
        </div>
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import { PageStatusEnum } from '~/views/chemical/waste/reg/index.ts'
import CreateList from './components/CreateList.vue'
import SubmitList from './components/SubmitList.vue'

const status = ref(PageStatusEnum.待提交)
</script>
