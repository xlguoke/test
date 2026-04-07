import { getCommomLineChartOptions } from "../utils/defaultChartOptions"
import dayjs from "dayjs"
import { zero } from "@/utils/utils"

export function getTestIndexChartOptions() {
  const options = getCommomLineChartOptions()

  return {
    ...options,
    grid: {
      top: 42,
      left: 24,
      right: 32,
      bottom: 0,
      containLabel: true
    },
    color: ["#0BFEFF", "#69F0B7"],
    dataset: [
      {
        source: []
      },
      {
        transform: {
          type: "ecStat:regression",
          config: {
            // linear - 线性回归（一次函数）
            // exponential - 指数回归（指数函数）
            // logarithmic - 对数回归（对数函数）
            // polynomial - 多项式回归（需指定阶数）
            method: "exponential"
          }
        }
      }
    ],
    tooltip: {
      show: true,
      className: "smart-cockpit-tooltip"
    },
    xAxis: {
      minInterval: 1,
      min: 1,
      axisLabel: {
        color: "#E6FFFC",
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: "#8EBFBA"
        }
      },
      splitLine: {
        lineStyle: {
          color: "#032724"
        }
      },
      splitNumber: 31
    },
    yAxis: {
      type: "value",
      name: "检测结果",
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
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        name: "检测结果",
        type: "scatter",
        datasetIndex: 0,
        itemStyle: {
          color: (params: any) => params.data[2]
        }
      },
      {
        name: "line",
        type: "line",
        smooth: true,
        datasetIndex: 1,
        symbolSize: 0.1,
        symbol: "circle",
        labelLayout: { dx: -20 },
        encode: { label: 2, tooltip: 1 },
        lineStyle: {
          width: 1,
          type: "dashed"
        }
      }
    ]
  }
}
