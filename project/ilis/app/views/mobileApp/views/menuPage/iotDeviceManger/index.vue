<template>
  <div class="deviceManger">
    <!-- <van-sticky> -->
    <MobileTitleBar title="设备授权管理" left-arrow @click-left="$router.go(-1)">
      <template #right>
        <div>
          <img
            style="
              width: 16px;
              vertical-align: middle;
              margin-bottom: 4px;
              margin-right: 4px;
            "
            :src="userSvg"
          />
          {{ realName }}
        </div>
      </template>
    </MobileTitleBar>
    <div class="deviceManger-container">
      <div class="deviceManger-container-title">
        <img :src="successPng" alt="暂无数据" />
        <p>{{ dataSource.name }}</p>
      </div>
      <div>
        <div class="flex just-space item1">
          <div>
            <span class="itemtitle">设备编号:</span>
            <span>{{ dataSource.sn }}</span>
          </div>
        </div>
        <div class="flex just-space item1">
          <div>
            <span class="itemtitle">关联智能开关:</span>
            <span>{{ dataSource.device.name }}</span>
            <span v-if="deviceAttr.empty" style="color: #ff0000">
              (未找到对应设备)
            </span>
          </div>
          <template v-if="deviceAttr.empty === false">
            <div v-if="deviceAttr.switch === true" style="color: green">
              已开启
            </div>
            <div v-if="deviceAttr.switch === false" style="color: red">
              已关闭
            </div>
          </template>
        </div>
        <div class="flex just-space item1">
          <div>
            <span class="itemtitle">所属功能室:</span>
            <span>{{ dataSource.laboratoryName }}</span>
          </div>
        </div>
        <!-- 操作 -->
        <div v-if="deviceAttr.empty === false" class="just-space flex action">
          <span class="deviceManger-on" @click="handleClickStart">远程开启</span>
          <span class="deviceManger-off" @click="handleClickEnd">远程关闭</span>
        </div>
        <div class="deviceManger-button">
          <van-button type="primary" block @click="handleDevice">
            返回授权设备列表
          </van-button>
          <van-button type="primary" block @click="handleScrin">
            继续扫码
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { showConfirmDialog, showDialog, showLoadingToast } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanModule } from '~/views/mobileApp/provides/modules/qr-code-scan-module'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

// eslint-disable-next-line unused-imports/no-unused-vars
let tim = null

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      userSvg: new URL(`~/views/mobileApp/assets/icon/user.svg`, import.meta.url).href,
      successPng: new URL(`~/views/mobileApp/assets/success.png`, import.meta.url).href,
      dataSource: {
        device: {},
      },
      deviceAttr: {},
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
    deviceId() {
      return this.$route.query.id
    },
  },
  watch: {
    deviceId(val) {
      if (val) {
        this.init()
      }
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getIotDevice()
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
      const id = this.$route.query.id
      const url = api.equipment.getIotDevice(id)
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest.get(url).then((res) => {
        if (res.success === false) {
          showDialog({ message: res.message })
        }
        else {
          const dataSource = res
          const devices = dataSource.devices
          const controllDeviceItem = devices.find(
            i => i.type === 'CONTROLLER',
          )
          dataSource.device = controllDeviceItem
          this.dataSource = dataSource
          this.getIotDeviceAttr()
        }
      }).finally(() => {
        toast.close()
      })
    },
    getIotDeviceAttr() {
      const id = this.dataSource.device.id
      const url = api.equipment.getIotDeviceAttr(id)
      mRequest
        .get(url, {
          params: {
            raw: true,
          },
        })
        .then((res) => {
          if (res.result === true) {
            res.info.empty = false
            this.deviceAttr = res.info
          }
          else {
            this.deviceAttr = {
              empty: true,
            }
            // showDialog({ message: res.message })
          }
        })
    },
    // 远程开启
    handleClickStart() {
      const device = this.dataSource.device
      const deviceAttr = this.deviceAttr
      if (deviceAttr.switch === true) {
        showDialog({ message: '当前设备已开启' })
        return
      }

      showConfirmDialog({
        title: '提示',
        message: '此操作将开启试验设备的电源，继续操作吗?',
        confirmButtonText: '继续',
        cancelButtonText: '取消',
      })
        .then(() => {
          tim = setTimeout(() => {
            const start = api.equipment.start(device.id, true)
            const toast = showLoadingToast({
              duration: 0,
              forbidClick: true,
            })
            mRequest.post(start).then((res) => {
              if (res.success) {
                showSuccessToast(res.message)
                this.init()
              }
              else {
                showDialog({ message: res.message })
              }
            }).finally(() => {
              toast.close()
            })
          }, 0)
        })
    },
    // 远程关闭
    handleClickEnd() {
      const device = this.dataSource.device
      const deviceAttr = this.deviceAttr
      if (deviceAttr.switch === false) {
        showDialog({ message: '当前设备已关闭' })
        return
      }

      showConfirmDialog({
        title: '提示',
        message:
          '此操作可能对正在进行试验的其他人有影响操作之前请确认是否有其他人在做试验.',
        cancelButtonText: '取消',
        confirmButtonText: '继续',
      })
        .then(() => {
          tim = setTimeout(() => {
            const start = api.equipment.start(device.id, false)
            const toast = showLoadingToast({
              duration: 0,
              forbidClick: true,
            })
            mRequest.post(start).then((res) => {
              if (res.success) {
                showSuccessToast(res.message)
                this.init()
              }
              else {
                showDialog({ message: res.message })
              }
            }).finally(() => {
              toast.close()
            })
          }, 0)
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
