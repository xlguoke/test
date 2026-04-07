<template>
  <div
    v-if="!pieData?.length"
    class="flex flex-col h-full items-center justify-center text-[#B4DBD6]"
  >
    <img src="@/assets/images/smartCockpit/no-data.svg" class="w-280 h-280" />
    暂无数据
  </div>
  <div v-show="pieData?.length" class="w-full h-full relative">
    <div ref="chartDom" class="w-full h-full"></div>
    <div v-if="!disableLegend" class="pieChart3D-legend">
      <div v-for="(item, index) in legendData" :key="index" class="pieChart3D-legend-item">
        <div class="pieChart3D-legend-icon" :style="`background:${item.color}`"></div>
        <div class="flex-1">{{ item.name }}</div>
        <div class="w-[1rem] text-[0.36rem] font-bold text-white">{{ item.value }}</div>
        <div class="w-[1rem] text-[0.36rem] font-bold" :style="`color:${item.color}`">
          {{ item.ratio }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, PropType, nextTick, computed } from "vue"
import * as echarts from "echarts"
import "echarts-gl"
import { useResizeObserver } from "@vueuse/core"
import { clacChartPx } from "@/utils/utils"
import pieBg from "../assets/images/smartCockpit/3d-pie-bg.png"
import { defaultChartOptions } from "@/views/smartCockpit"

interface PieDataItem {
  name: string
  value: number
  startRatio?: number
  endRatio?: number
  itemStyle?: {
    color?: string
    opacity?: number
  }
}

interface ExtendedPieDataItem extends PieDataItem {
  startRatio: number
  endRatio: number
}

interface PieSeriesItem {
  name: string
  type: string
  parametric: boolean
  wireframe: {
    show: boolean
  }
  pieData: ExtendedPieDataItem
  pieStatus: {
    selected: boolean
    hovered: boolean
    k: number
  }
  itemStyle?: {
    color?: string
    opacity?: number
  }
  parametricEquation?: any
}

// 定义组件属性
const props = defineProps({
  pieData: {
    type: Array as PropType<PieDataItem[]>,
    required: true
  },
  title: {
    type: Object as PropType<{
      name: string
      value: number | string
    }>,
    default: () => ({ name: "", value: "" })
  },
  internalDiameterRatio: {
    type: Number,
    default: 0.59
  },
  height: {
    type: String,
    default: "400px"
  },
  columnsThree: {
    type: Boolean,
    default: false
  },
  disableLegend: {
    type: Boolean,
    default: false
  }
})

const title = computed(() => props.title)

const legendData = computed(() => {
  const data = props.pieData
  const total = data.reduce((acc: number, curr: any) => acc + curr.value, 0)
  return data.map((item, index) => ({
    ...item,
    ratio: total ? ((item.value / total) * 100).toFixed(1) : 0,
    color: defaultChartOptions.color[index % defaultChartOptions.color.length]
  }))
})

// 定义状态和变量
const chartDom = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null
let selectedIndex = ""
let hoveredIndex = ""
let option: any = {}

