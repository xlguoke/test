<template>
  <div id="cqMap" class="map-wrap"></div>
</template>

<script setup lang="ts">
import { watch, onMounted } from "vue"
import * as echarts from "echarts"
import cqJson from "@/assets/js/500000_full_new.js"
const props = defineProps(["datas"])

onMounted(() => {
  initMap()
})
watch(
  () => props.datas,
  () => {
    initMap()
  }
)

const initMap = () => {
  const chartEle: HTMLElement = document.getElementById("cqMap") as HTMLElement
  const chart = echarts.init(chartEle)
  echarts.registerMap("chongqing", cqJson)
  const datas = props.datas.map((d) => ({
    name: d.region,
    value: d.qualifications
  }))
  const option = {
    tooltip: {
      show: true,
      trigger: "item",
      formatter: (val) => {
        const data = val?.data?.value || []
        let _tr = ``
        let _table = ``
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            const d = data[i]
            _tr += `<tr>
                      <td>${d.name}</td>
                      <td style="text-align: center;">${d.number}</td>
                    </tr>`
          }
          _table = `<table>${_tr}</table>`
        }
        let str = `<div class="map-tip"><p>${val.name}</p>${_table}</div>`
        return str
      }
    },
    series: [
      {
        name: "重庆地图",
        type: "map",
        map: "chongqing",
        zoom: 1.1,
        roam: true,
        label: {
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 1, //区域边框宽度
            borderColor: "#C4E2FF", //区域边框颜色
            areaColor: "#EFF7FF" //区域颜色
          },
          emphasis: {
            borderWidth: 1,
            borderColor: "#C4E2FF",
            areaColor: "#4A8DE5"
          }
        },
        data: datas
      }
    ]
  }
  option && chart.setOption(option)
}
</script>

<style scoped lang="less">
.map-wrap {
  width: 100%;
  height: 100%;
}

:deep(.map-tip) {
  p {
    margin-bottom: 5px;
    font-weight: 700;
  }
  table {
    border: 1px solid #e6e6e6;
  }
  tr {
    border-bottom: 1px solid #e6e6e6;
  }
  td {
    padding: 2px 10px;
    border-right: 1px solid #e6e6e6;
  }
}
</style>
