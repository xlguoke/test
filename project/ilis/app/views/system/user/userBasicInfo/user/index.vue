<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-tabs
      default-active-key="1"
      tab-position="left"
      :animated="false"
      @change="tabPage"
    >
      <a-tab-pane key="1" tab="基本信息">
        <div class="userBasicInfo-title">
          基本信息
        </div>
        <BaseInfo ref="BaseInfo" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="安全设置">
        <div class="userBasicInfo-title">
          安全设置
        </div>
        <Setting ref="Setting" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="账号绑定">
        <div class="userBasicInfo-title">
          账号绑定
        </div>
        <Account ref="Account" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="消息设置">
        <div class="userBasicInfo-title">
          消息设置
        </div>
        <MsgSettings ref="msgSettings" />
      </a-tab-pane>
      <a-tab-pane key="5" tab="其他设置">
        <div class="userBasicInfo-title">
          其他设置
        </div>
        <OtherSettings />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Account from '../components/account.vue'
import BaseInfo from '../components/baseInfo.vue'
import MsgSettings from '../components/msgSettings.vue'
import OtherSettings from '../components/otherSettings.vue'
import Setting from '../components/setting.vue'

export default {
  components: {
    BaseInfo,
    Setting,
    Account,
    MsgSettings,
    OtherSettings,
  },
  data() {
    return {}
  },
  methods: {
    tabPage() {},
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
