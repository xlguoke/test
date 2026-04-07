<template>
  <div>
    <Container>
      <div class="task-title line">
        <div class="name">
          {{ data.sampleDisplayName }}
          {{ data.testObjectCode ? `（${data.testObjectCode}）` : "" }}
        </div>
        <div
          class="status"
          :style="{ color: getStatusText(data) === '已完成' ? '#224059' : '#FFAC20' }"
        >
          {{ getStatusText(data) }}
        </div>
      </div>

      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine class="line" label="任务编号：" align="left" :value="data.testTaskCode">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine class="line" label="记录编号：" align="left" :value="data.testRecordCode">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine label="检测人员：" :value="data.testers" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/userIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine label="要求报告时间：" :value="data.requireReportDate || '-'" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/timeIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div class="line line_flex">
        <div class="info_item" style="flex: 1">
          <CommonLine
            label="检测参数："
            :value="
              params
                ?.map((i) => i.testParamDisplayName)
                ?.filter(Boolean)
                ?.join('，') || '-'
            "
            align="left"
          >
            <template #icon>
              <img class="label-icon" src="@/assets/images/functionRoom2/paramsIcon.svg" alt="" />
            </template>
          </CommonLine>
        </div>
      </div>
    </Container>
    <div v-if="!isReadOnly" class="line action block">
      <CommonButton v-if="showSampleSend" class="btn" @click="beforeSampleSend">
        智能送样
      </CommonButton>
      <CommonButton v-if="getStatusText(data) !== '已完成'" class="btn" @click="handleStart">
        开始试验
      </CommonButton>
      <CommonButton
        v-if="list?.filter((item) => item.status === SubTaskStatus.TESTING)?.length >= 2"
        class="btn"
        type="danger-plain"
        @click="handleEndBatch"
      >
        全部结束
      </CommonButton>
    </div>
    <CommonTitle v-if="renderList?.length || loading">
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/taskIcon.png"
          alt=""
        />
      </template>
      检测信息
    </CommonTitle>

    <Container v-if="renderList?.length || loading" class="block">
      <van-skeleton :row="3" :loading="loading">
        <div v-for="i in renderList" :key="i.id" class="sub_task">
          <div :class="['l', i.status === SubTaskStatus.FINISHED ? 'finished' : '']">
            <CommonLine
              class="line"
              label="检测参数："
              :value="i.testObjectParamDisplayName"
              align="left"
            ></CommonLine>
            <CommonLine
              class="line"
              label="开始时间："
              :value="i.startTime"
              align="left"
            ></CommonLine>
            <CommonLine
              v-if="i.status === SubTaskStatus.FINISHED"
              class="line"
              label="结束时间："
              :value="i.endTime"
              align="left"
            ></CommonLine>
            <CommonLine class="line" label="使用设备：">
              <template #value>
                <div v-for="eq in i.eqList" :key="eq.id" class="used_device">
                  <div class="name">
                    {{ eq.equipmentName }}
                    <span v-if="eq.startUseTime">
                      （
                      {{ eq.startUseTime && dayjs(eq.startUseTime).format("MM-DD HH:mm:ss") }}
                      {{ eq.endUseTime && ` - ${dayjs(eq.endUseTime).format("MM-DD HH:mm:ss")}` }}
                      ）
                    </span>
                  </div>
                  <div v-if="!isReadOnly" class="action">
                    <CommonButton v-if="!eq.startUseTime" @click="setDevice(eq.id, 'OPEN')">
                      开始
                    </CommonButton>
                    <CommonButton
                      v-if="eq.startUseTime && !eq.endUseTime"
                      type="info"
                      @click="setDevice(eq.id, 'REC')"
                    >
                      撤销
                    </CommonButton>
                    <CommonButton
                      v-if="eq.startUseTime && !eq.endUseTime"
                      type="danger-plain"
                      @click="setDevice(eq.id, 'END', i)"
                    >
                      结束
                    </CommonButton>
                  </div>
                </div>
              </template>
            </CommonLine>
          </div>
          <div v-if="i.status === SubTaskStatus.TESTING && !isReadOnly" class="r">
            <CommonButton
              v-if="i.eqList.every((i) => !i.startUseTime && !i.endUseTime)"
              class="btn"
              type="info"
              @click="handleDel(i)"
            >
              删除
            </CommonButton>
            <CommonButton class="btn" type="danger-plain" @click="handleEnd(i)">
              结束试验
            </CommonButton>
          </div>
        </div>
        <!-- <van-empty v-else description="暂无数据" :image="emptyImage" /> -->
      </van-skeleton>
    </Container>

    <van-popup v-model:show="show" position="bottom" overlay-class="custom-popup-mask">
      <div class="sel">
        <div class="title">
          选择参数
          <div class="close" @click="show = false">
            <van-icon name="cross" />
          </div>
        </div>
        <div class="checkbox">
          <div ref="paramsListRef" class="params_list" :class="showMore ? 'more' : ''">
            <div
              v-for="item in params"
              :key="item.id"
              class="params_item"
              :class="checked.includes(item.id) ? 'checked' : ''"
              @click="toggleItem(item)"
            >
              {{ item.testParamDisplayName }}
            </div>
          </div>
          <div v-if="showBtn" class="show_more" @click="showMore = !showMore">
            {{ showMore ? "收起" : "展开" }}
            <van-icon v-if="showMore" name="arrow-up" />
            <van-icon v-else name="arrow-down" />
          </div>
          <div class="device_list" :class="showMore ? 'hide' : ''">
            <div class="checkbox-container">
              <van-checkbox
                v-model="isCheckAll"
                class="check_all"
                :indeterminate="isIndeterminate"
                @change="checkAllChange"
              >
                全选
              </van-checkbox>
              <div
                v-if="personSelectData.length > 1"
                class="tooltip_container"
                @click="showTooltip = !showTooltip"
              >
                <transition name="tooltip">
                  <div v-if="showTooltip" class="tooltip">
                    <span>当试验任务有多个试验检测人员时，支持选择设备的试验人员。</span>
                  </div>
                </transition>
                <van-icon name="warning-o" />
              </div>
            </div>

            <van-checkbox-group v-model="checkedDevice" @change="checkedDeviceChange">
              <van-checkbox
                v-for="item in deviceList"
                :key="item"
                class="device_item"
                :name="item.id"
              >
                <div class="device_line1">
                  <div>设备编号：{{ item.equipmentSn }}</div>
                  <div>{{ getDeviceStatus(item) }}</div>
                </div>
                <div>设备名称：{{ item.name }}</div>
                <div v-if="personSelectData.length > 1">
                  <div class="pk_result" @click.stop="initMap(item.id)">
                    <div class="pk_result_text">
                      设备使用人：{{
                        (checkedPersonMap.get(item.id) || []).map((p) => p).join("，") || "请选择"
                      }}
                    </div>
                    <div class="pk_result_icon"><van-icon name="arrow-down" /></div>
                  </div>
                  <van-popup
                    v-model:show="showPicker"
                    position="bottom"
                    overlay
                    round
                    :style="{ height: '50%' }"
                    size="large"
                  >
                    <div class="pk_container">
                      <div class="pk_header">
                        <span>选择设备使用人</span>
                        <div class="person_close" @click="showPicker = false">
                          <van-icon name="cross" />
                        </div>
                      </div>
                      <div class="pk_content">
                        <van-checkbox-group v-model="checkedPerson" shape="square">
                          <van-checkbox v-for="p in personSelectData" :key="p.name" :name="p.name">
                            {{ p.name }}
                          </van-checkbox>
                        </van-checkbox-group>
                      </div>
                      <div class="pk_footer">
                        <div class="pk_btn">
                          <CommonButton
                            type="primary"
                            style="width: 100%"
                            @click="confirmPersonSelect()"
                          >
                            确认
                          </CommonButton>
                        </div>
                      </div>
                    </div>
                  </van-popup>
                </div>
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>
        <div class="btn_box">
          <CommonButton type="primary" style="width: 100%" @click="handleCreateSubTask">
            确认
          </CommonButton>
        </div>
      </div>
    </van-popup>

    <!-- 扫码登录 -->
    <ScanLogin ref="scanLoginRef" />
  </div>
