<template>
  <div class="location-reported-container">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>
    <div class="content">
      <p class="page-title">
        设备基本信息
      </p>
      <van-field
        v-model="form.equipmentName"
        readonly
        label="设备名称"
        placeholder="请扫码获取设备信息"
      >
        <template #right-icon>
          <van-icon name="scan" size="24" color="#3885d3" @click="onScan" />
        </template>
      </van-field>
      <van-field
        v-model="form.equipmentSn"
        readonly
        label="设备编号"
        placeholder="请扫码获取设备信息"
      >
        <template #right-icon>
          <van-icon name="scan" size="24" color="#3885d3" @click="onScan" />
        </template>
      </van-field>

      <p class="page-title" style="margin-top: 12px">
        位置信息
      </p>
      <van-field
        v-model="form.locate"
        readonly
        label="当前位置"
        type="textarea"
        autosize
        placeholder="定位获取当前位置"
      />
      <van-field
        v-model="form.lnglat"
        readonly
        label="经纬坐标"
        placeholder="定位获取当前位置经纬坐标"
      />
      <div class="map-warp">
        <BaiduMap
          ref="baiduMapRef"
          class="map-box"
          @get-location="getGeolocation"
        />
        <div class="icon-box" @click="resetLocation">
          <van-loading
            v-if="loading"
            type="spinner"
            size="16"
            color="#1989fa"
          />
          <van-icon v-else name="aim" />
        </div>
      </div>
    </div>
    <van-button type="primary" :loading="saveLoading" block @click="onSubmit">
      确认上报
    </van-button>

    <van-overlay :show="spinning" z-index="9999">
      <van-loading class="full-loading" type="spinner" color="#1989fa" />
    </van-overlay>
  </div>
</template>

<script>
import {
  showNotify,
} from 'vant'
import BaiduMap from '~/views/mobileApp/components/baiduMap.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

const EGRESS_STATUS_OBJ = {
  10: '在库',
  12: '待提交',
  14: '审核中',
  16: '审核通过',
  20: '外出待确认',
  30: '外出被拒绝',
  40: '外出',
  50: '归还待确认',
  60: '归还被拒绝',
  70: '外出延期',
  80: '延期待确认',
  90: '延期被拒绝',
}

export default {
  components: {
    BaiduMap,
    MobileTitleBar,
  },
  data() {
    return {
      iconLocationPng: new URL(`~/views/mobileApp/assets/icon-location.png`, import.meta.url).href,
      center: [],
      spinning: false,
      loading: false,
      form: {
        equipmentName: '',
        equipmentSn: '',
        locate: '',
        lnglat: '',
        egressId: '',
      },
      rules: {
        equipmentName: '请扫码获取设备信息',
        equipmentSn: '请扫码获取设备信息',
        locate: '请点击定位按钮获取当前位置信息',
        lnglat: '请点击定位获取当前位置信息',
        egressId: '设备外出记录id不能为空',
      },
      map: null,
      saveLoading: false,
    }
  },
  mounted() {
    this.onScan()
  },
  methods: {
    // 扫码
    onScan() {
      qrCodeScanTool.scan((r) => {
        const id = qrCodeScanTool.getParamByResult(r, 'id')

        if (!id) {
          showDialog({
            title: '提示',
            message: '无效二维码！',
          })
          return
        }

        this.scanRsult(id)
      })
    },
    // 扫码回调
    scanRsult(eqId) {
      if (!eqId) {
        showNotify({
          type: 'danger',
          message: '设备不存在',
        })
        return
      }
      this.spinning = true
      mRequest
        .get(`${api.eqEgressList.egressEqInfo}/${eqId}`)
        .then((res) => {
          if (res.code === 20000) {
            const eqInfo = res.data
            if (eqInfo.status && Number(eqInfo.status) > 30) {
              this.form.equipmentName = eqInfo.equipmentName
              this.form.equipmentSn = eqInfo.equipmentVo.equipmentSn || ''
              this.form.egressId = eqInfo.egressId
            }
            else {
              const statusText = EGRESS_STATUS_OBJ[eqInfo.status] || ''
              showNotify({
                type: 'danger',
                message: `当前设备状态${
                  statusText ? `（${statusText}）` : ''
                }不支持该操作`,
              })
            }
          }
          else {
            showNotify({
              type: 'danger',
              message: res.message || '获取设备信息失败',
            })
          }
          this.spinning = false
        })
        .catch((err) => {
          console.error(err)
          this.spinning = false
          showNotify({
            type: 'danger',
            message: err.message || '获取设备信息失败',
          })
        })
    },
    resetLocation() {
      const map = this.$refs.baiduMapRef.getMapInstance()
      map.panTo(
        new BMap.Point(this.form.locateLongitude, this.form.locateLatitude),
      )
    },
    getGeolocation(data, map) {
      const position = data.point

      this.form.lnglat = `${position.lng},${position.lat}`
      this.form.locateLatitude = position.lat
      this.form.locateLongitude = position.lng
      this.form.locate = data.address

      map.mapInstance.centerAndZoom(position, 18)

      // 2. 创建自定义图标
      const myIcon = new BMap.Icon(
        this.iconLocationPng, // 图标URL
        new BMap.Size(32, 32),
        {
          anchor: new BMap.Size(16, 32),
          imageSize: new BMap.Size(32, 32),
        },
      )

      // 3. 创建Marker
      const marker = new BMap.Marker(
        new BMap.Point(position.lng, position.lat),
        { icon: myIcon },
      )

      map.mapInstance.addOverlay(marker)
    },
    // 提交表单
    onSubmit() {
      for (const k in this.form) {
        if (!this.form[k]) {
          const msg = this.rules[k]
          return showNotify({
            type: 'warning',
            message: msg,
          })
        }
      }
      this.saveLoading = true
      mRequest
        .post(api.equipment.eqLocation, this.form, {
          headers: { 'content-type': 'application/json' },
        })
        .then((res) => {
          this.saveLoading = false
          if (res.code === 20000) {
            showNotify({
              type: 'success',
              message: '上报成功',
            })
            this.form.equipmentName = ''
            this.form.equipmentSn = ''
            this.form.egressId = ''
          }
          else {
            showNotify({
              type: 'warning',
              message: res.message,
            })
          }
        })
        .catch((err) => {
          console.error(err)
          this.saveLoading = false
          showNotify({
            type: 'warning',
            message: err.message || '保存失败',
          })
        })
    },
  },
}
</script>

<style lang="less" scoped>
.location-reported-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .full-loading {
    height: 100%;
    line-height: 100vh;
    text-align: center;
  }
}
.content {
  padding: 8px 16px;
  flex: 1;
  height: 0;
  overflow-y: auto;
}
.page-title {
  margin-bottom: 8px;
  line-height: 28px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 18px;
    background: #154bd0;
    vertical-align: middle;
    margin-right: 2px;
    border-radius: 0 2px 2px 0;
  }
}
.map-warp {
  position: relative;
  margin-top: 12px;
  height: 240px;
  background-color: #eee;
  border-radius: 2px;
  border: 1px solid #eee;
  .map-box {
    width: 100%;
    height: 100%;
  }

  .icon-box {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
    font-size: 20px;
  }
}
</style>
