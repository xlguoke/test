<template>
  <div></div>
</template>

<script>
export default {
  data() {
    return {
      scanCallback: null,
      listenMiniProgramScanTimer: null,
    }
  },
  methods: {
    open(sacnCallBack) {
      this.sacnCallBack = sacnCallBack
      this.init()
    },
    init() {
      // 微信扫一扫
      // 此处逻辑为了不在网页中配置微信jdk，直接将扫码逻辑写在小程序中，并通过跳转页面来调用
      wx.miniProgram.navigateTo({
        url: `/pages/scanQRCode/index?url=${encodeURIComponent(window.location.href)}`,
      })
      this.listenMiniProgramScan()
    },
    // 监听微信小程序扫码
    listenMiniProgramScan() {
      clearInterval(this.listenMiniProgramScanTimer)

      this.listenMiniProgramScanTimer = setInterval(() => {
        const hash = window.location.hash || ''
        const hashSearch = hash.split('?')[1] || ''
        const hashParams = new URLSearchParams(hashSearch)
        const scanResult = hashParams.get('miniScanResult')

        if (scanResult) {
          clearInterval(this.listenMiniProgramScanTimer)
          this.listenMiniProgramScanTimer = null

          hashParams.delete('miniScanResult')
          window.location.hash = hashParams.toString()

          // 取消扫码
          if (scanResult === 'CANCEL') {
            this.onClose()
            return
          }

          this.sacnCallBack(scanResult, {
            scanToast: this.scanToast,
          })
        }
      }, 300)
    },
    scanToast(msg) {
      showToast({
        message: msg,
        position: 'top',
      })
    },
    onClose() {
      if (this.listenMiniProgramScanTimer) {
        clearInterval(this.listenMiniProgramScanTimer)
        this.listenMiniProgramScanTimer = null
      }
    },
  },
}
</script>