</template>
<script lang="ts" setup>
import {
  authApiTransform,
  deleteLabSubTask,
  endLabSubTask,
  endLabSubTaskBatch,
  getLabEq,
  getLabSubTask,
  getLabSubTaskParam,
  getParamsUsedDeviceList,
  startLabSubTask
} from "@/api/functionRoom2.api"
import { IParams } from "@/interface/IParams"
import { ISubTask } from "@/interface/ISubTask"
import { ITask } from "@/interface/ITask"
import CommonButton from "@/views/functionRoom2/components/CommonButton.vue"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
import {
  closeToast,
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
  showToast
} from "vant"
import { computed, inject, ref, toRefs } from "vue"
import { SubTaskStatus } from ".."
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import request from "@/utils/request.js"
import dayjs from "dayjs"
import { useStore } from "@/store"
import { useSampleSendComposable } from "../../sampleSend"
import ScanLogin from "@/views/functionRoom2/components/ScanLogin.vue"
import { functionRoom2Store } from "@/store/functionRoom2"
import { userStore } from "@/store/user"

const props = defineProps<{
  data: ITask
  /** # 仅展示未完成的任务 */
  isShowUnFinish?: boolean
  /** # 功能室id */
  labId: string
}>()

const emit = defineEmits<{
  (e: "change"): void
}>()
const { userInfo } = toRefs(userStore())

