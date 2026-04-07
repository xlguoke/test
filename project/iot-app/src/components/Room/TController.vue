<template>
  <div w-full card line-height-22>
    <div mb-12 flex-x justify-between>
      <span flex-x>
        <img src="@/assets/tColorIconBig.svg" h-16 w-16>
        <span>温度（℃）</span>
      </span>
      <span v-if="webSocketData.temStatus" flex-x>
        <i
          class="dot bg-[#5B7489]"
          :class="{
            'bg-red': webSocketData.temStatus === '超标',
            'bg-green': webSocketData.temStatus === '达标',
          }"
        ></i>
        <span>{{ webSocketData.temStatus }}</span>
      </span>
    </div>
    <DashBoard
      mb-12
      :data="webSocketData.tem"
      :start="detail?.info?.minTemCon || -50"
      :end="detail?.info?.maxTemCon || 100"
      :precision="1"
      type="hot"
    />
    <div mb8 px32 flex-x justify-center h16>
      <div
        v-if="deviceStatus?.temIotStatus && Number(deviceStatus?.temIotValue) > Number(data.tem)"
        class="flex-x gap-3 text-primary"
      >
        <img
          class="w16 h16"
          src="@/assets/tup.svg"
          alt=""
        >
        升温中
      </div>
      <div
        v-if="deviceStatus?.temIotStatus && Number(deviceStatus?.temIotValue) < Number(data.tem)"
        class="flex-x gap-3 text-primary"
      >
        <img
          class="w16 h16"
          src="@/assets/tdown2.svg"
          alt=""
        >
        降温中
      </div>
    </div>
    <div class="mb-12 h30 flex-x justify-between rounded-4 bg-white/60 p4 px8 shadow">
      <span mr4 label>标准范围</span>
      <span>{{ detail?.info?.minTemperature || '-' }}~{{ detail?.info?.maxTemperature || '-' }}</span>
    </div>
    <CustomSlider
      v-if="CanOperate"
      v-model:value="tData"
      :min="Number(detail?.info?.minTemCon) || -50"
      :max="Number(detail?.info?.maxTemCon) || 50"
      active-color="#F68844"
      mb-12
      @change="onChangeTemperature"
    />
    <div v-if="CanOperate" v-permission="'iotApp:openDevice'" flex-y>
      <TurnOnOffButton v-model="isOnt" @change="handleChange" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { type HumitureSetParams, humitureTemClose, humitureTemSet } from '../Home'
import { closeToast, showLoadingToast, showSuccessToast, showToast } from 'vant'
import type { LaboratoryDeviceStatus } from '@/api'
import { CanOperate } from '@/utils/referrer'

const props = defineProps<{
  data: ILaboratory
  detail: Record<string, any>
  webSocketData: Record<string, any>
  deviceStatus?: LaboratoryDeviceStatus
}>()

const emit = defineEmits<{
  (e: 'getDetail'): void
}>()

const isOnt = ref(false)

const tData = ref([props.data.minIotTem, props.data.maxIotTem] as [number, number])

// temIotStatus属性已启用，只能通过温度数据判断
isOnt.value = !!(Number(props.detail?.minIotTem) && Number(props.detail?.maxIotTem))

if (props.detail.minIotTem || props.detail.maxIotTem) {
  tData.value = [props.detail.minIotTem, props.detail.maxIotTem]
}

if (!props.data.minIotTem && !props.data.maxIotTem) {
  tData.value = [props.data.minTemperature, props.data.maxTemperature]
}

watch(() => props.detail, (val) => {
  // 通过是否有温度范围来判断是否开启
  isOnt.value = !!((val?.maxIotTem && val?.minIotTem))
})

function handleChange(val: boolean) {
  if (val) {
    onOneTouch()
  }
  else {
    onOneClose()
  }
}
// fix：相当于ilis温湿度呈现中修改温湿度范围
async function onChangeTemperature() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data: HumitureSetParams = {
    laboratoryId: props.data?.id,
    iotEqId: props.data?.iotEqId,
    type: 'tem',
    minTem: tData.value[0],
    maxTem: tData.value[1],
  }
  await humitureTemSet(data)
    .then(() => {
      isOnt.value = true
      showSuccessToast('操作成功')
    })
    .catch(() => {
      showToast('未找到设备，请检查功能室温湿度设备配置信息')
    })
    .finally(() => {
      closeToast()
    })
  emit('getDetail')
}

// 修改后的温度开启
async function onOneTouch() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data = {
    laboratoryId: props.data?.id,
    iotEqId: props.data?.iotEqId,
    type: 'tem',
    minTem: tData.value[0],
    maxTem: tData.value[0],
  }

  await humitureTemSet(data)
    .then(() => {
      isOnt.value = true
      showSuccessToast('开启成功')
    })
    .catch(() => {
      showToast('未找到设备，请检查功能室温湿度设备配置信息')
    })
    .finally(() => {
      closeToast()
    })
}

// 修改后的湿度关闭
async function onOneClose() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data = {
    laboratoryId: props.data?.id,
    iotEqId: props.data?.iotEqId,
    type: 'tem',
  }
  await humitureTemClose(data)
    .then(() => {
      isOnt.value = false
      showSuccessToast('关闭成功')
    })
    .catch(() => {
      showToast('未找到设备，请检查功能室温湿度设备配置信息')
    })
    .finally(() => {
      closeToast()
    })
}
</script>
