<template>
  <IlisContainer app-id="dataPublishConfig">
    <a-tabs default-active-key="operation" @change="callback">
      <a-tab-pane key="operation" tab="Operation Nodes">
        <OperationConfig ref="operation" />
      </a-tab-pane>
      <a-tab-pane key="provider" tab="Data Providers" force-render>
        <ProviderConfig ref="provider" />
      </a-tab-pane>
      <a-tab-pane key="notice" tab="系统通知" force-render>
        <NoticeConfig ref="notice" />
      </a-tab-pane>
    </a-tabs>
  </IlisContainer>
</template>

<script>
import NoticeConfig from '../components/NoticeConfig.vue'
import OperationConfig from '../components/OperationConfig.vue'
import ProviderConfig from '../components/ProviderConfig.vue'

export default {
  name: 'App',
  components: { OperationConfig, ProviderConfig, NoticeConfig },
  data() {
    return {

    }
  },
  methods: {
    callback(key) {
      this.$refs[key].active()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
