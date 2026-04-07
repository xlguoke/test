<template>
  <div class="verification-wrap">
    <van-sticky>
      <MobileTitleBar title="扫码结果" left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="$router.push({ name: 'verificationRecord' })">
            授权记录
          </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div class="verification-content">
      <template v-if="auth === true">
        <van-icon name="checked" color="#52c41a" size="74" />
        <div class="verification-title">
          设备鉴权成功
        </div>
      </template>
      <template v-if="auth === false">
        <van-icon name="warning" color="#FF9800" size="74" />
        <div class="verification-title">
          扫码成功，鉴权失败
        </div>
      </template>
      <div class="verification-item">
        试验设备名称：{{ verification.name }}
      </div>
      <div class="verification-item">
        试验设备编号：{{ verification.archiveSn }}
      </div>
      <div class="verification-item">
        试验室名称：{{ verification.laboratoryName }}
      </div>
      <div class="verification-item">
        所属单位：{{ verification.unitName }}
      </div>
      <div
        v-if="auth === false && remark"
        class="verification-item"
        style="margin-top: 8px; color: #666"
      >
        失败原因：{{ remark }}
      </div>
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
import qs from 'qs'
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
      auth: null,
      remark: null,
    }
  },
  created() {
    const query = this.$route.query
    const result = query.result ? query.result : ''
    if (result) {
      this.getData(result)
    }
  },
  methods: {
    handleDevice() {
      this.$router.replace({
        name: 'iotDeviceRecord',
      })
    },
    handleScrin() {
      qrCodeScanModule.deviceAuthorization(this)
    },
    getData(result) {
      mRequest
        .post(
          api.verification.doAuth,
          qs.stringify({ qrCodeId: result }),
        )
        .then((res) => {
          if (
            res.data
            && res.data.equipmentVo
            && String(res.data.equipmentVo.rentStatus) === '0'
          ) {
            this.verification = res.data.equipmentVo
          }
          else {
            showToast('获取信息失败！')
          }

          if (res.data) {
            this.remark = res.data.remark
            this.auth = res.data.auth
          }
        })
        .catch((_) => {
          showToast(_)
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
