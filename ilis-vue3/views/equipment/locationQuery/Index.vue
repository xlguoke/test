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
      <HtMap
        ref="htMapRef"
        :markers="results"
        :info-window-v-node="infoWindowVNode"
        @ready="readyMap"
        @marker-click="markerClick"
        @info-window-click="infoWindowClick"
      ></HtMap>
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
import { egressStatisticsApi } from './api'
import Search, { type ClickDataItemEmit, type SearchEmit, type SearchResult } from './components/Search.vue'
import { HtMap, type Marker } from '~/components/htMap'

const eqStatistics = 'w-[64px] h-[64px] rounded-full bg-[#0066ec] p-2 text-white flex flex-col justify-center items-center'

const searchRef = ref()
const htMapRef = ref()
const isReady = ref(false)
const egressInfo = ref({
  egressCount: 0,
  notEgressCount: 0,
})

function readyMap() {
  isReady.value = true
  getData()
}

async function getData() {
  const { data } = await egressStatisticsApi()
  egressInfo.value = data
}

const showHistory = ref(false)
const results = ref<Marker[]>([])
const iconUrl = new URL('~/assets/img/icon-location-1.svg', import.meta.url).href

function markerField(d: SearchResult): Marker<SearchResult> {
  return {
    lng: d.locateLongitude,
    lat: d.locateLatitude,
    address: d.locate,
    title: '',
    icon: '',
    data: d,
  }
}

/**
 * 搜索
 */
function handleSearch(data: SearchEmit) {
  showHistory.value = data.showHistory
  results.value = data.datas.map((d, i) => {
    const item = markerField(d)
    item.title = data.showHistory ? `${i + 1}` : ''
    item.icon = data.showHistory ? iconUrl : ''
    return item
  })
}

/**
 * 点击数据
 */
function handleClickDataItem(data: ClickDataItemEmit) {
  const marker = markerField(data.data)
  htMapRef.value?.triggerMarkerClick(data.index, marker)
}

/**
 * 信息窗体
 */
function infoWindowVNode(marker: Marker<SearchResult>) {
  const eqName = marker.data?.equipmentName || '-'
  const sn = marker.data?.equipmentSn || ''

  return h('div', { class: 'map-info-window' }, [
    h('div', { class: 'map-info-window-title' }, `${eqName}${sn ? `（${sn}）` : ''}`),
    h('div', { class: 'map-info-window-content' }, [
      h('div', { class: 'con' }, [
        h('p', {}, `上报地址：${marker.address}`),
        h('p', {}, `经纬坐标：${marker.lng}, ${marker.lat}`),
      ]),
    ]),
    h('div', { class: 'map-info-window-reported' }, [
      h('span', {}, `上报人：${marker.data?.escalationUser}`),
      h('span', {}, `上报时间：${marker.data?.escalationTime}`),
    ]),
    showHistory.value
      ? null
      : h('a', { 'class': 'history', 'data-id': marker.data?.id }, '历史轨迹'),
  ])
}

/**
 * 标记点击事件
 */
function markerClick(marker: Marker) {
  searchRef.value.selectedDataItem(marker.data)
}

/** 信息窗体点击事件 */
function infoWindowClick(e: any) {
  const ev = e.originEvent
  if (ev.target.classList.contains('history')) {
    const id = ev.target.getAttribute('data-id')
    const data = results.value.find(r => r.data?.id === id)
    if (!data)
      return
    searchRef.value.showHistoryList(data.data)
  }
}
</script>

<style>
.map-info-window-title{
  padding: 4px 0;
  margin-bottom: 4px;
  max-width: 500px;
  min-width: 300px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
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
  color: #0066ec;
  border-top: 1px solid #eee;
}
.map-info-window .history:hover{
  opacity: .8;
}
</style>
