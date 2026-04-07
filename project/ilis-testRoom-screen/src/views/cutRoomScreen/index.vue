<template>
  <div class="main">
    <ScreenHeader :data="roomData" />
    <div class="content">
      <ScrollMessage v-if="messageList.length" :data="messageList" />
      <div
        :class="{
          'content-inner': true,
          showDetailModalVisible: detailModalVisible
        }"
      >
        <DeviceList class="device-list" :list-data="listData" />
        <TaskList class="b" :data="taskTodoList" />
        <InOutRecord
          class="c"
          :data="inOutRecordList"
          :month-data="inOutMounth"
          :date-data="inOutDate"
        />
        <FunctionRoomIframe
          ref="functionRoomIframeRef"
          class="function-room-iframe"
          :config-list="configList"
          @on-change-visible="onChangeVisible"
        />
      </div>
    </div>
    <ScreenFooter></ScreenFooter>
    <Transition>
      <div
        v-if="!detailModalVisible"
        ref="draggableButton"
        class="roombutton"
        :style="{ left: `${left}px`, top: `${top}px` }"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleTouchEnd"
        @click="handleOpen()"
      >
        <img src="@/assets/images/cutRoomScreen/roombutton.png" alt="" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import DeviceList from "./component/DeviceList.vue"
import ScreenHeader from "./component/Header.vue"
import InOutRecord from "./component/InOutRecord.vue"
import ScrollMessage from "./component/ScrollMessage.vue"
import TaskList from "./component/TaskList.vue"
import {
  getDeviceList,
  getDeviceTaskTodo,
  getRoomInfo,
  getInOutRecord,
  getInOutRecordMonth,
  getQdmToken
} from "@/api/cutRoomScreen.api"
import { message } from "ant-design-vue"
import { computed, onMounted, ref, toRefs, watchEffect } from "vue"
import { DeviceEntity } from "../deviceSmallScreen/Home/DeviceEntity"
import { InOutRecordEntity, RoomEntity, TaskEntity } from "."
import { useStore } from "@/store"
import ScreenFooter from "./component/ScreenFooter.vue"
import { useScreenHooks } from "@/hooks/useScreenHooks"
import { parseAddressToObj } from "@/utils/utils"
import { configItem } from "@/utils/3DScene/floor"
import FunctionRoomIframe from "./component/FunctionRoomIframe.vue"
import { getSmartScreenConfig } from "@/api/testRoom.api"

onMounted(async () => {
  initfontSize()
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1920) * 100
  document.documentElement.style.fontSize = size + "px"
}

const { screenConfig } = toRefs(useStore())

const { refreshData } = useScreenHooks()

const listData = ref([] as DeviceEntity[])

const taskTodoList = ref([] as TaskEntity[])

const roomData = ref({} as RoomEntity)

const inOutRecordList = ref([] as InOutRecordEntity[])

const inOutRecordListMonth = ref([] as InOutRecordEntity[])

const inOutDate = ref(0)

const inOutMounth = ref(0)

const configList = ref<configItem[]>([])

const detailModalVisible = ref(false)

const functionRoomIframeRef = ref()

const id = computed(() => {
  if (!screenConfig.value.url) return ""
  const query = parseAddressToObj(screenConfig.value.url)
  console.log("query", query)
  return query.id || ""
})

/**
 * 告警消息列表
 */
const messageList = computed(() => {
  return listData.value
    .filter((item) => {
      return item.statusDesc
    })
    .map((item) => item.statusDesc)
})

/**
 * 获取设备列表
 */
async function getList() {
  if (!id.value) return message.error("请配置正确的功能室id。例：?id=1")
  const { data, code } = (await getDeviceList(id.value)) as { data: DeviceEntity[]; code: number }
  if (code === 20000) {
    listData.value = data
  }
}

/**
 * 查询待检任务列表
 */
async function getTaskList() {
  const { data, code } = (await getDeviceTaskTodo(id.value)) as { data: TaskEntity[]; code: number }
  if (code === 20000) {
    taskTodoList.value = data
  }
}
/**
 * 查询功能室信息
 */
async function getRoomInfomation() {
  const { data, code } = (await getRoomInfo(id.value)) as { data: RoomEntity; code: number }
  if (code === 20000) {
    roomData.value = data
  }
}

/**
 * 获取人员进出记录
 */
