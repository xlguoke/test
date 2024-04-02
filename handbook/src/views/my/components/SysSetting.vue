<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue'
import { Input } from 'ant-design-vue'
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import SettingNetwork from './SettingNetwork.vue'
import SettingUpdateTime from './SettingUpdateTime.vue'
import { useUdrScript } from '@/stores/scripts'

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
            <RightOutlined />
          </RouterLink>
        </div>
        <div class="tool-item">
          <span class="label">日志</span>
          <RouterLink to="/my/logs" class="value">
            <RightOutlined />
          </RouterLink>
        </div>
        <div v-show="debugging" class="tool-item">
          <Input
            v-model:value="online"
            addon-before="Online Script"
            @press-enter="() => udrScript.setOnlineScript(online)"
          />
        </div>
        <div v-show="debugging" class="tool-item">
          <Input
            v-model:value="offline"
            addon-before="Offline Script"
            @press-enter="() => udrScript.setOfflineScript(offline)"
          />
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
