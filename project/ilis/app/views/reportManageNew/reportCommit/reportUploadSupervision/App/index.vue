<template>
  <IlisContainer app-id="reportUploadSupervision">
    <a-tabs v-model:active-key="key">
      <a-tab-pane key="1" tab="待上报">
        <ReportWait v-if="key === '1'" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="已上报" force-render>
        <ReportAchieve v-if="key === '2'" />
      </a-tab-pane>
    </a-tabs>
  </IlisContainer>
</template>

<script>
import reportAchieve from '../reportAchieve/index.vue'
import reportWait from '../reportWait/index.vue'

export default {
  name: 'App',
  components: {
    ReportAchieve: reportAchieve,
    ReportWait: reportWait,
  },
  data() {
    return {
      key: '1',
    }
  },
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
