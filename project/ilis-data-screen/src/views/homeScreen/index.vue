<template>
  <div class="screen-warp">
    <ScreenHeader />
    <div class="body-warp">
      <ul class="statistics pd-x">
        <li class="statistics-item one">
          <p class="count">{{ todayStatisticsObj["当月已检任务数"] }}</p>
          <p class="title">当月已检任务数</p>
          <p class="line bottom-border"></p>
          <div class="light-line"></div>
        </li>
        <li class="statistics-item two">
          <p class="count">{{ todayStatisticsObj["待检任务数"] }}</p>
          <p class="title">待检测任务数</p>
          <p class="line"></p>
          <div class="light-line"></div>
        </li>
        <li class="statistics-item three">
          <p class="count">{{ todayStatisticsObj["当日委托数"] }}</p>
          <p class="title">当日委托数</p>
          <p class="line bottom-border"></p>
          <div class="light-line"></div>
        </li>
        <!-- <li class="statistics-item three">
          <p class="count">{{ todayStatisticsObj["超期任务数"] }}</p>
          <p class="title">超期任务数</p>
          <p class="line"></p>
        </li> -->
      </ul>
      <div class="flex-box pd-x" style="flex: 1.3">
        <ComCard title="委托参数数量排行">
          <ul class="consign-param-num">
            <li v-for="(d, i) in paramsNoList" :key="d.id" class="item">
              <p class="param-info">
                NO.{{ i + 1 }} {{ d.chartDataKey }}：
                <span class="fr">{{ d.chartDataValue }}个</span>
              </p>
              <div class="bar"><p class="bar-thumb" :style="`width: ${d.scale}%`"></p></div>
            </li>
          </ul>
        </ComCard>
        <ComCard title="最新消息">
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
        </ComCard>
      </div>
      <div class="flex-box pd-x">
        <ComCard title="委托数量趋势图">
          <div id="consignNumTrend" class="echarts-box"></div>
        </ComCard>
        <ComCard title="当日在检任务" class="s-card-flex">
          <ul class="task-list">
            <li class="tr thead">
              <!-- <p class="order">序号</p> -->
              <p>功能室名称</p>
              <p style="flex: 1.5">试验参数</p>
              <p>检测人员</p>
              <p style="min-width: 1.5rem">开始时间</p>
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
        </ComCard>
        <ComCard title="功能室使用情况">
          <ul class="use-status-num">
            <li class="item use">
              <p class="count">{{ testRoomNum.usingCount }}</p>
              <p class="name">使用中</p>
            </li>
            <li class="line"></li>
            <li class="item">
              <p class="count">{{ testRoomNum.freeCount }}</p>
              <p class="name">空闲中</p>
            </li>
          </ul>
          <div id="use-status-box" class="use-status-box">
            <div :class="`scroll-box ${moveLab ? 'startMove' : ''}`">
              <ul
                v-for="(item, i) in testRoomDatas"
                :key="i"
                class="use-status-list clearfix"
                style="height: 1.84rem"
              >
                <li
                  v-for="d in item"
                  :key="d.id"
                  :class="`item ${d.status === '使用中' ? 'use' : ''}`"
                >
                  <span class="font-2">{{ d.name }}</span>
                  <p class="status">
                    <i class="icon"></i>
                    {{ d.status || "空闲中" }}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </ComCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from "vue"
import * as echarts from "echarts"
import ScreenHeader from "@/components/ScreenHeader.vue"
import ComCard from "@/components/ComCard.vue"
import { formatDate } from "@/utils/utils"
import {
  todayStatistics,
  rankedListParam,
  newestNotice,
  consignTrend,
  testingTask,
  labState
} from "@/api/homeScreen.api"

onMounted(() => {
  initPageScale()
  getDatas()
  setInterval(getDatas, 300000)
})

window.onresize = () => {
  initPageScale()
}

// 初始化页面宽高比例
const initPageScale = () => {
  const winH = window.innerHeight || document.body.clientHeight
  const size = (winH / 1080) * 100
  document.documentElement.style.fontSize = size + "px"
}

const getDatas = () => {
  getTodayStatistics()
  getRankedListParam()
  getConsignNumTrend()
  getTaskData()
  getNewsData()
  getLabState()
}

// 今日统计
const todayStatisticsObj = ref({
  当日委托数: 0,
  待检任务数: 0,
  超期任务数: 0,
  当月已检任务数: 0
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
    autoPlayData("newsScroll", newsDatas, moveNews, newsTimer)
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
    autoPlayData("taskScroll", todayTaskDatas, moveTask, taskTimer)
  })
}

