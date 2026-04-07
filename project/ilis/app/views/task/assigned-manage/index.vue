<template>
  <a-tabs v-model:active-key="activeKey" class="h-full">
    <a-tab-pane key="1" tab="待分配任务">
      <UnsignedView :key="key" />
    </a-tab-pane>
    <a-tab-pane key="2" tab="已分配任务">
      <SignedView />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
import SignedView from './signed/index.vue'
import UnsignedView from './unsigned/index.vue'

const activeKey = ref('1')

const key = ref(1)

onMounted(() => {
  key.value++
})
</script>

<style scoped lang="less">
:deep(.ant-tabs-content-holder){
  flex: 1 !important;
  height: 0 !important;
  .ant-tabs-content,.ant-tabs-tabpane{
    height: 100%;
  }
}
</style>