// 生成扇形的曲面参数方程，用于 series-surface.parametricEquation
const getParametricEquation = (
  startRatio: number,
  endRatio: number,
  isSelected: boolean,
  isHovered: boolean,
  k: number,
  h: number
) => {
  // 计算
  const midRatio = (startRatio + endRatio) / 2
  const startRadian = startRatio * Math.PI * 2
  const endRadian = endRatio * Math.PI * 2
  const midRadian = midRatio * Math.PI * 2

  // 产品不要高度随着数据值变化，这里直接写死
  h = document.body.clientHeight > 1080 ? 12 : 42

  // 如果只有一个扇形，则不实现选中效果。
  if (startRatio === 0 && endRatio === 1) {
    isSelected = false
  }

  // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
  k = typeof k !== "undefined" ? k : 1 / 3

  // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
  const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
  const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0

  // 计算高亮效果的放大比例（未高亮，则比例为 1）
  const hoverRate = isHovered ? 1.05 : 1

  // 返回曲面参数方程
  return {
    u: {
      min: -Math.PI,
      max: Math.PI * 3,
      step: Math.PI / 32
    },
    v: {
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 20
    },
    x: function (u: number, v: number) {
      if (u < startRadian) {
        return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    y: function (u: number, v: number) {
      if (u < startRadian) {
        return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      if (u > endRadian) {
        return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
      }
      return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
    },
    z: function (u: number, v: number) {
      if (u < -Math.PI * 0.5) {
        return Math.sin(u)
      }
      if (u > Math.PI * 2.5) {
        return Math.sin(u) * h * 0.1
      }
      return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
    }
  }
}

// 生成模拟 3D 饼图的配置项
const getPie3D = (pieData: PieDataItem[], internalDiameterRatio: number) => {
  const series: any[] = []
  let sumValue = 0
  let startValue = 0
  let endValue = 0
  const legendData: string[] = []
  const k =
    typeof internalDiameterRatio !== "undefined"
      ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio)
      : 1 / 3

  // 为每一个饼图数据，生成一个 series-surface 配置
  for (let i = 0; i < pieData.length; i++) {
    sumValue += pieData[i].value

    const seriesItem: PieSeriesItem = {
      name: typeof pieData[i].name === "undefined" ? `series${i}` : pieData[i].name,
      type: "surface",
      parametric: true,
      wireframe: {
        show: false
      },
      pieData: { ...pieData[i] } as ExtendedPieDataItem, // 创建一个副本以防止修改原始数据
      pieStatus: {
        selected: false,
        hovered: false,
        k: k
      },
      itemStyle: {} as any
    }

    if (typeof pieData[i].itemStyle != "undefined") {
      const itemStyle: any = {}

      if (pieData[i].itemStyle?.color !== undefined) {
        // itemStyle.color = pieData?.[i]?.itemStyle?.color
      }

      if (pieData[i].itemStyle?.opacity !== undefined) {
        itemStyle.opacity = pieData?.[i]?.itemStyle?.opacity
      }

      seriesItem.itemStyle = itemStyle
    }
    series.push(seriesItem)
  }

  // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
  // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
  for (let i = 0; i < series.length; i++) {
    endValue = startValue + series[i].pieData.value

    series[i].pieData.startRatio = startValue / sumValue
    series[i].pieData.endRatio = endValue / sumValue
    series[i].parametricEquation = getParametricEquation(
      series[i].pieData.startRatio,
      series[i].pieData.endRatio,
      false,
      false,
      k,
      series[i].pieData.value
    )

    startValue = endValue
    legendData.push(series[i].name)
  }

  const rich = props.columnsThree
    ? {
        nameWidth: 40,
        valueWidth: 130,
        percentWidth: 65
      }
    : {
        nameWidth: 280,
        valueWidth: 100,
        percentWidth: 70
      }

  // 准备待返回的配置项，把准备好的 legendData、series 传入。
  return {
    ...defaultChartOptions,
    graphic: {
      elements: [
        {
          type: "text",
          left: "center",
          top: clacChartPx(145),
          style: {
            text: title.value.value,
            font: '0.62rem "STHeiti", sans-serif',
            fill: "#ffffff"
          }
        },
        {
          type: "text",
          left: "center",
          top: clacChartPx(215),
          style: {
            text: title.value.name,
            font: '0.28rem "STHeiti", sans-serif',
            fill: "#B4DBD6"
          }
        },
        {
          type: "image",
          silent: true,
          style: {
            image: pieBg,
            width: clacChartPx(640),
            height: clacChartPx(333)
          },
          left: "center",
          zlevel: -11,
          top: clacChartPx(88)
        }
      ]
    },
    legend: {
      show: false,
      data: legendData,
      itemWidth: clacChartPx(18),
      itemHeight: clacChartPx(15),
      bottom: clacChartPx(20),
      left: "center",
      orient: "horizontal",
      icon: "path://M0.150955,13.8678C0.071024,14.4673,0.537394,15,1.14218,15L15.1245,15C15.6257,15,16.0495,14.629,16.1157,14.1322L17.849,1.13216C17.929,0.53268,17.4626,0,16.8578,0L2.87552,0C2.37431,0,1.95053,0.37103,1.88429,0.867836L0.150955,13.8678Z",
      itemGap: clacChartPx(10),
      textStyle: {
        color: "#fff",
        rich: {
          name: {
            padding: [2, 8, 2, 0],
            color: "#fff",
            width: clacChartPx(rich.nameWidth),
            fontSize: clacChartPx(24)
          },
          value: {
            padding: [2, 4, 2, 0],
            color: "#fff",
            width: clacChartPx(rich.valueWidth),
            fontWeight: "bold",
            fontSize: clacChartPx(36)
          },
          percent: {
            padding: [2, 0, 2, 0],
            width: clacChartPx(rich.percentWidth),
            fontWeight: "bold",
            fontSize: clacChartPx(36),
            align: "right"
          },
          bg: {
            backgroundColor: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(10, 153, 66, 0.2)"
                },
                {
                  offset: 1,
                  color: "rgba(10, 153, 66, 0)"
                }
              ]
            },
            padding: [clacChartPx(24), clacChartPx(16)],
            borderWidth: clacChartPx(1),
            borderColor: "rgba(105, 240, 183, 0.3)",
            width: "110%",
            align: "right"
          }
        }
      },
      formatter: (name: string) => {
        // 查找对应的系列数据
        const targetSeries = series.find((item) => item.name === name)
        if (targetSeries && targetSeries.pieData) {
          // 计算百分比，保留一位小数
          const percentage = ((targetSeries.pieData.value / sumValue) * 100).toFixed(1)
          // 返回格式化后的图例文本: 名称 值 百分比，包含渐变背景
          return `{name|${echarts.format.truncateText(
            name,
            clacChartPx(320),
            "12px Microsoft Yahei",
            "…",
            {}
          )}} {value|${targetSeries.pieData.value}} {percent|${percentage}%} {bg|}`
        }
        return name
      }
    },
    tooltip: {
      formatter: (params: any) => {
        if (params.seriesName !== "mouseoutSeries") {
          const seriesIndex = params.seriesIndex as number
          if (typeof seriesIndex === "number" && series[seriesIndex]?.pieData) {
            return `${params.seriesName}<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params.color};"></span>${series[seriesIndex].pieData.value}`
          }
        }
        return ""
      }
    },
    xAxis3D: {
      min: -0.8,
      max: 0.8
    },
    yAxis3D: {
      min: -0.8,
      max: 0.8
    },
    zAxis3D: {
      min: -0.8,
      max: 0.8
    },
    grid3D: {
      show: false,
      boxHeight: clacChartPx(8),
      top: -clacChartPx(120),
      height: "80%",
      viewControl: {
        alpha: 30,
        rotateSensitivity: 0,
        zoomSensitivity: 0,
        panSensitivity: 0,
        autoRotate: false
      },
      postEffect: {
        enable: true,
        bloom: {
          enable: true,
          bloomIntensity: 0.1
        },
        SSAO: {
          enable: true,
          quality: "medium",
          radius: clacChartPx(2)
        }
      }
    },
    series: series
  }
}

