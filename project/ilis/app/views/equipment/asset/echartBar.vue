<template>
  <div class="bar-chart-container">
    <!-- 柱状图容器 -->
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { getPersonWorkbenchesEquipmentRent, getPersonWorkbenchesEquipmentUse, TimeType } from './aapi'

// 定义数据接口
interface ChartData {
  name: string[]
  value: number[]
}

const props = defineProps({
  time: {
    type: String as () => TimeType,
    default: () => TimeType.ALL,
  },
  chartType: {
    type: String,
    default: 'rent',
  },
})

// 图表数据
const chartData = ref<ChartData>({
  name: [],
  value: [],
})
// 总次数
const totalCount = ref(0)

// 图表实例引用
const chartRef = ref(null)
let chartInstance: echarts.ECharts | null = null

// 获取图表数据
async function fetchChartData() {
  try {
    if (props.chartType === 'use') {
      const res = await getPersonWorkbenchesEquipmentUse(props.time)
      chartData.value.name = res.data.name
      chartData.value.value = res.data.value
      totalCount.value = res.data.value.reduce((sum: number, val: number) => sum + val, 0)
    }
    else if (props.chartType === 'rent') {
      const res = await getPersonWorkbenchesEquipmentRent(props.time)
      chartData.value.name = res.data.name
      chartData.value.value = res.data.value
      totalCount.value = res.data.value.reduce((sum: number, val: number) => sum + val, 0)
    }
    // 更新图表
    initChart()
  }
  catch (error) {
    console.error('获取图表数据失败:', error)
  }
}

// 初始化图表
function initChart() {
  if (chartInstance) {
    chartInstance.dispose()
  }
  // 创建新实例
  chartInstance = echarts.init(chartRef.value)

  // 判断是否需要滚动或调整标签显示
  const dataLength = chartData.value.name.length
  let xAxisConfig = {}

  // 如果数据点超过12个，启用滚动或调整标签显示
  if (dataLength > 12) {
    xAxisConfig = {
      type: 'category',
      data: chartData.value.name,
      axisLine: { show: true },
      axisTick: { show: false },
      // 当数据过多时，旋转标签以节省空间
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    }
  }
  else {
    xAxisConfig = {
      type: 'category',
      data: chartData.value.name,
      axisLine: { show: true },
      axisTick: { show: false },
    }
  }

  // 图表配置
  const option = {
    // 标题：包含总次数
    title: {
      text: `${props.chartType === 'use' ? '使用' : '借用'}设备总次数: ${totalCount.value}`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    // 坐标轴提示框
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    // 网格（控制图表位置）
    grid: {
      left: '3%',
      right: '4%',
      top: '15%', // 减少顶部留白
      bottom: dataLength > 12 ? '15%' : '3%', // 数据多时增加底部边距
      containLabel: true,
    },
    // x轴
    xAxis: xAxisConfig,
    // y轴：次数
    yAxis: {
      type: 'value',
      name: '数量: 次',
      nameLocation: 'end', // 将标签移到顶部
      nameGap: 10, // 调整标签与轴线的距离
      min: 0,
      splitLine: { show: true, lineStyle: { type: 'dashed' } }, // 虚线网格线
      axisLine: { show: true },
    },
    // 柱状图数据
    series: [
      {
        type: 'bar',
        data: chartData.value.value,
        itemStyle: { color: '#1890ff' }, // 蓝色柱形
        barWidth: dataLength > 12 ? '80%' : '60%', // 数据多时增加柱形宽度占比
      },
    ],
  }

  chartInstance.setOption(option)
}

// 窗口自适应
function resizeChart() {
  chartInstance?.resize()
}

// 初始化与监听
onMounted(() => {
  fetchChartData()
  window.addEventListener('resize', resizeChart)
})

// 监听时间变化，重新获取数据
watch(() => props.time, () => {
  fetchChartData()
})

// 监听数据变化，重新渲染
watch(chartData, () => {
  initChart()
})
</script>

<style scoped>
.bar-chart-container {
  padding: 20px;
}

.chart-box {
  width: 100%;
  height: 400px;
}
</style>
