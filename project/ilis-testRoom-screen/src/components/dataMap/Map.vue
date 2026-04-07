<template>
  <div :id="mapId" style="height: 100%"></div>
</template>

<script setup lang="ts">
/**
 * 高德api文档：https://lbs.amap.com/api/javascript-api-v2/guide/abc/plugins-list
 */
import AMapLoader from "@amap/amap-jsapi-loader"
import { onMounted, onUnmounted, ref } from "vue"

export interface MapReady {
  AMap: any
  map: any
}

const props = withDefaults(
  defineProps<{
    /**
     * # 地图样式
     * 详见样式定制 https://lbs.amap.com/demo/javascript-api-v2/example/personalized-map/custom_style
     */
    mapStyle?: string
    /**
     * # 是否显示比例尺
     */
    isShowScale?: boolean
    /**
     * # 是否显示定位
     */
    isShowGeoLocation?: boolean
  }>(),
  {
    mapStyle: undefined,
    isShowScale: true,
    isShowGeoLocation: true
  }
)

const emits = defineEmits<{
  /** 地图加载完成只是 */
  (e: "ready", data: MapReady): void
  (e: "click", data: any): void
}>()

// const SECURITY_JS_CODE = "138d6d2c2181f081fc4f8cfd70246b43"

// const KEY = "af75e06a8e8e1b9e95ca342897f82a53"

const SECURITY_JS_CODE = "911e14b9c041330c48648ecbb1c24362"

const KEY = "c2d54b9d0fe579d1c222d22054e70499"

const mapId = `map-${Date.now()}`

const zoom = ref(15)

const center = ref([106.510683, 29.615676])

let map: any = null

let AMap: any = null

function mapLoader() {
  AMapLoader.load({
    key: KEY, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    plugins: [
      "AMap.Scale", // 缩放比例尺插件
      "AMap.Geolocation", // 浏览器定位，提供了获取用户当前准确位置、所在城市的方法
      "AMap.PlaceSearch",
      "AMap.CitySearch",
      "AMap.AutoComplete",
      "AMap.Geocoder",
      "AMap.MarkerCluster"
    ]
  })
    .then((_AMap) => {
      AMap = _AMap
      map = new AMap.Map(mapId, {
        // 设置地图容器id
        viewMode: "3D", // 是否为3D地图模式
        zoom: zoom.value, // 初始化地图级别
        center: center.value, // 初始化地图中心点位置
        mapStyle: props?.mapStyle // 地图样式
      })

      emits("ready", { AMap, map })

      // 初始化插件
      initPlugins()

      // 初始化地图事件
      initMapEvent()
    })
    .catch((e) => {
      console.error("初始化地图失败：", e)
    })
}

// 初始化插件
function initPlugins() {
  if (props.isShowScale) {
    const scale = new AMap.Scale()
    map.addControl(scale)
  }
  if (props.isShowGeoLocation) {
    const geolocation = new AMap.Geolocation()
    map.addControl(geolocation)
  }
}

// 地图交互事件
function initMapEvent() {
  map.on("click", (ev: any) => {
    emits("click", ev)
  })
}

onMounted(() => {
  ;(window as any)._AMapSecurityConfig = {
    securityJsCode: SECURITY_JS_CODE
  }
  mapLoader()
})

onUnmounted(() => {
  AMap = null
  map = null
  map?.destroy()
})
</script>

<style></style>
