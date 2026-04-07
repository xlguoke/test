import { clacChartPx, deepCopy } from "@/utils/utils"
import ringBg from "../../../assets/images/smartCockpit/ring-bg.png"
import { defaultChartOptions } from ".."

export function getToolTipFormatter() {
  return function (data) {
    // const seriesName = data[0].seriesName
    const seriesName = ""
    let str = `<div>${seriesName.includes("series") ? "" : seriesName}`
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      str += `<p>${d.name}：${d.value}</p>`
    }
    return str + "</div>"
  }
}

/**
 * 通用折线图配置
 */
export function getCommomLineChartOptions(): any {
  return {
    tooltip: {
      trigger: "axis",
      className: "smart-cockpit-tooltip",
      formatter: getToolTipFormatter()
    },
    grid: {
      top: 48,
      left: 24,
      right: 24,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: "#E6FFFC"
      },
      data: [""],
      axisLine: {
        lineStyle: {
          color: "#8EBFBA"
        }
      }
    },
    yAxis: {
      type: "value",
      name: "",
      nameGap: 20,
      nameTextStyle: {
        color: "#B4C0CC"
      },
      axisLabel: {
        color: "#E6FFFC"
      },
      splitLine: {
        lineStyle: {
          color: "#8EBFBA",
          type: "dotted"
        }
      }
    },
    series: [
      {
        data: [0],
        type: "line",
        symbolSize: clacChartPx(12),
        label: {
          // show: true,
          show: false,
          color: "#fff"
        },
        lineStyle: {
          color: "#40E7D5"
        },
        itemStyle: {
          color: "#40E7D5"
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(11, 255, 255, 0.4)"
              },
              {
                offset: 1,
                color: "transparent"
              }
            ]
          }
        }
      }
    ]
  }
}

/**
 * 通用柱状图配置
 */
export function getCommomBarChartOptions(): any {
  return {
    tooltip: {
      show: true,
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      className: "smart-cockpit-tooltip",
      formatter: getToolTipFormatter()
    },
    grid: {
      top: 48,
      left: 24,
      right: 16,
      bottom: 0,
      containLabel: true
    },
    xAxis: {
      type: "category",
      axisLabel: {
        color: "#E6FFFC",
        interval: 0,
        formatter: function (value) {
          // 将value 7个字符一组，用换行符分割
          return value.match(/.{1,7}/g).join("\n")
        }
      },
      data: [""],
      axisLine: {
        lineStyle: {
          color: "#8EBFBA"
        }
      }
    },
    yAxis: {
      type: "value",
      name: "",
      nameGap: 20,
      nameTextStyle: {
        color: "#B4C0CC"
      },
      axisLabel: {
        color: "#E6FFFC"
      },
      splitLine: {
        lineStyle: {
          color: "#8EBFBA",
          type: "dotted"
        }
      }
    },
    series: [
      {
        data: [0],
        type: "bar",
        barWidth: clacChartPx(46),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(64, 231, 213, 0.1)"
              },
              {
                offset: 1,
                color: "rgba(64, 231, 213, 1)"
              }
            ],
            global: false
          }
        },
        label: {
          show: true,
          backgroundColor: "#40E7D5",
          width: clacChartPx(46),
          height: clacChartPx(10),
          position: "top",
          offset: [0, clacChartPx(20)],
          color: "transparent"
        }
      }
    ]
  }
}

/**
 * 通用柱状图配置 - 黄色
 */
export function getYellowBarChartOptions(): any {
  const options = getCommomBarChartOptions()
  options.series[0].itemStyle.color.colorStops = [
    {
      offset: 0,
      color: "rgba(253, 208, 94, 0.1)"
    },
    {
      offset: 1,
      color: "rgba(151, 224, 95, 1)"
    }
  ]
  options.series[0].label.backgroundColor = "#FDD05E"
  return options
}

/**
 * 柱状图带折线图
 */