// 渲染图表
const renderChart = () => {
  if (myChart) {
    option = getPie3D(props.pieData, props.internalDiameterRatio)
    myChart.setOption(option)
  }
}

// 设置事件监听
const setupEventListeners = () => {
  if (!myChart) return

  // 监听点击事件，实现选中效果（单选）
  myChart.on("click", (params: any) => {
    if (!option || !option.series || params.seriesName === "mouseoutSeries") return

    const seriesIndex = params.seriesIndex as number
    if (typeof seriesIndex !== "number" || !option.series[seriesIndex]) return

    // 从 option.series 中读取重新渲染扇形所需的参数，将是否选中取反。
    const isSelected = !option.series[seriesIndex].pieStatus.selected
    const isHovered = option.series[seriesIndex].pieStatus.hovered
    const k = option.series[seriesIndex].pieStatus.k
    const startRatio = option.series[seriesIndex].pieData.startRatio
    const endRatio = option.series[seriesIndex].pieData.endRatio

    // 如果之前选中过其他扇形，将其取消选中（对 option 更新）
    if (selectedIndex !== "" && selectedIndex !== String(seriesIndex)) {
      const prevIndex = parseInt(selectedIndex)
      if (!isNaN(prevIndex) && option.series[prevIndex]) {
        option.series[prevIndex].parametricEquation = getParametricEquation(
          option.series[prevIndex].pieData.startRatio,
          option.series[prevIndex].pieData.endRatio,
          false,
          false,
          k,
          option.series[prevIndex].pieData.value
        )
        option.series[prevIndex].pieStatus.selected = false
      }
    }

    // 对当前点击的扇形，执行选中/取消选中操作（对 option 更新）
    option.series[seriesIndex].parametricEquation = getParametricEquation(
      startRatio,
      endRatio,
      isSelected,
      isHovered,
      k,
      option.series[seriesIndex].pieData.value
    )
    option.series[seriesIndex].pieStatus.selected = isSelected

    // 如果本次是选中操作，记录上次选中的扇形对应的系列号 seriesIndex
    isSelected ? (selectedIndex = String(seriesIndex)) : null

    // 使用更新后的 option，渲染图表
    if (myChart) {
      myChart.setOption(option)
    }
  })

  // 监听 mouseover，近似实现高亮（放大）效果
  myChart.on("mouseover", (params: any) => {
    if (!option || !option.series) return

    const seriesIndex = params.seriesIndex as number
    if (typeof seriesIndex !== "number") return

    // 准备重新渲染扇形所需的参数
    let isSelected: boolean
    let isHovered: boolean
    let startRatio: number
    let endRatio: number
    let k: number

    // 如果触发 mouseover 的扇形当前已高亮，则不做操作
    if (hoveredIndex === String(seriesIndex)) {
      return
    } else {
      // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
      if (hoveredIndex !== "") {
        const prevIndex = parseInt(hoveredIndex)
        if (!isNaN(prevIndex) && option.series[prevIndex]) {
          // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
          isSelected = option.series[prevIndex].pieStatus.selected
          isHovered = false
          startRatio = option.series[prevIndex].pieData.startRatio
          endRatio = option.series[prevIndex].pieData.endRatio
          k = option.series[prevIndex].pieStatus.k

          // 对当前高亮的扇形，执行取消高亮操作（对 option 更新）
          option.series[prevIndex].parametricEquation = getParametricEquation(
            startRatio,
            endRatio,
            isSelected,
            isHovered,
            k,
            option.series[prevIndex].pieData.value
          )
          option.series[prevIndex].pieStatus.hovered = isHovered

          // 将此前记录的上次高亮的扇形对应的系列号 seriesIndex 清空
          hoveredIndex = ""
        }
      }

      // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 option 更新）
      if (params.seriesName !== "mouseoutSeries" && option.series[seriesIndex]) {
        // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
        isSelected = option.series[seriesIndex].pieStatus.selected
        isHovered = true
        startRatio = option.series[seriesIndex].pieData.startRatio
        endRatio = option.series[seriesIndex].pieData.endRatio
        k = option.series[seriesIndex].pieStatus.k

        // 对当前鼠标经过的扇形，执行高亮操作（对 option 更新）
        option.series[seriesIndex].parametricEquation = getParametricEquation(
          startRatio,
          endRatio,
          isSelected,
          isHovered,
          k,
          option.series[seriesIndex].pieData.value + 5
        )
        option.series[seriesIndex].pieStatus.hovered = isHovered

        // 记录上次高亮的扇形对应的系列号 seriesIndex
        hoveredIndex = String(seriesIndex)
      }

      // 使用更新后的 option，渲染图表
      if (myChart) {
        myChart.setOption(option)
      }
    }
  })

  // 修正取消高亮失败的 bug
  myChart.on("globalout", () => {
    if (!option || !option.series) return

    if (hoveredIndex !== "") {
      const prevIndex = parseInt(hoveredIndex)
      if (isNaN(prevIndex) || !option.series[prevIndex]) return

      // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
      const isSelected = option.series[prevIndex].pieStatus.selected
      const isHovered = false
      const k = option.series[prevIndex].pieStatus.k
      const startRatio = option.series[prevIndex].pieData.startRatio
      const endRatio = option.series[prevIndex].pieData.endRatio

      // 对当前高亮的扇形，执行取消高亮操作（对 option 更新）
      option.series[prevIndex].parametricEquation = getParametricEquation(
        startRatio,
        endRatio,
        isSelected,
        isHovered,
        k,
        option.series[prevIndex].pieData.value
      )
      option.series[prevIndex].pieStatus.hovered = isHovered

      // 将此前记录的上次高亮的扇形对应的系列号 seriesIndex 清空
      hoveredIndex = ""

      // 使用更新后的 option，渲染图表
      if (myChart) {
        myChart.setOption(option)
      }
    }
  })
}

