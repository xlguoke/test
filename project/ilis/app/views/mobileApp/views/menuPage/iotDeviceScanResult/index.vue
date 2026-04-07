<template>
  <div class="verification-wrap">
    <van-sticky>
      <MobileTitleBar
        title="扫码结果"
        left-arrow
        @click-left="$router.go(-1)"
      ></MobileTitleBar>
    </van-sticky>
    <div class="verification-content">
      <template v-if="deviceId">
        <van-icon name="warning" color="#FF9800" size="74" />
        <div class="verification-title">
          扫码成功，鉴权失败
        </div>
        <div class="verification-item">
          试验设备名称：{{ verification.name }}
        </div>
        <div class="verification-item">
          试验设备编号：{{ verification.sn }}
        </div>
        <div class="verification-item">
          试验室名称：{{ verification.laboratoryName }}
        </div>
        <!-- <div class="verification-item">所属单位：{{ verification.unitName }}</div> -->
        <div class="verification-item" style="margin-top: 8px; color: #666">
          失败原因：暂无设备权限，请联系管理员授权
        </div>
      </template>

      <template v-if="!deviceId && errorMsg">
        <van-icon name="warning" color="#dd372b" size="74" />
        <div class="verification-title">
          扫码失败
        </div>
        <div class="verification-item" style="margin-top: 8px; color: #666">
          失败原因：{{ errorMsg }}
        </div>
      </template>
    </div>

    <div class="verification-button">
      <van-button type="primary" block @click="handleDevice">
        返回授权设备列表
      </van-button>
      <van-button type="primary" block @click="handleScrin">
        继续扫码
      </van-button>
    </div>
  </div>
</template>

<script>
import { showLoadingToast } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanModule } from '~/views/mobileApp/provides/modules/qr-code-scan-module'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      verification: {},
    }
  },
  computed: {
    deviceId() {
      return this.$route.query.id
    },
    errorMsg() {
      return this.$route.query.errorMsg
    },
  },
  watch: {
    deviceId(val) {
      if (val) {
        this.init()
      }
    },
    errorMsg(val) {
      if (val) {
        this.verification = {}
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      if (this.deviceId) {
        this.getIotDevice()
      }
    },
    handleDevice() {
      this.$router.replace({
        name: 'iotDeviceRecord',
      })
    },
    handleScrin() {
      qrCodeScanModule.deviceAuthorization(this)
    },
    // 通过扫码获取物联网智能设备信息
    getIotDevice() {
      const url = api.equipment.getIotDevice(this.deviceId)
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest.get(url).then((res) => {
        if (res.success === false) {
          showDialog({ message: res.message })
        }
        else {
          this.verification = res
        }
      }).finally(() => {
        toast.close()
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('../verification/index.less');
</style>