export function getBarWithLineChartOptions(): any {
  const lineOptions = getCommomLineChartOptions()
  const barOptions = getCommomBarChartOptions()

  lineOptions.yAxis.splitLine = { show: false }
  lineOptions.series[0].symbolSize = 0
  lineOptions.series[0].label.show = false
  lineOptions.series[0].itemStyle.show = false
  lineOptions.series[0].lineStyle.color = "#EAFF74"
  lineOptions.series[0].yAxisIndex = 1

  const yAxis = [barOptions.yAxis, lineOptions.yAxis]

  barOptions.grid.right = 32
  barOptions.yAxis = yAxis
  barOptions.series.push(lineOptions.series[0])

  return barOptions
}

/**
 * 折线图带标记线
 */
export function getLineWithMarkChartOptions(): any {
  const lineOptions = getCommomLineChartOptions()

  lineOptions.series[0].markLine = {
    silent: true,
    symbol: 0,
    label: {
      show: false
    },
    data: [
      {
        yAxis: 0,
        lineStyle: {
          type: "dotted",
          color: "#FF7575",
          width: 1.5,
          opacity: 1
        }
      },
      {
        yAxis: 0,
        lineStyle: {
          type: "dotted",
          color: "#FF7575",
          width: 1.5,
          opacity: 1
        }
      }
    ]
  }

  return lineOptions
}

/**
 * 双折线
 */
export function getDoubleLineChartOptions(): any {
  const lineOptions = getCommomLineChartOptions()

  const serie0 = lineOptions.series[0]
  serie0.label.show = false

  const serie = deepCopy(serie0)
  serie.lineStyle.color = "#FDD05E"
  serie.itemStyle.color = "#FDD05E"

  lineOptions.series.push(serie)

  return lineOptions
}

/**
 * 双折线区域渐变
 */
export function getDoubleLineAreaChartOptions(): any {
  const lineOptions = getCommomLineChartOptions()

  const serie0 = lineOptions.series[0]
  serie0.label.show = false
  serie0.smooth = true
  serie0.symbolSize = 0
  serie0.lineStyle.color = "rgba(64, 231, 213, 1)"
  serie0.areaStyle = {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: " rgba(64, 231, 213, 0.4)"
        },
        {
          offset: 1,
          color: "rgba(64, 231, 213, 0)"
        }
      ],
      globalCoord: false
    }
  }

  const serie1 = deepCopy(serie0)
  serie1.lineStyle.color = "#FDD05E"
  serie1.lineStyle.color = "rgba(255, 209, 92, 1)"
  serie1.areaStyle = {
    color: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        {
          offset: 0,
          color: " rgba(255, 209, 92, 0.2)"
        },
        {
          offset: 1,
          color: "rgba(255, 209, 92, 0)"
        }
      ],
      globalCoord: false
    }
  }

  lineOptions.series.push(serie1)

  return lineOptions
}

/**
 * # 双折现区域渐变带标记线
 */
export function getDoubleLineAreaWithMarkChartOptions(): any {
  const lineOptions = getDoubleLineAreaChartOptions()

  lineOptions.series[0].markLine = {
    silent: true,
    symbol: 0,
    label: {
      show: false
    },
    data: [
      {
        yAxis: 0,
        lineStyle: {
          type: "dotted",
          color: "#FF7575",
          width: 1.5,
          opacity: 1
        }
      },
      {
        yAxis: 0,
        lineStyle: {
          type: "dotted",
          color: "#FF7575",
          width: 1.5,
          opacity: 1
        }
      }
    ]
  }
  lineOptions.series[1].markLine = {
    silent: true,
    symbol: 0,
    label: {
      show: false
    },
    data: [
      {
        yAxis: 1,
        lineStyle: {
          type: "dotted",
          color: "#FFAE58",
          width: 1.5,
          opacity: 1
        }
      },
      {
        yAxis: 1,
        lineStyle: {
          type: "dotted",
          color: "#FFAE58",
          width: 1.5,
          opacity: 1
        }
      }
    ]
  }

  return lineOptions
}

