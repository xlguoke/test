<template>
  <div class="content-wrap flex-column">
    <RoomCard title="选择试验类型" class="data-list-warp flex-column">
      <RoomSearch
        v-model="search.queryParam"
        placeholder="请输入任务编号、样品名称、样品编号、检测人查询"
        @search="searchTask"
      />

      <div ref="dataListscrollRef" class="data-list-scroll">
        <ul ref="taskListRef" class="task-list font-ys">
          <li
            v-for="(d, i) in taskDatas"
            :key="d.id"
            :class="`task-item ${checkInd === i ? 'active' : ''}`"
            @click="selectedTask(i)"
          >
            <p class="sample-name">
              {{ d.testSampleDisplayName }}
              <span style="letter-spacing: 0">{{ d.testObjectCode }}</span>
            </p>
            <p class="sample-info">
              <span class="label lg">任务编号：</span>
              {{ d.testTaskCode }}
            </p>
            <p class="sample-info">
              <span class="label lg">要求报告时间：</span>
              {{ d.requireReportDate || "--" }}
            </p>
            <p class="sample-info">
              <span class="label lg">检测人员：</span>
              {{ d.testUser || "--" }}
            </p>
          </li>
          <li v-if="taskDatas.length === 0" class="no-data">暂无数据</li>
          <li v-else-if="taskDatas.length === total" class="no-data">到底啦~</li>
        </ul>
      </div>
    </RoomCard>

    <div class="foot-btns">
      <div class="btn back" @click="back">返回</div>
      <div :class="`btn start ${checkInd == -1 ? 'disabled' : ''}`" @click="checkParamStatus">
        开始试验
      </div>
    </div>

    <!-- 选择参数弹窗 -->
    <ConfirmModal
      v-model:value="showModal"
      title="参数选择"
      @cancel="closeModal"
      @confirm="confirmTestParam"
    >
      <p
        v-for="d in params"
        :key="d.id"
        :class="`param-item ${d.checked ? 'active' : ''} ${d.status === '检测中' ? 'test' : ''}`"
        @click="clickParam(d)"
      >
        <span>{{ d.name }}</span>
      </p>
    </ConfirmModal>

    <!-- 确认弹窗 -->
    <ConfirmModal v-model:value="confirmModal" @cancel="closeConfirm" @confirm="okConfirm">
      <span>{{ errMsg }}</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue"
import { onMounted, ref, inject, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { RoomCard, RoomSearch } from "../components"
import { getTestTask, startLabTest } from "@/api/testRoom.api"
import { debounce, deepCopy, formatDate } from "@/utils/utils"
import { functionRoomStore } from "@/store/functionRoom"
const { getLabInfo } = functionRoomStore()

const router = useRouter()
const route = useRoute()
const loading = ref(inject("loading") as boolean)

// 获取任务列表
const checkInd = ref(-1)
const search = ref({
  queryParam: "",
  departIds: "",
  page: 1,
  size: 20
})
const total = ref(0)
const taskDatas = ref<any>([])
const labId = ref("")

onMounted(() => {
  labId.value = route.query.labId as string
  getTestTaskData()
  nextTick(() => {
    initScroll()
  })
})

// 搜索任务
const searchTask = () => {
  taskDatas.value = []
  search.value.page = 1
  checkInd.value = -1
  getTestTaskData()
}

const getTestTaskData = () => {
  loading.value = true
  const form = {
    ...search.value,
    departIds: functionRoomStore().labInfo.departIds
  }
  getTestTask(form)
    .then((res) => {
      loading.value = false
      if (res.code === 20000) {
        const list = res.data.rows || []
        list.forEach((d) => {
          const len = d.testUser.length - 1
          if (d.testUser && d.testUser.lastIndexOf(",") === len) {
            d.testUser = d.testUser.substr(0, len)
          }
          if (d.requireReportDate) {
            d.requireReportDate = formatDate(d.requireReportDate)
          }
        })
        taskDatas.value.push(...list)
        total.value = res.data.count
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 选择任务
const selectedTask = (ind) => {
  checkInd.value = ind
}

// 任务列表滚动事件
const dataListscrollRef = ref()
const taskListRef = ref()
let scrollHeight = 0
let oldScrollTop = 0
const initScroll = () => {
  scrollHeight = dataListscrollRef.value.clientHeight
  taskListRef.value = document.getElementById("task-list")
  dataListscrollRef.value?.addEventListener("scroll", scrollTask)
}
const scrollTask = (e) => {
  debounce(() => {
    const top = e.target.scrollTop
    if (top - oldScrollTop <= 0 || taskDatas.value.length >= total.value) return
    oldScrollTop = top
    if (taskListRef.value.clientHeight - scrollHeight - top < 100) {
      search.value.page++
      getTestTaskData()
    }
  }, 200)
}

// 检查参数状态
const showModal = ref(false)
const checkParamStatus = () => {
  if (checkInd.value === -1) return
  const testTaskParams = taskDatas.value[checkInd.value].testTaskParams || []
  const isTest = testTaskParams.filter((d) => d.status !== "检测中")
  params.value = deepCopy(testTaskParams)

  if (params.value.length === 1 && isTest.length === 1) {
    selectedParams.value = params.value
    // 只有一个参数，且为待检测状态时，直接开始检测，否则需要确认
    if (params.value[0].status !== "已检测") {
      startTestHandle()
    } else {
      const str = params.value.map((d) => d.name).join("、")
      openConfirm(`参数${str}已检测，确认继续？`)
    }
    return
  }
  // 有多个参数时，打开弹窗选择参数
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
  selectedParams.value = []
}

// 确认弹窗：参数已检测时，确认是否继续检测
const confirmModal = ref(false)
const errMsg = ref("")
const openConfirm = (msg) => {
  confirmModal.value = true
  errMsg.value = msg
}
const closeConfirm = () => {
  confirmModal.value = false
  errMsg.value = ""
}
const okConfirm = () => {
  closeConfirm()
  showModal.value = false
  startTestHandle()
}

// 选择参数
interface paramsType {
  id: string
  name: string
  status: string
  checked?: boolean
}
const params = ref<paramsType[]>([])
const selectedParams = ref<paramsType[]>([])
const clickParam = (item) => {
  if (item.status === "检测中") {
    message.info(item.name + "正在进行检测，请选择其它参数")
    return
  }
  item.checked = !item.checked
  selectedParams.value = params.value.filter((d) => d.checked)
}

// 确认参数
const confirmTestParam = () => {
  const param = selectedParams.value
  if (param.length === 0) return
  const testEnd = params.value.filter((d) => d.status === "已检测")
  if (testEnd.length > 0) {
    const str = testEnd.map((d) => d.name).join("、")
    openConfirm(`参数${str}已检测，确认继续？`)
    return
  }
  startTestHandle()
}

// 开始试验
const startTestHandle = () => {
  const param = selectedParams.value
  const paramIds = param.map((d) => d.id).join(",")
  loading.value = true
  startLabTest({
    laboratoryScreenId: labId.value,
    testTaskId: taskDatas.value[checkInd.value].id,
    testTaskParamIds: paramIds
  })
    .then((res) => {
      loading.value = false
      if (res.code === 20000) {
        back()
        getLabInfo()
      } else {
        openConfirm(res.message)
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 返回
const back = () => {
  router.go(-1)
}
</script>

<style></style>
