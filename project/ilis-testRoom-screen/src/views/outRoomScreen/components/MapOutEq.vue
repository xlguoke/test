<template>
  <div class="map-out-eq">
    <div class="title font-ys">各区域外出设备数量统计</div>
    <Map
      :is-show-scale="false"
      :is-show-geo-location="false"
      map-style="amap://styles/c9e4fc5f797a6ab61ad46a930408e535"
      @ready="mapReady"
    ></Map>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import Map from "@/components/dataMap/Map.vue"
import { egressAddress } from "@/api/outRoom.api"

const props = defineProps<{
  labId: string
}>()

const isReady = ref(false)

let AMapIns: any = null

let mapIns: any = null

let points: [number, number][] = [[104.2259, 30.511562]]

function _renderClusterMarker(context) {
  //context 为回调参数，
  //包含如下属性 marker:当前聚合点，count:当前聚合点内的点数量
  let clusterCount = context.count //聚合点内点数量

  const imgUrl = new URL("@/assets/images/outroom/mark.png", import.meta.url).href

  context.marker.setContent(
    `
    <div style="
      width: 0.6rem;
      height: 0.46rem;
      font-size: 0.24rem;
      text-align: center;
      font-weight: bolder;
      color: #fff;
      text-shadow: 0.02rem 0 0.08rem #128cff;
      background: url(${imgUrl}) no-repeat center/100% 100%;
    ">${clusterCount}<div/>
    `
  )
}
async function mapReady({ AMap, map }: any) {
  console.log("mapReady")
  isReady.value = true
  AMapIns = AMap
  mapIns = map
  AMapIns.plugin("AMap.CitySearch", () => {
    const citySearch: any = new AMapIns.CitySearch()

    // 2. 根据IP获取当前位置
    citySearch.getLocalCity((status: string, result: any) => {
      if (status === "complete" && result.info === "OK") {
        const center = result.rectangle?.split(";")?.[0]?.split(",")
        console.log("complete", center)
        // mapIns.setCenter(center || [104.2259, 30.511926]) // 设置为IP所在城市中心
        // mapIns.setCenter([104.2259, 30.511926]) // 设置为蜀工所在地
        mapIns.setCenter([103.06, 30.67]) // 设置为四川中心
        mapIns.setZoom(7) // 推荐缩放级别
        console.log("IP定位成功:", result)
      } else {
        // 4. 定位失败：使用默认视图
        console.warn("IP定位失败，使用默认视图")
        mapIns.setCenter([104.2259, 30.511926])
        mapIns.setZoom(11)
      }

      // 5. 渲染聚合点（确保在定位后执行）
      renderClusterMarkerView()
    })
  })

  mapIns.setStatus({
    dragEnable: false
  })

  initSCMap(AMapIns, mapIns)
}

// 构建四川地图区域
function initSCMap(AMapIns, mapIns) {
  const disProvince = new AMapIns.DistrictLayer.Province({
    zIndex: 12,
    adcode: [510000],
    depth: 1,
    styles: {
      fill: `rgba(174, 197, 253, 0.1)`,
      "province-stroke": "rgb(69, 123, 255)", // 省边界
      "city-stroke": "rgb(69, 123, 255)", // 市边界
      "county-stroke": "rgb(69, 123, 255)", // 区县边界
      "stroke-width": "1"
    }
  })

  disProvince.setMap(mapIns)
}

async function renderClusterMarkerView() {
  await getData()

  const renderPoints = points.map((i) => {
    return {
      lnglat: i
    }
  })
  new AMapIns.MarkerCluster(
    mapIns, //地图实例
    renderPoints, //海量点数据，数据中需包含经纬度信息字段 lnglat
    {
      gridSize: 60, //数据聚合计算时网格的像素大小
      renderClusterMarker: _renderClusterMarker, //上述步骤的自定义聚合点样式
      renderMarker: _renderClusterMarker //上述步骤的自定义非聚合点样式
    }
  )
  mapIns.setFitView()
  mapIns.setZoom(6.7)
}

async function getData() {
  const { data, code } = await egressAddress(props.labId)
  if (code === 20000) {
    points = data.map((i: any) => {
      return [i.locateLongitude, i.locateLatitude]
    })
  }
  console.log("points", points)
}

defineExpose({
  getData: renderClusterMarkerView
})
</script>
<style lang="less" scoped>
.map-out-eq {
  height: 100%;
  width: 100%;
  position: relative;
  .title {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 999;
    font-size: 0.24rem;
    text-shadow: 0.02rem 0 0.08rem #128cff;
    height: 0.47rem;
    line-height: 0.47rem;
    text-align: center;
    background: rgba(0, 102, 236, 0.1);
    box-sizing: border-box;
    border: 1px solid;
    border-image: linear-gradient(
        270deg,
        rgba(0, 102, 236, 0) 0%,
        rgba(0, 102, 236, 0.8) 52%,
        rgba(0, 102, 236, 0) 100%
      )
      1;
  }
}
.a {
  width: 0.6rem;
  height: 0.46rem;
  font-size: 0.24rem;
  text-align: center;
  font-weight: bolder;
  color: #fff;
  text-shadow: 0.02rem 0 0.08rem #128cff;
  background: url("@/assets/images/outroom/mark.png") no-repeat center/100% 100%;
}
</style>
