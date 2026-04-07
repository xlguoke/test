<template>
  <div class="content-wrap flex-column">
    <RoomCard title="" class="flex-column flex-h-1">
      <ul v-if="isType" class="my-tab font-ys">
        <li :class="selTab == 1 ? 'it active' : 'it'" @click="selTabEvent(1)">
          入库
          <div v-if="selTab == 1" class="border_icon"></div>
        </li>

        <li :class="selTab == 2 ? 'it active' : 'it'" @click="selTabEvent(2)">
          出库
          <div v-if="selTab == 2" class="border_icon"></div>
        </li>
      </ul>

      <RoomSearch
        v-model="search.quickQry"
        placeholder="请输入样品名称，样品编号"
        @search="searchTask"
      />

      <div class="data-list-scroll flex-1">
        <ul class="task-list">
          <li
            v-for="(d, i) in taskDatas"
            :key="d.id"
            :class="`task-item ${checkInd === i ? 'active' : ''}`"
            @click="selectedTask(i)"
          >
            <p class="sample-name font-ys">
              <span class="label">{{ d.testSampleDisplayName }}</span>
              <span style="letter-spacing: 0">{{ d.periodCode || d.testObjectCode }}</span>
            </p>

            <van-row class="sample-info">
              <van-col span="12">
                <span class="label">样品名称：</span>
                {{ d.testSampleDisplayName }}
              </van-col>
              <van-col span="12">
                <span class="label">样品数量：</span>
                {{ d.sampleNum || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">留样日期：</span>
                {{ d.reserveTime ? formatDate(d.reserveTime, 1) : "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">留样数量：</span>
                {{ d.inAmount }}
              </van-col>
              <van-col span="12">
                <span class="label">规格型号：</span>
                {{ d.standard || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">{{ selTab == 2 ? "出库人" : "留样人" }}：</span>
                {{ d.inOperator || "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">留样到期日期：</span>
                {{ d.reserveOverDue ? formatDate(d.reserveOverDue, 1) : "--" }}
              </van-col>
              <van-col span="12">
                <span class="label">留样地点：</span>
                {{ d.inSaveSite || "--" }}
              </van-col>
            </van-row>

            <img
              v-if="selTab == 2"
              style="width: 1.3rem; position: absolute; right: 0; top: 0"
              src="@/assets/images/1223.png"
            />
          </li>
          <li v-if="taskDatas.length === 0" class="no-data">暂无数据</li>
          <li v-else-if="taskDatas.length === total" style="text-align: center; line-height: 1rem">
            到底啦~
          </li>
        </ul>
      </div>
    </RoomCard>

    <div class="foot-btns">
      <div class="btn back font-ys" @click="back">返回</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject } from "vue"
import { message } from "ant-design-vue"
import { useRouter, useRoute } from "vue-router"
import { RoomCard, RoomSearch } from "../components"
import { getStandardOutAndIn, getTodayExpireList, getExpiredList } from "@/api/retainSampleRoom.api"
import { formatDate } from "@/utils/utils"

const router = useRouter()
const route = useRoute()
onMounted(() => {
  initPage()
})

const loading = ref(inject("loading") as boolean)

let inStock = ""
let outStock = ""
let isType = ref(false)

function initPage() {
  let t = route.query.type
  switch (t) {
    case "2":
      inStock = "TODAY_IN"
      outStock = "TODAY_OUT"
      search.value.queryType = inStock
      isType.value = true
      break
    case "3":
      inStock = "WEEK_IN"
      outStock = "WEEK_OUT"
      search.value.queryType = inStock
      isType.value = true
      break
    case "4":
      inStock = "MONTH_IN"
      outStock = "MONTH_OUT"
      search.value.queryType = inStock
      isType.value = true
      break
    default:
      search.value.queryType = t
      isType.value = false
      break
  }
  getTestTaskData()
}

let selTab = ref(1)
const selTabEvent = (v) => {
  selTab.value = v
  search.value.queryType = v == 1 ? inStock : outStock
  taskDatas.value = []
  search.value.quickQry = ""
  getTestTaskData()
}

// 搜索任务
const searchTask = () => {
  taskDatas.value = []
  search.value.page = 1
  search.value.quickQry = search.value.quickQry.trim()
  checkInd.value = -1
  getTestTaskData()
}

// 获取任务列表
const checkInd = ref(-1)
const search: any = ref({
  quickQry: "",
  page: 1,
  size: 99999,
  queryType: "",
  labId: route.query.labId
})

const total = ref(0)
const taskDatas = ref<any>([])
const getTestTaskData = async () => {
  loading.value = true
  let res
  if (route.query.type == "THREE_DAY_EXPIRE") {
    res = await getTodayExpireList(search.value)
  } else if (route.query.type == "EXPIRED") {
    res = await getExpiredList(search.value)
  } else {
    res = await getStandardOutAndIn(search.value)
  }
  loading.value = false
  if (res.code === 20000) {
    const list = res.data.rows || []
    taskDatas.value.push(...list)
    total.value = res.data.count
  } else {
    message.error(res.message || "系统异常，请稍后重试")
  }
}

// 选择任务
const selectedTask = (ind) => {
  checkInd.value = ind
}

// 返回
const back = () => {
  router.go(-1)
}
</script>
