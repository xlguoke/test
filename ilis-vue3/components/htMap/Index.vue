<template>
  <div :id="mapId" style="height: 100%;"></div>
</template>

<script setup lang='ts'>
/**
 * 高度api文档：https://lbs.amap.com/api/javascript-api-v2/guide/abc/plugins-list
 */
import AMapLoader from '@amap/amap-jsapi-loader'
import { renderToString } from '@vue/server-renderer'
import { message } from 'ant-design-vue'

export interface Ready {
  AMap: any
  map: any
}

export interface Marker<T = any> {
  lng: number
  lat: number
  address: string
  /** 标记点显示图标 */
  icon?: string
  /** 标记点内显示内容 */
  title: string
  /** 接口返回的数据 */
  data?: T
}

const props = withDefaults(defineProps<{
  /** 标记点 */
  markers?: Array<Marker>
  showMarkerIndex?: boolean
  /** 自定义信息窗口内容，返回VNode或html字符串 */
  infoWindowVNode: (d: Marker) => VNode | string
}>(), {
  markers: () => [],
})

const emits = defineEmits<{
  /** 地图加载完成只是 */
  (e: 'ready', data: Ready): void
  (e: 'click', data: any): void
  (e: 'markerClick', data: Marker): void
  (e: 'infoWindowClick', data: any): void
}>()

const iconSize = [28, 28]
const defaultIcon = new URL('~/assets/img/icon-location.svg', import.meta.url).href
const icon = {
  type: 'image', // 图标类型，现阶段只支持 image 类型
  image: defaultIcon, // 可访问的图片 URL
  size: iconSize, // 图片尺寸
  // anchor: "center", //图片相对 position 的锚点，默认为 bottom-center
}
const SECURITY_JS_CODE = 'ed14917aab2a283820d999f862f4e4e5'
const KEY = 'd505baaf18da73d83d201e8eebebab2b'
const mapId = `map-${Date.now()}`
const zoom = ref(15)
const center = ref([106.510683, 29.615676])
let map: any = null
let AMap: any = null
let labelsLayer: any = null
let infoWindow: any = null

onMounted(() => {
  window._AMapSecurityConfig = {
    securityJsCode: SECURITY_JS_CODE,
  }
  mapLoader()
})

function mapLoader() {
  AMapLoader.load({
    key: KEY, // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    plugins: [
      'AMap.Scale', // 缩放比例尺插件
      'AMap.Geolocation', // 浏览器定位，提供了获取用户当前准确位置、所在城市的方法
      'AMap.PlaceSearch',
      'AMap.CitySearch',
      'AMap.AutoComplete',
      'AMap.CircleEditor',
    ],
  })
    .then((_AMap) => {
      AMap = _AMap
      map = new AMap.Map(mapId, {
        // 设置地图容器id
        viewMode: '3D', // 是否为3D地图模式
        zoom: zoom.value, // 初始化地图级别
        center: center.value, // 初始化地图中心点位置
      })

      emits('ready', { AMap, map })

      // 初始化插件
      initPlugins()

      // 初始化图层
      initLabelsLayer()

      // 初始化地图事件
      initMapEvent()

      // 初始化信息窗
      initInfoWindow()
    })
    .catch((e) => {
      console.error('初始化地图失败：', e)
      message.error('初始化地图失败')
    })
}

// 初始化插件
function initPlugins() {
  const scale = new AMap.Scale()
  map.addControl(scale)

  const geolocation = new AMap.Geolocation()
  map.addControl(geolocation)
}

// 地图交互事件
function initMapEvent() {
  map.on('click', (ev: any) => {
    emits('click', ev)
  })
}

// 创建 LabelsLayer 图层
function initLabelsLayer() {
  labelsLayer = new AMap.LabelsLayer({
    zooms: [5, 20],
    zIndex: 1000,
    collision: false, // 该层内标注是否避让
    allowCollision: true, // 不同标注层之间是否避让
  })
  initMarkers()
}

// 创建 LabelMarker 标记
let labelMarkers: any[] = []
async function initMarkers() {
  if (!AMap || props.markers.length === 0)
    return ''

  const dot = props.markers[0]
  center.value = [dot.lng, dot.lat]
  map.setCenter(center.value)

  for (let i = 0; i < props.markers.length; i++) {
    const item = props.markers[i]
    if (!item.lat || !item.lng)
      continue

    if (item.icon) {
      icon.image = item.icon
    }
    else {
      icon.image = defaultIcon
    }

    const labelMarker = new AMap.LabelMarker({
      name: '标注', // 此属性非绘制文字内容，仅为标识使用
      position: [item.lng, item.lat],
      zIndex: 16,
      rank: 1, // 避让优先级
      icon, // 标注图标，将 icon 对象传给 icon 属性
      text: {
        content: item.title,
        offset: [0, 22],
        style: {
          fillColor: '#ffffff',
        },
      },
    })
    labelMarkers.push(labelMarker)
    labelsLayer.add(labelMarker)

    // 点击标记点，打开信息窗口
    if (!props.infoWindowVNode)
      continue
    let content = props.infoWindowVNode(item)
    if (typeof content === 'object') {
      content = await renderToString(content)
    }
    try {
      labelMarker.on('click', (ev: any) => {
        const position = ev.target ? ev.target.getPosition() : [ev.lng, ev.lat]
        infoWindow.setContent(content)
        infoWindow.open(map, position)

        // 提升当前点击标记点的 zIndex
        labelMarkers.forEach((marker) => {
          if (marker === labelMarker) {
            marker.setzIndex(1000) // 设置为最大 zIndex
          }
          else {
            marker.setzIndex(16) // 其他标记点的 zIndex
          }
        })
        emits('markerClick', item)
      })
    }
    catch (err) {
      console.error('infowwindowVNode 解析失败: ', err)
      message.error('infowwindowVNode 解析失败')
    }
  }

  map.add(labelsLayer)
}

// 更新标记点
watch(() => props.markers, updateMarkers)
function updateMarkers(newMarkers: Array<Marker>) {
  if (!AMap || newMarkers.length === 0)
    return ''

  // 更新前删除所有标记点
  labelsLayer.remove(labelMarkers)
  labelMarkers = []
  infoWindow.close()

  initMarkers()
}

// 创建信息窗体
function initInfoWindow() {
  if (!props.infoWindowVNode)
    return
  infoWindow = new AMap.InfoWindow({
    autoMove: true,
    closeWhenClickMap: true,
    content: '',
    offset: new AMap.Pixel(0, -iconSize[1]),
  })
  infoWindow.on('click', (e: any) => {
    emits('infoWindowClick', e)
  })
}

// 更新地图中心
function updateMapCenter(center: [number, number]) {
  if (!center || center.length !== 2) {
    message.error('坐标错误')
    return
  }
  map.setCenter(center)
}

// 触发标记点点击事件
function triggerMarkerClick(index: number, data: any) {
  if (index >= 0 && index < labelMarkers.length) {
    const targetMarker = labelMarkers[index]
    AMap.Event.trigger(targetMarker, 'click', data)
    updateMapCenter([data.lng, data.lat])
  }
  else {
    message.error('Invalid marker index')
  }
}

onUnmounted(() => {
  AMap = null
  map = null
  labelsLayer = null
  map?.destroy()
})

defineExpose({
  updateMapCenter,
  triggerMarkerClick,
})
</script>

<style>

</style>
