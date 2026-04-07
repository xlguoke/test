<template>
  <div>
    <div class="line">
      <div class="task-title line">
        <div class="name">
          {{ data.objectName }}
          <!-- {{ data.objectCode && data.objectCode !== "undefined" ? `(${data.objectCode})` : "" }} -->
        </div>
        <div class="status" :style="{ color: colorMap[data.samplingTaskStatus] }">
          {{ data.samplingTaskStatus }}
        </div>
      </div>

      <div class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine
              class="line"
              label="送样类型："
              align="left"
              :value="taskTypeMap[data.taskType]"
            >
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/typeIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine
              class="line"
              label="送样任务编号："
              align="left"
              :value="data.samplingTaskCode"
            >
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div v-if="!isSimple" class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine
              class="line"
              label="样品编号："
              align="left"
              :value="data.objectCode && data.objectCode !== 'undefined' ? data.objectCode : ''"
            >
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine class="line" label="任务编号：" align="left" :value="data.taskCode || '-'">
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
            <CommonLine
              class="line"
              label="目的地编号："
              align="left"
              :value="dict?.find((i) => i.typeCode === data.positionCode)?.typeName || '-'"
            >
              <template #icon>
                <img
                  class="label-icon"
                  src="@/assets/images/functionRoom2/positionIcon.svg"
                  alt=""
                />
              </template>
            </CommonLine>
          </div>
        </div>
        <div class="info_r">
          <div class="info_item">
            <CommonLine
              label="要求送达时间："
              :value="data.requestDeliveryTime || '-'"
              align="left"
            >
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/timeIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
      <div v-if="data.trayCode" class="line line_flex">
        <div class="info_l">
          <div class="info_item">
            <CommonLine label="托盘编号：" :value="data.trayCode || '-'" align="left">
              <template #icon>
                <img class="label-icon" src="@/assets/images/functionRoom2/taskIcon.svg" alt="" />
              </template>
            </CommonLine>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isReadOnly" class="line action">
      <CommonButton
        v-if="['CREATED', 'PENDING'].includes(data.status)"
        class="btn"
        @click="handleCancel"
      >
        取消送样
      </CommonButton>
      <CommonButton v-if="['PENDING'].includes(data.status)" class="btn" @click="handleConfirm">
        送达确认
      </CommonButton>
      <CommonButton
        class="btn"
        @click="router.push({ path: '/functionRoom2/sampleSendLog', query: { id: data.id } })"
      >
        进度跟踪
      </CommonButton>
    </div>
    <!-- 扫码登录 -->
    <ScanLogin ref="scanLoginRef" />
  </div>
</template>
<script lang="ts" setup>
import { getLabSubTask } from "@/api/functionRoom2.api"
import CommonButton from "@/views/functionRoom2/components/CommonButton.vue"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import { ref, toRefs } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "@/store"
import { getDictByCode, useSampleSendComposable } from "."
import ScanLogin from "@/views/functionRoom2/components/ScanLogin.vue"
import { functionRoom2Store } from "@/store/functionRoom2"

const props = defineProps<{
  data: any
  /** # 功能室id */
  labId: string
  /** # 是否简易展示（不显示任务相关信息） */
  isSimple?: boolean
}>()

const emit = defineEmits<{
  (e: "change"): void
}>()

const { isReadOnly } = toRefs(useStore())

const router = useRouter()

const list = ref<any[]>([])

const loading = ref(false)

const scanLoginRef = ref()

const { authConfig } = toRefs(functionRoom2Store())

const { handleCancelSampleSend, handleConfirmSampleSend } = useSampleSendComposable()

const colorMap = {
  待审核: "#FFAC20",
  已审核: "#FFAC20",
  运送中: "#FFAC20",
  已送达: "#0066EC",
  已登记: "#0066EC",
  已核实: "#0066EC",
  已结案: "#0066EC",
  已取消: "#224059"
}
const taskTypeMap = {
  IMMEDIATE: "立即送样（机器人送样）",
  APPOINTMENT: "预约送样（机器人送样）",
  SELF_DELIVERY: "自行送样（人工自取）"
}
const dict = ref([] as any)

async function getDict() {
  const { code, data } = await getDictByCode("lab::position")
  if (code === 20000) {
    dict.value = data
  }
}
getDict()

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

async function handleConfirm() {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optIntelligentSampleTask
    },
    async (userInfo) => {
      const res = await handleConfirmSampleSend([props.data?.id], {
        operatorId: userInfo?.id
      })
      window.open(res)
      getList()
      emit("change")
    }
  )
}

async function handleCancel() {
  scanLoginRef.value.auth(
    {
      needAuth: !!authConfig.value.optIntelligentSampleTask
    },
    async (userInfo) => {
      await handleCancelSampleSend([props.data?.id], {
        operatorId: userInfo?.id
      })
      getList()
      emit("change")
    }
  )
}
</script>
<style lang="less" scoped>
@import "./SampleSendCard.less";
</style>