// 功能室使用情况
interface testRoomType {
  id: string
  status: string
  name: string
}
const testRoomDatas = ref<testRoomType[][]>([])
const testRoomNum = ref<{
  freeCount: number
  usingCount: number
}>({
  freeCount: 0,
  usingCount: 0
})
const moveLab = ref(false)
const labTimer = ref()
const getLabState = () => {
  labState().then((res) => {
    if (res.code !== 20000) return
    const labs = res.data.labStatuses
    const newArr: testRoomType[][] = []
    let rowArr: testRoomType[] = []
    for (let i = 0; i < labs.length; i++) {
      const item = labs[i]
      if (i > 0 && i % 12 === 0) {
        newArr.push(rowArr)
        rowArr = []
      }
      if (i === labs.length - 1 && i % 12 !== 0) {
        newArr.push(rowArr)
      }
      rowArr.push(item)
    }
    testRoomNum.value = res.data
    testRoomDatas.value = newArr
    autoPlayData("use-status-box", testRoomDatas, moveLab, labTimer, 10)
  })
}

// 轮播
const autoPlayData = (domId, datas, moveTask, timer, t = 5) => {
  nextTick(() => {
    const warp = document.getElementById(domId) as any
    const con = warp?.querySelector(".scroll-box")
    const warpH = warp.clientHeight
    const conH = con.clientHeight
    if (warpH >= conH) return
    if (t < 2) t = 2
    timer.value && clearInterval(timer.value)
    timer.value = setInterval(() => {
      moveTask.value = true
      const t = setTimeout(() => {
        const obj = datas.value.shift()
        datas.value.push({ ...obj })
        moveTask.value = false
        clearTimeout(t)
      }, 1500)
    }, t * 1000)
  })
}
</script>

