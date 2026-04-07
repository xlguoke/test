<template>
  <div>
    <MobileTitleBar
      title="样品标签"
      left-arrow
      @click-left="$router.go(-1)"
    ></MobileTitleBar>
    <div class="bluetooth-print">
      <div v-if="pageFrom !== 1" id="perview" class="bluetooth-print-preview">
        <template v-if="type === 2">
          <div
            class="bluetooth-print-preview-arrow bluetooth-print-preview-left"
            @click="onSwiper('prev')"
          >
            <img :src="swiperArrowSvg" />
          </div>
          <div class="bluetooth-print-preview-center">
            <van-swipe
              ref="Swipe"
              :height="swiperHeight"
              @change="onSwipeChange"
            >
              <van-swipe-item v-for="item in printList" :key="item.id">
                <SampleLabelSjkjc
                  :ref="`SampleLabel-${item.id}`"
                  :data-source="item"
                />
              </van-swipe-item>
              <template #indicator>
                <div class="bluetooth-indicator">
                  {{ swipeCurrent + 1 }}/{{ printList.length }}
                </div>
              </template>
            </van-swipe>
          </div>
          <div
            class="bluetooth-print-preview-arrow bluetooth-print-preview-right"
            @click="onSwiper('next')"
          >
            <img :src="swiperArrowSvg" />
          </div>
        </template>
        <template v-else>
          <div v-if="udrData" class="bluetooth-print-group">
            <SampleLabelSjkjc :data-source="udrData" />
          </div>
        </template>
      </div>

      <div class="bluetooth-print-action">
        <van-field
          v-model="deviceName"
          label="打印设备"
          placeholder="请点击选择打印设备"
          readonly
          center
          @click="onConnectBluetooth"
        >
          <template #button>
            <span
              v-if="!btnDisabled"
              style="color: green; vertical-align: middle"
            >已连接</span>
            <span v-else style="color: gray; vertical-align: middle">未连接</span>
            <van-icon name="arrow" style="vertical-align: middle" />
          </template>
        </van-field>

        <van-field
          v-model="deviceName"
          label="标签数量"
          readonly
          center
          input-align="right"
          style="margin-top: 15px"
        >
          <template #input>
            <van-stepper v-model:value="printNum" min="1" max="20" integer />
          </template>
        </van-field>
      </div>

      <div class="bluetooth-err">
        <p v-if="errList.length > 0">
          以下编号数据获取失败，请稍后再试。
        </p>
        <p v-for="(item, index) in errList" :key="index">
          {{ item }}
        </p>
      </div>

      <div class="bluetooth-print-btn">
        <van-button
          v-if="type === 2 || pageFrom === 1"
          type="primary"
          square
          block
          :disabled="btnDisabled"
          @click="onPrintByList"
        >
          开始打印
        </van-button>
        <van-button
          v-else
          type="primary"
          square
          block
          :disabled="btnDisabled"
          @click="onPrint"
        >
          开始打印
        </van-button>
      </div>

      <van-dialog
        v-model:show="visible"
        title="请选择要连接的打印机"
        show-cancel-button
        class="bluetooth-devicelist"
        :before-close="onBeforeClose"
      >
        <van-radio-group v-model:value="deviceId">
          <van-radio
            v-for="(item, index) in deviceList"
            :key="index"
            :name="item.deviceId"
          >
            <p>设备名：{{ item.name }}</p>
            <p>设备ID：{{ item.deviceId }}</p>
          </van-radio>
        </van-radio-group>
      </van-dialog>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert */
import { mapWritableState } from 'pinia'
import { v4 } from 'uuid'
import { showConfirmDialog } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import {
  closeBLEConnection,
  createBLEConnection,
  getBLEDeviceCharacteristics,
  getBLEDeviceServices,
  onBLEConnectionStateChange,
  onBluetoothDeviceFound,
  openBluetoothAdapter,
  startBluetoothDevicesDiscovery,
  stopBluetoothDevicesDiscovery,
  writeBLECharacteristicValue,
} from '~/views/mobileApp/libs/bluetoothPrint/bluetooth'
import gbk from '~/views/mobileApp/libs/bluetoothPrint/printUtil-GBK'
import TemplateSampleLabel from '~/views/mobileApp/libs/bluetoothPrint/templateSampleLabel'
// 苏交科检测
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import SampleLabelSjkjc from './sampleLabel/sjkjc.vue'

