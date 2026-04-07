<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import SettingNetwork from './SettingNetwork.vue'
import SettingUpdateTime from './SettingUpdateTime.vue'
import { useUdrScript } from '@/stores/scripts'
import { useServerStore } from '@/stores/servers'
import { useCredentialStore } from '@/stores/credentials'

const serversStore = useServerStore()
const credentialStore = useCredentialStore()
const auth_base = __AUTH_BASE__

const udrScript = useUdrScript()
const online = ref(udrScript.online)
const offline = ref(udrScript.offline)
const debugging = ref(false)
const count = ref(0)
watch(count, (val) => {
  if (val > 5)
    debugging.value = true
})
</script>

<template>
  <div class="show-title-bar sys-setting-warp">
    <TitleBar />
    <div class="pd-lr">
      <div class="tool-card">
        <p class="page-title-min">
          内容
        </p>

        <SettingNetwork class="tool-item" />

        <SettingUpdateTime class="tool-item" />
      </div>
      <div class="tool-card">
        <p class="page-title-min">
          其它
        </p>
        <div class="tool-item">
          <span class="label" @click="count++">关于</span>
          <RouterLink to="/my/aboutUs" class="value">
            <van-icon name="arrow" />
          </RouterLink>
        </div>
        <div class="tool-item">
          <span class="label">日志</span>
          <RouterLink to="/my/logs" class="value">
            <van-icon name="arrow" />
          </RouterLink>
        </div>
        <div v-show="debugging" class="tool-item">
          <van-cell-group inset style="width: 100%;">
            <van-field
              v-model="online"
              label="Online Script"
              @keypress="() => udrScript.setOnlineScript(online)"
            />
            <van-field
              v-model="online"
              label="Offline Script"
              @keypress="() => udrScript.setOfflineScript(offline)"
            />
            <van-field
              v-model="auth_base"
              label="authBase"
              readonly
            />
            <van-field
              v-model="serversStore.servers[credentialStore.code].addr"
              label="baseUrl"
              readonly
            />
          </van-cell-group>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.sys-modal {
  .ant-radio-wrapper {
    padding: 15px 0;
    display: block;
    border-bottom: 1px solid #f8f8f8;
  }
}
.sys-setting-warp {
  .tool-card {
    margin-top: 2rem;
    padding: 2rem 2.5rem;
    background-color: #fff;
    font-size: 14px;
    font-weight: 500;
    .tool-item {
      margin-top: 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f8f8f9;
      line-height: 30px;
      user-select: none;
      .anticon-right {
        color: #ccc;
      }
      .label,
      .value {
        flex: 1;
      }
      .value{
        text-align: right;
      }
    }
  }
  .page-title-min {
    font-size: 16px;
    font-weight: 600;
    line-height: 16px;
    &::before {
      content: '';
      float: left;
      margin-top: 2px;
      margin-right: 10px;
      width: 4px;
      height: 14px;
      vertical-align: middle;
      background-color: #0284fe;
      border-radius: 0 3px 3px 0;
    }
  }
}
</style>
