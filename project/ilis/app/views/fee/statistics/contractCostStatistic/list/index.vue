<template>
  <div>
    <div>
      <a-form :model="formState">
        <a-row :gutter="15" type="flex" justify="start">
          <a-col>
            <a-form-item>
              <label>统计时间：</label>
              <span>
                <a-select
                  v-model:value="formState.range"
                  style="width: 220px"
                >
                  <a-select-option v-for="item in yearData" :key="item.value">{{
                    item.name
                  }}</a-select-option>
                </a-select>
              </span>
            </a-form-item>
          </a-col>
          <a-col>
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button class="toolBtn-bar" @click="reset">
              重置
            </a-button>
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
  legend: {
    data: ['合同签订金额', '合同回款'],
    left: 10,
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
    name: '收费合计',
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
      type: 'bar',
      itemStyle: {
        color: '#1890ff',
      },
      name: '合同签订金额',
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
      type: 'bar',
      itemStyle: {
        color: '#1890ff',
      },
      name: '合同回款',
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
          title: '收费合计',
          dataIndex: 'count',
          width: '50%',
        },
      ],
      page: 1,
      size: 10,
      loading: false,
      durationTypeData: [{ name: '年', value: 1000 }],
      dateFormat: 'YYYY-MM-DD',
      yearData: [],
      range: null, // 日期范围参数：年：2020；
      formState: {
        range: new Date().getFullYear(),
      },
    }
  },
  created() {
    // this.getBigCategoryData();
  },
  mounted() {
    this.getData({
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
      this.loading = true
      window.$oAjax
        .get(window.$oApi.contractCostStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.columns[0].dataIndex = 'month'
            chartOption.xAxis.data = res.data.map(item => item.month)
            chartOption.series[0].data = res.data.map(item => item.total)
            chartOption.series[1].data = res.data.map(item => item.paid)
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
      this.getData(data)
    },
    reset() {
      this.formState = {
        range: new Date().getFullYear(),
      }
      this.getData({
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
