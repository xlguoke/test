<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15" style="margin-bottom: 15px">
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
                  style="width: 220px"
                >
                  <a-select-option v-for="item in yearData" :key="item.value">{{
                    item.name
                  }}</a-select-option>
                </a-select>
              </span>
              <span v-else-if="durationType == 2000">
                <a-month-picker style="width: 220px" @change="changeRange" />
              </span>
              <span v-else-if="durationType == 3000">
                <a-week-picker style="width: 220px" @change="changeRange" />
              </span>
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="样品"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-tree-select
                v-model:value="formState.bigCategoryId"
                style="width: 220px"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                :placeholder="
                  bigCategoryData.length == 0 ? '数据加载中···' : '请选择大类'
                "
                allow-clear
                :tree-data="bigCategoryData"
                tree-default-expand-all
                show-search
                :disabled="bigCategoryData.length == 0"
                tree-node-filter-prop="title"
              >
                <template #suffixIcon>
                  <LoadingOutlined v-if="bigCategoryData.length == 0" />
                </template>
              </a-tree-select>
              <!-- @change="title => handleChange(title)" -->
              <!-- @onChange="title => handleChange(title)" -->
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
  </div>
</template>

<script>
import { LoadingOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

import * as echarts from 'echarts'

const chartOption = {
  title: {
    text: '收样走势图',
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
    name: '样品数量',
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
  components: {
    LoadingOutlined,
  },
  data() {
    return {

      columns: [
        {
          title: '日期',
          dataIndex: 'day',
          width: '50%',
        },
        {
          title: '样品数量',
          dataIndex: 'count',
          width: '50%',
        },
      ],
      page: 1,
      size: 10,
      loading: false,
      durationTypeData: [
        { name: '年', value: 1000 },
        { name: '月', value: 2000 },
        { name: '周', value: 3000 },
      ],
      bigCategoryData: [],
      dateFormat: 'YYYY-MM-DD',
      yearData: [],
      durationType: '', // 1000: 按年；2000：月；3000 周
      range: '', // 日期范围参数：年：2020；月、周 2020-01-01,2020-01-16 以半角逗号分隔
      formState: {
        durationType: 1000,
        range: new Date().getFullYear(),
      },
    }
  },
  created() {
    this.getBigCategoryData()
  },
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
    getBigCategoryData() {
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.consignSampleStatistic.getTreeData,
        timeout: 60 * 60 * 1000,
      }).then((res) => {
        if (res && res.length > 0) {
          this.bigCategoryData = this.formatBigCategoryData(res)
        }
      })
    },
    formatBigCategoryData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatBigCategoryData(item.children)
        }
        arr.push({
          title: item.name,
          value: item.id,
          key: item.id,
          children,
        })
      })
      return arr
    },
    handleChange(value) {
      const newData = [...this.bigCategoryData]

      // const target = newData.filter(item => id === item.id)[0]
      const target = newData.filter(item => value === item.name)[0]
      if (target) {
        // target[column] = value
        this.bigCategoryData = target
      }
    },
    getData(params) {
      this.loading = true
      window.$oAjax
        .get(window.$oApi.consignSampleStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            const durationType = this.formState.durationType
            if (durationType == 1000) {
              this.columns[0].dataIndex = 'month'
              chartOption.xAxis.data = res.data.map(item => item.monthRange)
            }
            else {
              this.columns[0].dataIndex = 'day'
              chartOption.xAxis.data = res.data.map(item => item.dayRange)
            }
            chartOption.series[0].data = res.data.map(
              item => item.testObjectCount,
            )
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
