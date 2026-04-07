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
            :loading="searchLoading"
            @search="onSearch"
          />
          <div v-if="showsearchResult">
            <div
              v-for="(item, index) in poiList"
              :key="index"
              class="bg-[var(--colorBgContainer)] p-3 border-b cursor-pointer"
              @click="markerResult(item)"
            >
              {{ item.title }}
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

const searchLoading = ref(false)

let baiduMap: any = null

let placeSearchComponent: any = null

let currentPostion: any = []

let currentPath: any = null

function init() {
  const urlSearchParams = new URLSearchParams(location.search)
  const lng = urlSearchParams.get('lng')
  const lat = urlSearchParams.get('lat')
  const mapRange = urlSearchParams.get('mapRange') || 500
  currentPostion = [lng, lat]
  radius.value = mapRange as unknown as number
}
init()

function mapReady(bm: any) {
  isReady.value = true
  baiduMap = bm
  mapInit()
}

/**
 * # 初始化地图搜索功能
 */
function mapInit() {
  placeSearchComponent = new window.BMap.LocalSearch(baiduMap, {
    onSearchComplete: (result: any) => {
      searchLoading.value = false
      showsearchResult.value = true
      if (placeSearchComponent.getStatus() === 0) {
        const s: any[] = []
        for (let i = 0; i < result.getCurrentNumPois(); i++) {
          s.push(result.getPoi(i))
        }
        poiList.value = s
      }
    },
  })

  baiduMap.addEventListener('click', (ev: any) => {
    const lng = ev.point.lng
    const lat = ev.point.lat
    addCircle(lng, lat)
  })

  if (currentPostion?.length && radius.value) {
    addCircle(currentPostion[0], currentPostion[1])
  }
}

function addCircle(lng: number, lat: number) {
  // 清除所有覆盖物
  baiduMap.clearOverlays()

  // 创建圆形覆盖物
  const center = new window.BMap.Point(lng, lat)
  const circle = new window.BMap.Circle(center, radius.value, {
    strokeColor: '#43a5fa',
    strokeWeight: 3,
    strokeOpacity: 1,
    fillColor: '#43a5fa',
    fillOpacity: 0.35,
  })

  // 标注
  const label = new window.BMap.Label(`半径${radius.value}米`, {
    position: center,
    offset: new window.BMap.Size(-30, -30),
  })
  label.setStyle({
    border: '1px solid #43a5fa',
    background: 'rgba(255,255,255,0.8)',
  })

  // 添加到地图
  baiduMap.addOverlay(circle)
  baiduMap.addOverlay(label)

  // 启用拖拽编辑
  circle.enableEditing()

  // 更新当前坐标和路径
  currentPostion = [lng, lat]
  currentPath = circle.getPath ? circle.getPath() : null

  // 监听拖拽结束事件
  circle.addEventListener('lineupdate', () => {
    radius.value = Math.floor(circle.getRadius())
    label.setContent(`半径${radius.value}米`)
    const newCenter = circle.getCenter()
    currentPostion = [newCenter.lng, newCenter.lat]
  })

  // 缩放视图适应圆
  baiduMap.setCenter(center)
  baiduMap.setZoom(20)
}

/**
 * # 搜索
 */
function onSearch() {
  searchLoading.value = true
  placeSearchComponent.search(queryStr.value)
}

/**
 * # 选中地址添加标记并移动地图
 */
function markerResult(data: any) {
  showsearchResult.value = false
  queryStr.value = data.title

  const point = new window.BMap.Point(data.point.lng, data.point.lat)
  const marker = new window.BMap.Marker(point)
  baiduMap.addOverlay(marker)
  baiduMap.panTo(point)
  baiduMap.setZoom(20)
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
