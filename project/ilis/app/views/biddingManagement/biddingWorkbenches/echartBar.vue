<template>
  <div class="flex-1 h-full flex flex-col">
    <div class="flex items-center justify-between my-4 px-8 rounded-md bg-[#F7FAFF] dark:!bg-[var(--colorFillContent)] leading-[80px]">
      <div class="flex items-center text-[16px]">
        <img :src="icon" class="w-6 h-6 mr-1">
        {{ title }}
      </div>
      <span class="text-[24px] font-bold">{{ numberWithCommas(totalCount) }}</span>
    </div>
    <!-- 柱状图容器 -->
    <div ref="chartRef" class="flex-1"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, ref, watch } from 'vue'
import { getPersonWorkbenchesEquipmentRent, getPersonWorkbenchesEquipmentUse, TimeType } from './api'

const props = defineProps({
  time: {
    type: String as () => TimeType,
    default: () => TimeType.ALL,
  },
  chartType: {
    type: String,
    default: 'rent',
  },
  title: {
    type: String,
    default: '',
  },
  // 图标
  icon: {
    type: String,
    default: '',
  },
})

// 定义数据接口
interface ChartData {
  name: string[]
  value: number[]
}

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
const nowDate = new Date()

// 格式化数字为带逗号的字符串
function numberWithCommas(num: number) {
  if (!num)
    return '0'
  return num.toLocaleString()
}

// 获取图表数据
async function fetchChartData() {
  try {
    let nameData: string[] = []
    let valueData: number[] = []

    if (props.chartType === 'use') {
      const res = await getPersonWorkbenchesEquipmentUse(props.time)
      nameData = res.data.name
      valueData = res.data.value
      totalCount.value = valueData.reduce((sum: number, val: number) => sum + val, 0)
    }
    else if (props.chartType === 'rent') {
      const res = await getPersonWorkbenchesEquipmentRent(props.time)
      nameData = res.data.name
      valueData = res.data.value
      totalCount.value = valueData.reduce((sum: number, val: number) => sum + val, 0)
    }

    if (nameData.length === 0) {
      const isAll = props.time === TimeType.ALL
      const year: number = nowDate.getFullYear()
      if (isAll) {
        nameData = [`${year}`]
      }
      else {
        let month: any = nowDate.getMonth() + 1
        if (month < 10) {
          month = `0${month}`
        }
        nameData = [`${year}-${month}`]
      }
      valueData = [0]
    }

    // 处理数据：如果时间筛选条件为 YEAR，则合并同一年的数据
    if (props.time === 'ALL') {
      const yearMap: { [key: string]: number } = {}

      // 遍历数据，按年份聚合
      nameData.forEach((date, index) => {
        const year = date.split('-')[0]
        if (yearMap[year]) {
          yearMap[year] += valueData[index]
        }
        else {
          yearMap[year] = valueData[index]
        }
      })

      // 重构数据
      chartData.value.name = Object.keys(yearMap)
      chartData.value.value = Object.values(yearMap)
    }
    // 当按近一年查询时，只取最近12个月的数据
    else if (props.time === 'YEAR') {
      // 限制只显示最近12个月的数据
      const limitedNameData = nameData.slice(-12)
      const limitedValueData = valueData.slice(-12)

      chartData.value.name = limitedNameData
      chartData.value.value = limitedValueData
    }
    else {
      // 其他情况下使用原始数据
      chartData.value.name = nameData
      chartData.value.value = valueData
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

  // 处理X轴标签显示：如果是"全部"时间范围，则只显示年份
  let xAxisData = chartData.value.name
  if (props.time === 'ALL') {
    xAxisData = chartData.value.name.map(item => item.split('-')[0])
  }

  // 如果数据点超过12个，启用滚动或调整标签显示
  if (dataLength > 12) {
    xAxisConfig = {
      type: 'category',
      data: xAxisData,
      axisLine: { show: true, lineStyle: { color: '#151515' } },
      axisTick: { show: true, alignWithLabel: true },
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
      data: xAxisData,
      axisLine: { show: true, lineStyle: { color: '#151515' } },
      axisTick: { show: true, alignWithLabel: true },
    }
  }

  // 动态计算柱状图宽度
  let barWidth
  if (props.time === 'ALL') {
    if (dataLength < 12) {
      barWidth = `${dataLength * 3}%`
    }
    else {
      barWidth = '36%' // 较宽的宽度
    }
  }
  else {
    if (dataLength < 12) {
      barWidth = `${dataLength * 3}%`
    }
    else {
      barWidth = '36%' // 较宽的宽度
    }
  }

  // 图表配置
  const option = {
    // 坐标轴提示框
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // 优化tooltip显示，即使只显示年份也显示完整的年月信息
      formatter: (params: any) => {
        const index = params[0].dataIndex
        const date = chartData.value.name[index]
        const value = params[0].value
        return `${date}<br/>${params[0].marker}${value} 次`
      },
    },
    // 网格（控制图表位置）
    grid: {
      left: '3%',
      right: '4%',
      top: '15%', // 减少顶部留白
      // bottom: dataLength > 12 ? '15%' : '3%', // 数据多时增加底部边距
      bottom: '3%',
      containLabel: true,
    },
    // x轴
    xAxis: xAxisConfig,
    // y轴：次数
    yAxis: {
      type: 'value',
      name: '数量: 次',
      nameLocation: 'end', // 将标签移到顶部
      nameGap: 14, // 调整标签与轴线的距离
      min: 0,
      splitLine: { show: true, lineStyle: { color: 'rgba(155,155,155,0.3)' } }, // 虚线网格线
      axisLine: { show: true, lineStyle: { color: '#151515' } },
      axisTick: { show: true, alignWithLabel: false },
      scale: false,
    },
    // 柱状图数据
    series: [
      {
        type: 'bar',
        data: chartData.value.value,
        itemStyle: { color: '#1890ff' }, // 蓝色柱形
        barWidth, // 使用计算后的宽度
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
  nextTick(() => {
    initChart()
  })
})

// 组件卸载时销毁实例（新增：防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
