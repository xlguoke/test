<template>
  <div id="chartScreen">
    <div class="hd"></div>

    <div class="ct">
      <div class="lt">
        <div class="wrap_tle">
          <span class="tle_name">示警统计</span>
        </div>
        <ul class="warn_list">
          <li @click="router.push('/staffEarlyWarn')">
            <div class="lable_wrap">
              <img src="@/assets/images/dashboard/warn1.png" />
              <span class="lable">示警总数</span>
            </div>
            <div class="num_wrap">
              <span>
                <span class="num" style="color: #fbfbfb">{{ alarmsData.total }}</span>
                <span class="unit">条</span>
              </span>
              <i class="iconfont icon-xiangyou1"></i>
            </div>
          </li>
          <li @click="router.push('/staffEarlyWarn')">
            <div class="lable_wrap">
              <img src="@/assets/images/dashboard/warn2.png" />
              <span class="lable">已处理示警</span>
            </div>
            <div class="num_wrap">
              <span>
                <span class="num" style="color: #08d5ab">{{ alarmsData.handled }}</span>
                <span class="unit">条</span>
              </span>
              <i class="iconfont icon-xiangyou1"></i>
            </div>
          </li>
          <li @click="router.push('/staffEarlyWarn')">
            <div class="lable_wrap">
              <img src="@/assets/images/dashboard/warn3.png" />
              <span class="lable">待处理示警</span>
            </div>
            <div class="num_wrap">
              <span>
                <span class="num" style="color: #ffd15c">{{ alarmsData.pending }}</span>
                <span class="unit">条</span>
              </span>
              <i class="iconfont icon-xiangyou1"></i>
            </div>
          </li>
        </ul>
        <div class="wrap_tle">
          <span class="tle_name">试验室统计</span>
        </div>

        <div class="laboratory_pir">
          <div class="pir_box">
            <p class="pir_lable">工地试验室</p>
            <div id="MultiCenter"></div>
          </div>
          <div class="pir_box">
            <p class="pir_lable">中心试验室</p>
            <div id="FieldTrial"></div>
          </div>
        </div>
        <!-- <ul class="data_gather">
          <li>
            <img src="@/assets/images/dashboard/Group4276.png" />
            <div>
              <p>{{ collectData.cruWeek }}</p>
              <p>本周采集量</p>
            </div>
          </li>
          <li>
            <img src="@/assets/images/dashboard/Group4624.png" />
            <div>
              <p>{{ collectData.cruMonth }}</p>
              <p>本月采集量</p>
            </div>
          </li>
          <li>
            <img src="@/assets/images/dashboard/Group4276-1.png" />
            <div>
              <p>{{ collectData.cruYear }}</p>
              <p>本年采集量</p>
            </div>
          </li>
          <li>
            <img src="@/assets/images/dashboard/Group4276-2.png" />
            <div>
              <p style="color: #ff6666">{{ collectData.abnormal }}</p>
              <p>采集异常</p>
            </div>
          </li>
        </ul> -->
      </div>
      <div class="rt">
        <div class="todayRes">
          <p class="tle">今日实时数据</p>
          <ul>
            <li>
              <span>示警总数</span>
              <span>{{ todayData.todayAlarms }}</span>
            </li>
            <!-- <li>
              <span>联网采集</span>
              <span>{{ todayData.cruWeek }}</span>
            </li>
            <li>
              <span>联网采集异常</span>
              <span style="color: #ff6666">{{ todayData.abnormal }}</span>
            </li> -->

            <li>
              <span>质量监督抽查报告</span>
              <span>{{ todayData.todayQualityCheckAll }}</span>
            </li>
            <li>
              <span>质量监督抽查报告异常</span>
              <span style="color: #ff6666">{{ todayData.todayQualityCheckUnqualified }}</span>
            </li>
            <li>
              <span>在建项目检测报告</span>
              <span>{{ todayData.todayBuildingAll }}</span>
            </li>
            <li>
              <span>在建项目检测报告异常</span>
              <span style="color: #ff6666">{{ todayData.todayBuildingUnqualified }}</span>
            </li>
            <li>
              <span>检测机构检测报告</span>
              <span>{{ todayData.todayOrgAll }}</span>
            </li>
            <li>
              <span>检测机构检测报告异常</span>
              <span style="color: #ff6666">{{ todayData.todayOrgUnqualified }}</span>
            </li>
          </ul>
        </div>
        <div id="mapChart"></div>
        <div class="pj_ify">
          <ul>
            <template v-for="item in unitDatas" :key="item.name">
              <li @click="router.push('/organizationList')">
                <span>{{ item.name }}</span>
                <span>{{ item.num }}</span>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>

    <div class="bt">
      <div class="item_block">
        <div class="wrap_tle">
          <span class="tle_name">检测机构-检测报告概览</span>
        </div>
        <div class="handle_row">
          <ul class="tab">
            <li
              :class="queryOrgRFrom.dateType == 'WEEK' ? 'active' : ''"
              @click="switchTabReg('WEEK')"
            >
              近7天
            </li>
            <li
              :class="queryOrgRFrom.dateType == 'MONTH' ? 'active' : ''"
              @click="switchTabReg('MONTH')"
            >
              近30天
            </li>
          </ul>
          <span>
            {{ queryOrgRFrom.dateType == "WEEK" ? "近7天" : "近30天" }}总计：
            <span class="mk">{{ reportORGNum }}</span>
            份
          </span>
        </div>
        <div id="orgChart" class="chart_item"></div>
      </div>
      <div class="item_block">
        <div class="wrap_tle">
          <span class="tle_name">在建项目-检测报告概览</span>
        </div>
        <div class="handle_row">
          <ul class="tab">
            <li
              :class="queryBuiFrom.dateType == 'WEEK' ? 'active' : ''"
              @click="switchTabBui('WEEK')"
            >
              近7天
            </li>
            <li
              :class="queryBuiFrom.dateType == 'MONTH' ? 'active' : ''"
              @click="switchTabBui('MONTH')"
            >
              近30天
            </li>
          </ul>
          <span>
            {{ queryBuiFrom.dateType == "WEEK" ? "近7天" : "近30天" }}总计：
            <span class="mk">{{ buildingsNum }}</span>
            份
          </span>
        </div>
        <div id="pjChart" class="chart_item"></div>
      </div>
      <div class="item_block">
        <div class="wrap_tle">
          <span class="tle_name">不合格统计-检测报告概览</span>
        </div>
        <div id="flunkWrap" class="chart_item">
          <ul>
            <li>
              <p>{{ disqualification.buildingUnqualifiedAll }}</p>
              <img src="@/assets/images/dashboard/Group4763.png" alt="" />
              <p>在建项目不合格</p>
            </li>
            <li>
              <p>{{ disqualification.orgUnqualifiedAll }}</p>
              <img src="@/assets/images/dashboard/Group4763.png" alt="" />
              <p>检测机构不合格</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue"
