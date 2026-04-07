<template>
  <div
    class="min-w-164 w-full card rounded-8 pt8 pr8 text-14 line-height-22"
    @click="router.push({ path: '/room', query: data })"
  >
    <div class="mb-12 h24 flex items-center">
      <div class="title text-16 line-height-24">
        {{ data.name }}
      </div>
      <template v-if="hasPermission('iotApp:openDevice')">
        <img
          v-if="!isOnt"
          src="@/assets/btn-off.svg"
          class=" h-24 w-24"
          @click.stop="onOneTouch()"
        >
        <img v-else src="@/assets/btn-on.svg" class=" h-24 w-24" @click.stop="onOneClose()">
      </template>
    </div>
    <div class="mb-3 flex-x justify-between">
      <div flex-x>
        <img src="@/assets/tColorIconBig.svg" mr3 h16 w16 alt="">
        <div>温度：</div>
      </div>
      <div class="text-end">
        {{ data.tem?.toFixed(1) ?? '-' }}℃
      </div>
    </div>
    <div class="mb10 flex-x justify-between">
      <div>
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
      <div v-show="data.temStatus !== '未配置'" flex-x>
        <span
          class="dot mr3  bg-[#5B7489]"
          :class="{
            'bg-red': data.temStatus === '超标',
            'bg-green': data.temStatus === '达标',
          }"
        ></span>
        {{ data.temStatus || '关闭' }}
      </div>
    </div>
    <!-- <CustomSlider
      v-model:value="tData"
      :min="data.minConTem || -50"
      :max="data.maxConTem || 50"
      class="mb-12"
      @change="onChangeTemperature"
    ></CustomSlider> -->
    <div class="mb-3 flex-x justify-between">
      <div flex-x>
        <img src="@/assets/rhColorIconBig.svg" mr3 h16 w16 alt="">
        <div>湿度：</div>
      </div>
      <div class="text-end">
        {{ data.hum ?? '-' }}%rh
      </div>
    </div>
    <div class="mb10 flex-x justify-between">
      <div>
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
      <div v-show="data.humStatus !== '未配置'" flex-x>
        <span
          class="dot mr3 bg-[#5B7489]"
          :class="{
            'bg-red': data.humStatus === '超标',
            'bg-green': data.humStatus === '达标',
          }"
        ></span>
        {{ data.humStatus || '关闭' }}
      </div>
    </div>
    <!-- <CustomSlider
      v-model:value="rhData"
      :min="data.minConHum || 0"
      :max="data.maxConHum || 100"
      @change="onChangeHumidity"
    ></CustomSlider> -->
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { humitureTemClose, humitureTemSet } from '.'
import { closeToast, showLoadingToast, showSuccessToast } from 'vant'
import type { LaboratoryDeviceStatus, TemHumControl } from '@/api'
import { usePermissionStore } from '@/stores'
import { getRoomDetail } from '@/pages/room'

const props = defineProps<{
  data: ILaboratory
  deviceStatus?: LaboratoryDeviceStatus
}>()

const emit = defineEmits(['refresh'])

const { hasPermission } = usePermissionStore()

const router = useRouter()

const tData = ref([props.data.minIotTem, props.data.maxIotTem] as [number, number])

// const rhData = ref([props.data.minIotHum, props.data.maxIotHum] as [number, number])

const isOnt = ref(false)
async function init() {
  if (!props.data.minIotTem && !props.data.maxIotTem) {
    tData.value = [props.data.minTemperature, props.data.maxTemperature]
  }
  if (!props.data.minIotHum && !props.data.maxIotHum) {
    tData.value = [props.data.minHumidity, props.data.maxHumidity]
  }
  // 首页获取功能室的温湿度开关状态
  const { data } = await getRoomDetail(props.data.id)
  if ((data.minIotTem && data.maxIotTem) || (data.minIotHum && data.maxIotHum)) {
    isOnt.value = true
  }
}
init()

// 监听props.data数据变化,更新isOnts数据
watch(() => props.data, async () => {
  const { data } = await getRoomDetail(props.data.id)
  if ((data.minIotTem && data.maxIotTem) || (data.minIotHum && data.maxIotHum)) {
    isOnt.value = true
  }
  else {
    isOnt.value = false
  }
})

async function onOneTouch() {
  const record = props.data
  const data: TemHumControl = {
    iotEqId: record.iotEqId,
    laboratoryId: record.id,
    type: 'all',
    minTem: record.minTemperature, // 默认为标准区间
    maxTem: record.maxTemperature,
    minHum: record.minHumidity,
    maxHum: record.maxHumidity,
  }
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  await humitureTemSet(data)
    .then(() => {
      isOnt.value = true
    })
    .finally(() => {
      closeToast()
    })
  showSuccessToast('开启成功')
  emit('refresh')
}

async function onOneClose() {
  const record = props.data
  const data: TemHumControl = {
    iotEqId: record.iotEqId,
    laboratoryId: record.id,
    type: 'all',
  }
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  await humitureTemClose(data)
    .then(() => {
      isOnt.value = false
    })
    .finally(() => {
      closeToast()
    })
  showSuccessToast('关闭成功')
  emit('refresh')
}
// async function onChangeTemperature() {
//   showLoadingToast({
//     forbidClick: true,
//     duration: 0,
//   })
//   const data: HumitureSetParams = {
//     laboratoryId: props.data?.id,
//     iotEqId: props.data?.iotEqId,
//     type: 'tem',
//     minTem: tData.value[0],
//     maxTem: tData.value[1],
//   }

//   await humitureSet(data).finally(() => {
//     closeToast()
//   })
//   showSuccessToast('操作成功')
// }

// async function onChangeHumidity() {
//   showLoadingToast({
//     forbidClick: true,
//     duration: 0,
//   })
//   const data: HumitureSetParams = {
//     laboratoryId: props.data?.id,
//     iotEqId: props.data?.iotEqId,
//     type: 'hum',
//     minHum: rhData.value[0],
//     maxHum: rhData.value[1],
//   }
//   await humitureSet(data).finally(() => {
//     closeToast()
//   })
//   showSuccessToast('操作成功')
// }
</script>
