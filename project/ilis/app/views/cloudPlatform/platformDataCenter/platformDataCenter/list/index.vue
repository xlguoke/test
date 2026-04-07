<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="data-center-wrap">
    <div
      class="title"
      :class="{
        'title-hbrd': isHBRD,
      }"
    >
      <span v-if="!isThirdParty && !isHBRD" class="title-con">欢迎使用！</span>
      <span class="title-con time">{{ nowDateTime }}</span>
    </div>
    <div v-if="isThirdParty" class="back-btn" @click="onBack">
      <LeftOutlined />返回
    </div>
    <div class="content">
      <div id="threeModel" class="center-map"></div>
      <ul v-if="false" class="nav-wrap">
        <li
          v-for="(nav, i) in navData"
          :key="i"
          :class="`nav-item ${navIndex == i ? 'active' : ''}`"
        >
          {{ nav.title }}
        </li>
      </ul>
      <ul class="content-item left">
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            机构概况
          </h3>
          <div class="echarts-content">
            <ul class="org-survey">
              <li class="org-survey-item">
                <p class="num">
                  {{ orgOverviewData.peopleNum }}
                </p>
                <p class="title">
                  人数
                </p>
              </li>
              <li class="org-survey-item">
                <p class="num">
                  {{ orgOverviewData.paramNum }}
                </p>
                <p class="title">
                  参数
                </p>
              </li>
              <li class="org-survey-item">
                <p class="num">
                  {{ orgOverviewData.equipmentNum }}
                </p>
                <p class="title">
                  设备数量(台/套)
                </p>
              </li>
              <li class="org-survey-item">
                <p class="num">
                  {{ orgOverviewData.standardNum }}
                </p>
                <p class="title">
                  规程(本)
                </p>
              </li>
            </ul>
          </div>
        </li>
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            运营概况
          </h3>
          <div class="echarts-content">
            <ul class="operate-survey">
              <li class="operate-survey-item">
                <span class="num">{{ manageOverviewData.customer.total }}</span>
                个客户 / 新增
                <span class="add-num">{{
                  manageOverviewData.customer.addition
                }}</span>
                个
              </li>
              <li class="operate-survey-item">
                <span class="num">{{ manageOverviewData.project.total }}</span>
                个项目 / 新增
                <span class="add-num">{{
                  manageOverviewData.project.addition
                }}</span>
                个
              </li>
              <li class="operate-survey-item">
                <span class="num">{{ manageOverviewData.contract.total }}</span>
                份合同 / 新增
                <span class="add-num">{{
                  manageOverviewData.contract.addition
                }}</span>
                份
              </li>
              <li class="operate-survey-item">
                支付比例：
                <span class="scale">{{
                  manageOverviewData.fee.paidProportion
                }}</span>
                %， 结算比例：
                <span class="scale">{{
                  manageOverviewData.fee.settlementProportion
                }}</span>
                %
              </li>
            </ul>
          </div>
        </li>
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            委托趋势
          </h3>
          <div class="echarts-content">
            <div id="consignTendency" class="echarts-box"></div>
          </div>
        </li>
      </ul>
      <div class="content-item middle">
        <ul class="content-sub-item">
          <li class="content-echarts-item">
            <h3 class="echarts-title">
              个人产值排行
            </h3>
            <div class="echarts-content">
              <ul class="production-top">
                <li v-for="(d, i) in productionDatas1" :key="i" class="item">
                  <span
                    v-if="i <= 2"
                    :class="`order-num order-num-bg-${i + 1}`"
                  ></span>
                  <span v-else class="order-num">{{ i + 1 }}</span>
                  <span class="name">{{ d.name }}</span>
                  <span class="production">{{ d.value }}</span>
                </li>
              </ul>
            </div>
          </li>
          <li class="content-echarts-item">
            <h3 class="echarts-title">
              部门产值排行
            </h3>
            <div class="echarts-content">
              <ul class="production-top">
                <li v-for="(d, i) in productionDatas2" :key="i" class="item">
                  <span
                    v-if="i <= 2"
                    :class="`order-num order-num-bg-${i + 1}`"
                  ></span>
                  <span v-else class="order-num">{{ i + 1 }}</span>
                  <span class="name">{{ d.name }}</span>
                  <span class="production">{{ d.value }}</span>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
      <ul class="content-item right">
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            样品统计
          </h3>
          <div class="echarts-content">
            <div class="sample-staticis-wrap">
              <ul class="sample-staticis">
                <li class="item">
                  <p class="num">
                    {{ sampleDatas.total }}
                  </p>
                  <p class="type">
                    全部样品
                  </p>
                </li>
                <li class="item">
                  <p class="num">
                    {{ sampleDatas.testing }}
                  </p>
                  <p class="type">
                    在检样品
                  </p>
                </li>
                <li class="item">
                  <p class="num">
                    {{ sampleDatas.retention }}
                  </p>
                  <p class="type">
                    留样中
                  </p>
                </li>
                <li class="item">
                  <p class="num">
                    {{ sampleDatas.waiting }}
                  </p>
                  <p class="type">
                    待检样品
                  </p>
                </li>
              </ul>
              <p v-if="isHBRD" class="sample-status-title">
                标养室信息
              </p>
              <ul class="sample-status clearfix">
                <li class="item">
                  标养中：
                  <span class="num">{{ sampleDatas.normal }}组</span>
                </li>
                <li class="item">
                  今日到期：
                  <span class="num">{{ sampleDatas.today }}组</span>
                </li>
                <li class="item">
                  3天到期：
                  <span class="num">{{ sampleDatas.threeDays }}组</span>
                </li>
                <li class="item">
                  7天到期：
                  <span class="num">{{ sampleDatas.sevenDays }}组</span>
                </li>
              </ul>
              <ul class="sample-environment clearfix">
                <li class="item">
                  温度：
                  <span class="num">{{ sampleDatas.temperature }}℃</span>
                </li>
                <li class="item">
                  湿度：
                  <span class="num">{{ sampleDatas.humidity }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </li>
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            报告统计
          </h3>
          <div class="echarts-content">
            <div class="sample-staticis-wrap report-staticis">
              <ul class="sample-status clearfix">
                <li class="item">
                  今日完成：
                  <span class="num">{{ reportDatas.today }}</span>
                </li>
                <li class="item">
                  本周完成：
                  <span class="num">{{ reportDatas.week }}</span>
                </li>
                <li class="item">
                  本月完成：
                  <span class="num">{{ reportDatas.month }}</span>
                </li>
                <li class="item">
                  本年完成：
                  <span class="num">{{ reportDatas.year }}</span>
                </li>
              </ul>
              <ul :class="`report-list ${isAnimate ? 'animate' : ''}`">
                <li v-for="d in reportList" class="report-item">
                  <span class="name">{{ d.person }}</span>
                  <span class="con">出具了{{ d.name }}报告 </span>
                  <span class="date">{{
                    formatTime(d.signDate, 'YYYY-MM-DD')
                  }}</span>
                </li>
              </ul>
            </div>
          </div>
        </li>
        <li class="content-echarts-item">
          <h3 class="echarts-title">
            合格率趋势
            <div class="echart-legend">
              <p class="line">
                合格率
              </p>
              <p class="bar">
                数量
              </p>
            </div>
          </h3>
          <div class="echarts-content">
            <div id="percentOfPass" class="echarts-box"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { LeftOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import * as THREE from 'three'
// 导入轨道模型控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { formatTime, getQueryVariable } from '~/providers/common/utils'

let scene

export default {
  components: {
    LeftOutlined,
  },
  data() {
    return {
      formatTime,
      loadPage: true,
      isAnimate: false,
      model_container: null,
      camera: null, // 相机对象
      scene: null, // 场景对象
      renderer: null, // 渲染器对象
      mesh: null, // 网格模型对象Mesh
      controls: null,
      nowDateTime: '',
      navIndex: 0,
      navData: [
        { title: '材料与制品', code: '' },
        { title: '实体结构', code: '' },
        { title: '监控测量', code: '' },
        { title: '交竣工检测', code: '' },
        { title: '定期检测', code: '' },
        { title: '健康检测', code: '' },
      ],
      orgOverviewData: {
        peopleNum: 0,
        paramNum: 0,
        equipmentNum: 0,
        standardNum: 0,
      },
      manageOverviewData: {
        customer: {
          total: 0,
          addition: 0,
        },
        project: {
          total: 0,
          addition: 0,
        },
        contract: {
          total: 0,
          addition: 0,
        },
        fee: {
          paidProportion: 0,
          settlementProportion: 0,
        },
      },
      consignLineChartData: [],
      qualifiedRateEchartsData: [],
      productionDatas1: [{}, {}, {}, {}, {}],
      productionDatas2: [{}, {}, {}, {}, {}],
      sampleDatas: {
        total: 0,
        testing: 0,
        retention: 0,
        waiting: 0,
        normal: 0,
        sevenDays: 0,
        threeDays: 0,
        today: 0,
        temperature: 0,
        humidity: 0,
      },
      reportDatas: {
        total: 0,
        week: 0,
        month: 0,
        today: 0,
      },
      reportList: [],
      startTime: null,
      timer: null,
      reportTimer: null,
      isHBRD: getQueryVariable('unitCode') === 'hbrd',
      isThirdParty: getQueryVariable('isThirdParty') === '1',
    }
  },
  computed: {
    isSkipAuth() {
      return this.isHBRD
    },
    modelName() {
      if (this.isHBRD) {
        return 'hbrd.gltf'
      }

      return 'gfzx.gltf'
    },
  },
  created() {
    document.title = '智慧试验检测质量管理控制云平台'
  },
  mounted() {
    this.initPageScale()
    this.getNowDate()
    setInterval(() => {
      this.getNowDate()
    }, 1000)

    setInterval(() => {
      this.getDatas()
    }, 600000)

    this.initThree()
    this.getDatas()

    window.onresize = () => {
      if (this.startTime && new Date().getTime() - this.startTime < 1000)
        return
      this.startTime = new Date().getTime()
      window.location.reload()
    }
  },
  methods: {
    // 格式化api地址
    // 湖北瑞达在大屏上展示，不需要登录，需要对请求做处理
    formatApi(url) {
      let newUrl = url

      if (this.isSkipAuth) {
        newUrl = newUrl.replace(/\/rest/, '/api')
        if (!newUrl.includes('?')) {
          newUrl += `?companyId=${getQueryVariable('unitCode')}`
        }
        else {
          newUrl += `&companyId=${getQueryVariable('unitCode')}`
        }
        return newUrl
      }

      return newUrl
    },
    onBack() {
      try {
        parent.backRouter && parent.backRouter()
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    // 获取当前时间
    getNowDate() {
      const t = formatTime(new Date().getTime(), 'YYYY.MM.DD HH:mm:ss')
      this.nowDateTime = t
    },
    // 视口与设计稿宽度比例
    initPageScale() {
      const scaleW = (window.innerWidth || document.body.clientWidth) / 1920
      const scaleH = (window.innerHeight || document.body.clientHeight) / 1080
      const size = Math.min(scaleW, scaleH) * 20
      document.querySelector('html').style.fontSize = `${size}px`
    },
    // 初始化
    initThree() {
      this.createScene() // 创建场景
      this.loadGLTF() // 加载GLTF模型
      this.createLight() // 创建光源
      this.createCamera() // 创建相机
      this.createRender() // 创建渲染器
      this.createControls() // 创建控件对象
      this.render() // 渲染
    },
    // 创建场景
    createScene() {
      scene = new THREE.Scene()
    },
    // 加载GLTF模型
    loadGLTF() {
      const loader = new GLTFLoader()
      loader.load(`/ilis2/plug-in/feStatic/model/${this.modelName}`, (model) => {
        const mesh = model.scene
        mesh.position.set(-50, -15, -30)
        // this.addRoad(mesh)
        scene.add(mesh)
      })
    },
    addRoad() {
      const geometryLine = new THREE.BufferGeometry()
      const p3 = new THREE.Vector3(100, 10, 10)
      const p4 = new THREE.Vector3(10, 10, 100)
      const line2 = new THREE.LineCurve3(p3, p4)
      const points = line2.getPoints(100)
      geometryLine.setFromPoints(points)
      const material1 = new THREE.LineBasicMaterial({ color: 0xFF0000 })
      const line = new THREE.Line(geometryLine, material1)
      scene.add(line)

      const geometry = new THREE.PlaneGeometry(100, 10)
      const material = new THREE.MeshLambertMaterial({
        color: 0xAAAAAA,
      })
      const planeMesh = new THREE.Mesh(geometry, material)
      planeMesh.rotateX(-Math.PI / 2)
      planeMesh.position.set(-10, 0, 30)
      scene.add(planeMesh)
    },
    // 创建光源
    createLight() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3) // 创建环境光
      scene.add(ambientLight) // 将环境光添加到场景
      const spotLight = new THREE.SpotLight(0xFFFFFF) // 创建聚光灯
      spotLight.position.set(150, 240, 120)
      spotLight.castShadow = true
      scene.add(spotLight)
    },
    // 创建相机
    createCamera() {
      const element = document.getElementById('threeModel')
      const width = element.clientWidth // 窗口宽度
      const height = element.clientHeight // 窗口高度
      const k = width / height // 窗口宽高比
      this.camera = new THREE.PerspectiveCamera(40, k, 0.1, 1000)
      if (this.isHBRD) {
        this.camera.position.set(0, 80, 130) // 设置相机位置
      }
      else {
        this.camera.position.set(120, 80, 130) // 设置相机位置
      }
      this.camera.lookAt(new THREE.Vector3(0, 0, 0)) // 设置相机方向
      scene.add(this.camera)
    },
    // 创建渲染器
    createRender() {
      const element = document.getElementById('threeModel')
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(element.clientWidth, element.clientHeight) // 设置渲染区域尺寸
      this.renderer.shadowMap.enabled = true // 显示阴影
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.setClearColor(0x021228, 1) // 设置背景颜色
      // this.renderer.setClearAlpha(0.3) // 透明度
      element.appendChild(this.renderer.domElement)
    },
    render() {
      if (this.mesh) {
        this.mesh.rotation.z += 0.006
      }
      this.renderer.render(scene, this.camera)
      requestAnimationFrame(this.render)
    },
    // 创建控件对象
    createControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // 能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为0
      this.controls.maxPolarAngle = 1.2
      // 能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0
      this.controls.minPolarAngle = 0
      // 水平旋转角度
      // this.controls.maxAzimuthAngle = 1.5
      // this.controls.minAzimuthAngle = -1.5
      this.controls.enablePan = false // 禁止右键拖拽
      // this.controls.enableZoom = false; //禁止缩放
      this.controls.maxDistance = 240 // 相机距离观察目标点极大距离——模型最小状态
      this.controls.minDistance = 120 // 相机距离观察目标点极小距离——模型最大状态
    },
    getDatas() {
      this.getOrgOverview()
      this.getManageOverview()
      this.getConsignLineChart()
      this.getProductionRanking()
      this.getSampleStatistics()
      this.getReportStatistics()
      this.getQualifiedRate()
    },
    initEcharts() {
      window.$oNextTick(() => {
        this.consignTendency()
        this.renderPercentOfPass()
      })
    },
    // 机构概况
    getOrgOverview() {
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.orgOverview))
        .then((res) => {
          if (this.isSkipAuth) {
            this.numAnimate(this.orgOverviewData, res, (data) => {
              this.orgOverviewData = data
            })
            return
          }

          if (res.code !== 20000)
            return
          this.numAnimate(this.orgOverviewData, res.data, (data) => {
            this.orgOverviewData = data
          })
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
    },
    // 数字自增效果
    numAnimate(num1, num2, fn) {
      const step = {}
      let timer = null
      const timerObj = {}

      ;(function add() {
        for (const k in num1) {
          const sub = Number(num2[k]) - Number(num1[k])
          if (!step[k]) {
            step[k] = Number.parseInt(Math.max(30, sub / 15))
          }
          if (sub > 0) {
            num1[k] = Number(num1[k]) + step[k]
            if (num1[k] > num2[k]) {
              num1[k] = num2[k]
            }
          }
          else if (sub < 0) {
            num1[k] = Number(num1[k]) - step[k]
            if (num1[k] < num2[k]) {
              num1[k] = num2[k]
            }
          }
          else if (sub === 0) {
            timerObj[k] = true
            num1[k] = num2[k]
          }
        }

        for (const k in num1) {
          if (!timerObj[k]) {
            fn && fn(num1)
            timer = setTimeout(() => {
              add()
            }, 100)
            return
          }
        }

        clearTimeout(timer)
      })()
    },
    // 运营概况
    getManageOverview() {
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.manageOverview))
        .then((res) => {
          if (this.isSkipAuth) {
            for (const k in res) {
              this.numAnimate(this.manageOverviewData[k], res[k], (data) => {
                this.manageOverviewData[k] = data
              })
            }
            return
          }

          if (res.code !== 20000)
            return
          for (const k in res.data) {
            this.numAnimate(this.manageOverviewData[k], res.data[k], (data) => {
              this.manageOverviewData[k] = data
            })
          }
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
    },
    // 委托趋势
    async getConsignLineChart() {
      const chartDom = document.getElementById('consignTendency')
      const myChart = echarts.init(chartDom)
      myChart.showLoading({
        color: '#7ca6e7',
        textColor: '#7ca6e7',
        maskColor: 'rgba(255, 255, 255, 0.2)',
      })
      try {
        const res = await window.$oAjax.get(
          this.formatApi(window.$oApi.platform.consignLineChart),
        )

        if (this.isSkipAuth) {
          this.consignLineChartData = res
        }
        else {
          if (res.code === 20000) {
            this.consignLineChartData = res.data
          }
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message)
      }
      myChart.hideLoading()
      this.consignTendency(myChart)
    },
    // 委托趋势 - echarts
    consignTendency(myChart) {
      let xData = ['']
      let yData = [0]
      if (this.consignLineChartData.length > 0) {
        xData = this.consignLineChartData.map(d => d.cycle)
        yData = this.consignLineChartData.map(d => d.amount)
      }
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          top: 30,
          right: 20,
          bottom: 40,
          left: 50,
        },
        xAxis: {
          type: 'category',
          data: xData,
          boundaryGap: false,
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#3F4F5E',
            },
          },
          axisLabel: {
            color: 'rgba(155,208,255,0.7)',
            rotate: 25,
          },
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false,
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(155,208,255,0.1)',
              type: 'dashed',
            },
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: 'rgba(155,208,255,0.7)',
          },
        },
        series: [
          {
            data: yData,
            type: 'line',
            smooth: true,
            color: '#29F1FA',
            showSymbol: false,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(41, 241, 250, 0)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(41, 241, 250, 0.5)',
                  },
                ],
              },
            },
          },
        ],
      })
    },
    // 产值排行
    getProductionRanking() {
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.personOutput))
        .then((res) => {
          if (this.isSkipAuth) {
            this.productionDatas1 = res
            return
          }
          if (res.code !== 20000)
            return
          this.productionDatas1 = res.data
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.deptOutput))
        .then((res) => {
          if (this.isSkipAuth) {
            this.productionDatas2 = res
            return
          }
          if (res.code !== 20000)
            return
          this.productionDatas2 = res.data
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
    },
    // 样品统计
    getSampleStatistics() {
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.sampleStatistics))
        .then((res) => {
          if (this.isSkipAuth) {
            this.numAnimate(this.sampleDatas, res, (data) => {
              this.sampleDatas = data
            })
            return
          }

          if (res.code !== 20000)
            return
          this.numAnimate(this.sampleDatas, res.data, (data) => {
            this.sampleDatas = data
          })
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
    },
    // 报告统计
    getReportStatistics() {
      window.$oAjax
        .get(this.formatApi(window.$oApi.platform.reportStatistics))
        .then((res) => {
          if (this.isSkipAuth) {
            this.numAnimate(this.reportDatas, res, (data) => {
              this.reportDatas = data
            })
            this.reportList = res.items || []
            this.scrollData()
            return
          }

          if (res.code !== 20000)
            return
          this.numAnimate(this.reportDatas, res.data, (data) => {
            this.reportDatas = data
          })
          this.reportList = res.data.items || []
          this.scrollData()
        })
        .catch((err) => {
          window.$oAntdMessage.error(err.message)
        })
    },
    // 滚动报告数据
    scrollData() {
      if (this.reportList.length <= 4)
        return

      this.reportTimer && clearInterval(this.reportTimer)
      this.reportTimer = setInterval(() => {
        this.isAnimate = true
        const timer = setTimeout(() => {
          this.isAnimate = false
          const item = this.reportList.shift()
          this.reportList.push({ ...item })
          clearTimeout(timer)
        }, 1000)
      }, 5000)
    },
    // 合格率趋势
    async getQualifiedRate() {
      const chartDom = document.getElementById('percentOfPass')
      const myChart = echarts.init(chartDom)
      myChart.showLoading({
        color: '#7ca6e7',
        textColor: '#7ca6e7',
        maskColor: 'rgba(255, 255, 255, 0.2)',
      })
      try {
        const res = await window.$oAjax.get(
          this.formatApi(window.$oApi.platform.qualifiedRate),
        )
        if (this.isSkipAuth) {
          this.qualifiedRateEchartsData = res
        }
        else {
          if (res.code === 20000) {
            this.qualifiedRateEchartsData = res.data
          }
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message)
      }
      myChart.hideLoading()
      this.renderPercentOfPass(myChart)
    },
    // 合格率趋势 - echarts
    renderPercentOfPass(myChart) {
      let xData = ['']
      let yData = [0]
      let y2Data = [0]
      if (this.qualifiedRateEchartsData.length > 0) {
        xData = this.qualifiedRateEchartsData.map(d => d.cycle)
        yData = this.qualifiedRateEchartsData.map(d => d.total)
        y2Data = this.qualifiedRateEchartsData.map(d => d.rate)
      }
      myChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter(data) {
            let val1 = data[0].value
            const val2 = `${data[1].value}%`
            val1 = val1 < 10000 ? val1 : `${Number.parseInt(val1 / 1000)}K`
            return `<p>${data[0].seriesName}：${val1}</p><p>${data[1].seriesName}：${val2}</p>`
          },
        },
        grid: {
          top: 40,
          right: 56,
          bottom: 40,
          left: 60,
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#3F4F5E',
            },
          },
          axisLabel: {
            color: 'rgba(155,208,255,0.7)',
            rotate: 25,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: '检测数量',
            nameTextStyle: {
              color: 'rgba(155,208,255,0.7)',
            },
            min: 0,
            axisLabel: {
              color: 'rgba(155,208,255,0.7)',
              formatter(val) {
                return val > 10000 ? `${Number.parseInt(val / 1000)}K` : val
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(155,208,255,0.1)',
                type: 'dotted',
              },
            },
            axisLine: {
              show: false,
            },
          },
          {
            type: 'value',
            name: '合格率',
            nameTextStyle: {
              color: 'rgba(155,208,255,0.7)',
            },
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: {
              color: 'rgba(155,208,255,0.7)',
              formatter: '{value}%',
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(155,208,255,0.1)',
                type: 'dashed',
              },
            },
            axisLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: '检测数量',
            type: 'bar',
            barWidth: 18,
            data: yData,
            color: {
              x: 1,
              y: 1,
              colorStops: [
                {
                  offset: 1,
                  color: 'rgba(7, 206, 250, 1)',
                },
                {
                  offset: 0,
                  color: 'rgba(0,85,255,0)',
                },
              ],
            },
          },
          {
            name: '合格率',
            type: 'line',
            yAxisIndex: 1,
            color: '#29F1FA',
            data: y2Data,
          },
        ],
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
