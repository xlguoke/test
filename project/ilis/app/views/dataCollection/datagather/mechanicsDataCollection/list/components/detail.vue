<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="查看曲线"
      width="700px"
      :footer="false"
      @ok="cancelModal"
      @cancel="cancelModal"
    >
      <div
        id="chart"
        style="width: 670px; height: 400px; border: solid 1px #e2e2e2"
      ></div>
    </ht-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import * as echarts from 'echarts'

let xName = ''
let yName = ''
const chartOption = {
  grid: {
    top: 40,
    left: 40,
    right: 60,
    bottom: 30,
  },
  xAxis: {
    type: 'value',
    nameTextStyle: {
      color: '#aaa',
    },
    axisTick: { show: false },
    splitLine: { show: false },
  },
  // dataZoom: [
  //     {
  //         type: 'inside',
  //         show: true,
  //         xAxisIndex: [0],
  //         start: 0,
  //         end: 100
  //     }
  // ],
  tooltip: {
    trigger: 'axis',
    formatter(data) {
      return data
        .map(
          item =>
            `<div>${item.marker}<span>${xName}：${item.value[0]}</span></div><div>${item.marker}<span>${yName}：${item.value[1]}</span></div>`,
        )
        .join('')
    },
  },
  yAxis: {
    type: 'value',
    axisTick: { show: false },
    splitLine: { show: false },
    nameTextStyle: {
      color: '#aaa',
    },
    // axisLabel: {
    //     formatter: '{value}%'
    // }
  },
  // graphic: {
  //   elements: [
  //     {
  //       type: 'text',
  //       right: 30,
  //       top: 15,
  //       style: {
  //         text: "注：数据过多时，可通过鼠标滚轮与拖动控制展示",
  //         fill: "#aaa"
  //       }
  //     }
  //   ]
  // },
  series: [],
}

let chartEle = null

export default {
  data() {
    return {
      data: [],
      loading: false,
      visible: false,
      taskIds: '',
    }
  },
  methods: {
    showModal(data) {
      xName = data.xUnit
      yName = data.yUnit
      chartOption.xAxis.name = data.xUnit
      chartOption.yAxis.name = data.yUnit
      const lineArr = data.dots.split(';')
      chartOption.series = lineArr.map((item) => {
        const lineData = []
        if (item) {
          // eslint-disable-next-line array-callback-return
          item.split(',').map((lItem) => {
            if (Array.isArray(lineData[lineData.length - 1])) {
              if (lineData[lineData.length - 1].length == 2) {
                lineData.push([lItem])
              }
              else {
                lineData[lineData.length - 1].push(lItem)
              }
            }
            else {
              lineData.push([lItem])
            }
          })
        }

        return {
          data: lineData,
          type: 'line',
          // name: "合格率",
          // itemStyle: {
          //     color: '#999'
          // },
        }
      })

      this.visible = true

      setTimeout(() => {
        chartEle = echarts.init(document.getElementById('chart'))
        window.onresize = function () {
          chartEle.resize()
        }
        this.buildEcharts()
      }, 500)
    },
    cancelModal() {
      chartEle.clear()
      this.visible = false
    },
    buildEcharts() {
      chartEle.setOption(chartOption)
    },
  },
}
</script>