const showPicker = ref(false)

const showTooltip = ref(false)

const showSampleSend = inject("showSampleSend")

const { isReadOnly } = toRefs(useStore())

const { handleSampleSend } = useSampleSendComposable()

const show = ref(false)

const checked = ref<any>([])

const checkedPerson = ref<any>([])

// 使用Map来存储每台设备对应的人员
const checkedPersonMap = ref<Map<string, any[]>>(new Map())

const currentOperatingEqId = ref<string>("") // 当前正在操作的设备ID

// props传入检验检测人员
const personSelectData = computed(() => {
  return (
    props.data.testers?.split(",")?.map((p) => {
      return {
        name: p,
        id: p // 用户id，暂时不支持
      }
    }) || []
  )
})

const list = ref<ISubTask[]>([])

const params = ref<IParams[]>([])

const loading = ref(false)

const showMore = ref(false)

const paramsListRef = ref()

const scanLoginRef = ref()

const { authConfig } = toRefs(functionRoom2Store())

const showBtn = computed(() => {
  // 判断paramsListRef的滚动高度是否超过容器高度
  if (showMore.value) {
    return true
  } else {
    return paramsListRef.value?.scrollHeight > paramsListRef.value?.clientHeight
  }
})

// 初始化下拉列表中-选中-人员数据
function initMap(currEqId: string) {
  currentOperatingEqId.value = currEqId
  checkedPerson.value = checkedPersonMap.value.get(currEqId) || []
  showPicker.value = true
}

async function confirmPersonSelect() {
  if (checkedPerson.value.length === 0) {
    showFailToast("设备使用人员不能为空")
    return
  }
  if (currentOperatingEqId.value) {
    checkedPersonMap.value.set(currentOperatingEqId.value, checkedPerson.value)
    showPicker.value = false
  }
}
// 取消选中默认值，退出，恢复默认选中值
function initDefaultCheckedPerson() {
  deviceList.value?.forEach((device: any) => {
    let testers = [] as string[]
    if (userInfo.value?.realName) {
      // 登录状态
      testers = [userInfo.value?.realName]
    } else {
      // 未登录状态
      const parts = props.data?.testers?.split(",")
      testers = parts.length > 0 ? [parts[0]] : []
    }
    checkedPersonMap.value.set(device.id, testers)
  })
}

const renderList = computed(() => {
  if (props.isShowUnFinish) {
    return list.value?.filter((item) => item.status === SubTaskStatus.TESTING)
  }
  return list.value
})

const deviceList = ref<any>([])
const checkedDevice = ref<string[]>([])

const isCheckAll = ref(false)
const isIndeterminate = ref(true)

async function beforeSampleSend() {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optIntelligentSampleTask
    },
    async (userInfo) => {
      handleSampleSend({
        operatorId: userInfo?.id,
        taskId: props.data?.taskId,
        taskCode: props.data?.testTaskCode,
        labId: props?.labId,
        objectCode: props.data?.testObjectCode,
        objectName: props.data?.sampleDisplayName
      })
    }
  )
}

const checkAllChange = (val: boolean) => {
  checkedDevice.value = val ? deviceList.value?.map((i) => i.id) : []
  isIndeterminate.value = false
}

