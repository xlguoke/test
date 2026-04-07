<template>
  <IlisContainer app-id="equipment_location">
    <div class="h-full relative">
      <ul v-if="isReady" class="absolute top-5 left-5 z-10 flex gap-[20px]">
        <li :class="eqStatistics">
          <p>{{ egressInfo.egressCount || 0 }}</p>
          外出
        </li>
        <li :class="eqStatistics">
          <p>{{ egressInfo.notEgressCount || 0 }}</p>
          未外出
        </li>
      </ul>
      <HtMap ref="htMapRef" @ready="readyMap" />
      <Search
        v-if="isReady"
        ref="searchRef"
        @search="handleSearch"
        @click-data-item="handleClickDataItem"
      />
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { ClickDataItemEmit, SearchEmit, SearchResult } from './components/Search.vue'
import { renderToString } from '@vue/test-utils'
import { HtMap } from '~/components/htMap'
import { egressStatisticsApi } from './api'
import Search from './components/Search.vue'

const eqStatistics = 'w-[64px] h-[64px] rounded-full bg-[var(--colorPrimary)] p-2 text-white flex flex-col justify-center items-center'

let baiduMap: any = null

const searchRef = ref()
const htMapRef = ref()
const isReady = ref(false)
const egressInfo = ref({
  egressCount: 0,
  notEgressCount: 0,
})

const eqSearchList = ref<SearchResult[]>([])

function readyMap(bm: any) {
  baiduMap = bm
  isReady.value = true
  getData()
  renderEqMarker()
}

async function getData() {
  const { data } = await egressStatisticsApi()
  egressInfo.value = data
}

const showHistory = ref(false)
const yellowIconUrl = new URL('~/assets/img/icon-location-1.svg', import.meta.url).href
const blueIconUrl = new URL('~/assets/img/icon-location.svg', import.meta.url).href

const markerMap: { [key: string]: any } = {}

const infoWindow = new window.BMap.InfoWindow('', {
  offset: new window.BMap.Size(0, -32),
})

function renderEqMarker() {
  // 自定义图标
  const myIcon = new window.BMap.Icon(
    showHistory.value ? yellowIconUrl : blueIconUrl,
    new window.BMap.Size(32, 32),
    {
      anchor: new window.BMap.Size(16, 32), // 锚点位置（尖角对准坐标点）
      imageSize: new window.BMap.Size(32, 32), // 图片实际大小
    },
  )

  if (baiduMap) {
    // 清理所有覆盖物
    baiduMap.clearOverlays()

    for (let i = 0; i < eqSearchList.value.length; i++) {
      const item = eqSearchList.value[i]
      const point = new window.BMap.Point(item.locateLongitude, item.locateLatitude)

      // 创建覆盖物
      const marker = new window.BMap.Marker(point, {
        icon: myIcon,
      })

      if (showHistory.value) {
        const label = new window.BMap.Label(i + 1, {})
        label.setStyle({
          backgroundColor: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '14px',
          paddingLeft: '12px',
          paddingTop: '6px',
        })
        marker.setLabel(label)
      }

      markerMap[item.id] = marker

      baiduMap.addOverlay(marker)

      marker.addEventListener('click', () => {
        searchRef.value.selectedDataItem(item)
        updateInfoWindow(item)
      })

      if (i === 0) {
        baiduMap.centerAndZoom(point, 16)
      }
    }
  }
}

/**
 * 搜索
 */
function handleSearch(data: SearchEmit) {
  showHistory.value = data.showHistory
  eqSearchList.value = data.datas

  renderEqMarker()
}

/**
 * 点击数据
 */
async function handleClickDataItem(data: ClickDataItemEmit) {
  const item = data.data

  await updateInfoWindow(item)
  const point = new window.BMap.Point(item.locateLongitude, item.locateLatitude)
  baiduMap.centerAndZoom(point, 16)

  for (const key in markerMap) {
    const marker = markerMap[key]

    if (marker) {
      marker.setTop(key === item.id)
    }
  }
}

async function updateInfoWindow(item: SearchResult) {
  const content = await renderToString(getInfoWindowVNode(item))
  const point = new window.BMap.Point(item.locateLongitude, item.locateLatitude)
  infoWindow.setContent(content)
  baiduMap.openInfoWindow(infoWindow, point)

  setTimeout(() => {
    const el = document.querySelector('.map-info-window .history')
    if (el) {
      el.addEventListener('click', () => {
        searchRef.value.showHistoryList(item)
      })
    }
  }, 100)
}

/**
 * 信息窗体
 */
function getInfoWindowVNode(item: SearchResult) {
  const eqName = item.equipmentName || '-'
  const sn = item.equipmentSn || ''

  return h('div', { class: 'map-info-window' }, [
    h('div', { class: 'map-info-window-title' }, `${eqName}${sn ? `（${sn}）` : ''}`),
    h('div', { class: 'map-info-window-content' }, [
      h('div', { class: 'con' }, [
        h('p', {}, `上报地址：${item.locate}`),
        h('p', {}, `经纬坐标：${item.locateLongitude}, ${item.locateLatitude}`),
      ]),
    ]),
    h('div', { class: 'map-info-window-reported' }, [
      h('span', {}, `上报人：${item.escalationUser}`),
      h('span', {}, `上报时间：${item.escalationTime}`),
    ]),
    showHistory.value
      ? null
      : h('span', { class: 'history', onClick: 'eqLocationQueryInfoWindowClick(item.id)' }, '历史轨迹'),
  ])
}
</script>

<style>
.map-info-window-title{
  padding: 4px 0;
  margin-bottom: 4px;
  max-width: 500px;
  min-width: 300px;
  font-size: 14px;
  border-bottom: 1px solid var(--colorSplit);
}
.map-info-window-content{
  display: flex;
  justify-content: space-between;
}
.map-info-window-content .con{
  flex: 1;
  margin-right: 8px;
  width: 0;
}
.map-info-window-reported{
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
}
.map-info-window .history{
  display: block;
  margin-top: 8px;
  text-align: center;
  line-height: 28px;
  color: var(--colorPrimary);
  border-top: 1px solid var(--colorSplit);
}
.map-info-window .history:hover{
  opacity: .8;
}
</style>
