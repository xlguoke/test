<template>
  <div class="scan-result">
    <van-sticky>
      <MobileTitleBar
        left-arrow
        :title="isStart ? '扫码登记' : '扫码选择'"
        @click-left="$router.go(-1)"
      >
        <template #right>
          <span v-if="!isStart" class="set-scan-type" @click="setFun">设置</span>
        </template>
      </MobileTitleBar>
    </van-sticky>

    <!-- 扫码选择 -->
    <div v-if="!isStart" class="scan-unstart">
      <h3 class="title">
        让手机变成扫码枪
      </h3>
      <p>开启连续扫码模式，用户可以对多个二维码进行连续扫码</p>
      <div class="scan-img">
        <img :src="phoneScanPng" />
      </div>
    </div>

    <!-- 扫码结果 -->
    <div v-else-if="scanStatus" class="scan-result">
      <div v-show="scanStatus === 'success'" class="status">
        <p class="icon-status success">
          <van-icon name="success" />
        </p>
        <span class="text">扫码成功</span>
      </div>
      <div v-show="scanStatus === 'fail'" class="status">
        <p class="icon-status fail">
          <van-icon name="fail" />
        </p>
        <span class="text">扫码重复</span>
      </div>
      <div v-show="scanStatus === 'cross'" class="status">
        <p class="icon-status cross">
          <van-icon name="cross" />
        </p>
        <span class="text">扫码失败</span>
        <p>请扫描正确的二维码！</p>
      </div>
      <p>第{{ scanNum }}次扫码</p>
      <p v-if="scanConf.isAuto" class="auto-time">
        {{ time }}秒后自动扫描下一个...
      </p>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-btn">
      <van-button v-if="!isStart" type="primary" @click="startScan">
        开始扫码
      </van-button>
      <template v-else>
        <van-button
          v-if="scanConf.isAuto"
          type="primary"
          @click="handContinuous"
        >
          手动继续
        </van-button>
        <van-button v-else type="primary" @click="continuous">
          继续扫码
        </van-button>
        <van-button type="primary" @click="endScan">
          结束扫码
        </van-button>
      </template>
    </div>

    <!-- 设置扫码配置 -->
    <van-popup
      v-model:show="showPopup"
      position="bottom"
      round
      closeable
      :style="{ height: '300px' }"
    >
      <h3 class="popup-title">
        设置
      </h3>
      <div class="popup-content">
        <h4>扫码模式</h4>
        <div class="switch">
          自动连续扫码
          <van-switch
            v-model="autoScan"
            size="18px"
            @change="changeSwitch"
          />
        </div>
        <h4>扫码间隔时长</h4>
        <ul :class="`time-list clearfix ${timeIndex === -1 ? 'disabled' : ''}`">
          <li
            v-for="(t, i) in timeList"
            :key="t.count"
            :class="`item ${timeIndex === i ? 'active' : ''}`"
            @click="chooseTime(i)"
          >
            {{ t.name }}
          </li>
        </ul>
        <div class="btns">
          <van-button @click="resetConfig">
            重置
          </van-button>
          <van-button style="width: 50%" type="primary" @click="confirmConfig">
            确认
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'

const throttle = (() => {
  let timer = null
  return (func, wait) => {
    if (timer)
      return
    func()
    timer = setTimeout(() => {
      timer = null
    }, wait)
  }
})()