import axios from "axios"
import * as echarts from "echarts"
import {
  getDashAlarmsAPI,
  getDashCollectAPI,
  getDashDistributionMapAPI,
  getOverviewReportAPI,
  getunqualifiedAllAPI,
  getTodayReportAPI,
  getTodayAlarmsAPI,
  getTodayUnusualAPI
} from "@/api/dashboard.api"
import router from "@/router"

const unitDatas = ref([
  { name: "公路工程-甲级", num: 0 },
  { name: "公路工程-桥梁隧道工程专项", num: 0 },
  { name: "公路工程-交通工程专项", num: 0 },
  { name: "公路工程-乙级", num: 0 },
  { name: "公路工程-丙级", num: 0 },
  { name: "水运工程-结构甲级", num: 0 },
  { name: "水运工程-结构乙级", num: 0 },
  { name: "水运工程-材料甲级", num: 0 },
  { name: "水运工程-材料乙级", num: 0 },
  { name: "水运工程-材料丙级", num: 0 },
  { name: "等级证书总数", num: 0 }
])

onMounted(async () => {
  launchFullscreen(document.getElementById("chartScreen"))
  fullscreenCallBack()
  // loadMapChart();
  resizeChange()

  getDashAlarms()
  getDashCollect()
  getDashDistributionMap()

  getOverviewReport()
  getBuildingReport()
  getunqualifiedAll()
  getLaboratoryStatistics()

  realTimeData()
  setInterval(() => {
    realTimeData()
  }, 60000)
})