const checkedDeviceChange = (value: string[]) => {
  const checkedCount = value.length
  isCheckAll.value = checkedCount === deviceList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < deviceList.value.length
}

function toggleItem(item: IParams) {
  checked.value = [item.id]
  getParamsDeviceList()
}

/** 获取参数管关联设备列表（用于回显） */
async function getParamsDeviceList() {
  showLoadingToast({
    message: "加载中...",
    duration: 1000
  })
  const { code, data } = await getParamsUsedDeviceList(props?.data?.taskId, checked.value?.[0])
  if (code === 20000) {
    const ids = data?.map((i) => i.equipmentId)
    const deviceIds = deviceList.value?.map((i) => i.id)
    checkedDevice.value = ids?.filter((i) => {
      return deviceIds.includes(i)
    })
  }
}

/** 获取功能室下设备列表（用于渲染） */
async function getLabEqList() {
  const { code, data } = await getLabEq(props.labId)
  if (code === 20000) {
    deviceList.value = data
  }
}

getLabEqList()

/** # 设置设备状态 */
async function setDevice(id: string, type: "OPEN" | "END" | "REC", task?: ISubTask) {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optTestTask
    },
    async () => {
      const tipText = type === "OPEN" ? "开始" : type === "END" ? "结束" : "撤销"
      if (type === "END" || type === "REC") {
        await showConfirmDialog({
          title: "提示",
          message: `确定要${tipText}吗？`,
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
      }
      showLoadingToast(`${tipText}中...`)
      await request
        .put(authApiTransform("api/indoor-screen/use/eq/set"), {
          id,
          type
        })
        .finally(() => {
          closeToast()
        })
      // 如果是当前任务最后一个设备，询问是否结束该任务
      if (type === "END" && task?.eqList?.filter((i: any) => !i.endUseTime)?.length === 1) {
        handleEnd(task, false)
      }
      getList()
    }
  )
}
const currentParams = computed(() => {
  const param = params.value.find((i) => i.id === checked.value?.[0])
  return param
})

const currentSubTask = computed(() => {
  const target = renderList.value?.find(
    (i: any) => i.testParamId === currentParams.value?.testParamId
  )
  return target
})

function getDeviceStatus(item: any) {
  const currentDevice = currentSubTask.value?.eqList?.find((i: any) => i.equipmentId === item.id)

  if (!currentDevice?.startUseTime) {
    return "未开始"
  }
  if (currentDevice?.startUseTime && !currentDevice?.endUseTime) {
    return "使用中"
  }
  if (currentDevice?.startUseTime && currentDevice?.endUseTime) {
    return "已结束"
  }
  return "未开始"
}
async function getList() {
  loading.value = true
  const { code, data } = await getLabSubTask(props?.data?.taskId).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    list.value = data
  }
}
getList()
function getStatusText(data: ITask) {
  if (data.taskStatus === "40") {
    return "已完成"
  } else if (data.taskStatus === "20" || "22") {
    if (data.taskHisCount > 0) {
      return "检测中"
    } else {
      return "待检测"
    }
  }
  return "-"
}

async function getParams() {
  const { data, code } = await getLabSubTaskParam(props?.data?.taskId)
  if (code === 20000) {
    params.value = data
  }
}
getParams()

async function handleStart() {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optTestTask
    },
    async () => {
      showLoadingToast({})
      await getLabEqList()
      const { data, code } = await getLabSubTaskParam(props?.data?.taskId).finally(() => {
        closeToast()
      })
      show.value = true
      if (code === 20000) {
        params.value = data
        toggleItem(data?.[0])
        initDefaultCheckedPerson()
      }
    }
  )
}

