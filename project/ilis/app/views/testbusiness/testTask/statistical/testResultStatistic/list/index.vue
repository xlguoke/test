<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15">
          <a-col span="8">
            <a-form-item
              label="检测样品"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-flex align="middle">
                <div
                  :title="testUnitSampleNames.toString()"
                  style="
                    font-size: 12px;
                    overflow: hidden;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding-top: 6px;
                  "
                  class="flex-1"
                >
                  <span
                    v-if="testUnitSampleNames.length === 0"
                    style="color: #ccc"
                  >请选择检测样品</span>
                  {{ testUnitSampleNames.toString() }}
                </div>
                <a-button @click="selectSample">
                  选择
                </a-button>
              </a-flex>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="委托日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-range-picker
                v-model:value="formState.consignDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="检测时间"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-range-picker
                v-model:value="formState.testDate"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="委托单位"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="formState.consignUnit"
                placeholder="请输入委托单位"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="工程项目"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="formState.consignProject"
                placeholder="请输入工程项目"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="生产厂家"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="formState.sampleManufactures"
                placeholder="请输入生产厂家"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-row>
              <a-col span="19" offset="5">
                <a-button type="primary" @click="search">
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
        margin-top: 15px;
      "
    ></div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
    />

    <Sample ref="Sample" :callback="getSample" />
  </div>
</template>

<script>
import dayjs from 'dayjs'

import * as echarts from 'echarts'
import Sample from './components/sample.vue'

const columns = [
  {
    title: '委托月份',
    dataIndex: 'months',
    width: '25%',
  },
  {
    title: '检测任务数量',
    dataIndex: 'count',
    width: '25%',
  },
  {
    title: '合格任务数量',
    dataIndex: 'qualified',
    width: '25%',
  },
  {
    title: '合格率',
    dataIndex: 'percentage',
    width: '25%',
    customRender: ({ text }) => `${text}%`,
  },
]

const chartOption = {
  grid: {
    top: 70,
    left: 80,
    right: 50,
    bottom: 60,
  },
  legend: {
    data: ['检测任务数量', '合格任务数量', '合格率'],
    bottom: 15,
    left: 'center',
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
    formatter(data) {
      return data
        .map(
          item =>
            `<div>${item.marker}<span>${item.seriesName}：${item.value}${
              item.seriesName === '合格率' ? '%' : ''
            }</span></div>`,
        )
        .join('')
    },
  },
  yAxis: [
    {
      type: 'value',
      axisTick: { show: false },
      name: '任务量',
      nameTextStyle: {
        color: '#aaa',
      },
    },
    {
      type: 'value',
      axisTick: { show: false },
      splitLine: { show: false },
      name: '合格率',
      nameTextStyle: {
        color: '#aaa',
      },
      axisLabel: {
        formatter: '{value}%',
      },
    },
  ],
  graphic: {
    elements: [],
  },
  series: [
    {
      data: [],
      type: 'bar',
      itemStyle: {
        color: '#ed7d31',
      },
      name: '检测任务数量',
      // stack: 'bar',
      barMaxWidth: 50,
    },
    {
      data: [],
      type: 'bar',
      name: '合格任务数量',
      itemStyle: {
        color: '#4472c4',
      },
      // stack: 'bar',
      barMaxWidth: 50,
    },
    {
      data: [],
      type: 'line',
      name: '合格率',
      itemStyle: {
        color: '#999',
      },
      yAxisIndex: 1,
    },
  ],
}

let chartEle = null

export default {
  components: {
    Sample,
  },
  data() {
    return {
      formState: {
        consignDate: [
          dayjs(new Date()).set({ month: 0, date: 1 }),
          dayjs(new Date()),
        ],
      },
      columns,
      page: 1,
      size: 10,
      loading: false,
      dateFormat: 'YYYY-MM-DD',
      data: [],
      testUnitSampleIds: [],
      testUnitSampleNames: [],
      initialConsignDate: [
        dayjs(new Date()).set({ month: 0, date: 1 }),
        dayjs(new Date()),
      ],
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    chartEle = echarts.init(document.getElementById('chart'))

    window.onresize = function () {
      chartEle.resize()
    }
  },
  methods: {
    getData(params) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, projectName } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.testResultStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.data = res.data
            chartOption.xAxis.data = res.data.map(item => item.months)
            // chartOption.series[0].data = res.data.map(item=>((item.count||0)-(item.qualified||0)))
            chartOption.series[0].data = res.data.map(item => item.count || 0)
            chartOption.series[1].data = res.data.map(item => item.qualified)
            chartOption.series[2].data = res.data.map(item => item.percentage)

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

            chartEle.clear()
            this.buildEcharts()
            this.loading = false
          }
        })
    },
    search() {
      const data = { ...this.formState }

      if (data.consignDate) {
        data.consignDate = data.consignDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join(',')
      }

      if (data.testDate) {
        data.testDate = data.testDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join(',')
      }

      data.testUnitSampleIds = this.testUnitSampleIds.toString() || null

      this.getData(data)
    },
    reset() {
      this.formState = {}
      this.testUnitSampleIds = []
      this.testUnitSampleNames = []
      this.getData()
    },
    buildEcharts() {
      chartEle.setOption(chartOption)
    },
    selectSample() {
      this.$refs.Sample.showModal()
    },
    getSample(data) {
      this.testUnitSampleIds = data.map(item => item.key)
      this.testUnitSampleNames = data.map(item => item.title)
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
