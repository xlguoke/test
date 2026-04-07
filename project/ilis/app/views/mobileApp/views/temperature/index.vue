<template>
  <div class="temperature-wrap">
    <van-sticky>
      <MobileTitleBar
        title="温湿度"
        left-arrow
        @click-left="$router.go(-1)"
        @click-right="onRefresh"
      >
        <template #right>
          <van-icon
            class-prefix="iconfont"
            name="shuaxin"
            style="font-size: 20px; margin-right: 6px"
          />
          刷新
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div class="temperature-content">
      <div class="temperature-list-wrap">
        <ul v-if="list" class="temperature-list">
          <li
            v-for="(row, rowIndex) in list"
            :key="rowIndex"
            class="temperature-item flex items-center"
            :class="{ active: activeValue === row.value }"
            @click.stop="temperature(row, rowIndex)"
          >
            <img v-if="rowIndex % 4 === 0" :src="temperatureZiSvg" />
            <img v-else-if="rowIndex % 4 === 1" :src="temperatureLvSvg" />
            <img v-else-if="rowIndex % 4 === 2" :src="temperatureLanSvg" />
            <img v-else-if="rowIndex % 4 === 3" :src="temperatureChengSvg" />
            <img v-else :src="temperatureLanSvg" />

            <div class="temperature-item-wrap">
              <div class="temperature-item-left">
                <img :src="temperatureIconSvg" width="44" />
                <div class="temperature-name">
                  {{ row.labName }}
                </div>
              </div>
              <div class="temperature-content flex items-center">
                <div class="temperature-value">
                  <img :src="temperatureWdSvg" />
                  <span class="temperature-number">{{
                    row.temperatureValue
                  }}</span><span class="temperature-unit">℃</span>
                  <div
                    v-if="row.overType === '10' || row.overType === '30'"
                    class="temperature-warning"
                  >
                    <img :src="temperatureWarningSvg" />
                    温度异常
                  </div>
                </div>
                <div class="temperature-value text-right">
                  <img :src="temperatureSdSvg" />
                  <span class="temperature-number">{{ row.humidityValue }}</span><span class="temperature-unit">%</span>
                  <div
                    v-if="row.overType === '20' || row.overType === '30'"
                    class="temperature-warning"
                  >
                    <img :src="temperatureWarningSvg" />
                    湿度异常
                  </div>
                </div>
              </div>
            </div>
            <div class="temperature-time">
              {{ formatDate(row.recordTime, 'YYYY-MM-DD HH:mm') }}
            </div>
          </li>
        </ul>
        <div v-if="!loading" style="margin: 0 15px; padding-bottom: 15px">
          <van-button
            type="primary"
            block
            square
            @click.stop="$router.push({ name: 'temperatureRecord' })"
          >
            报警记录
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      temperatureZiSvg: new URL(`~/views/mobileApp/assets/background/temperature-zi.svg`, import.meta.url).href,
      temperatureLvSvg: new URL(`~/views/mobileApp/assets/background/temperature-lv.svg`, import.meta.url).href,
      temperatureLanSvg: new URL(`~/views/mobileApp/assets/background/temperature-lan.svg`, import.meta.url).href,
      temperatureChengSvg: new URL(`~/views/mobileApp/assets/background/temperature-cheng.svg`, import.meta.url).href,
      temperatureIconSvg: new URL(`~/views/mobileApp/assets/icon/temperature-icon.svg`, import.meta.url).href,
      temperatureWdSvg: new URL(`~/views/mobileApp/assets/icon/temperature-wd.svg`, import.meta.url).href,
      temperatureWarningSvg: new URL(`~/views/mobileApp/assets/icon/temperature-warning.svg`, import.meta.url).href,
      temperatureSdSvg: new URL(`~/views/mobileApp/assets/icon/temperature-sd.svg`, import.meta.url).href,
      formatDate,
      colorArr: ['#C280FF', '#70B603', '#02A7F0', '#F59A23'],
      colorEndArr: [
        'rgba(202, 161, 235,.8)',
        'rgba(142, 197, 52,.8)',
        'rgba(96, 191, 234,.8)',
        'rgba(234, 164, 83,.8)',
        'rgba(143, 206, 40,.8)',
      ],
      list: [],
      activeName: '',
      activeLabel: '',
      activeId: '',
      activeValue: '',
      appTime: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 10,
      isLoading: false,
      loading: false,
      finished: false,
      error: false,
      finishedText: '没有更多了',
    }
  },
  created() {
    const query = this.$route.query
    const samplesName = query.name ? query.name : ''
    const samplesLabel = query.label ? query.label : ''
    const samplesId = query.id ? query.id : ''
    const samplesValue = query.value ? query.value : ''
    this.activeName = samplesName || ''
    this.activeLabel = samplesLabel || ''
    this.activeId = samplesId || ''
    this.activeValue = samplesValue || ''

    this.onLoad()
  },
  mounted() {
    this.setTime(1)
  },
  beforeUnmount() {
    this.destroyedTime()
  },
  methods: {
    temperature(row) {
      this.destroyedTime()
      this.$router.push({
        name: 'temperatureDetail',
        query: {
          deviceKey: row.deviceKey,
          labId: row.labId,
          labName: row.labName,
        },
      })
    },
    setTime(type) {
      if (this.appTime) {
        window.clearTimeout(this.appTime)
        this.appTime = null
      }
      if (!type) {
        this.onRefresh()
      }
      this.appTime = window.setTimeout(() => {
        if (!this.appTime) {
          return
        }
        this.setTime()
      }, 60 * 1000)
    },
    onLoad(type) {
      const toast
        = type === 'refresh'
          ? showLoadingToast({
              duration: 0,
              message: '加载中...',
              forbidClick: true,
            })
          : ''
      this.loading = true
      mRequest
        .get(api.temperature.appList)
        .then((res) => {
          if (res.code === 20000) {
            this.list = res.data ? res.data : []
            this.finished = true
            // 数据全部加载完成
            this.finishedText = !this.list.length
              ? '数据为空哦！'
              : '没有更多了'
            this.currentPage++
            this.error = false
          }
          else {
            showDialog({ message: res.msg || res.message })
            this.isLoading = false
            this.loading = false
            this.error = true
          }
        })
        .catch((_) => {
          this.error = true
        })
        .finally(() => {
          this.isLoading = false
          this.loading = false
          if (toast) {
            toast.close()
          }
        })
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.list = []
      this.isLoading = true
      this.currentPage = 1
      this.onLoad('refresh')
    },
    destroyedTime() {
      if (this.appTime) {
        window.clearTimeout(this.appTime)
        this.appTime = null
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
.temperature-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #fff;
  .temperature-content {
    flex: 1;
    overflow: auto;

    .temperature-box {
      width: 100%;
      padding-bottom: 15px;
      background: #fff;
    }
  }

  .temperature-tip-box {
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

  .temperature-list-wrap {
    width: 100%;
  }

  .temperature-list {
    width: 100%;
    padding: 15px 15px 0 15px;
    box-sizing: border-box;

    .temperature-item {
      position: relative;
      width: 100%;
      text-align: center;
      margin-bottom: 15px;
      border-radius: 10px;
      box-sizing: border-box;
      color: #fff;
      z-index: 1;

      .temperature-item-wrap {
        display: flex;
        width: 100%;
        position: relative;
        position: absolute;
        left: 0;
        top: 20px;
      }

      .temperature-content {
        flex: 5;
        margin-top: -22px;
      }

      .temperature-value {
        flex: 1;
        display: flex;
        text-align: center;
        position: relative;

        &:nth-child(n + 3) {
          margin-left: 5%;
        }

        img {
          vertical-align: middle;
          width: 20px;
          margin-bottom: 6px;
          margin-right: 4px;
        }
      }

      .temperature-item-left {
        flex: 2;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .temperature-name {
        font-size: 16px;
        line-height: 24px;
        text-align: center;
        padding-top: 6px;
      }

      .temperature-number {
        font-size: 24px;
        line-height: 24px;
      }

      .temperature-unit {
        font-size: 10px;
        margin-left: 5px;
        margin-top: 5px;
      }

      .temperature-time {
        position: absolute;
        font-size: 12px;
        right: 10px;
        bottom: 4px;

        .iconfont {
          display: inline-block;
          font-size: 16px;
          vertical-align: middle;
          margin-bottom: 3px;
        }
      }

      .temperature-key {
        position: absolute;
        left: 20px;
        bottom: 30px;
        font-size: 10px;
      }

      .temperature-warning {
        position: absolute;
        left: 0;
        bottom: -20px;
        height: 22px;
        line-height: 22px;
        background: #fff;
        color: #ff6b4d;
        font-size: 12px;
        border-radius: 6px;
        padding: 0 5px;
        display: flex;
        align-items: center;

        img {
          width: 14px;
          margin-right: 4px;
          margin-bottom: 2px;
        }

        .van-icon {
          color: #ff0000;
          font-size: 20px;
        }
      }
    }
  }
}
</style>
