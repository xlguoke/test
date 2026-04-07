<template>
  <div v-show="deviceList?.length">
    <div mb8 flex-x justify-between line-height-22>
      <div flex-x>
        <img src="@/assets/deviceIcon.svg " class="mr8 h16 w16">
        <div>设备</div>
      </div>
      <div @click="router.push({ path: '/device', query: data })">
        查看更多>
      </div>
    </div>
    <van-skeleton :row="6" :loading="loading">
      <div v-if="deviceList?.length" grid grid-cols-2 gap-9>
        <DeviceCard
          v-for="item in deviceList"
          :key="item.key"
          :data="item"
        />
      </div>
      <van-empty
        v-else
        :image="emptyImage"
        description="暂无内容"
      />
    </van-skeleton>
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { IotDataRequest } from '@/pages/iotDataRequest'
import { getRoomDivece } from '@/pages/device'
import emptyImage from '@/assets/empty.svg'

const props = defineProps<{
  data: ILaboratory
}>()

const router = useRouter()

const iotDataRequest = new IotDataRequest()

const deviceList = ref([])

const loading = ref(false)

async function getAllDevice() {
  loading.value = true
  const { data } = await getRoomDivece(props.data.iotEqId).finally(() => {
    loading.value = false
  })
  deviceList.value = data.filter((item) => {
    return item.type === '温湿度'
  })?.splice(0, 4)

  const listenData = deviceList.value.map((item, index) => {
    return {
      entityType: 'DEVICE',
      entityId: item?.to?.id,
      cmdId: index,
    }
  })

  iotDataRequest.listenDataUpdate(listenData, (res) => {
    const { data: { temperature, humidity } } = res

    deviceList.value.forEach((item, index) => {
      if (index === res.subscriptionId) {
        if (temperature?.length) {
          item.tem = Number.parseFloat(temperature[0][1])
        }
        else {
          item.tem = undefined
        }

        if (humidity?.length) {
          item.hum = Number.parseFloat(humidity[0][1])
        }
        else {
          item.hum = undefined
        }
      }
    })
  })
}

getAllDevice()

onUnmounted(() => {
  iotDataRequest.closeWebSocket()
})
</script>