async function handleCreateSubTask() {
  const data = params.value.filter((item) => {
    return checked.value.includes(item.id)
  })
  if (!checkedDevice.value?.length) {
    showFailToast("请选择设备")
    return
  }
  data[0].eqIds = checkedDevice.value?.join(",")
  if (!data?.length) {
    showFailToast("请选择参数")
    return
  }
  const equipmentUseList = [] as any
  checkedPersonMap.value.forEach((persons, equipmentId) => {
    // 为每个人员创建设备使用记录
    equipmentUseList.push({
      id: equipmentId, // 设备id
      userId: "", // 使用人id
      userName: persons.join(",") // 使用人姓名
    })
  })
  const result = equipmentUseList.filter((item: any) => {
    return checkedDevice.value.includes(item.id)
  })
  data[0].equipmentUseList = result
  delete data[0].eqIds
  showLoadingToast({})
  const { code, msg, message } = await startLabSubTask(
    props.labId,
    props?.data?.taskId,
    data
  ).finally(() => {
    closeToast()
  })
  if (code === 20000) {
    await showSuccessToast("操作成功")
    setTimeout(() => {
      getList()
      show.value = false
      checked.value = []
      emit("change")
    }, 1000)
  } else {
    showToast(`${msg || message}！`)
  }
}

async function handleEnd(item: ISubTask, isCheck = true) {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optTestTask
    },
    async () => {
      if (!item.eqList?.every((i) => i.endUseTime) && isCheck) {
        showFailToast("存在未结束的试验设备，请先结束设备")
        return
      }
      await showConfirmDialog({
        title: "提示",
        message: "是否结束当前检测参数任务？",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
      showLoadingToast({})
      const { code, msg, message } = await endLabSubTask(props.labId, item.id).finally(() => {
        closeToast()
      })
      if (code === 20000) {
        showSuccessToast("结束成功")
        setTimeout(() => {
          getList()
          emit("change")
        }, 1000)
      } else {
        showFailToast(msg || message)
      }
    }
  )
}

async function handleDel(item: ISubTask) {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optTestTask
    },
    async () => {
      await showConfirmDialog({
        title: "提示",
        message: "确定要删除吗？",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
      showLoadingToast({})
      const { code, msg, message } = await deleteLabSubTask(item.id).finally(() => {
        closeToast()
      })
      if (code === 20000) {
        setTimeout(() => {
          showSuccessToast("删除成功")
          getList()
          emit("change")
        }, 1000)
      } else {
        showFailToast(msg || message)
      }
    }
  )
}

async function handleEndBatch() {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optTestTask
    },
    async () => {
      const data = list.value.filter((item) => {
        return item.status === SubTaskStatus.TESTING
      })
      if (!data?.length) {
        showFailToast("没有进行中的试验")
        return
      }
      if (
        !data?.every((subtak) => {
          return subtak?.eqList?.every((eq) => {
            return eq?.endUseTime
          })
        })
      ) {
        showFailToast("存在未结束的试验设备，请先结束设备")
        return
      }
      await showConfirmDialog({
        title: "提示",
        message: "确定要全部结束吗？",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
      const ids = data?.map((i) => i.id)
      showLoadingToast({})
      const { code, msg, message } = await endLabSubTaskBatch(props.labId, ids).finally(() => {
        closeToast()
      })
      if (code === 20000) {
        setTimeout(() => {
          showSuccessToast("操作成功")
          getList()
          emit("change")
        }, 1000)
      } else {
        showFailToast(msg || message)
      }
    }
  )
}
</script>
<style lang="less" scoped>
.custom-loading {
  .van-toast__loading {
    color: #707c8c;
  }
}
.custom-popup-mask {
  background: rgba(34, 64, 89, 0.9);
}
.checkbox {
  .params_list {
    max-height: 200px;
    overflow-y: scroll;
    padding: 32px 32px 0;
    &.more {
      max-height: 600px;
      &::-webkit-scrollbar {
        width: 20px;
        background: rgba(255, 255, 255, 0.4);
      }
      &::-webkit-scrollbar-thumb {
        background: #fff;
      }
    }

    .params_item {
      display: inline-block;
      padding: 10px 32px;
      border-radius: 8px;
      background: linear-gradient(291deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
      border: 1px solid #ffffff;
      transition: background 0.1s;
      margin: 0 32px 32px 0;

      &.checked {
        background: #0066ec;
      }
    }
  }
  .show_more {
    padding: 20px;
    color: #0066ec;
    text-align: center;
  }
  .device_list {
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    padding: 32px 32px 0;
    margin-bottom: 32px;
    max-height: 800px;
    overflow-y: scroll;
    &.hide {
      max-height: 400px;
    }
    .check_all {
      // border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      padding-bottom: 32px;
    }
    .device_item {
      padding: 32px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.4);
      .device_line1 {
        width: 100%;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
    }
  }
  :deep(.van-checkbox__label) {
    color: #fff;
  }
  :deep(.van-checkbox__icon) {
    width: 36px;
    height: 36px;
    background: #758998;
    font-size: 36px;
    .van-icon {
      border-radius: 4px;
      width: 100%;
      height: 100%;
      border: 1px solid #ffffff;
    }
  }
}
.sel {
  position: relative;
  min-height: 580px;
  color: #fff;
  font-size: 32px;
  padding-bottom: 92px;
  .btn_box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 60px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
  }
  .title {
    position: relative;
    text-align: center;
    font-size: 32px;
    padding: 24px 0;
    border: 1px solid rgba(255, 255, 255, 0.4);
    .close {
      position: absolute;
      top: 24px;
      right: 40px;
    }
  }
}
.task-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .name {
    flex: 1;
    white-space: nowrap;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.28rem;
    font-weight: 500;
  }
  .status {
    font-weight: bold;
    font-size: 0.28rem;
    color: #ffac20;
  }
}

