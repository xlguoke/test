<template>
  <div class="screen-warp" :style="`width: ${screenW}px`">
    <ScreenHeader />
    <div class="body-warp">
      <div class="left-warp">
        <ul class="statistics">
          <li class="statistics-item one">
            <p class="count">{{ todayStatisticsObj["当日委托数"] }}</p>
            <p class="title">当日委托数</p>
          </li>
          <li class="statistics-item two">
            <p class="count">{{ todayStatisticsObj["待检任务数"] }}</p>
            <p class="title">待检测任务数</p>
          </li>
          <li class="statistics-item three">
            <p class="count">{{ todayStatisticsObj["超期任务数"] }}</p>
            <p class="title">超期任务数</p>
          </li>
          <li class="line"></li>
        </ul>
        <div class="s-card mg-t">
          <div class="s-card-head font-ys">委托数量趋势图</div>
          <div class="s-card-body">
            <div id="consignNumTrend" class="echarts-box"></div>
          </div>
        </div>
        <div class="s-card mg-t down-card">
          <div class="s-card-head font-ys">委托参数数量排行</div>
          <div class="s-card-body">
            <ul class="consign-param-num">
              <li v-for="(d, i) in paramsNoList" :key="d.id" class="item">
                <p class="param-info">
                  NO.{{ i + 1 }} {{ d.chartDataKey }}：
                  <span class="fr">{{ d.chartDataValue }}个</span>
                </p>
                <div class="bar"><p class="bar-thumb" :style="`width: ${d.scale}%`"></p></div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="content-warp">
        <div class="video-warp">
          <div class="show-video">
            <WvpLiveVideo :id="mainVideoId" is-play v-if="!companyVideoVisible" />
            <video
              id="companyVideoEle"
              v-if="companyVideoVisible"
              style="width: 100%; height: 100%"
              loop
              :controls="true"
            >
              <source :src="companyVideoUrl" type="video/mp4" />
            </video>

            <p class="border"></p>

            <div class="all-more-layer" v-if="moreVisible">
              <template v-for="item in labs" :key="item.id">
                <a-popover
                  placement="bottomLeft"
                  overlayClassName="video-list-popover"
                  v-if="item.labConfigs.length > 1"
                  :key="item.id"
                >
                  <template #content>
                    <ul class="video-list-popover-ul">
                      <li
                        @click="onSelectVideo(item, item2)"
                        v-for="item2 in item.labConfigs"
                        :key="item2.id"
                      >
                        <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
                      </li>
                    </ul>
                  </template>
                  <div
                    :key="item.id"
                    class="all-more-layer-item"
                    :class="{
                      active: mainLabId == item.id
                    }"
                  >
                    <span class="font-2" :title="item.name">{{ item.name }}</span>
                  </div>
                </a-popover>

                <div
                  v-else
                  :key="item.id"
                  class="all-more-layer-item"
                  :class="{
                    active: mainLabId == item.id
                  }"
                  @click="onSelectVideo(item)"
                >
                  <span class="font-2" :title="item.name">{{ item.name }}</span>
                </div>
              </template>
            </div>
          </div>
          <div id="video-scroll" class="videos">
            <div class="video-company" @click="onCheckCompanyVideo" v-if="companyVideoUrl">
              <img src="../../assets/images/dataScreen/camera.svg" />
              宣传视频
            </div>
            <ul :class="`video-list scroll-box ${moveVideo ? 'start-move' : ''}`">
              <template v-for="item in labs" :key="item.id">
                <a-popover
                  placement="bottomLeft"
                  overlayClassName="video-list-popover"
                  v-if="item.labConfigs.length > 1"
                  :key="item.id"
                >
                  <template #content>
                    <ul class="video-list-popover-ul">
                      <li
                        @click="onSelectVideo(item, item2)"
                        v-for="item2 in item.labConfigs"
                        :key="item2.id"
                      >
                        <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
                      </li>
                    </ul>
                  </template>
                  <li
                    :key="item.id"
                    class="item"
                    :class="{
                      active: mainLabId == item.id
                    }"
                  >
                    <span class="font-2" :title="item.name">{{ item.name }}</span>
                  </li>
                </a-popover>

                <li
                  v-else
                  :key="item.id"
                  class="item"
                  :class="{
                    active: mainLabId == item.id
                  }"
                  @click="onSelectVideo(item)"
                >
                  <span class="font-2" :title="item.name">{{ item.name }}</span>
                </li>
              </template>
            </ul>
            <div
              class="video-more"
              :class="{ active: moreVisible }"
              v-if="labs.length >= (companyVideoUrl ? 9 : 10)"
              @click="moreVisible = !moreVisible"
            >
              选择更多
              <img src="../../assets/images/dataScreen/more.svg" />
            </div>
          </div>
        </div>
        <div class="s-card s-card-long mg-t down-card">
          <div class="s-card-head font-ys">当日在检任务统计</div>
          <div class="s-card-body" style="padding: 0.09rem">
            <ul class="task-list">
              <li class="tr thead">
                <!-- <p class="order">序号</p> -->
                <p>功能室名称</p>
                <p style="flex: 1.5">试验参数</p>
                <p>检测人员</p>
                <p>开始时间</p>
                <p class="status">检测状态</p>
              </li>
            </ul>
            <div id="taskScroll" class="task-scroll-box">
              <ul :class="`task-list scroll-box ${moveTask ? 'startMove' : ''}`">
                <li v-for="d in todayTaskDatas" :key="d.id" class="tr">
                  <!-- <p class="order">{{ d.index }}</p> -->
                  <p :title="d.laboratoryName">{{ d.laboratoryName }}</p>
                  <p :title="d.testTaskParamName" style="flex: 1.5">{{ d.testTaskParamName }}</p>
                  <p :title="d.testUser">{{ d.testUser }}</p>
                  <p style="min-width: 1.5rem">
                    {{ d.startTime ? formatDate(d.startTime, 2) : "--" }}
                  </p>
                  <p :class="`status ${d.status == '进行中' ? 'orange' : ''}`">{{ d.status }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="right-warp">
        <div class="s-card">
          <div class="s-card-head font-ys">最新消息</div>
          <div class="s-card-body">
            <div id="newsScroll" class="news-scroll-box">
              <ul :class="`news-list scroll-box ${moveNews ? 'startMove' : ''}`">
                <li v-for="d in newsDatas" :key="d.id" class="item">
                  <span v-if="d.noticeType == 1" class="sign">通知</span>
                  <span v-if="d.noticeType == 2" class="sign">公告</span>
                  <!-- <span class="sign sign-err">告警</span> -->
                  <span class="text">{{ d.noticeTitle }}</span>
                  <span class="time">{{ d.createTime ? formatDate(d.createTime, 2) : "--" }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="s-card mg-t down-card no-border">
          <div class="s-card-head font-ys">功能室温湿度监控</div>
          <div id="use-status-box" class="use-status-box">
            <div :class="`scroll-box ${moveLab ? 'startMove' : ''}`">
              <ul v-for="(item, i) in testRoomDatas" :key="i" class="use-status-list clearfix">
                <li v-for="d in item" :key="d.id" class="item">
                  <span class="font-2">{{ d.labName }}</span>
                  <p :class="`status ${d.isOutDate && d.temperature ? 'middle-line' : ''}`">
                    <span class="wendu">{{ d.temperature ? `${d.temperature}℃` : "--" }}</span>
                    <span class="shidu">{{ d.humidity ? `${d.humidity}%RH` : "--" }}</span>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue"
import * as echarts from "echarts"
import ScreenHeader from "@/components/ScreenHeader.vue"
import WvpLiveVideo from "@/components/WvpLiveVideo.vue"
import { formatDate, deepCopy } from "@/utils/utils"
import {
  todayStatistics,
  rankedListParam,
  newestNotice,
  consignTrend,
  testingTask,
  labEnvironment,
  getLabList,
  getCompanyVideo
} from "@/api/dataScreen.api"
onMounted(() => {
  initPageScale()
  nextTick(() => {
    getLiveVideoDatas()
    getDatas()
    setInterval(getDatas, 300000)
  })
})

window.onresize = () => {
  initPageScale()
}

// 初始化页面宽高比例
const screenW = ref(1920)
const initPageScale = () => {
  const winH = window.innerHeight || document.body.clientHeight
  const winW = winH * 2.37
  const size = (winH / 1080) * 100
  screenW.value = winW
  document.documentElement.style.fontSize = size + "px"
}

const getDatas = () => {
  getTodayStatistics()
  getRankedListParam()
  getConsignNumTrend()
  getTaskData()
  getNewsData()
  getLabEnvironment()
  getCompanyVideoUrl()
}

const companyVideo = ref()

// 获取直播摄像头配置列表
const labs = ref<any>([])
const videoDatas = ref<any>([])
const mainVideoId = ref("")
const mainLabId = ref("")
const videoTimer = ref()
const moveVideo = ref(false)
const moreVisible = ref(false)
const companyVideoUrl = ref("")
const companyVideoVisible = ref(false)

const getLiveVideoDatas = () => {
  getLabList().then((res) => {
    if (res.code != 20000) return
    const list: any = res.data || []
    const videos: any = []
    for (let i = 0; i < list.length; i++) {
      videos.push(...list[i].labConfigs)
    }
    labs.value = list.filter((i) => i.labConfigs.length > 0)
    videoDatas.value = videos
    mainVideoId.value = videos[0].id
    mainLabId.value = list[0].id
  })
}

// 概况数据
const todayStatisticsObj = ref<{
  当日委托数: number
  待检任务数: number
  超期任务数: number
}>({
  当日委托数: 0,
  待检任务数: 0,
  超期任务数: 0
})

const getTodayStatistics = () => {
  todayStatistics().then((res) => {
    if (res.code === 20000) {
      const obj = {}
      res.data.forEach((d) => {
        obj[d.name] = d.numMain
      })
      numAnimate(todayStatisticsObj.value, obj, (data) => {
        todayStatisticsObj.value = data
      })
    }
  })
}

// 数字自增效果
let timer
const numAnimate = (num1, num2, fn) => {
  let step = {}
  ;(function add() {
    let isEnd = true
    for (let k in num1) {
      let sub = Number(num2[k]) - Number(num1[k])
      if (!step[k]) {
        step[k] = parseInt(Math.max(30, sub / 15) + "")
      }
      if (sub > 0) {
        isEnd = false
        num1[k] = Number(num1[k]) + step[k]
        if (num1[k] > num2[k]) {
          num1[k] = num2[k]
        }
      } else if (sub < 0) {
        isEnd = false
        num1[k] = Number(num1[k]) - step[k]
        if (num1[k] < num2[k]) {
          num1[k] = num2[k]
        }
      }
    }
    if (!isEnd) {
      fn && fn(num1)
      timer = setTimeout(() => {
        add()
      }, 100)
    } else {
      clearTimeout(timer)
    }
  })()
}

// 委托参数数量排行
interface paramsType {
  id: string
  chartDataKey: string
  chartDataValue: number
  scale: number
}
const paramsNoList = ref<paramsType[]>([])
const getRankedListParam = () => {
  rankedListParam().then((res) => {
    if (res.code === 20000) {
      const list = res.data.data || []
      if (list.length === 0) return
      const maxItem = list[0]
      for (let i = 0; i < list.length; i++) {
        list[i].scale = (list[i].chartDataValue / maxItem.chartDataValue) * 100
      }
      paramsNoList.value = list
    }
  })
}

// 委托数量趋势图
const getConsignNumTrend = () => {
  consignTrend().then((res) => {
    if (res.code !== 20000) return
    renderConsignNumTrend(res.data.data)
  })
}
const renderConsignNumTrend = (datas) => {
  const myChart = echarts.init(document.getElementById("consignNumTrend") as any)
  const xData = datas.map((d) => d.chartDataKey)
  const yData = datas.map((d) => d.chartDataValue)
  myChart.setOption({
    lenged: {},
    tooltip: {
      trigger: "axis",
      className: "custom-tooltip-box",
      extraCssText: "background: transparent",
      formatter: function (data) {
        let str = `<div class="echart-tooltip">${data[0].name}`
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          str += `<p>${d.seriesName}：${d.value}</p>`
        }
        return str + "</div>"
      }
    },
    grid: {
      top: 40,
      right: 10,
      bottom: 40,
      left: 40
    },
    xAxis: {
      type: "category",
      data: xData,
      boundaryGap: false,
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: "#3F4F5E"
        }
      },
      axisLabel: {
        color: "#fff",
        rotate: 25
      }
    },
    yAxis: {
      type: "value",
      name: "单位：个",
      nameTextStyle: {
        color: "#fff"
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: "rgba(155,208,255,0.1)",
          type: "dashed"
        }
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: "#fff"
      }
    },
    series: [
      // {
      //   data: yData,
      //   name: "待检数",
      //   type: "line",
      //   smooth: true,
      //   color: "#F3BC52",
      //   showSymbol: false,
      //   areaStyle: {
      //     color: {
      //       type: "linear",
      //       x: 0,
      //       y: 1,
      //       x2: 0,
      //       y2: 0,
      //       colorStops: [
      //         {
      //           offset: 0,
      //           color: "rgba(243, 188, 82, 0)"
      //         },
      //         {
      //           offset: 1,
      //           color: "rgba(243, 188, 82, 0.3)"
      //         }
      //       ]
      //     }
      //   }
      // }
      {
        data: yData,
        name: "委托数",
        type: "line",
        smooth: true,
        color: "#1890FF",
        showSymbol: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: "rgba(24, 144, 255, 0)"
              },
              {
                offset: 1,
                color: "rgba(24, 144, 255, 0.3)"
              }
            ]
          }
        }
      }
    ]
  })
}

