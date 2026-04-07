<template>
  <div px16 py12>
    <van-search
      v-model="queryStr"
      class="flex-1 p-0"
      placeholder="请输入设备名称"
    >
      <template #left-icon>
        <div flex-x items-center>
          <img src="@/assets/searchIcon.svg" w16 h16 alt="">
        </div>
      </template>
    </van-search>

    <div class="grid grid-cols-2 gap-12 pt-12">
      <DeviceCard
        v-for="(item) in iotData"
        :key="item.key"
        :data="item"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { IotDataRequest } from '@/pages/iotDataRequest'
import { getRoomDivece } from '.'

const route = useRoute()

const query = route.query as ILaboratory

const queryStr = ref('')

const iotDataRequest = new IotDataRequest()

const deviceList = ref([])

const iotData = computed(() => {
  return deviceList.value.filter(item =>
    item.toName?.toLocaleLowerCase()?.includes(queryStr.value.trim().toLocaleLowerCase()),
  )
})

async function getAllDevice() {
  const { data } = await getRoomDivece(query.iotEqId)
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

<route lang="json">
  {
    "name": "device",
    "meta": {
      "title": "设备"
    }
  }
</route>
