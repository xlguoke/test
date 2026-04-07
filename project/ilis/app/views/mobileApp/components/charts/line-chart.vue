<template>
  <div ref="chartDom" class="chart-wrap" @click.stop="chartClick"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'LineChart',
  components: {},
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    list2: {
      type: Array,
      default: () => [],
    },
    dataX: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    config: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['chartClick'],
  data() {
    return {
      selectPicker: false,
      echart: null,
      option: {
        color: ['#154BD0', '#3EC590'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              show: true,
            },
          },
        },
        grid: {
          top: '35',
          left: '15',
          right: '15',
          bottom: '15',
          containLabel: true,
        },
        title: {
          text: '',
          subtext: '',
        },
        xAxis: {
          id: 'x0',
          data: [],
          // axisLabel: {
          //   inside: true,
          //   textStyle: {
          //     color: "#fff"
          //   }
          // },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: ['#eee'],
            },
          },
          axisLabel: {
            color: '#333',
          },
          z: 10,
        },
        yAxis: [
          {
            // name: "温度:℃",
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              textStyle: {
                color: '#999',
              },
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: ['#e5e5e5'],
              },
            },
          },
          {
            // name: "湿度:%RH",
            type: 'value',
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              textStyle: {
                color: '#999',
              },
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: ['#e5e5e5'],
              },
            },
          },
        ],
        dataZoom: [
          {
            type: 'inside',
          },
        ],
        series: [
          {
            type: 'line',
            label: {
              show: false,
              position: 'top',
              distance: 1,
            },
            smooth: true,
            data: [],
            showSymbol: false,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(21, 75, 208, 0.8)',
                },
                {
                  offset: 1,
                  color: 'rgba(21, 75, 208, 0)',
                },
              ]),
            },
          },
          {
            type: 'line',
            yAxisIndex: 1,
            label: {
              show: false,
              position: 'top',
              distance: 1,
            },
            showSymbol: false,
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(62, 197, 144, 0.8)',
                },
                {
                  offset: 1,
                  color: 'rgba(62, 197, 144, 0)',
                },
              ]),
            },
            data: [],
          },
        ],
      },
    }
  },
  computed: {},
  watch: {
    list: {
      handler() {
        this.echart && this.setOption()
      },
      deep: true,
    },
    list2: {
      handler() {
        this.echart && this.setOption()
      },
      deep: true,
    },
    dataX: {
      handler() {
        this.echart && this.setOption()
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    const chartDom = this.$refs.chartDom
    this.echart = echarts.init(chartDom)
    this.setOption()
    window.addEventListener('resize', () => {
      this.echart && this.echart.resize()
    })
  },
  methods: {
    init() {},
    setOption() {
      this.title && (this.option.title.text = this.title)

      this.subtitle && (this.option.title.subtext = this.subtitle)

      this.config && (this.option = Object.assign(this.option, this.config))

      this.dataX && this.dataX.length && (this.option.xAxis.data = this.dataX)
      if (this.list && this.list.length) {
        this.option.series[0].data = this.list
      }
      if (this.list2 && this.list2.length) {
        this.option.series[1].data = this.list2
      }
      this.echart.setOption(this.option)
      this.$nextTick().then(() => {
        this.echart && this.echart.resize()
      })
    },
    chartClick() {
      this.$emit('chartClick', this.echart)
    },
  },
}
</script>

<style lang="less" scoped>
.chart-wrap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