<style lang="less" scoped>
.pd-x {
  padding: 0 30px;
}
.screen-warp {
  height: 100%;
  color: #fff;

  ul,
  p {
    margin-bottom: 0;
  }

  .body-warp {
    padding: 0.2rem 0;
    height: calc(100% - 0.88rem);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background: url("../../assets/images/center-bg.png") center 40% no-repeat;
    background-size: 6rem 4.5rem;
    .statistics {
      display: flex;
      height: 1.74rem;
      margin-bottom: 0;

      .statistics-item {
        position: relative;
        border: 1px solid;
        text-align: center;
        box-sizing: border-box;

        .light-line {
          width: 3.2rem;
          height: 0.05rem;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .count {
          margin-top: 0.3rem;
          font-size: 0.52rem;
          font-weight: bold;
        }
        .title {
          font-size: 0.18rem;
          margin-top: 0.06rem;
        }
        .linear-line(@color) {
          .line {
            .bottom-border(@color);
            position: absolute;
            background: linear-gradient(to right, transparent 20%, @color, transparent 80%);
          }
        }
        .line {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 0.05rme;
        }
        &.one {
          width: 5.4rem;
          border-color: rgba(0, 93, 180, 0.39);
          color: #0e9eff;
          box-shadow: inset 0 0 50px rgba(0, 93, 180, 0.3);

          .light-line {
            background: linear-gradient(
              270deg,
              rgba(14, 158, 255, 0) 0%,
              #0e9eff 56%,
              rgba(14, 158, 255, 0) 100%
            );
          }

          .title {
            color: #99c2f7;
          }
          .linear-line(#128cff);
          .top-border(#128cff);
        }
        &.two {
          flex: 1;
          margin: 0 0.2rem;
          border-color: rgba(255, 173, 32, 0.39);
          color: #ffac20;
          box-shadow: inset 0 0 0.5rem rgba(255, 172, 32, 0.3);

          .light-line {
            background: linear-gradient(
              270deg,
              rgba(255, 172, 32, 0) 1%,
              #ffac20 56%,
              rgba(255, 172, 32, 0) 100%
            );
          }

          .title {
            color: #ffd48b;
          }
          .linear-line(#ffac20);
          .top-border(#ffac20);
        }
        &.three {
          width: 5.4rem;
          border: 1px solid rgba(50, 234, 255, 0.4);
          color: #32eaff;
          box-shadow: inset 0px 4px 38px 28px rgba(255, 117, 117, 0.07);

          .light-line {
            background: linear-gradient(
              270deg,
              rgba(50, 234, 255, 0) 2%,
              #32eaff 56%,
              rgba(50, 234, 255, 0) 100%
            );
          }

          .title {
            color: #32eaff;
          }
          .linear-line(#32eaff);
          .top-border(#32eaff);
        }
      }
    }
  }

  .flex-box {
    margin-top: 0.2rem;
    flex: 1;
    height: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .s-card {
      width: 5.4rem;
      height: 100%;
      border: 1px solid #05234a;
      .bottom-border(#128cff);
      &.s-card-flex {
        flex: 1;
        width: 0;
        margin: 0 0.2rem;
        .s-card-head {
          background: url("../../assets/images/home-bg-2.png") no-repeat 0 center/100% 100%,
            linear-gradient(to right, #021f3a, transparent);
        }
      }
    }
    .s-card-head {
      position: relative;
      padding-left: 0.42rem;
      line-height: 0.5rem;
      font-size: 0.2rem;
      background: url("../../assets/images/home-bg-1.png") no-repeat 0 center/100% 100%,
        linear-gradient(to right, #021f3a, transparent);
      text-shadow: 2px 0 8px #128cff;
    }
    .s-card-body {
      height: calc(100% - 0.5rem);
      padding: 0.1rem;
      box-sizing: border-box;
    }
  }

  .echarts-box {
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
      width: 12px;
      height: 12px;
      border-bottom: 2px solid @color;
      border-left: 2px solid @color;
    }
    &::after {
      content: "";
      position: absolute;
      right: -1px;
      bottom: -1px;
      width: 12px;
      height: 12px;
      border-bottom: 2px solid @color;
      border-right: 2px solid @color;
    }
  }

  .consign-param-num {
    padding: 0 0.1rem;
    height: 100%;
    overflow-y: hidden;
    font-size: 0.14rem;
    .param-info {
      .name {
        display: inline-block;
        width: 60%;
      }
    }
    .item {
      padding: 0.06rem 0;
      &:first-child .bar .bar-thumb {
        background: linear-gradient(to right, #f3bc52, #f39052);
      }
    }
    .bar {
      margin-top: 0.06rem;
      width: 100%;
      height: 0.06rem;
      border-radius: 0.06rem;
      background-color: #364267;
      .bar-thumb {
        border-radius: 0.06rem;
        width: 0;
        height: 100%;
        background: linear-gradient(to right, #7ce9ff, #4aa2ff);
      }
    }
  }

  .news-scroll-box {
    height: 100%;
    overflow: hidden;
  }
  .news-list {
    line-height: 0.345rem;
    font-size: 0.14rem;
    &.startMove {
      transition: 0.5s ease-out;
      transform: translateY(-0.345rem);
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

  @taskItemH: 0.32rem;
  .task-scroll-box {
    height: calc(100% - @taskItemH);
    overflow: hidden;
  }
  .task-list {
    font-size: 0.14rem;
    &.startMove {
      transition: 0.3s ease-out;
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
        width: 0.5rem;
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

  .use-status-num {
    width: 70%;
    margin: 0 auto;
    display: flex;
    color: #1890ff;
    .line {
      width: 2px;
      height: 0.66rem;
      background: linear-gradient(transparent, #073d61, transparent);
    }
    .item {
      flex: 1;
      text-align: center;
      .count {
        font-size: 0.36rem;
      }
      .name {
        font-size: 0.14rem;
        color: #2f79bc;
      }
      &.use {
        color: #ffac20;
        .name {
          color: #af7a20;
        }
      }
    }
  }
  .use-status-box {
    height: calc(100% - 0.66rem);
    overflow: hidden;
    .startMove {
      transition: 0.9s ease-out;
      transform: translateY(-1.84rem);
    }
    .use-status-list {
      color: #1890ff;
      font-size: 0.12rem;

      .item {
        float: left;
        margin: 0.08rem 0.1rem 0 0;
        padding: 0 0.1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(33.33333% - 0.07rem);
        height: 0.36rem;
        box-sizing: border-box;
        border-top: 1px solid #1890ff;
        background: linear-gradient(
          180deg,
          rgba(34, 155, 255, 0) 0%,
          rgba(34, 155, 255, 0.19) 100%
        );
        &:nth-child(3n) {
          margin: 0.08rem 0 0;
        }
        .status {
          width: 45%;
          min-width: 45%;
          line-height: 0.25rem;
          text-align: right;
          border-left: 1px solid rgba(255, 255, 255, 0.3);
          .icon {
            display: inline-block;
            width: 0.08rem;
            height: 0.08rem;
            background: rgba(24, 144, 255, 0.32);
            border: 1px solid #1890ff;
            border-radius: 0.05rem;
          }
        }
      }
      .use {
        border-top: 1px solid #ffac20;
        background: linear-gradient(
          180deg,
          rgba(255, 172, 32, 0) 0%,
          rgba(255, 172, 32, 0.15) 100%
        );
        color: #ffac20;
        .status {
          .icon {
            background: rgba(255, 172, 32, 0.32);
            border: 1px solid #ffac20;
          }
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
