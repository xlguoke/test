<template>
  <VanNavBar
    :title="route.query.name as string || detail?.info?.name || '实验室'"
    :fixed="true"
    clickable
    placeholder
    :left-arrow="true"
    @click-left="onBack"
    @click-right="router.push({ path: '/room/record', query: (route.query as ILaboratory) })"
  >
    <template v-if="isNeedAuth === IsNeedAuth.YES" #right>
      <div class="record-icon">
        <img src="@/assets/recordIcon.svg" h16 w16>
      </div>
    </template>
  </VanNavBar>
  <div px-16 pb60 pt0 class="room-container">
    <div class="grid grid-cols-2 mb16 gap-9">
      <van-skeleton avatar title :row="9" :loading="!Object.keys(detail).length">
        <TController
          v-if="Object.keys(detail).length"
          :data="(route.query as ILaboratory)"
          :detail="detail"
          :web-socket-data="webSocketData"
          :device-status="statusMap?.[(route.query as ILaboratory).id]"
          @get-detail="getDetail"
        />
      </van-skeleton>
      <van-skeleton avatar title :row="9" :loading="!Object.keys(detail).length">
        <RHController
          v-if="Object.keys(detail).length"
          :data="(route.query as ILaboratory)"
          :detail="detail"
          :web-socket-data="webSocketData"
          :device-status="statusMap?.[(route.query as ILaboratory).id]"
          @get-detail="getDetail"
        />
      </van-skeleton>
    </div>
    <!-- 调养箱 -->
    <IncubatorBlock mb16 :data="(route.query as ILaboratory)" />

    <DeviceBlock mb16 :data="(route.query as ILaboratory)" />
    <TaskBlock mb16 :data="(route.query as ILaboratory)" />
    <PreTaskBlock :data="(route.query as ILaboratory)" />
    <!-- <van-sticky :offset-bottom="0" position="bottom"> -->
    <div
      v-if="CanOperate"
      class="fixed-box"
    >
      <van-button
        size="small"
        type="primary"
        w-full
        @click="router.push({ path: '/timedTask/add', query: { laboratoryId: (route.query as ILaboratory).id } })"
      >
        添加定时任务
      </van-button>
    </div>
    <!-- </van-sticky> -->
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { IotDataRequest, type TsSubCmdItem } from '../iotDataRequest'
import { getRoomDetail } from '.'
import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import { getLaboratoryDeviceStatusData, type LaboratoryDeviceStatus } from '@/api'
import { CanOperate } from '@/utils/referrer'

const router = useRouter()

const route = useRoute()

const { isNeedAuth } = usePermissionStore()

function onBack() {
  if ((parent as any).back) {
    (parent as any).back()
    return
  }
  if (window.history.state.back)
    history.back()
  else
    router.replace('/')
}

const detail = ref({} as ILaboratory)

const statusMap = ref<Record<string, LaboratoryDeviceStatus>>({})

async function getDetail() {
  const { data } = await getRoomDetail(route.query.id as string)
  detail.value = data
  listenIotData([route.query as ILaboratory])
}

getDetail()

const iotDataRequest = new IotDataRequest()

const webSocketData = ref({} as Record<string, any>)

let timer

async function getDeviceStatus() {
  if (!timer) {
    statusMap.value = await getLaboratoryDeviceStatusData([route.query].map(item => item.id).join(','))
  }
  timer = setTimeout(async () => {
    statusMap.value = await getLaboratoryDeviceStatusData([route.query].map(item => item.id).join(','))
    getDeviceStatus()
  }, 1000 * 10)
}

getDeviceStatus()

// 获取物联网设备数据
function listenIotData(listData: ILaboratory[]) {
  const lData: TsSubCmdItem[] = []

  listData.forEach((item, index) => {
    if (item.iotEqId) {
      lData.push({
        entityType: 'DEVICE',
        entityId: item.iotEqId,
        cmdId: index,
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }

  iotDataRequest.listenDataUpdate(lData, async (res) => {
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity

    if (temperature && temperature.length > 0) {
      webSocketData.value.tem = Number.parseFloat(temperature[0][1])
    }
    else {
      webSocketData.value.tem = undefined
    }

    if (humidity && humidity.length > 0) {
      webSocketData.value.hum = Number.parseFloat(humidity[0][1])
    }
    else {
      webSocketData.value.hum = undefined
    }

    if (webSocketData.value.tem !== undefined) {
      const minTemperature = detail.value?.info?.minTemperature
      const maxTemperature = detail.value?.info?.maxTemperature

      if (!isDefined(minTemperature) || !isDefined(maxTemperature)) {
        webSocketData.value.temStatus = undefined
      }
      else if (webSocketData.value.tem >= detail.value?.info?.minTemperature
        && webSocketData.value.tem <= detail.value?.info?.maxTemperature) {
        webSocketData.value.temStatus = '达标'
      }
      else {
        webSocketData.value.temStatus = '超标'
      }
    }
    else {
      webSocketData.value.temStatus = undefined
    }

    if (webSocketData.value.hum !== undefined) {
      const minHumidity = detail.value?.info?.minHumidity
      const maxHumidity = detail.value?.info?.maxHumidity

      if (!isDefined(minHumidity) || !isDefined(maxHumidity)) {
        webSocketData.value.humStatus = undefined
      }
      else if (webSocketData.value.hum >= detail.value?.info?.minHumidity
        && webSocketData.value.hum <= detail.value?.info?.maxHumidity) {
        webSocketData.value.humStatus = '达标'
      }
      else {
        webSocketData.value.humStatus = '超标'
      }
    }
    else {
      webSocketData.value.humStatus = undefined
    }

    // statusMap.value = await getLaboratoryDeviceStatusData(listData.map(item => item.id).join(','))
  })
}

onUnmounted(() => {
  iotDataRequest.closeWebSocket()
  clearTimeout(timer)
})
</script>

<style lang="less" scoped>
.room-container {
  height: calc(100vh - 60px);
  overflow: auto;
}
.record-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #224059;
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  border: 1px solid #ffffff;
}
</style>

<route lang="json">
  {
    "name": "room",
    "meta": {
      "hiddenNavBar": true
    }
  }
</route>