// 最新消息
const newsDatas = ref<any>([])
const moveNews = ref(false)
const newsTimer = ref()
const getNewsData = () => {
  newestNotice().then((res) => {
    if (res.code !== 20000) return
    const list = res.data || []
    for (let i = 0; i < list.length; i++) {
      list[i].index = i + 1
    }
    newsDatas.value = list
    autoPlayData({
      domId: "newsScroll",
      datas: newsDatas,
      isMove: moveNews,
      timer: newsTimer
    })
  })
}

// 当日在检任务
const todayTaskDatas = ref<any>([])
const moveTask = ref(false)
const taskTimer = ref()
const getTaskData = () => {
  testingTask().then((res) => {
    if (res.code !== 20000) return
    const list = res.data || []
    for (let i = 0; i < list.length; i++) {
      list[i].index = i + 1
    }
    todayTaskDatas.value = list
    autoPlayData({
      domId: "taskScroll",
      datas: todayTaskDatas,
      isMove: moveTask,
      timer: taskTimer
    })
  })
}

// 功能室使用情况
interface testRoomType {
  id: string
  humidity: string
  labName: string
  recordTime: string
  temperature: string
  isOutDate: boolean
}
const testRoomDatas = ref<testRoomType[][]>([])
const moveLab = ref(false)
const labTimer = ref()
const getLabEnvironment = () => {
  labEnvironment().then((res) => {
    if (res.code !== 20000) return
    const labs = res.data
    const newArr: testRoomType[][] = []
    let rowArr: testRoomType[] = []
    const nowDate = new Date().getTime()
    for (let i = 0; i < labs.length; i++) {
      const item = labs[i]
      if (item.recordTime) {
        const t = nowDate - item.recordTime
        item.isOutDate = t >= 300000
      } else {
        item.isOutDate = false
      }
      if (i > 0 && i % 2 === 0) {
        newArr.push(rowArr)
        rowArr = []
      }
      if (i === labs.length - 1 && i % 2 !== 0) {
        newArr.push(rowArr)
      }
      rowArr.push(item)
    }
    testRoomDatas.value = newArr
    autoPlayData({
      domId: "use-status-box",
      datas: testRoomDatas,
      isMove: moveLab,
      timer: labTimer,
      callback: (list) => {
        const nowDate = new Date().getTime()
        for (let i = 0; i < list.length; i++) {
          if (list[i].recordTime) {
            const t = nowDate - list[i].recordTime
            list[i].isOutDate = t >= 300000
          } else {
            list[i].isOutDate = false
          }
        }
      }
    })
  })
}