.line {
  margin-bottom: 0.24rem;
  &:nth-last-child(1) {
    margin-bottom: 0rem;
  }
  &.line_flex {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    > .info_l,
    .info_r {
      flex: 1;
    }
  }
  &.action {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .btn + .btn {
      margin-left: 0.24rem;
    }
  }
  .info_item {
    display: flex;
    align-items: center;
    & + .info_item {
      margin-top: 0.16rem;
    }
    > span {
      flex: 1;
      display: flex;
      align-items: center;
      .label {
        white-space: nowrap;
        margin-right: 0.12rem;
      }
      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    img {
      width: 0.24rem;
      height: 0.24rem;
      margin-right: 0.12rem;
    }
  }
}
.block {
  margin-bottom: 40px !important;
}
.sub_task_header {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}
.sub_task {
  padding: 24px 0;
  .used_device {
    margin-bottom: 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .name {
      flex: 1;
      word-break: break-all;
      text-align: left;
      margin-right: 40px;
    }
  }
  .r {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .btn + .btn {
    margin-left: 0.24rem;
  }
}
.pk_result {
  font-size: 24px;
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  max-height: 0.5rem;
  margin-top: 0.15rem;
  min-height: 0.5rem; /* 保持最小高度 */
  max-width: max-content;
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
  transition: all 0.2s ease;
  cursor: pointer;
  .pk_result_text {
    flex: 1; /* 让文本区域占据剩余空间 */
    min-width: 0; /* 允许文本区域在必要时收缩 */
    word-wrap: break-word; /* 允许文本换行 */
    margin-right: 10px; /* 与图标保持距离 */
  }
  .pk_result_icon {
    flex-shrink: 0; /* 防止图标被压缩 */
    width: 24px; /* 固定图标宽度 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
/* 点击时的动画效果 */
.pk_result:active {
  transform: scale(0.99);
  border-color: #c4c6c9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.pk_container {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  position: relative;
}
.pk_header {
  text-align: center;
  display: flex;
  justify-content: center;
  padding: 24px 0;
  font-size: 32px;
  border-bottom: 1px solid #eee; /* 分隔线，可选 */
  .person_close {
    position: absolute;
    right: 24px;
    top: 24px;
  }
}
.pk_content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}
.pk_footer {
  padding: 24px;
  flex-shrink: 0;
}
.pk_btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 60px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}
.tooltip_container {
  display: flex;
  align-items: center;
  display: inline-flex;
  max-width: 3.5rem;
  white-space: normal;
  cursor: pointer;
}
.tooltip {
  // transform: translateY(-50%); /* 垂直居中 */
  margin-right: 8px;
  padding: 4px 8px;
  font-size: 0.2rem;
  background-color: #0066ec;
  color: white;
  border-radius: 4px;
  white-space: normal; /* 允许自动换行（关键修复） */
  word-wrap: break-word; /* 长单词强制换行 */
  z-index: 10;
  transition: all 0.15s ease-out;
  opacity: 1;
  transform: translateY(0);
}
.sub_task:nth-child(n + 2) {
  border-top: 1px solid #fff;
}
.label-icon {
  width: 24px;
  height: 24px;
}
:deep(.van-checkbox__label) {
  flex: 1;
}
</style>