export default {
  components: {
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'testTaskDetail') {
      const toPageState = useAppPageStateStore().getPage(to.name)
      toPageState.resetPage = null
    }
    next()
  },
  data() {
    return {
      phoneScanPng: new URL(`~/views/mobileApp/assets/phone-scan.png`, import.meta.url).href,
      isStart: false,
      showPopup: false,
      autoScan: false,
      timeIndex: -1,
      timeList: [
        { name: '0.5s', count: 500 },
        { name: '1s', count: 1000 },
        { name: '1.5s', count: 1500 },
        { name: '2s', count: 2000 },
        { name: '2.5s', count: 2500 },
        { name: '3s', count: 3000 },
        { name: '3.5s', count: 3500 },
        { name: '4s', count: 4000 },
        { name: '4.5s', count: 4500 },
        { name: '5s', count: 5000 },
      ],
      scanNum: 0,
      scanStatus: '',
      time: 0,
      timer: null,
      tt: null,
    }
  },
  computed: {
    ...mapWritableState(useEquipmentStore, {
      testTaskDetail: 'testTaskDetail',
      scanConf: 'autoScanConf',
      scanAddEquipment: 'scanAddEquipment',
    }),
    ...mapState(useAppIndustryStore, ['industryData', 'industryId']),
  },
  methods: {
    // 扫描获取设备
    async scanRsult(eqId) {
      this.scanNum++
      if (!eqId) {
        this.scanStatus = 'cross'
      }
      else {
        const { selectedEq, equipmentList = [] } = this.testTaskDetail
        const eqItem = equipmentList.find(d => d.equipmentId === eqId)
        if (!eqItem) {
          await this.getEquipmentById(eqId)
        }
        else if (selectedEq.includes(eqItem.id)) {
          this.scanStatus = 'fail'
        }
        else {
          this.scanStatus = 'fail'
          selectedEq.push(eqItem.id)
          this.updateStoreCommit(selectedEq, equipmentList)
        }
      }
      if (this.scanConf.isAuto) {
        this.autoScanHandle()
      }
    },
    // 扫码获取设备信息
    getEquipmentById(eqId) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        try {
          // 根据id获取设备信息
          this.scanStatus = 'success'

          const eqRes = await mRequest.post(
            api.equipment.detail,
            qs.stringify({
              id: eqId,
            }),
          )
          const data = eqRes.obj

          if (!(data.industryIds || '').includes(this.industryId)) {
            showConfirmDialog({
              title: '提示',
              confirmButtonText: '继续',
              message: `当前扫码的设备不是应用于${this.industryData.name}`,
            }).then(async () => {
              if (eqRes.success && data) {
                const eqInfo = this.initEqRecordField(data)
                await this.saveUseEquipments(eqInfo)
              }
              resolve(true)
            }).catch(() => {
              resolve(null)
            })
          }
          else {
            if (eqRes.success && data) {
              const eqInfo = this.initEqRecordField(data)
              await this.saveUseEquipments(eqInfo)
            }
            resolve(true)
          }
        }
        catch (err) {
          this.scanStatus = 'cross'
          resolve(false)
          console.warn(err)
        }
      })
    },
    // 保存使用设备并获取设备使用记录
    async saveUseEquipments(eqInfo) {
      const { selectedEq, equipmentList, paramObjectId } = this.testTaskDetail
      const params = {
        testObjectParamId: paramObjectId,
        useEquipmentsJson: JSON.stringify([...equipmentList, eqInfo]),
      }
      try {
        const res = await mRequest.post(
          api.testManage.saveUseEquipments,
          qs.stringify(params),
        )
        if (res.success) {
          eqInfo.id = res.obj && res.obj[0]
          equipmentList.push(eqInfo)
          selectedEq.push(eqInfo.id)
          this.updateStoreCommit(selectedEq, equipmentList)
        }
        else {
          console.warn('保存设备失败', res)
        }
      }
      catch (err) {
        console.warn('保存设备', err)
      }
    },
    initEqRecordField(data) {
      return {
        equipmentSn: data.equipmentSn,
        equipmentName: data.name,
        equipmentCode: data.archiveSn,
        standard: data.standard,
        startUseTime: data.startUseTime,
        endUseTime: data.endUseTime,
        useStatus: '',
        id: '', // 使用记录id
        testTaskId: this.testTaskDetail.taskId,
        taskParamId: this.testTaskDetail.paramId,
        startUseState: '正常',
        endUseState: '正常',
        equipmentId: data.id,
        isAdd: true,
      }
    },
    updateStoreCommit(selectedId, eqList) {
      this.scanAddEquipment = JSON.parse(JSON.stringify({
        selectedEq: selectedId,
        equipmentList: eqList,
      }))

      this.testTaskDetail = {
        selectedEq: selectedId,
        equipmentList: eqList,
      }
    },
    // 开始扫码
    startScan() {
      this.isStart = true

      qrCodeScanTool.scan(async (r) => {
        const id = qrCodeScanTool.getParamByResult(r, 'id')
        this.scanRsult(id)
      })
    },
    // 手动继续
    handContinuous() {
      throttle(() => {
        if (this.timer) {
          clearInterval(this.timer)
        }
        this.startScan()
      }, this.scanConf.count || 1000)
    },
    // 继续扫码
    continuous() {
      throttle(() => {
        this.startScan()
      }, this.scanConf.count || 1000)
    },
    // 结束扫码
    endScan() {
      clearTimeout(this.tt)
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.$nextTick(() => {
        this.$router.go(-1)
      })
    },
    // 自动扫码
    autoScanHandle() {
      this.time = this.scanConf.count / 1000
      const t = (this.scanConf.count / 1000) * 1000
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(() => {
        this.time--
        if (this.time <= 0) {
          this.time = 0
          clearInterval(this.timer)
          this.startScan()
        }
      }, Math.min(t, 500))
    },
    // 设置
    setFun() {
      this.timeIndex = this.scanConf.index
      this.autoScan = this.scanConf.isAuto
      this.showPopup = true
    },
    // 重置设置
    resetConfig() {
      this.timeIndex = -1
      this.autoScan = false
    },
    // 保存设置
    confirmConfig() {
      this.showPopup = false

      this.scanConf = {
        index: this.timeIndex,
        count: this.timeIndex === -1 ? 0 : this.timeList[this.timeIndex].count,
        isAuto: this.autoScan,
      }
    },
    changeSwitch(e) {
      this.timeIndex = e ? 0 : -1
    },
    // 选择间隔时长
    chooseTime(i) {
      if (!this.autoScan)
        return
      this.timeIndex = i
    },
  },
}
</script>

