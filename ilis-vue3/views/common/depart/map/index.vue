<template>
  <IlisContainer app-id="depart_map">
    <div class="h-full flex flex-col">
      <div class="mb-3">
        <a-input-number
          v-model:value="radius"
          style="width: 240px"
          :min="1"
          @change="radiusChange"
        >
          <template #addonBefore>
            误差范围
          </template>
        </a-input-number>
        <a-button disabled>
          米（m）
        </a-button>
      </div>
      <div class="flex-1 h-0 relative rounded-lg overflow-hidden">
        <!-- 搜索 -->
        <div class="absolute left-5 top-5 p-3 z-10">
          <a-input-search
            v-model:value="queryStr"
            placeholder="请输入"
            enter-button
            allow-clear
            size="large"
            style="width: 380px"
            @search="onSearch"
          />
          <div v-if="showsearchResult">
            <div
              v-for="(item, index) in poiList"
              :key="index"
              class="bg-white p-3 border-b cursor-pointer"
              @click="markerResult(item)"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
        <HtMap @ready="mapReady"></HtMap>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { ValueType } from 'ant-design-vue/es/input-number/src/utils/MiniDecimal'
import { HtMap } from '~/components/htMap'

const isReady = ref(false)

const queryStr = ref('')

const showsearchResult = ref(false)

const poiList = ref([] as any[])

const radius = ref(500)

let AMapIns: any = null

let mapIns: any = null

let placeSearchComponent: any = null

let currentPostion: any = []

let currentPath: any = null

let circleEditor: any = null

function init() {
  const urlSearchParams = new URLSearchParams(location.search)
  const lng = urlSearchParams.get('lng')
  const lat = urlSearchParams.get('lat')
  const mapRange = urlSearchParams.get('mapRange') || 500
  currentPostion = [lng, lat]
  radius.value = mapRange as unknown as number
}
init()

function mapReady({ AMap, map }: any) {
  isReady.value = true
  AMapIns = AMap
  mapIns = map
  mapInit(AMap)
}

/**
 * # 初始化地图搜索功能
 */
function mapInit(AMap: any) {
  placeSearchComponent = new AMap.PlaceSearch()
  mapIns.on('click', (e: any) => {
    const lng = e.lnglat.lng
    const lat = e.lnglat.lat
    addCircle(lng, lat)
  })
  if (currentPostion?.length && radius.value) {
    addCircle(currentPostion[0], currentPostion[1])
  }
}

function addCircle(lng: number, lat: number) {
  const circle = new AMapIns.Circle({
    center: new AMapIns.LngLat(lng, lat), // 圆心位置
    radius: radius.value, // 半径
    strokeColor: '#F33', // 线颜色
    strokeOpacity: 1, // 线透明度
    strokeWeight: 3, // 线粗细度
    fillColor: '#ee2200', // 填充颜色
    fillOpacity: 0.35, // 填充透明度
    draggable: true,
  })
  currentPath = circle.getPath()
  currentPostion = [lng, lat]
  mapIns.clearMap()// 清除所有覆盖物（点标志）
  mapIns.add(circle) // 添加圆
  addCircleEditor(circle)
  // 获取圆的path
  checkIsPointInRing(circle.getPath())
  // 监听圆形拖拽结束事件
  circle.on('dragend', () => {
    checkIsPointInRing(circle.getPath())
  })
  // 点击后在对应位置重新创建圆
  circle.on('click', (e: any) => {
    const lng = e.lnglat.lng
    const lat = e.lnglat.lat
    addCircle(lng, lat)
  })
  // 计算合适的缩放级别
  mapIns.setFitView()
}

function addCircleEditor(circle: any) {
  circleEditor?.close()
  circleEditor = new AMapIns.CircleEditor(mapIns, circle)
  circleEditor.open()
  circleEditor.on('end', (e: any) => {
    checkIsPointInRing(e.target.getPath())
  })
  circleEditor.on('move', (e: any) => {
    checkIsPointInRing(e.target.getPath())
    const center = e.target.getCenter()
    currentPostion = [center.lng, center.lat]
  })
  circleEditor.on('adjust', (e: any) => {
    radius.value = e.target.getRadius()
    checkIsPointInRing(e.target.getPath())
  })
}

function checkIsPointInRing(path: any) {
  const isPointInRing = AMapIns.GeometryUtil.isPointInRing(currentPostion, path)
  return isPointInRing
}

/**
 * # 搜索
 */
function onSearch() {
  placeSearchComponent.search(queryStr.value, (status: any, result: any) => {
    if (status === 'complete' && result?.info === 'OK') {
      showsearchResult.value = true
      poiList.value = result.poiList.pois
    }
    else {
      showsearchResult.value = false
      poiList.value = []
    }
  })
}

/**
 * # 选中地址添加标记并移动地图
 */
function markerResult(data: any) {
  showsearchResult.value = false
  queryStr.value = data.name
  const marker = new AMapIns.Marker({
    position: [Number(data.location.lng), Number(data.location.lat)],
  })
  currentPostion = marker.getPosition()
  mapIns.add(marker)// 添加点标志
  setTimeout(() => {
    mapIns.setCenter(data.location)
    mapIns.setZoom(15)
  }, 50)
}

function radiusChange(val: ValueType) {
  radius.value = Number(val)
  if (Number(val) <= 0) {
    return
  }
  addCircle(currentPostion[0], currentPostion[1])
}

// 提供给jsp页面使用
function getMapData(index: number, parentCallName: any) {
  parentCallName({
    lng: currentPostion[0],
    lat: currentPostion[1],
    mapRange: radius.value,
    path: JSON.stringify(currentPath),
  }, index)
}
window.getMapData = getMapData
</script>