let queryOrgRFrom = ref({
  type: "ORG",
  dateType: "WEEK"
})

const switchTabReg = (t) => {
  queryOrgRFrom.value.dateType = t
  queryOrgRFrom.value.type = "ORG"
  getOverviewReport()
}

//获取检测机构报告概览数据
let reportORGNum = ref(0) //报告数量
const getOverviewReport = async () => {
  let res = await getOverviewReportAPI(queryOrgRFrom.value)
  let xv: any = []
  let yv: any = []
  reportORGNum.value = res.total
  let d = ForwardRankingDate(res.chartData, "key")
  d.forEach((item) => {
    let a = item.key.split("-")
    xv.push(a[1] + "/" + a[2])
    yv.push(item.value)
  })
  loadBarChart(xv, yv)
}

//获取试验室统计
const getLaboratoryStatistics = async () => {
  loadPieChart()
}

//封装的日期排序方法
const ForwardRankingDate = function (data, p) {
  for (let i = 0; i < data.length - 1; i++) {
    for (let j = 0; j < data.length - 1 - i; j++) {
      if (Date.parse(data[j][p]) > Date.parse(data[j + 1][p])) {
        let temp = data[j]
        data[j] = data[j + 1]
        data[j + 1] = temp
      }
    }
  }
  return data
}

let queryBuiFrom = ref({
  type: "BUILDING",
  dateType: "WEEK"
})
const switchTabBui = (t) => {
  queryBuiFrom.value.dateType = t
  queryBuiFrom.value.type = "BUILDING"
  getBuildingReport()
}

//获取 在建项目 检测报告
let buildingsNum = ref(0) //报告数量
const getBuildingReport = async () => {
  let res = await getOverviewReportAPI(queryBuiFrom.value)
  let xv: any = []
  let yv: any = []
  buildingsNum.value = res.total
  let d = ForwardRankingDate(res.chartData, "key")
  d.forEach((item) => {
    let a = item.key.split("-")
    xv.push(a[1] + "/" + a[2])
    yv.push(item.value)
  })
  loadLineChart(xv, yv)
}

//获取示警统计数据
let alarmsData: any = ref({})
const getDashAlarms = async () => {
  alarmsData.value = await getDashAlarmsAPI()
}
//获取采集数据
let collectData: any = ref({})
const getDashCollect = async () => {
  collectData.value = await getDashCollectAPI()
}
// 获取不合格统计数据
let disqualification: any = ref({})
const getunqualifiedAll = async () => {
  let res = await getunqualifiedAllAPI()
  res.chartData.forEach((item) => {
    if (item.key == "orgUnqualifiedAll") {
      disqualification.value["orgUnqualifiedAll"] = item.value
    } else {
      disqualification.value["buildingUnqualifiedAll"] = item.value
    }
  })
}
//今日实时数据获取
let todayData: any = ref({})
const realTimeData = async () => {
  let r = await getTodayReportAPI()
  console.log(3333333333, r)
  r.chartData.forEach((item) => {
    todayData.value[item.key] = item.value
  })
  let a = await getTodayAlarmsAPI()
  todayData.value.todayAlarms = a.today
  let c = await getTodayUnusualAPI()

  todayData.value.abnormal = c.cruDayAbnormal
  todayData.value.cruWeek = c.cruDay
}

//获取地图数据
const getDashDistributionMap = async () => {
  let res = await getDashDistributionMapAPI()
  let arr = res.map((item) => {
    return {
      name: item.region,
      value: item.qualifications
    }
  })
  loadMapChart(arr)
  getQualificationList(res)
}

const getQualificationList = (res) => {
  const unitObj = {}
  for (let i = 0; i < res.length; i++) {
    const datas = res[i].qualifications
    if (!datas || datas.length === 0) continue
    for (let j = 0; j < datas.length; j++) {
      const d = datas[j]
      if (!unitObj[d.name]) {
        unitObj[d.name] = d.number
      } else {
        unitObj[d.name] += d.number
      }
    }
  }
  let total = 0
  for (let i = 0; i < unitDatas.value.length; i++) {
    const item = unitDatas.value[i]
    if (unitObj[item.name]) {
      item.num = unitObj[item.name]
      total += unitObj[item.name]
    }
  }
  unitDatas.value[unitDatas.value.length - 1].num = total
}

