<template>
  <div class="temperatureDetail-wrap">
    <van-sticky>
      <MobileTitleBar :title="activeLabel" left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="$router.push({ name: 'temperatureRecord' })">报警记录
          </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div class="temperatureDetail-content">
      <div class="temperatureDetail-title">
        实时温湿度
      </div>
      <div
        class="temperature-info" :style="{
          background: temperatureDetailPng,
        }"
      >
        <div class="temperature-info-item">
          <div class="temperature-info-label">
            温度
          </div>
          <div class="temperature-info-value">
            {{ temperatureDetail.temperatureValue }}℃
          </div>
          <div
            v-if="
              temperatureDetail.overType === '10'
                || temperatureDetail.overType === '30'
            "
            class="temperature-info-warning"
          >
            <img :src="temperatureWarningSvg" />
            温度异常
          </div>
        </div>
        <div class="temperature-info-item">
          <div class="temperature-info-label">
            湿度
          </div>
          <div class="temperature-info-value">
            {{ temperatureDetail.humidityValue }}%
          </div>
          <div
            v-if="
              temperatureDetail.overType === '20'
                || temperatureDetail.overType === '30'
            "
            class="temperature-info-warning"
          >
            <img :src="temperatureWarningSvg" />
            湿度异常
          </div>
        </div>
      </div>
      <div class="temperatureDetail-title">
        <div class="temperatureDetail-title-type">
          <span style="background: #154bd0"></span>温度
          <span style="background: #3ec590"></span>湿度
        </div>
        1小时变化曲线
      </div>
      <div class="temperature-chart-wrap">
        <LineChart
          :list="lineChartList"
          :list2="lineChartList2"
          :data-x="lineChartListX"
          @chart-click="look"
        ></LineChart>
      </div>
      <div class="temperatureDetail-title">
        历史报警记录
      </div>
      <ul class="temperatureDetail-list">
        <template v-for="(item, index) in list" :key="index">
          <li v-if="index < 4" class="temperatureDetail-item">
            <div class="temperatureDetail-item-icon">
              <img
                :src="temperatureRecordSvg"
                width="24"
              />
            </div>
            <div class="temperatureDetail-item-content">
              <div class="temperatureDetail-item-name">
                报警时间：{{ formatDate(item.recordTime, 'YYYY-MM-DD HH:mm:ss') }}
              </div>
              <div class="temperatureDetail-item-info">
                <span class="temperatureDetail-flex">
                  当前温度：
                  <span
                    :class="{ red: item.overType === '10' || item.overType === '30' }"
                  >{{ item.temperatureValue }}℃
                  </span>
                </span>
                <span class="temperatureDetail-flex">
                  当前湿度：
                  <span
                    :class="{ red: item.overType === '20' || item.overType === '30' }"
                  >{{ item.humidityValue }}%
                  </span>
                </span>
              </div>
              <div class="temperatureDetail-item-info">
                <div v-if="item.notice">
                  <p v-for="(row, rowIndex) in item.notice" :key="rowIndex">
                    {{ row }}
                  </p>
                </div>
              </div>
            </div>
          </li>
        </template>
      </ul>
      <div class="temperatureDetail-btn text-center" @click.stop="lookAll">
        查看所有
      </div>
    </div>
    <van-overlay :show="showBigChart" @click="showBigChart = false">
      <div v-if="showBigChart" class="wrapper">
        <div class="block">
          <LineChart
            :list="lineChartList"
            :list2="lineChartList2"
            :data-x="lineChartListX"
          ></LineChart>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import LineChart from '~/views/mobileApp/components/charts/line-chart.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    LineChart,
    MobileTitleBar,
  },
  data() {
    return {
      temperatureDetailPng: new URL(`~/views/mobileApp/assets/background/temperature-detail.png`, import.meta.url).href,
      temperatureWarningSvg: new URL(`~/views/mobileApp/assets/icon/temperature-warning.svg`, import.meta.url).href,
      temperatureRecordSvg: new URL(`~/views/mobileApp/assets/icon/temperature-record.svg`, import.meta.url).href,
      formatDate,
      list: [],
      activeName: '',
      activeLabel: '',
      activeId: '',
      activeValue: '',
      lineChartList: [],
      lineChartList2: [],
      lineChartListX: [],
      lineChartTime: null,
      dataTime: null,
      showBigChart: false,
      deviceKey: '',
      labId: '',
      temperatureDetail: {},
    }
  },
  created() {
    const query = this.$route.query
    const deviceKey = query.deviceKey ? query.deviceKey : ''
    const labId = query.labId ? query.labId : ''
    const labName = query.labName ? query.labName : ''
    this.deviceKey = deviceKey || ''
    this.labId = labId || ''
    this.setTime()
    this.setDataTime()
    this.getRecordlist()

    this.activeLabel = `${labName}温湿度详情`
  },
  beforeUnmount() {
    this.destroyedTime()
  },
  methods: {
    lookAll() {
      this.destroyedTime()
      this.$router.push({
        name: 'temperatureRecord',
      })
    },
    look() {
      this.showBigChart = true
    },
    setTime() {
      if (this.lineChartTime) {
        window.clearTimeout(this.lineChartTime)
        this.lineChartTime = null
      }
      this.getCharts()
      this.lineChartTime = window.setTimeout(() => {
        if (!this.lineChartTime) {
          return
        }
        this.setTime()
      }, 60 * 1000)
      //  * 10
    },
    setDataTime() {
      if (this.dataTime) {
        window.clearTimeout(this.dataTime)
        this.dataTime = null
      }
      this.getData()
    },
    checkTime(start) {
      const end = new Date().getTime()
      const diff = end - start
      if (diff < 10 * 1000) {
        this.dataTime = window.setTimeout(() => {
          if (!this.dataTime) {
            return
          }
          this.setDataTime()
        }, 10 * 1000 - diff)
      }
      else {
        if (!this.dataTime) {
          return
        }
        this.setDataTime()
      }
    },
    getCharts(type) {
      const toast
        = type === 'refresh'
          ? showLoadingToast({
              duration: 0,
              message: '加载中...',
              forbidClick: true,
            })
          : ''
      mRequest
        .get(api.temperature.charts, {
          params: { deviceKey: this.deviceKey, labId: this.labId },
        })
        .then((res) => {
          toast && toast.close()
          if (res.code === 20000) {
            const data = res.data
            this.lineChartList = data.tempData ? data.tempData : []
            this.lineChartList2 = data.humData ? data.humData : []
            this.lineChartListX = data.chartsX ? data.chartsX : []
          }
          else {
            showDialog({ message: res.msg || res.message })
          }
        })
        .catch((_) => {
          toast && toast.close()
        })
    },
    getData() {
      if (this.dataTime) {
        window.clearTimeout(this.dataTime)
        this.dataTime = null
      }
      const start = new Date().getTime()
      mRequest
        .get(api.temperature.detail, {
          params: { deviceKey: this.deviceKey, labId: this.labId },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.temperatureDetail = res.data
          }
          else {
            showDialog({ message: res.msg || res.message })
          }
          this.checkTime(start)
        })
        .catch((_) => {
          this.checkTime(start)
        })
    },
    getRecordlist() {
      mRequest
        .get(api.temperature.recordlist, {
          params: {
            deviceKey: this.deviceKey,
            labId: this.labId,
            recordTimeBegin: null,
            recordTimeEnd: null,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            const data = res.data
            this.list = data || []
          }
          else {
            showDialog({ message: res.msg || res.message })
          }
        })
        .catch((_) => {})
    },
    destroyedTime() {
      if (this.lineChartTime) {
        window.clearTimeout(this.lineChartTime)
        this.lineChartTime = null
      }
      if (this.dataTime) {
        window.clearTimeout(this.dataTime)
        this.dataTime = null
      }
    },
  },
}
</script>

