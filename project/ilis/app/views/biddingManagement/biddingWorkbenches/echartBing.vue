<template>
  <div class="completion-chart-container">
    <!-- 环形图容器 -->
    <div ref="chartRef" class="chart-box"></div>
    <!-- 数据图例 -->
    <div class="legend-box mr-8">
      <div class="legend-item">
        <span class="legend-dot" :style="{ backgroundColor: configData[type].pieColor }"></span>
        <span>已{{ configData[type].text }} {{ initData.completed }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot pending"></span>
        <span>待{{ configData[type].text }} {{ initData.pending }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { configData, ConfigKey } from './api.ts'

const props = defineProps({
  data: {
    type: Object as () => PieChartData,
    default: () => ({}),
  },
  type: {
    type: String as () => ConfigKey,
    default: ConfigKey.TEST,
  },
})

interface PieChartData {
  total?: number
  completed: number
  pending: number
}

const initData = ref<PieChartData>(props.data)

// 初始化 completionRate 值
const completionRate = ref('0')
const total = initData.value.completed + initData.value.pending
if (total === 0 || initData.value.completed === 0) {
  completionRate.value = '0'
}
else {
  completionRate.value = ((initData.value.completed / total) * 100).toFixed(2)
}

watch(() => props.data, (newVal) => {
  initData.value = newVal
  // 当数据更新时，重新计算 completionRate
  const total = initData.value.completed + initData.value.pending
  if (total === 0 || initData.value.completed === 0) {
    completionRate.value = '0'
  }
  else {
    completionRate.value = ((initData.value.completed / total) * 100).toFixed(2)
  }
  initChart()
})

// 图表实例引用
const chartRef = ref(null)
let chartInstance: echarts.ECharts | null = null

// 初始化图表
function initChart() {
  // 销毁旧实例（避免重复渲染）
  if (chartInstance) {
    chartInstance.dispose()
  }
  // 创建新实例
  chartInstance = echarts.init(chartRef.value)

  // 图表配置
  const option = {
    tooltip: { show: false }, // 隐藏提示框
    series: [
      {
        type: 'pie',
        radius: ['75%', '90%'], // 增大环形图半径并使其更细
        center: ['50%', '50%'], // 图表居中
        data: [
          { value: initData.value.pending, itemStyle: { color: '#D7DADF' } }, // 待检测（灰色）
          { value: initData.value.completed, itemStyle: { color: configData[props.type].pieColor } }, // 动态颜色
        ],
        label: {
          show: true,
          position: 'center',
          formatter: `{rate|${completionRate.value}%}\n{text|完成率}`, // 中心显示完成率，保留两位小数
          rich: {
            rate: {
              fontSize: 18,
              fontWeight: 'bold',
              lineHeight: 24,
            },
            text: {
              fontSize: 14,
              color: '#666',
            },
          },
        },
        labelLine: { show: false }, // 隐藏标签连接线
      },
    ],
  }

  chartInstance.setOption(option)
}

// 监听窗口变化，自适应图表
function resizeChart() {
  chartInstance?.resize()
}

// 初始化与监听
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

// 监听数据变化，重新渲染图表
watch(() => [initData.value.completed, initData.value.pending], () => {
  initChart()
})
</script>

<style scoped>
.completion-chart-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.chart-box {
    width: 150px;
    height: 100%;
    position: relative;
}

/* 右上角数字标记（对应示例中的“349”） */
/* .chart-box::after {
  content: "349";
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
} */

.legend-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.pending {
  background-color: #e5e5e5;
}
</style>