let timer

//监听屏幕变化
const resizeChange = () => {
  window.addEventListener("resize", () => {
    clearTimeout(timer)
    timer = setTimeout(function () {
      console.log("屏幕发生改变,重新渲染charts")
      getOverviewReport()
      getBuildingReport()
      getDashDistributionMap()
      getLaboratoryStatistics()
      getLaboratoryStatistics()
    }, 1000)
  })
}

//加载饼状图
const loadPieChart = () => {
  let option = {
    grid: {
      // 设置图表在当前dom的间距
      top: "0px",
      left: "0px",
      right: "0px",
      bottom: "0px"
    },
    tooltip: {
      show: false, //隐藏标示文字
      trigger: "item"
    },
    legend: {
      show: false, //隐藏标示文字
      top: "5%",
      left: "center"
    },
    color: ["#1890ff", "#ffeb3b"],
    series: [
      {
        name: "",
        type: "pie",
        radius: ["50%", "80%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: "#fff",
          borderWidth: 0
        },
        label: {
          position: "center"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: "市外机构" },
          { value: 735, name: "市内机构" }
        ]
      }
    ]
  }

  let el = document.getElementById("MultiCenter") as HTMLElement
  el?.removeAttribute("_echarts_instance_") //移除重新渲染时上次生成的渲染id
  let charts = echarts.init(el) //在dom上初始化charts
  charts.clear()
  charts.resize({ height: el?.offsetHeight, width: el?.offsetWidth })
  charts.setOption(option)

  let el2 = document.getElementById("FieldTrial") as HTMLElement
  el2?.removeAttribute("_echarts_instance_") //移除重新渲染时上次生成的渲染id
  let charts2 = echarts.init(el2) //在dom上初始化charts
  charts2.clear()
  charts2.resize({ height: el2?.offsetHeight, width: el2?.offsetWidth })
  charts2.setOption(option)
}

