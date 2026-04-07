<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-parsing-error -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15" type="flex" align="middle">
          <a-col>
            <a-form-item>
              <label class="hitek-form-label">统计周期：</label>
              <a-radio-group
                v-model:value="formState.durationType"
                name="durationType"
                @change="changeDurationType"
              >
                <a-radio
                  v-for="(item, index) in durationTypeData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <label class="hitek-form-label">统计时间：</label>
              <span v-if="durationType == 1000 || durationType == ''">
                <a-select
                  v-model:value="formState.range"
                  style="width: 200px"
                >
                  <a-select-option v-for="item in yearData" :key="item.value">{{
                    item.name
                  }}</a-select-option>
                </a-select>
              </span>
              <span v-else-if="durationType == 2000">
                <a-month-picker @change="changeRange" />
              </span>
              <span v-else-if="durationType == 3000">
                <a-week-picker @change="changeRange" />
              </span>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="search">
                查询
              </a-button>
              <a-button class="toolBtn-bar" @click="reset">
                重置
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div
      id="chart"
      style="
        width: 100%;
        height: 400px;
        border: solid 1px #e2e2e2;
        margin-bottom: 15px;
      "
    ></div>
    <p>
      <u> <a href="#" @click="goDetail"><<< 查看数据详情</a></u>
    </p>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const chartOption = {
  title: {
    text: '报告发放统计',
    left: 'center',
    top: 20,
    textStyle: {
      fontSize: 20,
      fontWeight: 'normal',
    },
  },
  grid: {
    top: 70,
    left: 80,
    right: 30,
    bottom: 40,
  },
  tooltip: {},
  series: [
    {
      data: [],
      type: 'pie',
      radius: '55%',
      // itemStyle: {
      //     color: '#1890ff'
      // },
      name: '委托数量',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      itemStyle: {
        normal: {
          label: {
            show: true,
            formatter: '{b} : {c}',
          },
          labelLine: { show: false },
        },
      },
      // color: ['#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
    },
  ],
}

let chartEle = null

export default {
  data() {
    return {
      formState: {
        durationType: 1000,
        range: new Date().getFullYear(),
      },
      loading: false,
      durationTypeData: [
        { name: '年', value: 1000 },
        { name: '月', value: 2000 },
        { name: '周', value: 3000 },
      ],
      dateFormat: 'YYYY-MM-DD',
      yearData: [],
      durationType: '',
      range: '',
      queryParams: null,
    }
  },
  created() {},
  mounted() {
    this.getData(this.formState)

    const year = new Date().getFullYear()
    this.yearData = Array.from({ length: 10 }).fill(year).map((item, index) => ({
      name: year - index,
      value: year - index,
    }))

    chartEle = echarts.init(document.getElementById('chart'))

    window.onresize = function () {
      chartEle.resize()
    }
  },
  methods: {
    getData(params) {
      this.queryParams = params
      this.loading = true
      window.$oAjax
        .get(window.$oApi.reportGrantStatistics.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            chartOption.series[0].data = res.data.map(item => ({
              value: item.wayCount,
              name: item.issueWay,
            }))
            chartEle.clear()
            this.buildEcharts()
            this.loading = false
          }
        })
    },
    goDetail() {
      this.search()
      let signDateStart = ''
      let signDateEnd = ''
      if (this.queryParams.durationType === 1000) {
        // 年
        signDateStart = `${this.queryParams.range}-01-01`
        signDateEnd = `${this.queryParams.range}-12-31`
      }
      else if (this.queryParams.durationType === 2000) {
        // 月
        const dateArr = this.queryParams.range.split(',')
        signDateStart = dateArr[0]
        signDateEnd = dateArr[1]
      }
      else if (this.queryParams.durationType === 3000) {
        // 周
        const dateArr = this.queryParams.range.split(',')
        signDateStart = dateArr[0]
        signDateEnd = dateArr[1]
      }
      const url = `reportIssueController.do?goListPage&dataType=1
      &signDateStart=${encodeURI(signDateStart)}&signDateEnd=${encodeURI(
        signDateEnd,
      )}`

      if (top.addTabs) {
        top.addTabs({
          id: '1',
          title: '报告发放',
          close: false,
          url,
        })
      }
    },
    changeDurationType(e) {
      this.range = ''
      this.durationType = e.target.value
    },
    changeRange(value, value2) {
      if (this.durationType == 2000) {
        const firstDate = new Date(value2)
        firstDate.setDate(1)
        const endDate = new Date(firstDate)
        endDate.setMonth(firstDate.getMonth() + 1)
        endDate.setDate(0)
        this.range = `${dayjs(firstDate).format('YYYY-MM-DD')},${dayjs(
          endDate,
        ).format('YYYY-MM-DD')}`
      }
      else if (this.durationType == 3000) {
        const firstDate = dayjs(value).weekday(0).format('YYYY-MM-DD')
        const endDate = dayjs(value).weekday(6).format('YYYY-MM-DD')
        this.range = `${firstDate},${endDate}`
      }
    },
    search() {
      const data = { ...this.formState }
      if (this.durationType == 2000 || this.durationType == 3000) {
        if (this.range == '') {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择统计日期'))
          return
        }
        data.range = this.range
      }

      this.getData(data)
    },
    reset() {
      this.formState = {
        durationType: 1000,
        range: new Date().getFullYear(),
      }
      this.range = ''
      this.durationType = 1000
      this.getData(this.formState)
    },
    buildEcharts() {
      chartEle.setOption(chartOption)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
#chart canvas {
  cursor: pointer;
}
</style>
