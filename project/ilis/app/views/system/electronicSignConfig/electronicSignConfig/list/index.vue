<template>
  <div class="p-4">
    <a-tabs default-active-key="signConfig">
      <a-tab-pane key="signConfig" tab="电子签名配置">
        <SignConfig></SignConfig>
      </a-tab-pane>
      <a-tab-pane
        key="thirdPartyPlatform"
        tab="设置电子签名/签章第三方平台"
        force-render
      >
        <ThirdPartyPlatform></ThirdPartyPlatform>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import signConfig from './components/signConfig.vue'
import thirdPartyPlatform from './components/thirdPartyPlatform.vue'

export default {
  components: {
    ThirdPartyPlatform: thirdPartyPlatform,
    SignConfig: signConfig,
  },
  data() {
    return {}
  },
  computed: {},
  async created() {},
  methods: {},
}
</script>

<style lang="less">
@import './index.less';
</style>