//加载地图maps
const loadMapChart = async (v) => {
  console.log(v)
  let res: any = await axios.get("../web/chongqingMap.json")

  //地图参数
  let optionMap = {
    tooltip: {
      // 悬浮框
      triggerOn: "click",
      enterable: true,
      trigger: "item", // 触发条件
      backgroundColor: "RGBA(136, 123, 135, 0.8)",
      formatter: (param) => {
        console.log(param)
        // 自定义 弹窗里面的 内容
        let str = `<div style="background:rgba(4, 49, 81, 0.7);padding:20px;">
                  <p><h3  style='color:#fff'> ${param.name} </h3></p>
                  <ul style="padding:10px;width:300px">`
        if (param.data && param.data.value.length) {
          param.data.value.forEach((item) => {
            str += `
                <li style="display: flex;justify-content: space-between; padding:5px 0">
                  <span style='cursor:pointer;pointer-events: auto' onclick='goOrgPage()'>
                    <span style='color:#fff'>${item.name} :</span>
                    <span style='color:#3385F0;font-size:16px'>${item.number} </span>
                  </span>
                  <span style='cursor:pointer;pointer-events: auto' onclick='goLabPage()'>
                    <span style='color:#fff'>试验室：</span>
                    <span style='color:#3385F0;font-size:16px'>${item.laboratoryCount} </span>
                  </span>
                </li>                      
                `
          })
        } else {
          str += `<span style='color:#fff'>暂无数据!</span>`
        }
        str += `</ul>
               </div>`

        return str
      },
      textStyle: {
        color: "#ffffff"
      }
    },
    series: [
      {
        type: "map",
        map: "chongqing",
        zoom: 1.2,
        top: "10%",
        x: "center",
        label: {
          color: "#fff",
          show: false // 显示
        },
        itemStyle: {
          normal: {
            // 静态的时候显示的默认样式
            areaColor: "#0B58BA", // 地图颜色
            borderColor: "#2FB5FA", // 边框颜色
            opacity: 1
          },
          emphasis: {
            // 鼠标移入动态的时候显示的默认样式
            borderWidth: 2, // 边框宽度
            areaColor: {
              // 地图颜色
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#FFDC47" // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: "#F99E0C" // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            },
            label: {
              color: "#aed1e3"
            }
          }
        },
        //数据
        data: v
      }
    ]
  }

  ;(window as any).goLabPage = function () {
    router.push("/laboratory/laboratoryList")
  }
  ;(window as any).goOrgPage = function () {
    router.push("/organizationList")
  }

  echarts.registerMap("chongqing", res) //注册铁图
  let el = document.getElementById("mapChart") as HTMLElement
  el?.removeAttribute("_echarts_instance_") //移除重新渲染时上次生成的渲染id
  let mapCahrt = echarts.init(el) //在dom上初始化地图
  mapCahrt.clear()
  mapCahrt.resize({ height: el?.offsetHeight, width: el?.offsetWidth })
  mapCahrt.setOption(optionMap)
}

//加载柱状统计图
const loadBarChart = (xv, yv) => {
  console.log(xv)
  console.log(yv)
  let option = {
    tooltip: {},
    legend: {},
    grid: {
      // 设置图表在当前dom的间距
      top: "20px",
      left: "30px",
      right: "30px",
      bottom: "30px"
    },
    xAxis: {
      data: xv
    },
    yAxis: {
      type: "value",
      splitLine: {
        //网格样式
        show: true,
        lineStyle: {
          color: "#35414D",
          type: "dashed"
        }
      }
    },
    series: [
      {
        type: "bar", //背景层
        itemStyle: {
          normal: {
            color: "#6C8297",
            opacity: 0.1
          }
        },
        silent: true,
        barWidth: 45,
        barGap: "-70%",
        data: yv.map(() => {
          return Math.max(...yv) + 10
        })
      },
      {
        type: "bar", //数据层
        barWidth: 20,
        z: 20,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "#0783FA" // 0% 处的颜色
              },
              {
                offset: 0.05,
                color: "#000" // 0% 处的颜色
              },
              {
                offset: 1,
                color: "#0783FA" // 100% 处的颜色
              }
            ],
            global: false // 缺省为 false
          }
        },
        data: yv
      }
    ],
    dataZoom: [
      {
        type: "slider", //隐藏或显示（true）组件
        show: false,
        backgroundColor: "rgb(19, 63, 100)", // 组件的背景颜色。
        fillerColor: "rgb(16, 171, 198)", // 选中范围的填充颜色。
        borderColor: "rgb(19, 63, 100)", // 边框颜色
        showDetail: false, //是否显示detail，即拖拽时候显示详细数值信息
        startValue: 0,
        endValue: 5,
        filterMode: "empty",
        width: "50%", //滚动条高度
        height: 8, //滚动条显示位置
        left: "center",
        zoomLoxk: true, // 是否锁定选择区域（或叫做数据窗口）的大小
        handleSize: 0, //控制手柄的尺寸
        bottom: 3 // dataZoom-slider组件离容器下侧的距离
      },
      {
        //没有下面这块的话，只能拖动滚动条，鼠标滚轮在区域内不能控制外部滚动条
        type: "inside",
        zoomOnMouseWheel: false, //滚轮是否触发缩放
        moveOnMouseMove: true, //鼠标滚轮触发滚动
        moveOnMouseWheel: true
      }
    ]
  }

  let el = document.getElementById("orgChart") as HTMLElement
  el?.removeAttribute("_echarts_instance_") //移除重新渲染时上次生成的渲染id
  let charts = echarts.init(el) //在dom上初始化charts
  charts.clear()
  charts.resize({ height: el?.offsetHeight, width: el?.offsetWidth })
  charts.setOption(option)
}
//加载折线图
const loadLineChart = (xv, yv) => {
  let option = {
    grid: {
      // 设置图表在当前dom的间距
      top: "20px",
      left: "30px",
      right: "30px",
      bottom: "30px"
    },
    xAxis: {
      type: "category",
      data: xv
    },
    yAxis: {
      type: "value",
      splitLine: {
        //网格样式
        show: true,
        lineStyle: {
          color: "#35414D",
          type: "dashed"
        }
      }
    },
    series: [
      {
        type: "bar", //背景层
        itemStyle: {
          normal: {
            color: "#6C8297",
            opacity: 0.1
          }
        },
        silent: true,
        barWidth: 45,
        barGap: "-70%",
        data: yv.map(() => {
          return Math.max(...yv) + 10
        })
      },
      {
        data: yv,
        type: "line",
        itemStyle: {
          color: "#09D28A"
        }
      }
    ],
    dataZoom: [
      {
        type: "slider", //隐藏或显示（true）组件
        show: false,
        backgroundColor: "rgb(19, 63, 100)", // 组件的背景颜色。
        fillerColor: "rgb(16, 171, 198)", // 选中范围的填充颜色。
        borderColor: "rgb(19, 63, 100)", // 边框颜色
        showDetail: false, //是否显示detail，即拖拽时候显示详细数值信息
        startValue: 0,
        endValue: 5,
        filterMode: "empty",
        width: "50%", //滚动条高度
        height: 8, //滚动条显示位置
        left: "center",
        zoomLoxk: true, // 是否锁定选择区域（或叫做数据窗口）的大小
        handleSize: 0, //控制手柄的尺寸
        bottom: 3 // dataZoom-slider组件离容器下侧的距离
      },
      {
        //没有下面这块的话，只能拖动滚动条，鼠标滚轮在区域内不能控制外部滚动条
        type: "inside",
        zoomOnMouseWheel: false, //滚轮是否触发缩放
        moveOnMouseMove: true, //鼠标滚轮触发滚动
        moveOnMouseWheel: true
      }
    ]
  }

  let el = document.getElementById("pjChart") as HTMLElement
  el?.removeAttribute("_echarts_instance_") //移除重新渲染时上次生成的渲染id
  let charts = echarts.init(el) //在dom上初始化charts
  charts.clear()
  charts.resize({ height: el?.offsetHeight, width: el?.offsetWidth })
  charts.setOption(option)
}

