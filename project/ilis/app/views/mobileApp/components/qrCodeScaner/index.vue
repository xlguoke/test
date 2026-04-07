<template>
  <component :is="scanComponent" ref="qrCodeScanerRef"></component>
</template>

<script>
import { InAndroid, InMiniProgram } from '~/views/mobileApp/provides/utils/referrer'
import { loadScript } from '../../provides/utils/loadScript'
import AppScanPage from './appScanPage.vue'
import MiniProgramScanPage from './miniProgramScanPage.vue'
import WebScanPage from './webScanPage.vue'

export default {
  components: {
    AppScanPage,
    WebScanPage,
    MiniProgramScanPage,
  },
  computed: {
    scanComponent() {
      // 安卓
      if (InAndroid) {
        return 'AppScanPage'
      }

      // 微信小程序
      if (InMiniProgram) {
        return 'MiniProgramScanPage'
      }

      // 浏览器
      return 'WebScanPage'
    },
  },
  created() {
    // 微信小程序环境加载jdk
    if (InMiniProgram) {
      loadScript('/ilis2/drivers/jweixin-1.6.0.js')
    }
  },
  mounted() {
    window.$ilisQRCodeScan = this.$refs.qrCodeScanerRef.open
  },
}
</script>
