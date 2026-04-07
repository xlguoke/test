import { clacChartPx } from "@/utils/utils"
import * as echarts from "echarts"
export function getGaugeChartOptions(name: string, value: number) {
  return {
    backgroundColor: "rgba(0,0,0,0)",
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%"
    },

    series: [
      // 最外部进度条
      {
        name: "最外部进度条",
        type: "gauge",
        radius: "80%",
        splitNumber: 100,
        axisLine: {
          lineStyle: {
            color: [
              [
                1,
                new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#FDD05E" // 黄色
                  },
                  {
                    offset: 1,
                    color: "#97E05F" // 绿色
                  }
                ])
              ]
            ],
            width: clacChartPx(14)
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        detail: {
          show: false
        },
        title: {
          //标题
          show: false
        },
        data: [],
        pointer: {
          show: false
        }
      },
      // 内部进度条
      {
        name: "内部进度条",
        type: "gauge",
        radius: "50%",
        z: 4,
        min: 0,
        max: 100,
        startAngle: 225,
        endAngle: -45,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            color: [
              [value / 100, "rgba(48, 184, 252, 0.49)"],
              [1, "rgba(28,128,245,.0)"]
            ],
            width: clacChartPx(170)
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        detail: {
          show: false
        },
        title: {
          //标题
          show: false
        },
        data: [],

        itemStyle: {
          color: "rgba(46, 143, 255, 1)"
        }
      },
      // 指针
      {
        name: "指针",
        type: "gauge",
        radius: "40%",
        z: 6,
        min: 0,
        max: 100,
        startAngle: 225,
        endAngle: -45,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            color: [[1, "rgba(28,128,245,.0)"]],
            width: clacChartPx(170)
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        detail: {
          formatter: [`{val|{value}}{unit|%}`, `{name|${name}}`].join("\n"),
          offsetCenter: [0, clacChartPx(200)],
          rich: {
            val: {
              fontSize: clacChartPx(76),
              fontWeight: "500",
              color: "#fff",
              lineHeight: clacChartPx(100)
            },
            unit: {
              fontSize: clacChartPx(46),
              fontWeight: "500",
              color: "#fff",
              lineHeight: clacChartPx(20)
            },
            name: {
              fontSize: clacChartPx(46),
              fontWeight: "500",
              color: "rgba(180, 219, 214, 1)",
              lineHeight: clacChartPx(60)
            }
          }
        },
        title: {
          show: false
        },
        data: [
          {
            name: value.toString(),
            value: value
          }
        ],
        pointer: {
          show: true,
          length: "120%",
          width: clacChartPx(4),
          icon: "rect",
          itemStyle: {
            color: "#468EFD"
          }
        },
        anchor: {
          show: true,
          showAbove: true,
          size: clacChartPx(25),
          itemStyle: {
            borderWidth: clacChartPx(6),
            color: "#0e1327",
            borderColor: "rgba(46, 143, 255, 1)"
          }
        },
        itemStyle: {
          color: "rgba(46, 143, 255, 1)"
        }
      },
      // 内圆
      {
        name: "内圆",
        type: "pie",
        hoverAnimation: false,
        legendHoverLink: false,
        radius: "34%",
        z: 4,

        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: 0
          },
          {
            value: 10,

            itemStyle: {
              color: "#02140e"
            }
          }
        ]
      },
      // 外部刻度
      {
        name: "外部刻度",
        type: "gauge",
        radius: "78%",
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 10, //刻度数量
        startAngle: 225,
        endAngle: -45,
        axisLine: {
          show: false,
          lineStyle: {
            width: clacChartPx(1),
            color: [[1, "rgba(0,0,0,0)"]]
          }
        }, //仪表盘轴线
        axisLabel: {
          show: true,
          color: "#3FE1D7",
          distance: clacChartPx(25),
          fontSize: clacChartPx(24),
          formatter: function (v: number) {
            switch (v + "") {
              case "0":
                return "0"
              case "10":
                return "10"
              case "20":
                return "20"
              case "30":
                return "30"
              case "40":
                return "40"
              case "50":
                return "50"
              case "60":
                return "60"
              case "70":
                return "70"
              case "80":
                return "80"
              case "90":
                return "90"
              case "100":
                return "100"
            }
          }
        }, //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 7,
          lineStyle: {
            color: "#3FE1D7",
            width: clacChartPx(6)
          },
          length: clacChartPx(24)
        }, //刻度样式
        splitLine: {
          show: true,
          length: clacChartPx(18),
          lineStyle: {
            color: "#3FE1D7"
          }
        }, //分隔线样式
        detail: {
          show: false
        },
        title: {
          //标题
          show: false
        }
      }
    ]
  }
}
