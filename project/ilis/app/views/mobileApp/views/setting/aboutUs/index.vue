<template>
  <div class="about-us">
    <van-sticky v-if="InWeChatWeb">
      <div style="padding-top: 16px; padding-left: 16px">
        <van-button @click="$router.go(-1)">
          返回
        </van-button>
      </div>
    </van-sticky>
    <van-nav-bar
      v-else
      title="关于"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="$router.go(-1)"
    ></van-nav-bar>

    <div class="about-us-content">
      <img :src="appIconPng" class="app-icon" alt="" />
      <p class="version">
        V1.0.0
      </p>
      <p class="describe">
        智博检APP是一款集样品管理、试验管理、报告管理、设备管理、台账管理、环境监测及检查管理于一体的综合性试验室管理软件。
      </p>
      <p class="describe">
        通过智能化、数字化的管理方式，提升试验室工作效率，确保试验数据准确可靠。用户可随时随地查看实验进度，轻松管理试验室各项任务。ILIS博试云智慧试验室APP，助您实现试验室管理的智能化升级，提升科研工作效率，为科研创新提供有力支持。
      </p>
    </div>
    <div class="copyright">
      <p>版权所有 重庆海特科技发展有限公司</p>
      <p>{{ copyright }}</p>
    </div>
  </div>
</template>

<script>
import { InMiniProgram, InWeChatWeb } from '~/views/mobileApp/provides/utils/referrer'

export default {
  data() {
    return {
      appIconPng: new URL(`~/views/mobileApp/assets/app-icon.png`, import.meta.url).href,
      InWeChatWeb,
      InMiniProgram,
    }
  },
  computed: {
    copyright() {
      if (InMiniProgram) {
        return '渝ICP备10201065号-20X'
      }
      return '渝ICP备10201065号-16A'
    },
  },
  methods: {},
}
</script>

<style lang="less" scoped>
.about-us {
  height: 100vh;
  background-color: #fff;
}
.about-us-content {
  padding: 30px;
  min-height: 80vh;
  .app-icon {
    display: block;
    margin: 30px auto 10px;
    width: 68px;
    height: 68px;
    text-align: center;
  }
  .version {
    text-align: center;
  }
  .describe {
    font-size: 12px;
    color: #333;
    line-height: 24px;
    margin-top: 10px;
  }
}
.copyright {
  text-align: center;
  font-size: 12px;
  color: #666;
}
</style>