const onSelectVideo = (labItem, videoItem?) => {
  const vItem = videoItem || labItem.labConfigs[0]
  mainLabId.value = labItem.id
  mainVideoId.value = vItem.id
  moreVisible.value = false
  companyVideoVisible.value = false
}

// 获取公司宣传视频
const getCompanyVideoUrl = async () => {
  const res: any = await getCompanyVideo()
  const _embedded = res._embedded
  const video = _embedded["publicity-video"]

  if (video && video.length > 0) {
    companyVideoUrl.value = video[0].url
  }
}

// 播放公司宣传视频
const onCheckCompanyVideo = () => {
  companyVideoVisible.value = true
  mainLabId.value = "";
  mainVideoId.value = "";
  setTimeout(() => {
    const companyVideoEle = document.getElementById("companyVideoEle") as any;
    companyVideoEle && companyVideoEle.play()
  }, 300);
}

// 轮播
const autoPlayData = (opt) => {
  const { domId, datas, isMove, timer, callback, delay = 5000 } = opt
  nextTick(() => {
    const warp = document.getElementById(domId) as any
    const con = warp?.querySelector(".scroll-box")
    const warpH = warp.clientHeight
    const conH = con.clientHeight
    let t: any = null
    if (warpH >= conH) return
    t && clearTimeout(t)
    timer.value && clearInterval(timer.value)
    timer.value = setInterval(() => {
      isMove.value = true
      t = setTimeout(() => {
        const obj = datas.value.shift()
        callback && callback(obj)
        datas.value.push(deepCopy(obj))
        isMove.value = false
      }, 1000)
    }, delay)
  })
}
</script>

