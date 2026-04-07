<!-- 化学品列表 -->
<template>
  <div class="content-wrap flex-column">
    <div class="data-list-warp flex-column">
      <RoomSearch
        v-model="search.quickQry"
        placeholder="请输入化学名称查询"
        @search="handleSearch()"
      />
      <div ref="contentWrap" class="data-list-box" @scroll="handlescroll">
        <div v-for="item in listData" :key="item.id" class="data-list-item">
          <p
            class="item-name"
            :style="{
              paddingRight:
                item.nextCheckDate && timeShip >= item.nextCheckDate ? '0.82rem' : '0.06rem'
            }"
          >
            {{ `${item.name}${item.sn ? `(${item.sn})` : ""}` }}
          </p>
          <van-row>
            <van-col span="12">
              <span class="item-label">所属类别:</span>
              <span class="item-value">{{ item.categoryName }}</span>
            </van-col>
            <van-col span="12">
              <span class="item-label">纯度:</span>
              <span class="item-value">{{ item.purity }}</span>
            </van-col>
            <van-col span="12">
              <span class="item-label">用途:</span>
              <span class="item-value">{{ item.effect }}</span>
            </van-col>
            <van-col span="12">
              <span class="item-label">数量:</span>
              <span class="item-value">{{ item.amount }}</span>
            </van-col>
            <van-col span="12">
              <span class="item-label">生产厂家:</span>
              <span class="item-value">
                {{ item.manufacturer }}
              </span>
            </van-col>
          </van-row>

          <img
            v-if="item.nextCheckDate && timeShip >= item.nextCheckDate"
            class="item-status-icon"
            src="@/assets/images/yidaoqi.png"
            alt=""
          />
        </div>
        <div v-if="total == 0 && listData && listData.length <= 0" class="no-data">暂无数据</div>
        <li v-else-if="listData.length === total" class="no-data">到底啦~</li>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, inject } from "vue"
import { message } from "ant-design-vue"
import { storeToRefs } from "pinia"
import { formatDate } from "@/utils/utils"
import { getChemicalList } from "@/api/testRoom.api"
import { functionRoomStore } from "@/store/functionRoom"
import RoomSearch from "../../components/RoomSearch.vue"
const { labInfo } = storeToRefs(functionRoomStore())
interface DeviceInfo {
  page: number
  size: number
  quickQry?: string
  laboratoryScreenId: string
}
let timer: any = null
let fun: any = null
const loading = ref(inject("loading") as boolean)
const listData = ref<any>([])
const total = ref<number>(0)
const timeShip: number = new Date().getTime()
const search = ref<DeviceInfo>({
  quickQry: "",
  page: 1,
  size: 20,
  laboratoryScreenId: labInfo.value.id
})
const contentWrap = ref()

// 初始化html字体大小
onMounted(() => {
  initPage()
})
const initPage = () => {
  getData()
  fun = debounce()
}
const getData = async (flag?: boolean) => {
  !flag && (loading.value = true)
  try {
    const result = await getChemicalList(search.value)
    if (result.code !== 20000) {
      return message.error(result.message || "系统异常，请稍后重试")
    }
    if (result.code === 20000) {
      if (search.value.page === 1) {
        // 不清空列表,避免自动刷新时内容部分先变成空白再显示数据,导致页面闪动,影响观感
        contentWrap.value && (contentWrap.value.scrollTop = 0)
        listData.value = result.data.rows
      } else {
        listData.value = [...listData.value, ...result.data.rows]
      }
      total.value = result.data.count
    }
    // 判断是否还有数据
    nextTick(() => {
      // 没有滚动条且还有数据
      if (contentWrap.value && contentWrap.value.scrollHeight <= contentWrap.value.clientHeight) {
        if (total.value > listData.value.length) {
          nextTask()
        }
      }
    })
  } finally {
    loading.value = false
  }
}
const nextTask = () => {
  search.value.page++
  getData()
}

// 搜索任务
const handleSearch = (flag?: boolean) => {
  search.value.page = 1
  total.value = 0
  getData(flag)
}
// 滚动分页
const handlescroll = () => {
  // 判断是否有滚动条
  if (contentWrap.value.scrollHeight <= contentWrap.value.clientHeight) return
  // 如果滚动到底部,scrollTop = 0;
  if (
    contentWrap.value.scrollTop + contentWrap.value.clientHeight + 50 >=
    contentWrap.value.scrollHeight
  ) {
    // 防抖节流控制
    fun && fun()
  }
}

const debounce = () => {
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      if (total.value == listData.value.length) {
        return
      }
      search.value.page++
      getData()
    }, 100)
  }
}
onBeforeUnmount(() => {
  timer && clearInterval(timer)
})

defineExpose({
  refreshData: () => handleSearch(true)
})
</script>
