<template>
  <div style="padding-bottom: 30px">
    <van-sticky>
      <MobileTitleBar class="left-title" title="首页">
      </MobileTitleBar>
    </van-sticky>
    <!-- 统计一览表 -->
    <div class="data-statistics">
      <van-row>
        <van-col v-for="(item, i) in statisticsDatas" :key="i" span="8">
          <p class="number">
            {{ item.numMain || 0 }}
          </p>
          <span class="title">{{ item.name }}</span>
        </van-col>
      </van-row>
    </div>
    <!--  合同执行情况  -->
    <div class="page-card">
      <p class="title">
        合同执行情况
      </p>
      <div id="contractInfo" class="echarts-box"></div>
      <van-row class="contract-total">
        <van-col span="8">
          <p class="number">
            {{ contractData.totalAmount }}
          </p>
          <span class="title">合同总金额(万元)</span>
        </van-col>
        <van-col span="8">
          <p class="number">
            {{ contractData.paidAmount }}
          </p>
          <span class="title">已结清(万元)</span>
        </van-col>
        <van-col span="8">
          <p class="number">
            {{ contractData.arrearsAmount }}
          </p>
          <span class="title">未结清(万元)</span>
        </van-col>
      </van-row>
    </div>
    <!--  营收同比增长情况统计  -->
    <div class="page-card">
      <div class="title">
        营收同比增长情况
        <div class="tab-date">
          <van-tabs v-model:active="active1" type="card" color="#0066EC">
            <van-tab title="近半年"></van-tab>
            <van-tab title="近一年"></van-tab>
          </van-tabs>
        </div>
      </div>
      <div id="revenueInfo" class="echarts-box"></div>
    </div>
    <!--  收样统计  -->
    <div class="page-card">
      <div class="title">
        收样统计
        <div class="tab-date">
          <van-tabs v-model:active="active2" type="card" color="#0066EC">
            <van-tab title="近一周"></van-tab>
            <van-tab title="近半年"></van-tab>
            <van-tab title="近一年"></van-tab>
          </van-tabs>
        </div>
      </div>
      <div id="sampleInfo" class="echarts-box"></div>
    </div>
    <!--  产值&报告统计  -->
    <div class="page-card">
      <div class="title">
        产值&报告
        <div class="tab-date">
          <van-tabs v-model:active="active3" type="card" color="#0066EC">
            <van-tab title="近一周"></van-tab>
            <van-tab title="近半年"></van-tab>
            <van-tab title="近一年"></van-tab>
          </van-tabs>
        </div>
      </div>
      <ul class="tabs-btn">
        <li
          :class="`${testType === '1' ? 'active' : ''} item`"
          @click="changeTabs(1)"
        >
          检测产值
        </li>
        <li
          :class="`${testType === '2' ? 'active' : ''} item`"
          @click="changeTabs(2)"
        >
          检测报告
        </li>
        <li style="float: right; line-height: 30px">
          单位: {{ testType === 1 ? '万元' : '份' }}
        </li>
      </ul>
      <ul>
        <li v-show="testType === '1'" id="productions" class="echarts-box2"></li>
        <li v-show="testType === '2'" id="reports" class="echarts-box2"></li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      active1: 0,
      active2: 0,
      active3: 0,
      statisticsDatas: [],
      contractData: {},
      testType: '1',
    }
  },
  watch: {
    active1() {
      this.getRevenue()
    },
    active2() {
      this.getSampling()
    },
    active3() {
      this.changeTabs(this.testType)
    },
  },
  created() {},
  mounted() {
    this.getOverallSituation()
    this.getContract()
    this.getRevenue()
    this.getSampling()
    this.getProductions()
  },
  methods: {
    // 数据一览
    getOverallSituation() {
      mRequest.get(api.bossHome.overallSituation).then((res) => {
        if (res.code !== 20000) {
          return showToast(res.message || '获取数据失败')
        }
        this.statisticsDatas = res.data
      })
    },
    // 合同执行情况
    async getContract() {
      const res = await mRequest.get(api.bossHome.contract)
      let obj = {}
      if (res.code === 20000) {
        obj = res.data
      }
      else {
        obj = {
          arrearsAmount: '0.00',
          completed: 0,
          paidAmount: '0.00',
          total: 0,
          totalAmount: '0.00',
          uncompleted: 0,
        }
      }
      this.contractData = obj
      const myCharts = echarts.init(document.getElementById('contractInfo'))
      const option = {
        color: ['#3C8AFF', '#ddd'],
        title: {
          text: obj.total,
          left: '30%',
          top: '42%',
          subtext: '合同总数',
          textAlign: 'center',
          subtextStyle: {
            color: '#9AA1A9',
            fontSize: 12,
            fontWeight: 400,
          },
          textStyle: {
            color: '#333',
            fontSize: 16,
            fontWeight: 700,
          },
        },
        legend: {
          top: '5%',
          left: 'right',
          align: 'left',
          orient: 'vertical',
          formatter(name) {
            const num = name === '已完成合同' ? obj.completed : obj.uncompleted
            const arr = [`{a|${name}}`, `{b|${num} 份}`]
            return arr.join('\n')
          },
          textStyle: {
            rich: {
              a: {
                color: '#aaa',
                padding: [0, 0, 10, 0],
              },
              b: {
                fontSize: 16,
                padding: [0, 0, 10, 0],
              },
            },
          },
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            name: '合同执行情况',
            type: 'pie',
            center: ['30%', '50%'],
            radius: ['45%', '70%'],
            label: {
              show: false,
              position: 'inner',
              formatter: '{c}',
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: Number.parseFloat(obj.completed), name: '已完成合同' },
              { value: Number.parseFloat(obj.uncompleted), name: '未完成合同' },
            ],
          },
        ],
      }
      myCharts.setOption(option)
    },
    // 营收同比增长情况统计
    async getRevenue() {
      // 1.近一年, 2.近半年
      const timeType = this.active1 === 0 ? 2 : 1
      const res = await mRequest.get(
        `${api.bossHome.revenue}?timeType=${timeType}`,
      )
      let datas = []
      if (res.code === 20000) {
        datas = res.data || []
      }
      const xData = this.getIntervalTime(timeType)
      datas = xData.map((d) => {
        const obj = datas.find(item => item.month.trim() === d)
        return obj || {
          amount: 0,
          increaseRate: 0,
          lastYearAmount: 0,
          month: d,
        }
      })
      const myCharts = echarts.init(document.getElementById('revenueInfo'))
      const option = {
        color: ['#3C8AFF', '#09D28A', '#F59064'],
        legend: {
          bottom: '2%',
          left: 'center',
        },
        grid: {
          left: 60,
          right: 45,
          top: 20,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        xAxis: [
          {
            type: 'category',
            data: this.formatXAxis(xData),
            axisLine: {
              show: false,
            },
            axisLabel: {
              color: '#999',
            },
            axisTick: {
              alignWithLabel: true,
              lineStyle: {
                color: '#ccc',
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: false,
            },
            axisLabel: {
              color: '#999',
            },
            axisTick: {
              show: false,
            },
          },
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} %',
              color: '#999',
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: '去年',
            type: 'bar',
            barWidth: 8,
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 0, 0],
              },
            },
            data: datas.map(d => d.lastYearAmount || 0),
          },
          {
            name: '本年',
            type: 'bar',
            barWidth: 8,
            itemStyle: {
              normal: {
                barBorderRadius: [10, 10, 0, 0],
              },
            },
            data: datas.map(d => d.amount || 0),
          },
          {
            name: '增长率',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter(value) {
                return `${value} %`
              },
            },
            data: datas.map(d => d.increaseRate || 0),
          },
        ],
      }
      myCharts.setOption(option)
    },
    // 收样统计
    async getSampling() {
      // 1.近一年, 2.近半年, 3.近一周
      const timeType = this.active2 === 0 ? 3 : this.active2 === 1 ? 2 : 1
      const res = await mRequest.get(
        `${api.bossHome.sampling}?timeType=${timeType}`,
      )
      let datas = []
      if (res.code === 20000) {
        datas = res.data.data || []
      }
      let xData = this.getIntervalTime(timeType)
      datas = xData.map((d) => {
        const obj = datas.find(item => item.chartDataKey.trim() === d)
        return obj ? obj.chartDataValue : 0
      })
      if (timeType !== 3) {
        xData = this.formatXAxis(xData)
      }
      const myCharts = echarts.init(document.getElementById('sampleInfo'))
      const option = {
        color: ['#0066EC'],
        grid: {
          top: 30,
          bottom: 40,
          left: 50,
          right: 10,
        },
        tooltip: {
          trigger: 'axis',
          formatter(par) {
            return `${par[0].axisValue} <br/> 收样数量： ${par[0].data}`
          },
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            rotate: 45,
            color: '#999',
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#999',
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            data: datas,
            type: 'line',
            areaStyle: {
              color: '#E6F0FD',
              opacity: 1,
            },
          },
        ],
      }
      myCharts.setOption(option)
    },
    // 产值
    async getProductions() {
      // 1.近一年, 2.近半年, 3.近一周
      const timeType = this.active3 === 0 ? 3 : this.active3 === 1 ? 2 : 1
      const res = await mRequest.get(
        `${api.bossHome.productions}?timeType=${timeType}`,
      )
      let data = res.data.data || []
      if (data.length > 0) {
        data = data.reverse()
      }
      if (!this.productEchart) {
        this.productEchart = echarts.init(
          document.getElementById('productions'),
        )
      }
      const option = {
        color: ['#3C8AFF', '#09D28A'],
        grid: {
          left: 110,
          top: 20,
          bottom: 5,
        },
        yAxis: [
          {
            type: 'category',
            data: data.map(d => d.chartDataKey),
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        xAxis: {
          show: false,
        },
        series: [
          {
            type: 'bar',
            data: data.map(d => d.chartDataValue),
            barWidth: 8,
            itemStyle: {
              barBorderRadius: [0, 5, 5, 0],
              color(par) {
                return ['#3C8AFF', '#09D28A'][par.dataIndex % 2]
              },
            },
            label: {
              show: true,
              offset: [0, 1],
              position: 'right',
              color: '#333',
            },
          },
        ],
      }
      this.productEchart.setOption(option, true)
    },
    // 报告
    async getReports() {
      // 1.近一年, 2.近半年, 3.近一周
      const timeType = this.active3 === 0 ? 3 : this.active3 === 1 ? 2 : 1
      const res = await mRequest.get(
        `${api.bossHome.reports}?timeType=${timeType}`,
      )
      let datas = []
      if (res.code === 20000) {
        datas = res.data.data || []
      }
      let xData = this.getIntervalTime(timeType)
      datas = xData.map((d) => {
        const obj = datas.find(item => item.chartDataKey.trim() === d)
        return obj ? obj.chartDataValue : 0
      })
      if (timeType !== 3) {
        xData = this.formatXAxis(xData)
      }
      if (!this.reportsEchart) {
        this.reportsEchart = echarts.init(document.getElementById('reports'))
      }
      const option = {
        color: ['#34af30'],
        grid: {
          top: 50,
          bottom: 40,
          left: 50,
          right: 10,
        },
        tooltip: {
          trigger: 'axis',
          formatter(par) {
            return `${par[0].axisValue} <br/> 检测报告： ${par[0].data}`
          },
        },
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            rotate: 45,
            color: '#999',
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#999',
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            data: datas,
            type: 'line',
            areaStyle: {
              color: '#E9F7F1',
              opacity: 1,
            },
          },
        ],
      }
      this.reportsEchart.setOption(option, true)
    },
    changeTabs(k) {
      this.testType = k
      this.$nextTick(() => {
        if (k === 1) {
          this.getProductions()
        }
        else {
          this.getReports()
        }
      })
    },
    // 处理坐标月份显示
    formatXAxis(xData) {
      if (!xData || xData.length < 3)
        return xData
      let py = xData[0].split('-')
      xData[0] = py[1] === '01' ? py[0] : `${Number.parseInt(py[1])}月`
      for (let i = 1; i < xData.length; i++) {
        const y = xData[i].split('-')
        if (y[0] === py[0]) {
          xData[i] = `${Number.parseInt(y[1])}月`
        }
        else {
          py = xData[i].split('-')
          xData[i] = py[1] === '01' ? py[0] : `${Number.parseInt(py[1])}月`
        }
      }
      return xData
    },
    // 获取时间段
    getIntervalTime(type) {
      // 1.近一年, 2.近半年, 3.近一周
      const times = []
      const date = new Date()
      if (type === 3) {
        let now = date.getTime()
        const t = 24 * 3600 * 1000
        for (let i = 0; i < 7; i++) {
          const prevD = new Date(now - t)
          const month = prevD.getMonth() + 1
          const day = prevD.getDate()
          times.unshift(`${this.zero(month)}-${this.zero(day)}`)
          now = prevD.getTime()
        }
      }
      else {
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        const n = type === 1 ? 12 : 6
        for (let i = 0; i < n; i++) {
          month--
          if (month < 1) {
            month = 12
            year--
          }
          times.unshift(`${year}-${this.zero(month)}`)
        }
      }
      return times
    },
    zero(m) {
      return m < 10 ? `0${m}` : m
    },
  },
}
</script>