<style lang="less" scoped>
.scan-result {
  height: 100vh;
  padding-bottom: 50px;
  box-sizing: border-box;
  overflow-y: hidden;
  .scan-unstart {
    padding: 15% 50px 0;
    height: 100%;
    background-color: #fff;
    text-align: center;
    overflow-y: auto;
    box-sizing: border-box;
    .title {
      line-height: 50px;
    }
    .scan-img {
      margin: 30px auto 0;
      width: 260px;
      height: 260px;
      border-radius: 50%;
      overflow: hidden;
      background-color: #edf5ff;
      img {
        margin-left: -10px;
        margin-top: 20px;
        width: 300px;
        height: auto;
        max-width: initial;
      }
    }
  }

  .scan-result {
    padding: 40px 30px 0;
    text-align: center;
    .status {
      margin-bottom: 20px;
      .text {
        font-size: 18px;
        font-weight: 600;
      }
    }
    .icon-status {
      margin: 10px auto;
      width: 60px;
      height: 60px;
      background-color: #36be73;
      border-radius: 50%;
      font-size: 40px;
      color: #fff;
      line-height: 60px;
      text-align: center;
      &.fail {
        background-color: #e09239;
      }
      &.cross {
        background-color: #db5139;
      }
    }
    .auto-time {
      margin-top: 90%;
    }
  }
}
.footer-btn {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
  .van-button {
    flex: 1;
  }
}
.popup-title {
  text-align: center;
  line-height: 50px;
}
.popup-content {
  padding: 0 15px;
  .switch {
    display: flex;
    justify-content: space-between;
    margin: 10px 0 15px;
  }
  .time-list {
    .item {
      margin-right: 12px;
      margin-top: 8px;
      width: calc(20% - 10px);
      line-height: 30px;
      border-radius: 4px;
      background-color: #eee;
      text-align: center;
      float: left;
      &.active {
        color: #0066ec;
        background-color: rgba(0, 102, 236, 0.1);
      }

      &:nth-child(5n) {
        margin-right: 0;
      }
    }
    &.disabled .item {
      color: #aaa;
    }
  }
  .btns {
    margin-top: 30px;
    display: flex;
    justify-content: space-around;
  }
}
</style>
