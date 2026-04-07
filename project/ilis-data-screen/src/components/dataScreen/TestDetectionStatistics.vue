<template>
  <ComCard title="试验检测数据统计">
    <div class="relative w-full h-full flex justify-center items-center">
      <BarChart ref="testRef" />
    </div>
  </ComCard>
</template>
<script lang="ts" setup>
import ComCard from "@/components/ComCard.vue"
import BarChart from "../BarChart.vue"
import { onMounted, Ref, ref } from "vue"
import { testDetectionStatistics } from "@/api/dataScreen.api"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"

onMounted(() => {
  initTestDetectionChart()
})

const { unitCode } = useUnitDataHooks()
const testRef = ref()
const testLoading = ref(false)
// 试验检测数据统计
function initTestDetectionChart() {
  initChart(testRef, async (cb) => {
    testLoading.value = true
    const res = await testDetectionStatistics(unitCode.value).finally(() => {
      testLoading.value = false
    })
    const data = res.data
    const passRate: number[] = []
    data.forEach((i, index) => {
      passRate[index] = Math.floor(i.count > 0 ? ((i.count - i.unqualified) / i.count) * 100 : 0)
    })
    const currentYear = new Date().getFullYear() % 100
    cb(
      data.map((i) => `${currentYear}-${i.month}`),
      data.map((i) => i.count),
      passRate
    )
  })
}
/** 渲染图表 */
function initChart(
  chartRef: Ref<any, any>,
  requestFun: (cb: (xData: string[], data: number[], lineData: number[]) => void) => void
) {
  requestFun((xData: string[], data: number[], lineData: number[]) => {
    chartRef.value.setData(xData, data, lineData)
  })
}
function getData() {
  initTestDetectionChart()
}

defineExpose({
  getData
})
</script>
<style lang="less" scoped>
.sample-statistics {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  padding: 0 0.22rem;

  .sample-statistics-item {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sample-statistics-title {
    font-size: 0.14rem;
    color: #c6dcea;
  }

  .sample-statistics-count {
    font-size: 0.24rem;
    margin-top: 0.1rem;
    font-weight: bold;
    color: #fff;
  }

  .sample-statistics-icon {
    width: 0.86rem;
    height: 0.86rem;
    margin-right: 0.24rem;

    &.one {
      background: url("@/assets/images/dataScreen/ypsltj-1.png") no-repeat center/100% 100%;
    }

    &.two {
      background: url("@/assets/images/dataScreen/ypsltj-2.png") no-repeat center/100% 100%;
    }

    &.three {
      background: url("@/assets/images/dataScreen/ypsltj-3.png") no-repeat center/100% 100%;
    }

    &.four {
      background: url("@/assets/images/dataScreen/ypsltj-4.png") no-repeat center/100% 100%;
    }
  }
}
</style>