<style lang="less" scoped>
.mg-t {
  margin-top: 10px;
}
.data-statistics {
  padding: 12px;
  width: 100%;
  height: auto;
  background: linear-gradient(#154bd0, #fff 65%);
  .van-row {
    padding: 10px 0;
    background-color: #fff;
    border-radius: 4px;
    text-align: center;
    box-shadow: 0 0 10px rgba(1, 1, 1, 0.05);
  }

  .van-col:nth-child(n + 4) {
    margin-top: 10px;
  }

  .number {
    font-size: 20px;
    color: #0066ec;
    font-weight: 600;
  }

  .title {
    font-size: 12px;
    color: #666;
  }
}
.echarts-box {
  height: 240px;
}
.echarts-box2 {
  height: 280px;
}
.page-card {
  margin-top: 10px;
  padding: 10px;
  background-color: #fff;
  & > .title {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 30px;
  }

  .tab-date {
    float: right;

    .van-tabs__nav--card {
      margin: 0;
    }
  }
}
.contract-total {
  padding: 15px 10px;
  border-radius: 8px;
  background-color: #f5f5f5;
  text-align: center;
  .number {
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 600;
  }

  .title {
    font-size: 12px;
    color: #666;
  }
}
.tabs-btn {
  margin-top: 20px;
  .item {
    display: inline-block;
    padding: 5px 12px;
    margin-right: 5px;
    background-color: #f5f5f5;
    border-radius: 8px;
    transition: 0.1s;

    &.active {
      background-color: #0066ec;
      color: #fff;
    }
  }
}
</style>
