<template>
  <a-tabs v-model:active-key="activeKey" class="h-full">
    <a-tab-pane key="2" tab="待我复核">
      <WaitMeReview
        :active-key="activeKey"
        column-type="column-review-confirm"
      />
    </a-tab-pane>
    <a-tab-pane key="3" tab="报告审核中">
      <WaitMeReview
        :active-key="activeKey"
        column-type="column-review-approval"
      />
    </a-tab-pane>
    <a-tab-pane key="4" tab="报告已批准">
      <WaitMeReview
        :active-key="activeKey"
        column-type="column-review-approved"
      />
    </a-tab-pane>
    <a-tab-pane key="5" tab="全部">
      <WaitMeReview
        :active-key="activeKey"
        column-type="column-review-all"
      />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import WaitMeReview from './waitMeReview/index.vue'

const activeKey = ref('2')
</script>

<style lang="less" scoped>
:deep(.ant-tabs-content-holder){
  flex: 1 !important;
  .ant-tabs-content{
    height: 100%;
  }
}
</style>
