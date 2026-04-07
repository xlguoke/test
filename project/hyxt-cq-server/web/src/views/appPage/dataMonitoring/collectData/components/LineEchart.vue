<template>
  <a-modal
    v-model:visible="visible"
    title="力学曲线图"
    :mask-closable="false"
    :keyboard="false"
    width="900PX"
  >
    <template #footer>
      <a-button @click="visible = false">关闭</a-button>
    </template>
    <div id="myEchart" style="height: 500px"></div>
  </a-modal>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue"
import * as echarts from "echarts"

const visible = ref<boolean>(false)
const openModal = (datas: any[]) => {
  visible.value = true
  nextTick(() => {
    initEchart(datas)
  })
}

defineExpose({
  openModal
})

const initEchart = (datas: any[]) => {
  if (!datas || !datas.length) return
  const chartDom = document.getElementById("myEchart") as HTMLElement
  const myEchart = echarts.init(chartDom)
  const firstD = datas[0]
  console.log(datas)
  let axiosData = firstD.xDots.split(",")
  const option = {
    tooltip: {
      trigger: "axis"
    },
    legend: {},
    xAxis: {
      type: "category",
      name: firstD.xUnit,
      data: axiosData
    },
    yAxis: {
      type: "value",
      name: firstD.yUnit
    },
    // xAxis: datas.map(d=>{
    //   const dots = d.dots ? d.dots.split(",") : [];
    //   const data = <any[]>[];
    //   for (let i = 0; i < dots.length; i += 2) {
    //     data.push(dots[i]);
    //   }
    //   return{
    //     type: "category",
    //     name: d.xUnit,
    //     data
    //   }
    // }),
    // yAxis: datas.map((d) => {
    //   return {
    //     type: "value",
    //     name: d.yUnit,
    //   };
    // }),
    series: datas.map((d) => {
      const xData = d.yDots.split(",")
      return {
        data: xData,
        name: d.name,
        type: "line",
        symbol: "none",
        smooth: true,
        emphasis: {
          focus: "series"
        }
      }
    })
  }
  myEchart.setOption(option)
}
</script>

<style lang="less" scoped></style>
