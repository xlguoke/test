<template>
  <van-popup
    v-model:show="visible"
    close-on-popstate
    position="bottom"
    :style="{ width: '100%', height: '100%' }"
    class="scanPage"
    duration="0.2"
    :lazy-render="true"
    @close="onClose"
  >
    <MobileTitleBar title="扫描二维码" left-arrow @click-left="onClose" />
    <div id="scan" :style="`width: ${scanWidth}px;height: ${scanHeight}px;`"></div>
  </van-popup>
</template>

<script>
import { showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      scan: null,
      scanWidth: window.screen.width,
      scanHeight: window.screen.height - 46,
      visible: false,
      sacnCallBack: null,
      scanConfig: {},
    }
  },
  computed: {
    enableKeepScan() {
      return this.scanConfig.enableKeepScan
    },
  },
  methods: {
    /**
     * sacnCallBack - 扫码完成回调
     * config - 其他配置项
     * config.enableKeepScan - 开启连续扫码模式，需主动关闭扫码页面
     */
    open(sacnCallBack, config) {
      if (this.visible === true) {
        return
      }

      this.scanWidth = window.screen.width
      this.scanHeight = window.screen.height - 46

      this.sacnCallBack = sacnCallBack
      this.scanConfig = config || {
        enableKeepScan: false,
      }
      this.visible = true

      this.$nextTick(() => {
        this.init()
      })
    },
    init() {
      this.scan = new plus.barcode.Barcode('scan', [0, plus.barcode.CODE128])
      this.scan.onmarked = this.onmarked

      setTimeout(() => {
        this.scan.start()
      }, 100)
    },
    // 扫码后的回调
    async onmarked(type, result) {
      if (type !== plus.barcode.QR && type !== plus.barcode.CODE128) {
        showNotify({
          type: 'warning',
          message: '未识别到二维码/条形码，请重新扫描',
        })

        setTimeout(() => {
          this.scan.start()
        }, 1500)
        return
      }

      try {
        await this.sacnCallBack(result, {
          scanToast: this.scanToast,
        })

        if (this.enableKeepScan) {
          setTimeout(() => {
            this.scan.start()
          }, 1500)
          return
        }
      }
      catch (e) {
        // eslint-disable-next-line no-alert
        alert(e)
      }

      this.onClose()
    },
    scanToast(msg) {
      plus.nativeUI.toast(msg, {
        duration: 'short',
      })
    },
    onClose() {
      if (this.scan) {
        this.scan.cancel()
        this.scan.close()
        this.scan = null
      }

      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.scanPage {
  overflow: hidden;
}
</style>
