<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <a-form ref="formRef" :model="formState">
        <a-row :gutter="15">
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
            <a-form-item
              label="检测科室"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-tree-select
                v-model:value="formState.departmentId"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择检测科室"
                allow-clear
                :tree-data="departmentData"
                tree-default-expand-all
                show-search
                tree-node-filter-prop="title"
              />
            </a-form-item>
          </a-col>
          <a-col span="16">
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button @click="reset">
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
    <a-row>
      <a-col v-if="data1 && data1.length > 0" span="12">
        <a-table
          :columns="columns"
          :data-source="data1"
          bordered
          :pagination="false"
          :loading="loading"
          :row-class-name="rowClassName"
        />
      </a-col>
      <a-col v-if="data2 && data2.length > 0" span="12">
        <a-table
          :columns="columns"
          :data-source="data2"
          bordered
          :pagination="false"
          :loading="loading"
          :row-class-name="rowClassName"
        />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import dayjs from 'dayjs'

import * as echarts from 'echarts'

const chartOption = {
  title: {
    text: '部门检测任务量',
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
    name: '任务量',
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
      name: '检测任务数量',
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
      formState: {
        queryType: 100,
        durationType: 1000,
        range: new Date().getFullYear(),
      },
      departmentId: '',
      data1: [],
      data2: [],
      columns: [
        {
          title: '日期',
          dataIndex: 'day',
          width: '50%',
        },
        {
          title: '检测任务数量',
          dataIndex: 'count',
          width: '50%',
        },
      ],
      page: 1,
      size: 10,
      loading: false,
      queryTypeData: [
        { name: '部门检测任务量', value: 100 },
        { name: '人员检测任务量', value: 200 },
      ],
      durationTypeData: [
        { name: '年', value: 1000 },
        { name: '月', value: 2000 },
        { name: '周', value: 3000 },
      ],
      departmentData: [],
      dateFormat: 'YYYY-MM-DD',
      yearData: [],
      durationType: '',
      range: '',
    }
  },
  async mounted() {
    await this.getLaboratoryData()
    await this.getData({
      queryType: 100,
      durationType: 1000,
      range: new Date().getFullYear(),
      departmentId: this.departmentId,
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
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        if (res && res.length > 0) {
          res.shift()
          this.departmentData = this.formatDepartmentData(res)
          this.departmentId = this.departmentData[0].value
          this.formState.departmentId = this.departmentId
        }
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    getData(params) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, projectName } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.testTaskStatistic.getData, { params })
        .then((res) => {
          if (res.code && res.code === 20000) {
            const queryType = this.formState.queryType
            const durationType = this.formState.durationType

            if (queryType == 100) {
              this.columns[0].dataIndex = 'day'
              this.columns[0].title = '日期'
              if (durationType == 1000) {
                this.columns[0].dataIndex = 'month'
                chartOption.xAxis.data = res.data.map(item => item.month)
              }
              else {
                this.columns[0].dataIndex = 'day'
                chartOption.xAxis.data = res.data.map(item => item.day)
              }
              chartOption.series[0].data = res.data.map(item => item.count)
            }
            else if (queryType == 200) {
              this.columns[0].dataIndex = 'testPerson'
              this.columns[0].title = '检测人员'

              chartOption.xAxis.data = res.data.map(item => item.testPerson)
              chartOption.series[0].data = res.data.map(item => item.count)
            }

            this.data1 = res.data.filter((item, index) => index % 2 == 0)
            this.data2 = res.data.filter((item, index) => index % 2 == 1)

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

            chartOption.title.text = this.queryTypeData.find(
              item => item.value == queryType,
            ).name
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
        queryType: 100,
        durationType: 1000,
        range: new Date().getFullYear(),
      }
      this.range = ''
      this.durationType = 1000
      this.getData({
        queryType: 100,
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
