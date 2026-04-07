<!-- eslint-disable vue/no-parsing-error -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15" style="margin-bottom: 15px">
          <a-col span="8">
            <a-form-item
              label="统计类型"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-radio-group
                v-model:value="formState.queryType"
                name="queryType"
              >
                <a-radio
                  v-for="(item, index) in queryTypeData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="统计周期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
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
          <a-col span="8">
            <a-form-item
              label="统计时间"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
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
          <a-col span="8">
            <a-row>
              <a-col span="19" offset="5">
                <a-button @click="search">
                  查询
                </a-button>
                <a-button @click="reset">
                  重置
                </a-button>
              </a-col>
            </a-row>
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
      <u> <a href="#" class="text-blue-500 text-sm" @click="goDetail"><<< 查看数据详情</a></u>
    </p>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as echarts from 'echarts'

const chartOption = {
  title: {
    text: '',
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
  xAxis: {
    type: 'category',
    data: [],
    axisTick: { show: false },
    splitLine: { show: false },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  yAxis: {
    type: 'value',
    axisTick: { show: false },
    name: '',
    nameTextStyle: {
      color: '#aaa',
    },
  },
  graphic: {
    elements: [],
  },
  series: [
    {
      data: [],
      type: 'line',
      itemStyle: {
        color: '#1890ff',
      },
      name: '委托数量',
      barMaxWidth: 50,
      label: {
        normal: {
          show: true,
          position: 'top',
        },
      },
    },
    {
      data: [],
      type: 'line',
      itemStyle: {
        color: '#f60',
      },
      name: '样品数量',
      barMaxWidth: 50,
      label: {
        normal: {
          show: true,
          position: 'top',
        },
      },
    },
  ],
}

let chartEle = null

export default {
  data() {
    return {

      columns: [
        {
          title: '日期',
          dataIndex: 'day',
          width: '50%',
        },
        {
          title: '委托数量',
          dataIndex: 'count',
          width: '50%',
        },
      ],
      page: 1,
      size: 10,
      loading: false,
      geturl: 'getCountData',
      queryTypeData: [
        { name: '委托数量统计', value: 'getCountData' },
        { name: '委托费用统计', value: 'getFeeData' },
      ],
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
      formState: {
        queryType: 'getCountData',
        durationType: 1000,
        range: new Date().getFullYear(),
      },
    }
  },
  created() {},
  mounted() {
    this.getData({
      durationType: 1000,
      range: new Date().getFullYear(),
    })

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
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, projectName } = this
      this.queryParams = params
      this.loading = true
      window.$oAjax
        .get(window.$oApi.consignInfoStatistic[this.geturl], { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            const durationType = this.formState.durationType
            if (durationType == 1000) {
              this.columns[0].dataIndex = 'month'
              chartOption.xAxis.data = res.data.map(
                item => item.month || item.monthRange,
              )
            }
            else {
              this.columns[0].dataIndex = 'day'
              chartOption.xAxis.data = res.data.map(
                item => item.day || item.dayRange,
              )
            }
            if (this.geturl === 'getCountData') {
              chartOption.title.text = ''
              chartOption.series[0].data = res.data.map(
                item => item.consignCount,
              )
              chartOption.series[0].name = '委托数量'
              chartOption.series[1].data = res.data.map(
                item => item.testObjectCount,
              )
            }
            else {
              chartOption.title.text = ''
              chartOption.series[0].data = res.data.map(item => item.sum)
              chartOption.series[0].name = '费用'
              chartOption.series[1].data = []
            }

            if (res.data.length > 12) {
              chartOption.dataZoom = [
                {
                  type: 'inside',
                  show: true,
                  xAxisIndex: [0],
                  start: 0,
                  end: 100,
                },
              ]
              chartOption.graphic.elements = [
                {
                  type: 'text',
                  right: 30,
                  top: 15,
                  style: {
                    text: '注：数据过多时，可通过鼠标滚轮控制缩放',
                    fill: 'red',
                  },
                },
              ]
            }
            else {
              chartOption.dataZoom = undefined
              chartOption.graphic.elements = []
            }

            // chartOption.title.text = this.queryTypeData.find(item=>item.value == queryType).name
            chartEle.clear()
            this.buildEcharts()
            this.loading = false
          }
        })
    },
    goDetail() {
      this.search()
      let consignDates = ''
      if (this.queryParams.durationType === 1000) {
        // 年
        consignDates = `${this.queryParams.range}-01-01 ~ ${this.queryParams.range}-12-31`
      }
      else if (this.queryParams.durationType === 2000) {
        // 月
        const dateArr = this.queryParams.range.split(',')
        consignDates = `${dateArr[0]} ~ ${dateArr[1]}`
      }
      else if (this.queryParams.durationType === 3000) {
        // 周
        const dateArr = this.queryParams.range.split(',')
        consignDates = `${dateArr[0]} ~ ${dateArr[1]}`
      }

      const url = `consignController.do?goConsignList&initSearchType=4&consignDates=${encodeURI(consignDates)}`

      top.addTabs
      && top.addTabs({
        id: '1',
        title: '委托收样',
        close: false,
        url,
      })
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
      this.geturl = data.queryType
      delete data.queryType
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
        queryType: 'getCountData',
        durationType: 1000,
        range: new Date().getFullYear(),
      }
      this.range = ''
      this.geturl = 'getCountData'
      this.durationType = 1000
      this.getData({
        durationType: 1000,
        range: new Date().getFullYear(),
      })
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