<style lang="less">
.video-list-popover {
  width: 2.24rem;

  .ant-popover-arrow {
    background: url("../../assets/images/dataScreen/tip-s.png") no-repeat;
    background-position: 100% 100%;
    width: 12px;
    height: 8px;
    top: 1px;
  }

  .ant-popover-arrow::after,
  .ant-popover-arrow::before {
    display: none;
  }

  .ant-popover-inner {
    background: #031335;
    border-radius: 0;
    padding: 0;
    border: 1px solid rgba(0, 102, 236, 0.5);
  }

  .ant-popover-inner-content {
    color: #fff;
  }
}

.video-list-popover-ul {
  padding: 8px 0;

  li {
    min-height: 0.32rem;
    padding: 0.08rem 0.12rem;
    font-size: 0.14rem;
    display: flex;
    align-items: center;

    &:hover {
      background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
    }
  }
}
</style>
<style lang="less" scoped>
.mg-t {
  margin-top: 20px;
}
.screen-warp {
  color: #fff;
  height: 100%;
  overflow-y: hidden;
  .body-warp {
    padding: 0.2rem;
    height: calc(100% - 0.88rem);
    display: flex;
    box-sizing: border-box;
    .left-warp,
    .right-warp {
      width: 6rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      .s-card {
        flex: 1;
        height: 0;
      }
      // 更新大屏的宽高撑开比例
      .s-card-update {
        flex: 1;
        height: 100%;
      }
    }
    .content-warp {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin: 0 0.2rem;
      width: 0;
      height: 100%;
      .video-warp {
        flex: 1;
        height: 0;
      }
    }

    .down-card {
      flex: initial !important;
      height: 35% !important;
    }
  }

  .s-card {
    width: 100%;
    height: 100%;
    &:not(.no-border) {
      border: 1px solid #05234a;
      .bottom-border(#128cff);
    }
    &.s-card-long {
      .s-card-head {
        background: url("../../assets/images/data-bg-1.png") no-repeat 0 center/100% 100%,
          linear-gradient(to right, #021f3a, transparent);
      }
    }
    .s-card-head {
      position: relative;
      padding-left: 0.42rem;
      line-height: 0.5rem;
      font-size: 0.2rem;
      background: url("../../assets/images/home-bg-1.png") no-repeat 0 center/100% 100%,
        linear-gradient(to right, #021f3a, transparent);
      text-shadow: 0.02rem 0 0.08rem #128cff;
    }
    .s-card-body {
      height: calc(100% - 0.5rem);
      padding: 0.1rem;
      box-sizing: border-box;
    }
  }

  .echarts-box {
    // width: 100%;
    width: 5.8rem;
    height: 100%;
  }

  .top-border(@color) {
    position: relative;
    &::before {
      content: "";
      position: absolute;
      left: -1px;
      top: -1px;
      width: 0.12rem;
      height: 0.12rem;
      border-top: 2px solid @color;
      border-left: 2px solid @color;
    }
    &::after {
      content: "";
      position: absolute;
      right: -1px;
      top: -1px;
      width: 0.12rem;
      height: 0.12rem;
      border-top: 2px solid @color;
      border-right: 2px solid @color;
    }
  }
  .bottom-border(@color) {
    position: relative;
    &::before {
      content: "";
      position: absolute;
      left: -1px;
      bottom: -1px;
      width: 0.12rem;
      height: 0.12rem;
      border-bottom: 2px solid @color;
      border-left: 2px solid @color;
    }
    &::after {
      content: "";
      position: absolute;
      right: -1px;
      bottom: -1px;
      width: 0.12rem;
      height: 0.12rem;
      border-bottom: 2px solid @color;
      border-right: 2px solid @color;
    }
  }

  .statistics {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    height: 2rem;
    border: 1px solid #05234a;
    .top-border(#0e9eff);
    .line {
      .bottom-border(#0e9eff);
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }
    .statistics-item {
      text-align: center;
      &::before {
        content: "";
        position: absolute;
        height: 1.1rem;
        width: 1.1rem;
        border: 1px solid;
        border-radius: 50%;
        display: block;
        clip-path: polygon(100% 0%, 100% 50%, 50% 100%, 100% 100%, 0 100%, 0% 0%, 50% 0%);
      }
      .count {
        width: 0.9rem;
        height: 0.9rem;
        border: 10px solid;
        line-height: 0.9rem;
        border-radius: 50%;
        font-size: 0.28rem;
      }
      .title {
        margin-top: 0.1rem;
        font-size: 0.14rem;
      }
      &.one {
        &::before {
          border-color: #0e9eff;
        }
        .count {
          border-color: rgba(0, 93, 180, 0.2);
          color: #0e9eff;
        }
        .title {
          color: #99c2f7;
        }
      }
      &.two {
        &::before {
          border-color: #ffac20;
        }
        .count {
          border-color: rgba(255, 173, 32, 0.2);
          color: #ffac20;
        }
        .title {
          color: #ffd48b;
        }
      }
      &.three {
        &::before {
          border-color: #ff5858;
        }
        .count {
          border-color: rgba(255, 88, 88, 0.2);
          color: #ff5858;
        }
        .title {
          color: #ff8383;
        }
      }
    }
  }

  .consign-param-num {
    margin: 0 10px;
    height: 100%;
    overflow-y: hidden;
    font-size: 0.14rem;

    .item {
      padding: 0.1rem 0;
      &:first-child .bar .bar-thumb {
        background: linear-gradient(to right, #f3bc52, #f39052);
      }
    }
    .bar {
      margin-top: 0.06rem;
      width: 100%;
      height: 0.08rem;
      border-radius: 0.05rem;
      background-color: #364267;
      .bar-thumb {
        border-radius: 0.05rem;
        width: 0;
        height: 100%;
        background: linear-gradient(to right, #7ce9ff, #4aa2ff);
        transition: 0.2s;
      }
    }
  }

  .all-more-layer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 38%;
    background: rgba(3, 19, 53, 0.8);
    z-index: 99;
    border: 1px solid rgba(0, 102, 236, 0.5);
    padding: 0.18rem;
    overflow-y: auto;

    .all-more-layer-item {
      width: 1.6rem;
      height: 0.48rem;
      display: flex;
      align-items: center;
      font-size: 0.14rem;
      padding: 0 0.12rem;
      margin-right: 0.08rem;
      margin-bottom: 0.16rem;
      float: left;
      border: solid 1px transparent;

      &:hover {
        background: linear-gradient(180deg, rgba(28, 170, 255, 0.4) 0%, rgba(0, 85, 197, 0.4) 100%);
        border: 1px solid #0d98fd;
      }
    }
  }

  .video-warp {
    display: flex;
    .show-video {
      flex: 1;
      height: 100%;
      position: relative;
      border: 1px solid #05234a;
      .top-border(#128cff);
      .border {
        .bottom-border(#128cff);
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      }
    }
    .videos {
      margin-left: 0.1rem;
      width: 2.24rem;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .start-move {
        transition: 0.5s ease-in;
        transform: translateY(-1.99rem);
      }
      .video-company {
        height: 0.62rem;
        display: flex;
        align-items: center;
        font-size: 0.14rem;
        color: #0d98fd;
        margin-bottom: 2px;
        background: rgba(0, 102, 236, 0.1);
        position: relative;

        &::before {
          content: "";
          position: absolute;
          background: linear-gradient(
            270deg,
            rgba(0, 102, 236, 0) 0%,
            #0066ec 52%,
            rgba(0, 102, 236, 0) 100%
          );
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
        }

        img {
          margin-left: 0.14rem;
          margin-right: 0.04rem;
        }
      }
      .video-more {
        height: 0.52rem;
        padding: 0 0.14rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid transparent;
        font-size: 0.14rem;
        background: rgba(0, 102, 236, 0.1);
        color: #0d98fd;
        margin-top: 2px;

        &:hover,
        &.active {
          background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
          border: 1px solid;
          border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1;
          color: #fff;
        }
      }
      .video-list {
        flex: 1;
        overflow-y: auto;

        .item {
          height: 0.52rem;
          padding: 0 0.14rem;
          display: flex;
          align-items: center;
          border: 1px solid transparent;
          font-size: 0.14rem;
          background: rgba(0, 102, 236, 0.1);
          color: #0d98fd;

          &:hover,
          &.active {
            background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
            border: 1px solid;
            border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1;
            color: #fff;
          }
        }
      }
    }
  }

  .news-scroll-box {
    height: 100%;
    overflow: hidden;
  }
  .news-list {
    line-height: 0.348rem;
    font-size: 0.14rem;
    &.startMove {
      transition: 0.5s ease-out;
      transform: translateY(-0.347rem);
    }
    .item {
      display: flex;
      align-items: center;
      .sign {
        width: 0.4rem;
        height: 0.24rem;
        text-align: center;
        line-height: 0.24rem;
        border-radius: 2px;
        background: linear-gradient(180deg, rgba(18, 140, 255, 0.56), rgba(18, 140, 255, 0));
        border: 1px solid rgba(18, 140, 255, 0.5);
        &.sign-err {
          background: linear-gradient(180deg, rgba(255, 0, 0, 0.4), rgba(255, 0, 0, 0));
          border: 1px solid rgba(255, 0, 0, 0.5);
        }
      }
      .text {
        flex: 1;
        width: 0;
        margin: 0 0.1rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  @taskItemH: 0.33rem;
  .task-scroll-box {
    height: calc(100% - @taskItemH);
    overflow: hidden;
  }
  .task-list {
    margin: 0 0.2rem;
    font-size: 0.14rem;
    &.startMove {
      transition: 0.5s ease-out;
      transform: translateY(-@taskItemH);
    }
    .thead {
      color: #1890ff;
    }
    .tr {
      line-height: @taskItemH;
      display: flex;
      p {
        margin: 0 0.05rem;
        flex: 1;
        width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      p.order {
        flex: inherit;
        width: 0.6rem;
      }
      p.status {
        flex: inherit;
        width: 0.6rem;
        color: #1890ff;
      }
      p.orange {
        color: #ffac20;
      }
    }
  }

  .use-status-box {
    overflow: hidden;
    height: calc(100% - 0.5rem);
    .startMove {
      transition: 0.9s ease-out;
      transform: translateY(-0.7rem);
    }
    .use-status-list {
      color: #1890ff;
      font-size: 0.14rem;
      display: flex;
      flex-wrap: wrap;
      .item {
        // float: left;
        padding: 0 0.1rem;
        margin-top: 0.14rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(50% - 5px);
        height: 0.55rem;
        box-sizing: border-box;
        border-top: 1px solid #1890ff;
        background: linear-gradient(
          180deg,
          rgba(34, 155, 255, 0) 0%,
          rgba(34, 155, 255, 0.19) 100%
        );
        &:nth-child(2n) {
          margin-left: 0.1rem;
        }
        .status {
          display: flex;
          width: 60%;
          min-width: 60%;
          line-height: 0.25rem;
          border-left: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          .wendu {
            flex: 1;
            margin-left: 0.15rem;
            padding-left: 0.22rem;
            background: url("../../assets/images/wendu.png") no-repeat 0 center/ 22px 16px;
          }
          .shidu {
            flex: 1;
            margin-left: 0.05rem;
            padding-left: 0.22rem;
            background: url("../../assets/images/shidu.png") no-repeat 0 center/ 18px 16px;
          }
        }
        .middle-line span {
          text-decoration: line-through;
        }
      }
    }
  }
}
:deep(.custom-tooltip-box) {
  padding: 0 !important;
  border: none !important;

  .echart-tooltip {
    padding: 10px 15px;
    background-color: rgba(14, 159, 255, 0.2);
    border: 1px solid #1890ff;
    border-radius: 4px;
    color: #fff;
  }
}
</style>
