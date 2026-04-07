<template>
  <div w-full card line-height-22>
    <div mb-12 flex-x justify-between>
      <span flex-x>
        <img src="@/assets/rhColorIconBig.svg" h-16 w-16>
        <span>湿度（%rh）</span>
      </span>
      <span v-if="webSocketData.humStatus" flex-x>
        <i
          class="dot bg-[#5B7489]"
          :class="{
            'bg-red': webSocketData.humStatus === '超标',
            'bg-green': webSocketData.humStatus === '达标',
          }"
        ></i>
        <span>{{ webSocketData.humStatus }}</span>
      </span>
    </div>
    <DashBoard
      mb-12
      b-12
      :data="webSocketData.hum"
      :start="detail?.info?.minHumCon || 0"
      :end="detail?.info?.maxHumCon || 100"
    />
    <div mb8 px32 flex-x justify-center h16>
      <div v-if="deviceStatus?.addHumIotStatus" class="flex-x gap-3 text-primary">
        <img
          class="w16 h16"
          src="@/assets/rhup.svg"
          alt=""
        >
        加湿中
      </div>
      <div v-if="deviceStatus?.subHumIotStatus" class="flex-x gap-3 text-primary">
        <img
          class="w16 h16"
          src="@/assets/rhdown.svg"
          alt=""
        >
        除湿中
      </div>
    </div>
    <div class="mb-12 h30 flex-x justify-between rounded-4 bg-white/60 p4 px8 shadow">
      <span mr4 label>标准范围</span>
      <span>{{ detail?.info?.minHumidity }}~{{ detail?.info?.maxHumidity }}</span>
    </div>
    <CustomSlider
      v-if="CanOperate"
      v-model:value="rhData"
      :min="Number(detail?.info?.minHumCon) || 0"
      :max="Number(detail?.info?.maxHumCon) || 100"
      mb-12
      @change="onChangeHumidity"
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

const rhData = ref([props.data.minIotHum, props.data.maxIotHum] as [number, number])

// humIotStatus属性已启用，只能通过温度数据判断
isOnt.value = !!(Number(props.detail?.minIotHum) && Number(props.detail?.maxIotHum))

if (props.detail.minIotHum || props.detail.maxIotHum) {
  rhData.value = [props.detail.minIotHum, props.detail.maxIotHum]
}

if (!props.data.minIotHum && !props.data.maxIotHum) {
  rhData.value = [props.data.minHumidity, props.data.maxHumidity]
}

watch(() => props.detail, (val) => {
  // 通过是否有温度范围来判断是否开启
  isOnt.value = !!((val?.maxIotHum && val?.minIotHum))
})
function handleChange(val: boolean) {
  if (val) {
    onOneTouch()
  }
  else {
    onOneClose()
  }
}

async function onChangeHumidity() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data: HumitureSetParams = {
    laboratoryId: props.data?.id,
    iotEqId: props.data?.iotEqId,
    type: 'hum',
    minHum: rhData.value[0],
    maxHum: rhData.value[1],
  }
  await humitureTemSet(data).finally(() => {
    closeToast()
  })
  emit('getDetail')
  showSuccessToast('操作成功')
}

async function onOneTouch() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data = {
    iotEqId: props.data?.iotEqId,
    laboratoryId: props.data?.id,
    type: 'hum',
    minHum: rhData.value[0],
    maxHum: rhData.value[1],
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

async function onOneClose() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data = {
    iotEqId: props.data?.iotEqId,
    laboratoryId: props.data?.id,
    type: 'hum',
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