async function getInOutRecordList() {
  if (!roomData.value.accessControlEquipmentSn) return
  const { message } = await getQdmToken()

  const {
    Result: { Items: Items2, TotalCount: TotalCount2 }
  } = await getInOutRecordMonth(roomData.value.accessControlEquipmentSn, message)
  const {
    Result: { Items, TotalCount }
  } = (await getInOutRecord(roomData.value.accessControlEquipmentSn, message)) as {
    Result: { Items: InOutRecordEntity[]; TotalCount: number }
    code: number
  }
  inOutRecordList.value = Items
  inOutRecordListMonth.value = Items2
  inOutDate.value = TotalCount
  inOutMounth.value = TotalCount2
}

const draggableButton = ref<HTMLElement | null>(null)
const left = ref(localStorage.getItem("cutRoomScreenBtnLeft") || 0)
const top = ref(localStorage.getItem("cutRoomScreenBtnTop") || 500)
let isDragging = false
let initialX = 0
let initialY = 0
let timer = null as any

watchEffect(() => {
  localStorage.setItem("cutRoomScreenBtnLeft", left.value.toString())
  localStorage.setItem("cutRoomScreenBtnTop", top.value.toString())
})

const handleTouchStart = (e: TouchEvent) => {
  initialX = e.touches[0].clientX - (draggableButton.value?.offsetLeft || 0)
  initialY = e.touches[0].clientY - (draggableButton.value?.offsetTop || 0)
  timer = setTimeout(() => {
    isDragging = true
    // 放大按钮
    draggableButton.value?.classList.add("active")
  }, 300)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging) {
    clearTimeout(timer)
    return
  }
  const x = e.touches[0].clientX - initialX
  const y = e.touches[0].clientY - initialY
  left.value = x
  top.value = y
}

const handleTouchEnd = () => {
  clearTimeout(timer)
  draggableButton.value?.classList.remove("active")
  if (isDragging) {
    const buttonX = Number(left.value)
    const screenWidth = window.innerWidth
    const buttonWidth = draggableButton.value?.offsetWidth || 0
    draggableButton.value?.style.setProperty("transition", "left 0.3s ease")
    // 动画播放完成，恢复为默认值
    setTimeout(() => {
      draggableButton.value?.style.removeProperty("transition")
    }, 300)
    if (buttonX < screenWidth * 0.5) {
      left.value = 0
    } else if (buttonX > screenWidth * 0.5) {
      left.value = screenWidth - buttonWidth
    }
  } else {
    handleOpen()
  }
  isDragging = false
}

const getFunctionRooms = async () => {
  const res = await getSmartScreenConfig()
  configList.value = res.data.rows
}

async function handleOpen() {
  console.log("handleOpen")
  await getFunctionRooms()
  detailModalVisible.value = !detailModalVisible.value
  functionRoomIframeRef.value && functionRoomIframeRef.value.open(roomData.value.name)
}

const onChangeVisible = (visible) => {
  detailModalVisible.value = visible
}

async function init() {
  getTaskList()
  getList()
  await getRoomInfomation()
  getFunctionRooms()
  getInOutRecordList()
}
init()
refreshData(init)
</script>

<style lang="less" scoped>
:deep(*) {
  box-sizing: border-box;
}
.main {
  font-size: 14px;
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .roombutton {
    width: 134px;
    height: 134px;
    position: absolute;
    right: 0;
    top: 50%;
    &.active {
      transform-origin: center;
      transform: scale(1.2);
    }
  }
  .content {
    height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 32px;
    overflow-y: auto;
    overflow-x: hidden;
    // overflow: hidden;
    gap: 20px;
    .content-inner {
      height: 0;
      position: relative;
      flex: 1;
      display: grid;
      grid-template-rows: 432px calc(100% - 432px - 10px - 20px);
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas: "a a" "b c";
      row-gap: 30px;
      column-gap: 24px;
      // overflow: auto;
      transition: all 0.5s;
      &.showDetailModalVisible {
        transform: translate(calc(-515px - 32px), 0);
      }
      // 分区调试-待删除
      // > div {
      //   border: 1px solid #fff;
      // }
      .function-room-iframe {
        position: absolute;
        right: 0;
        bottom: 0;
        top: 0;
        transform: translate(calc(100% + 32px), 0);
      }
      .device-list {
        grid-area: a;
      }
      .b {
        grid-area: b;
      }
      .c {
        grid-area: c;
      }
    }
  }
}
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