useResizeObserver(chartDom, () => {
  myChart?.resize()
})

// 初始化图表
const initChart = () => {
  if (chartDom.value && !myChart) {
    myChart = echarts.init(chartDom.value)
    setupEventListeners()
    renderChart()
    nextTick(() => {
      myChart?.resize()
    })
  }
}

// 当数据变化时重新渲染图表
watch(
  () => props.pieData,
  () => {
    renderChart()
  },
  { deep: true }
)

// 挂载后初始化图表
onMounted(() => {
  initChart()
})

// 组件销毁前清理
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
})
</script>

<style lang="less" scoped>
.pieChart3D-legend {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  bottom: 0;
  left: 0.48rem;
  right: 0.48rem;
  top: 4.6rem;
  max-height: 2.8rem;
  overflow-y: auto;
  align-self: flex-start;
  row-gap: 0.4rem;
  column-gap: 0.16rem;

  .pieChart3D-legend-item {
    width: calc(50% - 0.08rem);
    background: linear-gradient(90deg, rgba(10, 153, 66, 0.1) 0%, rgba(10, 153, 66, 0) 100%);
    border: 1px solid;
    border-image: linear-gradient(90deg, rgba(105, 240, 183, 0.3) 0%, rgba(105, 240, 183, 0) 100%) 1;
    height: 0.64rem;
    padding-left: 0.16rem;
    padding-right: 0.32rem;
    display: flex;
    align-items: center;
    font-size: 0.24rem;
    gap: 0.16rem;
  }

  .pieChart3D-legend-icon {
    width: 0.18rem;
    height: 0.18rem;
    transform: skewX(-10deg);
  }
}
</style>
