<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
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
                      <a-select-option
                        v-for="item in yearData"
                        :key="item.value"
                      >{{ item.name }}</a-select-option>
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
      </div>
    </a-spin>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
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
    name: '报告打印份数',
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
      name: '报告打印份数',
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

      // columns: [{
      //   title: '日期',
      //   dataIndex: 'day',
      //   width: '50%'
      // },{
      //   title: '报告打印份数',
      //   dataIndex: 'count',
      //   width: '50%'
      // }],
      // page: 1,
      // size: 10,
      spinning: false,
      durationTypeData: [
        { name: '年', value: 1000 },
        { name: '月', value: 2000 },
        { name: '周', value: 3000 },
      ],
      // bigCategoryData: [],
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
    // this.getBigCategoryData();
  },
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
    // getBigCategoryData(){
    //   window.$oAjax.get(window.$oApi.consignSampleStatistic.getTreeData).then(res => {
    //     if(res && res.length > 0){
    //       this.bigCategoryData = this.formatBigCategoryData(res)
    //     }
    //   });
    // },
    // formatBigCategoryData(data){
    //   if(!(data && Array.isArray(data))){
    //     return [];
    //   }
    //   let arr = [];
    //   data.map(item => {
    //     let children = [];
    //     if (item.children && item.children.length > 0) {
    //       children = this.formatBigCategoryData(item.children)
    //     }
    //     arr.push({
    //       title: item.name,
    //       value: item.id,
    //       key: item.id,
    //       children
    //     })
    //   });
    //   return arr;
    // },
    getData(params) {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.reportPrintStatistics.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            const durationType = this.formState.durationType
            if (durationType == 1000) {
              // this.columns[0].dataIndex = 'month';
              chartOption.xAxis.data = res.data.map(item => item.month)
            }
            else {
              // this.columns[0].dataIndex = 'day';
              chartOption.xAxis.data = res.data.map(item => item.day)
            }
            chartOption.series[0].data = res.data.map(item => item.printNum)
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
            this.spinning = false
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
