<template>
  <a-tabs default-active-key="1" @change="changeTabs">
    <a-tab-pane key="1" tab="检测结果及结论">
      <TestResult />
    </a-tab-pane>
    <a-tab-pane key="2" tab="相关附件">
      <RelatedAccessory />
    </a-tab-pane>
  </a-tabs>
</template>

<script>
import RelatedAccessory from './relatedAccessory.vue'
import TestResult from './testResult.vue'

export default {
  components: {
    TestResult,
    RelatedAccessory,
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    changeTabs() {},
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-tabs-bar) {
  margin-bottom: 10px;
}
:deep(.ant-tabs-content) {
  height: calc(100vh - 60px);
}
</style>
