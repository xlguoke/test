<script lang="ts" setup>
import { TabPane, Tabs } from 'ant-design-vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import WaitUpload from './components/WaitUpload.vue'
import SuccessUpload from './components/SuccessUpload.vue'

const activeKey = ref('1')
const successUpload = ref()
const route = useRoute()

watch(
  () => activeKey.value,
  (key) => {
    if (key === '1')
      return
    successUpload.value && successUpload.value.refreshData()
  },
)

watch(
  () => route.query.tabKey,
  (key) => {
    activeKey.value = (key as string) || '2'
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />

    <div class="test-task-content">
      <div class="test-task-tabs">
        <Tabs v-model:activeKey="activeKey">
          <TabPane key="2" tab="已上传" />
          <TabPane key="1" tab="待上传" />
        </Tabs>
      </div>

      <!-- 待上传 -->
      <WaitUpload v-show="activeKey === '1'" />

      <!-- 已上传 -->
      <SuccessUpload v-show="activeKey === '2'" ref="successUpload" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.test-task-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.test-task-tabs {
  background-color: #fff;
  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }
  .ant-tabs-nav-list {
    width: 100%;
    .ant-tabs-tab {
      flex: 1;
    }
  }
}
</style>