export function getRingChartLegend(pieData: { name: string; value: number }[], unit?: string) {
  const sumValue = pieData
    .map((i) => i.value)
    .reduce((pre, sum) => {
      return pre + sum
    }, 0)

  return function (name: string) {
    const dataItem = pieData.find((item) => item.name === name)
    if (dataItem) {
      const percentage = Math.round((dataItem.value / sumValue) * 100)
      return `{name|${name}} {value|${dataItem.value}${unit || ""}} {percent|${percentage}%}`
    }
    return name
  }
}

// 通用环形图
export function getRingChartOptions(title: string) {
  return {
    ...defaultChartOptions,
    tooltip: {
      trigger: "item",
      className: "smart-cockpit-tooltip",
      formatter: function (data) {
        let str = `<div>`
        str += `<p>${data.name}：${data.value}</p>`
        return str + "</div>"
      }
    },
    graphic: {
      elements: [
        {
          type: "text",
          left: "center",
          bottom: clacChartPx(410),
          style: {
            text: 0,
            font: '0.72rem "STHeiti", sans-serif',
            fill: "#ffffff"
          }
        },
        {
          type: "text",
          left: "center",
          bottom: clacChartPx(350),
          style: {
            text: title,
            font: '0.32rem "STHeiti", sans-serif',
            fill: "#B4DBD6"
          }
        },
        {
          type: "image",
          left: "center",
          bottom: clacChartPx(210),
          style: {
            image: ringBg,
            width: clacChartPx(412),
            height: clacChartPx(412)
          }
        }
      ]
    },
    legend: {
      show: true,
      type: "scroll",
      height: clacChartPx(150),
      bottom: 8,
      left: "center",
      orient: "vertical",
      icon: "rect",
      pageIconColor: "#fff", // 滚动箭头颜色
      pageIconInactiveColor: "#555", // 禁用时颜色
      pageIconSize: 8, // 滚动图标大小
      pageButtonItemGap: 5, // 分页按钮间距
      itemWidth: clacChartPx(16),
      itemHeight: clacChartPx(16),
      itemGap: clacChartPx(24),
      textStyle: {
        color: "#fff",
        rich: {
          name: {
            padding: [4, 2, 2, 0],
            color: "#fff",
            fontSize: clacChartPx(28)
            // width: clacChartPx(60)
          },
          value: {
            padding: [4, 2, 2, 0],
            color: "#fff",
            fontWeight: "bold",
            fontSize: clacChartPx(28)
            // width: clacChartPx(50)
          },
          percent: {
            padding: [4, 2, 2, 0],
            color: "#fff",
            fontWeight: "bold",
            fontSize: clacChartPx(28),
            width: clacChartPx(50)
          }
        }
      },
      formatter: function (name: string) {
        return name
      }
    },
    series: [
      {
        type: "pie",
        bottom: clacChartPx(180),
        radius: ["58%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: false
        },
        data: [{ value: 0, name: "Search " }]
      }
    ]
  }
}

// 获取环形图（小）
export function getMinRingChartOptions(title: string) {
  const options = getRingChartOptions(title)

  options.graphic.elements[0].style.font = '0.82rem "STHeiti", sans-serif'
  options.graphic.elements[0].bottom = clacChartPx(390)

  options.graphic.elements[1].bottom = clacChartPx(340)

  options.graphic.elements[2].style.width = clacChartPx(390)
  options.graphic.elements[2].style.height = clacChartPx(390)
  options.graphic.elements[2].bottom = clacChartPx(212)

  options.color = ["#40E7D5", "#FFD15C"]
  options.series[0].radius = ["65%", "77%"]

  return options
}

// 通用饼图
export function getPieChartOptions() {
  return {
    ...defaultChartOptions,
    tooltip: {
      trigger: "item",
      className: "smart-cockpit-tooltip",
      formatter: function (data) {
        let str = `<div>`
        str += `<p>${data.name}：${data.value}</p>`
        return str + "</div>"
      }
    },
    legend: {
      show: true,
      bottom: 0,
      left: "center",
      icon: "roundRect",
      textStyle: {
        color: "#fff"
      }
    },
    series: [
      {
        type: "pie",
        radius: "60%",
        label: {
          color: "#fff",
          formatter: "{b}：{c}({d}%)"
        },
        data: []
      }
    ]
  }
}
