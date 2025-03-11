<template>
  <div class="absolute right-5 top-5 p-3 gap-3 bg-white rounded">
    <a-spin :spinning="loading">
      <a-input-search
        v-show="!showHistory"
        v-model:value="query"
        placeholder="输入设备名称、设备编号"
        enter-button
        allow-clear
        size="large"
        style="width: 380px"
        @search="onSearch"
      />
      <div v-if="showResultList.length" class="flex flex-col w-[380px] h-[75vh]">
        <div v-show="showHistory">
          <p
            class="mb-2 text-[#0066ec] cursor-pointer hover:opacity-80"
            @click="backToResult"
          >
            &lt; 返回上一级搜索结果
          </p>
          <p class="flex justify-between p-2 bg-gray-100">
            <span>{{ selectedResult?.equipmentName }}</span>
            <span>历史轨迹</span>
          </p>
        </div>
        <a-select
          v-model:value="queryType"
          style="width: 100%;"
          class="mt-2"
          :options="options"
          placeholder="排序方式"
        />
        <ul class="mt-2 overflow-y-auto flex-1">
          <li
            v-for="(d, i) in showResultList" :key="d.id"
            :class="d.index === activeIndex ? 'bg-blue-100' : 'hover:bg-gray-100'"
            class="relative rounded mb-2 p-2 border overflow-hidden"
            @click="clickDataItem(d, d.index)"
          >
            <div class="cursor-default">
              <div class="text-sm flex items-center">
                <p v-if="showHistory" class="mr-2 location-icon text-center text-white text-xs">
                  <span class="relative z-10">{{ i + 1 }}</span>
                </p>
                <span class="mr-2">{{ d.equipmentName }}</span>
                <a-tag v-if="d.egressStatus">
                  {{ EGRESS_STATUS_DICT.getLabelByKey(d.egressStatus) }}
                </a-tag>
              </div>
              <p class="mt-1 flex">
                <span class="w-16 text-right">设备编号：</span>
                <span class="flex-1 w-0">{{ d.equipmentSn || '-' }}</span>
              </p>
              <p class="flex">
                <span class="w-16 text-right">上报地址：</span>
                <span class="flex-1 w-0">{{ d.locate }}</span>
              </p>
              <p class="flex">
                <span class="w-16 text-right">经纬坐标：</span>
                <span class="flex-1 w-0">{{ d.locateLongitude }},{{ d.locateLatitude }}</span>
              </p>
              <p class="flex justify-between gap-4">
                <span class="flex justify-start"><span class="w-16 text-right">上报人：</span>{{ d.escalationUser }}</span>
                <span>上报时间：{{ d.escalationTime }}</span>
              </p>
            </div>
            <a
              v-if="!showHistory"
              class="block mt-2 pt-1 w-full text-[#0066ec] text-center border-t"
              @click.stop="showHistoryDetail(d)"
            >
              历史轨迹
            </a>
          </li>
        </ul>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang='ts'>
import { egressLocateApi, egressLocateLocusApi } from '../api'
import { EGRESS_STATUS_DICT } from '..'

export interface SearchResult {
  id: string
  sysCompanyCode?: string
  unitCode?: string
  equipmentId?: string
  equipmentName: string
  equipmentSn: string
  egressId: string
  egressApplyId: string
  egressStatus: string
  locateLongitude: number
  locateLatitude: number
  locate: string
  recent?: string
  escalationTime: string
  escalationUserId?: string
  escalationUser: string
  index: number
}

export interface SearchEmit {
  datas: SearchResult[]
  showHistory: boolean
}

export interface ClickDataItemEmit {
  data: SearchResult
  index: number | null
}

const emits = defineEmits<{
  (e: 'search', data: SearchEmit): void
  (e: 'clickDataItem', data: ClickDataItemEmit): void
}>()

const activeIndex = ref(-1)
const loading = ref(false)
const query = ref('')
const queryType = ref(1)
const options = ref([
  { value: 1, label: '按上报时间倒序' },
  { value: 2, label: '按上报时间正序' },
])
// 搜索结果
const searchResult = ref<SearchResult[]>([])
// 历史轨迹
const historyList = ref<SearchResult[]>([])
// 是否显示历史轨迹
const showHistory = ref(false)
// 显示结果
const showResultList = computed(() => {
  const list = showHistory.value ? historyList.value : searchResult.value
  return list.sort(sortByTime)
})

// 上报时间排序
function sortByTime(p: SearchResult, n: SearchResult) {
  const t1 = p.escalationTime ? new Date(p.escalationTime).getTime() : 0
  const t2 = n.escalationTime ? new Date(n.escalationTime).getTime() : 0
  if (queryType.value === 1)
    return t2 - t1
  return t1 - t2
}

/**
 * 初始化数据时，地图上显示全部数据，查询列表不显示
 */
onMounted(async () => {
  const datas = await getLocaleList()
  emits('search', { datas, showHistory: showHistory.value })
})

// 触发查询事件
function searchCb() {
  emits('search', { datas: showResultList.value, showHistory: showHistory.value })
}

// 搜索
async function onSearch() {
  searchResult.value = await getLocaleList()
  searchCb()
}

function initDataField(d: SearchResult, index: number) {
  return {
    ...d,
    index,
    locateLongitude: Number(d.locateLongitude),
    locateLatitude: Number(d.locateLatitude),
    egressStatus: d.egressStatus ? Number(d.egressStatus) : '',
  }
}

/** 获取定位信息 */
async function getLocaleList() {
  loading.value = true
  activeIndex.value = -1
  const { data } = await egressLocateApi({ query: query.value })
  loading.value = false
  return data.map((d: SearchResult, i: number) => initDataField(d, i))
}

// 点击数据项
function clickDataItem(d: SearchResult, index: number) {
  activeIndex.value = index
  emits('clickDataItem', { data: d, index })
}

// 显示历史轨迹
const selectedResult = ref<SearchResult>()
async function showHistoryDetail(d: SearchResult) {
  loading.value = true
  activeIndex.value = -1
  const { data } = await egressLocateLocusApi(d.egressId)
  loading.value = false
  historyList.value = data.map((v: SearchResult, i: number) => initDataField(v, i))
  selectedResult.value = d
  showHistory.value = true
  searchCb()
}

/** 返回上一级搜索结果 */
function backToResult() {
  activeIndex.value = -1
  showHistory.value = false
  if (searchResult.value)
    searchCb()
}

/**
 * 选中数据：点击地图标记点触发
 */
async function selectedDataItem(d: SearchResult) {
  if (searchResult.value.length === 0) {
    searchResult.value = await getLocaleList()
  }
  for (let i = 0; i < searchResult.value.length; i++) {
    const item = searchResult.value[i]
    if (item.id === d.id) {
      activeIndex.value = item.index
      break
    }
  }
}

/**
 * 显示历史轨迹列表：点击地图标记的历史轨迹触发
 */
async function showHistoryList(d: SearchResult) {
  if (searchResult.value.length === 0) {
    searchResult.value = await getLocaleList()
  }
  showHistoryDetail(d)
}

defineExpose({
  selectedDataItem,
  showHistoryList,
})
</script>

<style scoped>
.location-icon {
  position: relative;
  top: -2px;
  width: 16px;
  height: 16px;
  background-color: orange;
  border-radius: 50%;
}

.location-icon::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  width: 0;
  height: 0;
  border-top: 12px solid orange;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  z-index: 0;
}
.ant-spin-nested-loading,
:deep(.ant-spin-container){
  height: 100%;
}
:deep(.ant-spin-container){
  display: flex;
  flex-direction: column;
}
</style>
