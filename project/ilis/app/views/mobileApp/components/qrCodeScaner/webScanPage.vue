<template>
  <van-popup
    v-model:show="visible"
    close-on-popstate
    position="bottom"
    :style="{ width: '100%', height: '100%' }"
    duration="0.2"
    :lazy-render="true"
    @close="onClose"
  >
    <div class="web-scanner">
      <video :id="videoId"></video>

      <van-icon name="clear" class="web-scanner-close" @click="onClose" />

      <div v-if="scanning" class="web-scanner-view">
        <div class="line"></div>
        <div class="angle"></div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { BrowserMultiFormatReader } from '@zxing/library'
import { v4 } from 'uuid'

export default {
  data() {
    return {
      visible: false,
      videoId: null,
      scanning: false,
      sacnCallBack: null,
      codeReader: null,
      selectedDeviceId: null,
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
    open(sacnCallBack, scanConfig) {
      if (this.visible === true) {
        return
      }

      this.sacnCallBack = sacnCallBack
      this.scanConfig = scanConfig || {
        enableKeepScan: false,
      }
      this.videoId = v4()
      this.visible = true
      this.init()
    },
    init() {
      // 识别和处理多种常见的条形码和二维码格式
      this.codeReader = new BrowserMultiFormatReader()
      // 获取当前设备上可用的视频输入设备列表
      this.codeReader.getVideoInputDevices().then((videoInputDevices) => {
        if (videoInputDevices.length > 1) {
          // 后缀摄像头（手机）
          this.selectedDeviceId = videoInputDevices[1].deviceId
        }
        else {
          // 前置摄像头
          this.selectedDeviceId = videoInputDevices[0].deviceId
        }

        // 展示扫码样式
        this.scanning = true

        // 开始扫码
        this.onScan()
      }).catch((err) => {
        showDialog({
          title: '扫码失败',
          message: err.message || '请检查摄像头是否被占用或权限是否被拒绝',
        }).then(() => {
          this.onClose()
        })
      })
    },
    onScan() {
      // 自动打开指定的视频输入设备，并实时对视频流中的每一帧图像进行条形码和二维码的解码操作，此方法不是只进行一次解码尝试，而是在视频流持续传输的过程中，不断地对每一帧图像进行解码分析
      this.codeReader.decodeFromVideoDevice(this.selectedDeviceId, this.videoId, async (result, err) => {
        if (result) {
          try {
            await this.sacnCallBack(result.text, {
              scanToast: this.scanToast,
            })

            if (this.enableKeepScan) {
              setTimeout(() => {
                this.onScan()
              }, 1500)
              return
            }
          }
          catch (e) {
            // eslint-disable-next-line no-alert
            alert(e)
          }

          this.onClose()
        }

        if (err) {
          // eslint-disable-next-line no-console
          console.log(err)
        }
      })
    },
    scanToast(msg) {
      showToast({
        message: msg,
        position: 'top',
      })
    },
    onClose() {
      if (this.codeReader) {
        this.codeReader.reset()
        this.codeReader = null
      }
      this.selectedDeviceId = null
      this.scanning = false
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@keyframes radar-beam {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(0);
  }
}

.web-scanner {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  .web-scanner-close {
    position: absolute;
    left: 16px;
    top: 16px;
    font-size: 24px;
    color: #f2f2f2;
    z-index: 200;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .web-scanner-view {
    width: 240px;
    height: 240px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    border: 1px solid rgba(0, 102, 236, 0.2);
    outline: solid 9999px rgba(0, 0, 0, 0.2);
    z-index: 100;

    .line {
      height: calc(100% - 2px);
      width: 100%;
      background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #0066EC 211%);
      border-bottom: 1px solid #0066EC;
      transform: translateY(-100%);
      animation: radar-beam 2s infinite;
      animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
      animation-delay: 1.4s;
    }
  }
}

.web-scanner-view:after,
.web-scanner-view:before,
.web-scanner-view .angle:after,
.web-scanner-view .angle:before {
  content: '';
  display: block;
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
}

.web-scanner-view:after,
.web-scanner-view:before {
  top: 0;
  border-top-color: #0066EC;
}

.web-scanner-view .angle:after,
.web-scanner-view .angle:before {
  bottom: 0;
  border-bottom-color: #0066EC;
}

.web-scanner-view:before,
.web-scanner-view .angle:before {
  left: 0;
  border-left-color: #0066EC;
}

.web-scanner-view:after,
.web-scanner-view .angle:after {
  right: 0;
  border-right-color: #0066EC;
}
</style>