let renderTimer = null

export default {
  name: 'bluetoothPrint',
  components: {
    SampleLabelSjkjc,
    MobileTitleBar,
  },
  data() {
    return {
      swiperArrowSvg: new URL(`~/views/mobileApp/assets/icon/swiper-arrow.svg`, import.meta.url).href,
      type: null,
      testObjectId: null,
      // pageFrom为1则代表从取样台账列表进入该页面批量生成逻辑
      pageFrom: null,
      swiperHeight: null,
      deviceId: null,
      deviceName: null,
      printNum: 1,
      name: '',
      services: [],
      serviceId: '',
      writeId: '',
      readId: '',
      State: '',
      Dev_mac: '',
      deviceList: [],
      visible: false,
      btnDisabled: true,
      isListening: false,
      swipeCurrent: 0,
      printList: [],
      errList: [],
      batchPrintList: [],
      udrData: null,
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['samplingPrintList']),
  },
  watch: {
    printNum() {
      if (renderTimer) {
        clearTimeout(renderTimer)
        renderTimer = null
      }

      renderTimer = setTimeout(() => {
        // 打印样品标签
        this.buildPrintList()
      }, 300)
    },
  },
  activated() {
    // 初始化数据
    this.type = Number(this.$route.params.type)
    this.testObjectId = this.$route.params.testObjectId
    this.pageFrom = Number(this.$route.params.pageFrom)
    this.printNum = 1
    this.printList = []
    this.errList = []
    this.batchPrintList = []
    this.udrData = null
    this.swipeCurrent = 0

    // 批量打印
    if (this.pageFrom === 1) {
      this.getBatchSampleLabelDataSource()
      return
    }

    this.getSampleLabelDataSource()
  },
  mounted() {
    const perview = document.getElementById('perview')
    this.swiperHeight = perview.offsetHeight - 30

    window.onPrint = this.onPrintByList
  },
  methods: {
    // 获取蓝牙连接状态
    listenerConnection() {
      this.isListening = true
      onBLEConnectionStateChange((res) => {
        this.btnDisabled = !res.connected
      })
    },
    // swipe滚动
    onSwipeChange(swipeCurrent) {
      this.swipeCurrent = swipeCurrent
      try {
        this.printList[swipeCurrent].isRender = true
      }
      catch (e) {
        console.warn(e)
      }
    },
    // 格式化编号数字
    formatCodeNum(num) {
      if (num >= 10) {
        return num
      }
      else {
        return `0${num}`
      }
    },
    // 渲染待打印列表
    buildPrintList() {
      if (this.printNum === '' || this.printNum > 20) {
        return
      }

      if (this.pageFrom === 1 && this.type === 2) {
        const printList = []
        this.batchPrintList.forEach((item) => {
          const ypbh = item['样品编号']
          for (let i = 1; i <= this.printNum; i++) {
            printList.push({
              ...item,
              id: v4(),
              样品编号: `${ypbh}-${this.formatCodeNum(i)}`,
            })
          }
        })
        this.printList = printList
        return
      }

      if (this.type === 2 && this.udrData) {
        const ypbh = this.udrData['样品编号']
        const printLishLen = this.printList.length
        if (this.printNum > printLishLen) {
          const addNum = this.printNum - printLishLen
          for (let i = 1; i <= addNum; i++) {
            this.printList.push({
              id: v4(),
              ...this.udrData,
              样品编号: `${ypbh}-${this.formatCodeNum(printLishLen + i)}`,
              isRender: !!(i === 1 && printLishLen === 0),
            })
          }
          this.swipeCurrent = 0
        }
        else {
          const removeNum = printLishLen - this.printNum
          this.printList.splice(printLishLen - removeNum, removeNum)
          this.swipeCurrent = 0
        }
      }
    },
    // 获取样品标签数据源
    async getSampleLabelDataSource() {
      showLoadingToast({
        duration: 0,
        forbidClick: true,
        loadingType: 'spinner',
        message: '数据加载中...',
      })

      try {
        const res = await mRequest.get(api.common.getSampleLabelUdrData, {
          params: {
            templateType: 'sampleLable',
            objectId: this.testObjectId,
          },
        })

        if (res.code !== 20010) {
          const ypbqzb = res['样品标签主表']

          if (ypbqzb && ypbqzb[0]) {
            const item = ypbqzb[0]
            this.udrData = {
              样品名称: (item.Child && item.Child['试样名称']) || '',
              规格型号: (item.Child && item.Child['规格型号']) || '',
              收样日期: (item.Child && item.Child['取样日期']) || '',
              样品编号: item['样品编号'] || '',
              样品标签二维码: item['样品标签二维码'] || '',
              样品状态: item['样品状态'] || '待检',
            }
          }
          else {
            this.udrData = null
          }

          if (this.type === 1) {
            this.udrData.isRender = true
          }

          this.buildPrintList()
        }
        else {
          showDialog({
            message:
              res.msg || res.message || '样品标签模板获取失败，请稍后再试',
          })
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '样品标签模板获取失败，请稍后再试' })
      }

      closeToast()
    },
    // 批量获取样品标签打印
    async getBatchSampleLabelDataSource() {
      const samplingPrintList = this.samplingPrintList
      const batchPrintList = []
      const errList = []

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        loadingType: 'spinner',
        message: `数据加载中 ${1}/${samplingPrintList.length} ...`,
      })

      for (let i = 0; i < samplingPrintList.length; i++) {
        toast.message = `数据加载中 ${i + 1}/${samplingPrintList.length} ...`

        const item = samplingPrintList[i]
        try {
          const res = await mRequest.get(
            api.common.getSampleLabelUdrData,
            {
              params: {
                templateType: 'sampleLable',
                objectId: item.testObjectId,
              },
            },
          )

          if (res.code !== 20010) {
            const ypbqzb = res['样品标签主表']
            let udrData = {}

            if (ypbqzb && ypbqzb[0]) {
              const item = ypbqzb[0]
              udrData = {
                样品名称: (item.Child && item.Child['试样名称']) || '',
                规格型号: (item.Child && item.Child['规格型号']) || '',
                收样日期: (item.Child && item.Child['取样日期']) || '',
                样品编号: item['样品编号'] || '',
                样品标签二维码: item['样品标签二维码'] || '',
                样品状态: item['样品状态'] || '待检',
              }
            }

            batchPrintList.push({
              id: v4(),
              ...udrData,
            })
          }
          else {
            errList.push(item.testObjectCode)
          }
        }
        catch (e) {
          errList.push(item.testObjectCode)
          console.warn(e)
        }
      }

      closeToast()

      this.batchPrintList = batchPrintList
      if (this.type === 2) {
        this.buildPrintList()
      }
      else {
        this.printList = this.batchPrintList
      }
      this.errList = errList
    },
    // 开始搜索设备
    onConnectBluetooth() {
      // 如果已存在连接的设备，则断开设备连接
      if (this.deviceId) {
        this.onChangeDevice()
        return
      }

      try {
        openBluetoothAdapter(
          () => {
            !this.isListening && this.listenerConnection()

            startBluetoothDevicesDiscovery(
              [],
              true,
              1000,
              () => {
                this.visible = true
                onBluetoothDeviceFound((obj) => {
                  obj.devices.forEach((device) => {
                    if (
                      !this.deviceList.find(
                        item => item.deviceId === device.deviceId,
                      )
                    ) {
                      this.deviceList.push(device)
                    }
                  })
                })
              },
              () => {
                alert('开启搜索失败')
              },
            )
          },
          (err) => {
            if (err.code === 10001) {
              alert('检测到未打开蓝牙，请打开蓝牙后再试')
            }
            else {
              alert(err.message)
            }
          },
        )
      }
      catch (e) {
        alert(`err,${e}`)
      }
    },
    // 更换设备
    onChangeDevice() {
      this.onCloseDevice(() => {
        startBluetoothDevicesDiscovery(
          [],
          true,
          1000,
          () => {
            this.visible = true
            onBluetoothDeviceFound((obj) => {
              obj.devices.forEach((device) => {
                if (
                  !this.deviceList.find(
                    item => item.deviceId === device.deviceId,
                  )
                ) {
                  this.deviceList.push(device)
                }
              })
            })
          },
          () => {
            alert('开启搜索失败')
          },
        )
      })
    },
    // 蓝牙连接设备
    onConnectDevice(row) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      this.showWaiting('设备连接中...')
      createBLEConnection(
        row.deviceId,
        () => {
          window._appPlus.bluetooth.setBLEMTU({
            deviceId: row.deviceId,
            mtu: 500,
            success() {},
            fail() {},
          })

          that.closeWaiting()
          alert('设备连接成功')
          that.onConnectSuccess(row)
        },
        (err) => {
          that.closeWaiting()
          alert(JSON.stringify(err))
        },
      )
    },
    // 蓝牙重连设备
    reConnectDevice(cb) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      createBLEConnection(
        that.deviceId,
        () => {
          window._appPlus.bluetooth.setBLEMTU({
            deviceId: that.deviceId,
            mtu: 500,
            success() {},
            fail() {},
          })

          cb && cb()
        },
        (err) => {
          alert(JSON.stringify(err))
        },
      )
    },
    // 蓝牙断开设备
    onCloseDevice(callback) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      this.showWaiting('设备断开连接中...')
      closeBLEConnection(
        that.deviceId,
        () => {
          that.deviceId = null
          that.deviceName = null
          callback && callback()
        },
        (err) => {
          alert(JSON.stringify(err))
        },
        () => {
          that.closeWaiting()
        },
      )
    },
    // 加载中
    showWaiting(msg) {
      window._appPlus.nativeUI.showWaiting(msg || '处理中...')
    },
    // 关闭加载中
    closeWaiting() {
      window._appPlus.nativeUI.closeWaiting()
    },
    onBeforeClose(action, done) {
      if (action === 'confirm') {
        const device = this.deviceList.find(
          item => item.deviceId === this.deviceId,
        )

        if (!device) {
          showDialog({ message: '请选择要连接的打印机' })
          return done(false)
        }
        else {
          this.deviceName = device.name
          this.onConnectDevice(device)
          return done()
        }
      }
      else {
        return done()
      }
    },
    // ---连接成功----
    onConnectSuccess(row) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      that.deviceId = row.deviceId
      that.deviceName = row.name

      // 获取设备服务
      getBLEDeviceServices(
        that.deviceId,
        (res) => {
          that.services = res.services
          getBLEDeviceCharacteristics(
            that.deviceId,
            that.services,
            (res2) => {
              that.serviceId = res2.serviceId
              that.writeId = res2.writeId
              that.readId = res2.readId
              // ---停止扫描蓝牙设备---------
              stopBluetoothDevicesDiscovery()
            },
            (err2) => {
              alert(`onGetCharacterFail,${JSON.stringify(err2)}`)
            },
          )
        },
        (err) => {
          alert(`获取打印机服务失败，请重新连接打印机，${JSON.stringify(err)}`)
        },
      )
    },
    // ---连接失败----
    onConnectFail(res) {
      alert('设备连接失败：', JSON.stringify(res))
    },
    // ---数据全部发送成功回调----
    onSendSuccess() {
      this.closeWaiting()
      alert('操作完成')
    },
    // 滑动
    onSwiper(type) {
      this.$refs.Swipe[type]()
    },
    // 打印printList中的数据
    onPrintByList() {
      const printList = this.printList
      let index = 0

      // 递归调用打印，直到试件都打印完
      const print = () => {
        const item = printList[index]
        const templateSampleLabel = new TemplateSampleLabel({
          unitCode: 'sjkjc',
          width: 8 * 66,
          height: 8 * 46,
          number: this.pageFrom === 1 && this.type === 1 ? this.printNum : 1,
          dataSource: item,
        })

        const strCmd = templateSampleLabel.getPrintTemplate()
        const buffer = gbk.strToGBKByte(strCmd)

        const opt = {
          deviceId: this.deviceId,
          serviceId: this.serviceId,
          characteristicId: this.writeId,
          value: buffer,
          onceLength: 50,
        }

        writeBLECharacteristicValue(
          opt,
          () => {
            if (index < printList.length - 1) {
              index++
              print()
            }
            else {
              this.onSendSuccess()
            }
          },
          () => {
            if (index < printList.length - 1) {
              this.closeWaiting()
              showConfirmDialog({
                title: '提示',
                message: `是否继续打印下一份`,
              }).then(() => {
                index++
                this.showWaiting('打印中，请稍等...')
                print()
              }).catch(() => {
                this.closeWaiting()
              })
            }
            else {
              this.onSendSuccess()
            }
          },
        )
      }

      this.showWaiting('打印中，请稍等...')
      print()
    },
    // 打印
    onPrint() {
      const templateSampleLabel = new TemplateSampleLabel({
        unitCode: 'sjkjc',
        width: 8 * 66,
        height: 8 * 46,
        number: this.printNum,
        dataSource: this.udrData,
      })

      const strCmd = templateSampleLabel.getPrintTemplate()
      const buffer = gbk.strToGBKByte(strCmd)

      const opt = {
        deviceId: this.deviceId,
        serviceId: this.serviceId,
        characteristicId: this.writeId,
        value: buffer,
        onceLength: 50,
      }

      this.showWaiting('打印中，请稍等...')
      writeBLECharacteristicValue(opt, this.onSendSuccess, () => {
        this.closeWaiting()
      })
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.van-swipe-item) {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    max-height: 100%;
    max-width: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -ms-backface-visibility: hidden;
  }
}
.bluetooth-print {
  .bluetooth-err {
    color: red;
    font-size: 12px;
    line-height: 16px;
    padding: 15px;

    p {
      margin-bottom: 4px;
    }
  }

  .bluetooth-indicator {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 10;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.2);
    padding: 0 4px;
  }

  .bluetooth-print-preview {
    height: 220px;
    padding: 15px 0;
    background: #fff;
    position: relative;
    margin-bottom: 15px;

    .bluetooth-print-group {
      position: absolute;
      right: 60px;
      left: 60px;
      bottom: 15px;
      top: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .bluetooth-print-preview-center {
      margin: 0 60px;
    }

    .bluetooth-print-preview-arrow {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }

    .bluetooth-print-preview-left {
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      bottom: 0;
      z-index: 100;
    }

    .bluetooth-print-preview-right {
      position: absolute;
      top: 0;
      right: 0;
      width: 60px;
      bottom: 0;
      z-index: 100;

      img {
        -webkit-transform: rotate(180deg);
        -moz-transform: rotate(180deg);
        -ms-transform: rotate(180deg);
        -o-transform: rotate(180deg);
        transform: rotate(180deg);
      }
    }
  }

  .bluetooth-print-btn {
    position: fixed;
    height: 46px;
    width: 100%;
    left: 0;
    bottom: 0;

    .van-button {
      height: 46px;
    }
  }

  .bluetooth-print-action {
    padding: 15px;
    background: #fff;

    .van-field {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      border-radius: 5px;
    }
  }
}
.bluetooth-devicelist {
  :deep(.van-dialog__content) {
    max-height: 240px;
    overflow-y: auto;
  }

  :deep(.van-radio-group) {
    padding: 10px 15px;
  }

  :deep(.van-radio) {
    padding: 5px 8px;
    margin-bottom: 8px;
    border: solid 1px #e2e2e2;
    font-size: 13px;
  }

  :deep(.van-radio__label) {
    color: #666;
  }
}
</style>
