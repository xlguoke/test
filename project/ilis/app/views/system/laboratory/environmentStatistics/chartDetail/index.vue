<template>
  <div>
    <div id="tempChart" :style="{ width: '100%', height: '300px' }"></div>
    <div id="humChart" :style="{ width: '100%', height: '300px' }"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { ajaxRequest, formatTime } from '~/providers/common/utils.js'

export default {
  name: 'ChartDetail',
  props: ['queryParams'],
  data() {
    return {
      option: {
        title: {
          text: '',
          x: 'center',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [],
            type: 'line',
          },
        ],
      },
    }
  },
  mounted() {
    // this.drawLine();

  },
  methods: {
    ajaxRequest,
    formatTime,
    getData() {
      if (this.queryParams.laboratoryId) {
        ajaxRequest(
          window.$oApi.environmentStatistics.chartUrl,
          window.$oQs.stringify(this.queryParams),
          this.getDataCall,
        )
      }
    },
    getDataCall(res) {
      if (res.obj && res.obj.length > 0) {
        for (let i = 0; i < res.obj.length; i++) {
          this.drawLine(res.obj[i])
        }
      }
    },
    drawLine(resData) {
      const arrY = []
      const arrX = []
      const option = { ...this.option }
      option.title.text = resData.dataTitle
      resData.data = resData.data.sort(
        (a, b) => a.chartDataKey - b.chartDataKey,
      )
      for (let i = 0; i < resData.data.length; i++) {
        arrY.push(resData.data[i].chartDataValue)
        arrX.push(
          formatTime(resData.data[i].chartDataKey, 'YYYY-MM-DD HH:mm:ss'),
        )
      }
      option.series[0].data = arrY
      option.xAxis.data = arrX

      let max, min
      // eslint-disable-next-line array-callback-return
      arrY.map((item) => {
        max ? item > max && (max = item) : (max = item)

        min ? item < min && (min = item) : (min = item)
      })

      if (max && min) {
        option.series[0].markLine = {
          silent: true,
          symbol: 'none',
          data: [
            {
              yAxis: max,
              label: {
                show: false,
              },
            },
            {
              yAxis: min,
              label: {
                show: false,
              },
            },
          ],
        }
      }

      let chartEle = 'tempChart'
      if (resData.dataTitle.includes('湿度')) {
        chartEle = 'humChart'
      }
      const tempChart = echarts.init(document.getElementById(chartEle))
      // 绘制图表
      tempChart.setOption(option)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