// 全屏监听回调
const fullscreenCallBack = () => {
  document.addEventListener("fullscreenchange", () => {
    // 监听到屏幕变化，在回调中判断是否已退出全屏 如果已退出全屏 把本地状态修改为false
    // document.fullscreen 会返回true或false
    if (document.fullscreenElement) {
      console.log("进入全屏")
    } else {
      console.log("退出全屏")
    }
  })
}
//打开全屏
function launchFullscreen(element) {
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen()
    }
  } catch (error) {
    console.error(error)
  }
}

// //手动关闭全屏
// function exitFullscreen() {
//   if (document.exitFullscreen) {
//     document.exitFullscreen()
//   } else if ((document as any).msExitFullscreen) {
//     document.msExitFullscreen()
//   } else if (document.mozCancelFullScreen) {
//     document.mozCancelFullScreen()
//   } else if (document.webkitExitFullscreen) {
//     document.webkitExitFullscreen()
//   }
// }
</script>
<style lang="less">
@font-face {
  font-family: Bicubik;
  src: url("@/assets/font/YouSheBiaoTiHei-2.ttf");
}

#chartScreen {
  background: url("@/assets/images/dashboard/bg.png") no-repeat;
  background-size: 100% 100%;
  height: 100%;
  width: 100%;
  color: #fff;

  .wrap_tle {
    background: url("@/assets/images/dashboard/tle_bg.png") no-repeat;
    background-size: 100% 100%;
    height: 50px;
    padding-left: 20px;
    font-family: Bicubik;
    display: flex;
    align-items: center;
    font-size: 18px;

    .tle_name::before {
      content: url("@/assets/images/dashboard/icon_l.png");
      vertical-align: text-top;
      margin-right: 10px;
    }
  }

  .hd {
    height: 70px;
    background: url("@/assets/images/dashboard/top.png") no-repeat;
    background-size: 100% 100%;
  }

  .ct {
    padding: 10px;
    height: calc(100% - 390px);
    // background: green;
    display: flex;

    .lt {
      width: 30%;
      font-family: Bicubik;
      margin-right: 15px;

      .warn_list {
        li {
          margin: 15px 0;
          display: flex;
          justify-content: space-between;
          background: url("@/assets/images/dashboard/Group12.png") no-repeat;
          background-size: 100% 100%;
          height: 50px;
          align-items: center;
          cursor: pointer;

          .lable_wrap {
            img {
              margin: 0 10px;
              width: 40px;
            }

            .lable {
              font-size: 15px;
            }
          }

          .num_wrap {
            .num {
              font-size: 20px;
            }

            .unit {
              color: #1890ff;
              margin-left: 10px;
            }

            i {
              color: #1890ff;
              margin-left: 45px;
              font-weight: 900;
            }
          }
        }
      }

      .laboratory_pir {
        width: 100%;
        height: 370px;
        display: flex;

        // #MultiCenter {
        //   width: 50%;
        //   height: 100%;
        // }

        // #FieldTrial {
        //   width: 50%;
        //   height: 100%;
        // }
        .pir_box {
          width: 50%;
          height: 100%;
          position: relative;

          .pir_lable {
            position: absolute;
            text-align: center;
            width: 100%;
            top: 20px;
            font-size: 16px;
          }

          #MultiCenter {
            width: 100%;
            height: 100%;
          }

          #FieldTrial {
            width: 100%;
            height: 100%;
          }
        }
      }

      .data_gather {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        min-width: 385px;

        li {
          display: flex;
          margin-right: 18px;
          margin-top: 60px;
          align-items: center;
          justify-content: center;

          div {
            margin-left: 10px;
          }

          p:first-child {
            font-size: 20px;
          }

          p:last-child {
            font-size: 16px;
          }
        }
      }
    }

    .rt {
      width: 70%;
      display: flex;
      border: 1px solid #0b58ba;
      position: relative;

      .todayRes {
        width: 25%;
        padding: 10px;
        overflow: auto;

        .tle {
          font-family: Bicubik;
          font-size: 17px;
        }

        .tle::before {
          content: url("@/assets/images/dashboard/icon_l.png");
          vertical-align: sub;
          margin-right: 10px;
        }

        ul {
          li {
            display: flex;
            justify-content: space-between;
            margin: 45px 0;

            span:first-child {
              color: #c6d1db;
            }

            span:last-child {
              font-family: Bicubik;
              font-size: 20px;
            }
          }
        }
      }

      #mapChart {
        width: 100%;
        height: 100%;
      }

      .pj_ify {
        width: 25%;
        padding: 10px;

        ul {
          overflow: auto;
          height: 100%;

          li {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            height: 30px;
            align-items: center;
            cursor: pointer;
            color: #c6d1db;
          }

          .active::before {
            content: url("@/assets/images/dashboard/Vector347.png");
            margin-right: 10px;
            position: absolute;
            left: -21px;
            top: 10px;
          }

          .active {
            position: relative;
            background: url(@/assets/images/dashboard/Frame24.png) no-repeat;
            background-size: 100% 100%;
            color: #0eb6f6;
          }

          li:hover {
            position: relative;
            background: url(@/assets/images/dashboard/Frame24.png) no-repeat;
            background-size: 100% 100%;
            color: #0eb6f6;
          }

          li:hover::before {
            content: url("@/assets/images/dashboard/Vector347.png");
            margin-right: 10px;
            position: absolute;
            left: -21px;
            top: 10px;
          }
        }
      }
    }
  }

  .bt {
    padding: 0 10px;
    height: 320px;
    display: flex;
    justify-content: space-between;

    .item_block {
      width: 32%;

      .handle_row {
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        align-items: center;
        margin-top: 10px;

        ul {
          display: flex;

          li {
            padding: 2px 10px;
            border: 1px solid #1890ff;
            color: #1890ff;
            cursor: pointer;
          }

          .active {
            background: #1890ff;
            color: #fff;
          }
        }

        .mk {
          font-family: Bicubik;
        }
      }

      .chart_item {
        height: calc(100% - 76px);
        width: 100%;
      }

      #flunkWrap {
        ul {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          height: 100%;
          width: 100%;
          margin-top: 10px;

          li {
            text-align: center;
            background: rgba(76, 4, 4, 0.3);
            padding: 10px 20px;

            p:first-child {
              font-family: Bicubik;
              font-size: 25px;
              padding: 10px;
            }

            p:last-child {
              padding: 10px;
            }
          }
        }
      }
    }
  }
}

// .fullScreen {
//   position: fixed !important;
//   width: 100vw !important;
//   height: 100vh !important;
//   top: 0 !important;
//   left: 0 !important;
//   background: #fff;
// }
</style>