<style lang="less" scoped>
@size16: 16px;
@size14: 14px;
@size13: 13px;
@size12: 12px;
.temperatureDetail-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #fff;
  .temperatureDetail-content {
    flex: 1;
    overflow: auto;
    padding: 0 15px;

    .temperatureDetail-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      line-height: 30px;
      border-left: solid 4px #154bd0;
      line-height: 16px;
      padding-left: 8px;
      margin-top: 25px;

      .temperatureDetail-title-type {
        float: right;
        font-size: 13px;
        font-weight: normal;
        display: flex;
        align-items: center;

        span {
          width: 12px;
          height: 6px;
          display: inline-block;
          margin-left: 30px;
          margin-right: 6px;
        }
      }
    }

    .temperature-info {
      margin-top: 20px;
      width: 100%;
      height: 120px;
      border-radius: 4px;
      background-size: 100% 100%;
      display: flex;

      .temperature-info-item {
        flex: 1;
        position: relative;
        z-index: 1;
        padding-top: 15px;
        text-align: center;

        &:nth-child(n + 2) {
          &::after {
            position: absolute;
            z-index: 2;
            content: '';
            left: 0;
            top: 55%;
            transform: translateY(-50%);
            width: 1px;
            height: 65px;
            background: #fff;
            border-radius: 2px;
          }
        }
      }

      .temperature-info-label {
        font-size: 17px;
        color: #ffffff;
      }

      .temperature-info-value {
        font-size: 28px;
        color: #ffffff;
        padding-top: 15px;
      }

      .temperature-info-warning {
        background: #fff;
        color: #ff6b4d;
        font-size: 12px;
        border-radius: 6px;
        padding: 0 5px;
        display: inline-block;
        margin-top: 10px;

        img {
          width: 14px;
          margin-top: 3px;
        }

        .van-icon {
          color: #ff0000;
          font-size: 20px;
        }
      }

      .red {
        color: #ff3399;
      }
    }

    .temperatureDetail-box {
      width: 100%;
      padding-bottom: 15px;
      background: #fff;
    }

    .temperature-chart-wrap {
      width: 100%;
      height: 210px;
    }

    .temperatureDetail-list {
      width: 100%;
      border-top: 1px solid #f2f2f2;
      margin-top: 20px;

      .temperatureDetail-item {
        width: 100%;
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #f2f2f2;
        align-items: center;
      }

      .temperatureDetail-item-icon {
        font-size: 20px;
        line-height: 40px;
        margin-right: 20px;
        margin-top: 10px;
      }

      .temperatureDetail-item-content {
        flex: 1;
        overflow: hidden;
        text-align: left;
      }

      .temperatureDetail-item-name {
        font-size: 14px;
        color: #333;
        line-height: 24px;
        font-weight: 700;
      }

      .temperatureDetail-item-info {
        display: flex;
        font-size: 12px;
        color: #666;
        line-height: 22px;
      }

      .temperatureDetail-flex {
        flex: 1;
      }

      .red {
        color: #ff4d10;
        font-weight: bold;
      }
    }

    .temperatureDetail-btn {
      font-size: 14px;
      line-height: 48px;
      color: #40aafe;
    }
  }

  .temperatureDetail-tip-box {
    width: 100%;
    font-size: 12px;
    line-height: 14px;
    background: #fff5e6;
    padding: 5px 15px;
    word-break: break-all;
    box-sizing: border-box;
    border: 1px solid #ffebcc;

    .van-icon-volume-o {
      color: #ed6a0c;
      line-height: 12px;
      margin-right: -5px;
      vertical-align: middle;
    }

    .tip-btn {
      white-space: nowrap;
      font-size: 12px;
      line-height: 14px;
      color: #2577e3;
    }
  }
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.block {
  width: 100%;
  height: 210px;
  background: #fff;
}
</style>
