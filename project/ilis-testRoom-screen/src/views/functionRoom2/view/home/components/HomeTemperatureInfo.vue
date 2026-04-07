<template>
  <Container
    title="温湿度信息"
    link="/insetApp"
    :query="{
      url: insetUrl
    }"
    @click="
      router.push({
        path: '/insetApp',
        query: {
          url: insetUrl
        }
      })
    "
  >
    <template #title>
      <span>温湿度信息</span>
      <span
        class="title_status"
        :style="{
          '--statusColor': RoomStatusDict.getDescriptionByKey(roomStatus)
        }"
      >
        {{ RoomStatusDict.getLabelByKey(roomStatus) }}
      </span>
    </template>
    <van-skeleton :row="2" class="line" :loading="loading">
      <div class="info">
        <div class="item">
          <div class="t">
            <span class="label">温度标准范围：</span>
            <span class="data">
              {{ detail?.info?.minTemperature || "-" }}℃~{{ detail?.info?.maxTemperature || "-" }}℃
            </span>
          </div>
          <div class="b">
            <div class="bl">
              <div class="blt">{{ webSocketData.tem?.toFixed(1) || "-" }}℃</div>
              <div class="blb">当前温度</div>
            </div>
            <div class="br">
              <img src="@/assets/images/functionRoom2/t.png" />
            </div>
          </div>
        </div>
        <div class="item">
          <div class="t">
            <span class="label">湿度标准范围：</span>
            <span class="data">
              {{ detail?.info?.minHumidity }}%RH~{{ detail?.info?.maxHumidity }}%RH
            </span>
          </div>
          <div class="b">
            <div class="bl">
              <div class="blt">{{ webSocketData.hum || "-" }}%RH</div>
              <div class="blb">当前湿度</div>
            </div>
            <div class="br">
              <img src="@/assets/images/functionRoom2/rh.png" />
            </div>
          </div>
        </div>
      </div>
    </van-skeleton>
  </Container>
</template>
<script lang="ts" setup>
import { computed, inject, ref, toRefs, watch } from "vue"
import Container from "../../../components/Container.vue"
import { getLaboratoryDeviceStatusData, LaboratoryDeviceStatus } from "@/api/functionRoom2.api"
import { TemHumData } from "@/utils/iotDataRequest"
import router from "@/router"
import { AnyDictionaryHelper } from "@/utils/Dictionary/DictionaryHelper"
import { useStore } from "@/store"
import { functionRoom2Store } from "@/store/functionRoom2"
import { storeToRefs } from "pinia"

const props = defineProps<{
  labId: string
}>()

/** # 房间工作状态枚举 */
enum RoomStatus {
  /** # 开启 */
  OPEN_ALL,
  /** # 部分开启 */
  OPEN_SOME,
  /** # 关闭 */
  CLOSE
}

/** # 房间工作状态字典 */
const RoomStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: RoomStatus.OPEN_ALL, label: "开启", description: "#24b276" },
  { key: RoomStatus.OPEN_SOME, label: "部分开启", description: "#ffae58" },
  { key: RoomStatus.CLOSE, label: "关闭", description: "#97b7d1" }
])

const { isReadOnly } = toRefs(useStore())

const { labData: detail } = storeToRefs(functionRoom2Store())

const iotTemHumData = inject("iotTemHumData") as TemHumData["data"]

const webSocketData = ref({} as Record<string, any>)

const loading = ref(false)

const queryStr = ref<URLSearchParams>()

const insetUrl = computed(() => {
  return `${import.meta.env.VITE_INSERT_APP}#/room?isNeedAuth=0&${
    queryStr.value
  }&inEmbed=1&inScreen=1&${isReadOnly.value ? "&readOnly=1" : ""}`
})

const deviceStatus = ref<LaboratoryDeviceStatus>()

const roomStatus = computed(() => {
  if (
    deviceStatus.value?.temIotStatus &&
    (deviceStatus.value?.addHumIotStatus || deviceStatus.value?.subHumIotStatus)
  ) {
    return RoomStatus.OPEN_ALL
  } else if (
    deviceStatus.value?.temIotStatus ||
    deviceStatus.value?.addHumIotStatus ||
    deviceStatus.value?.subHumIotStatus
  ) {
    return RoomStatus.OPEN_SOME
  } else {
    return RoomStatus.CLOSE
  }
})

async function getDeviceStatus() {
  const data = await getLaboratoryDeviceStatusData(props.labId)
  deviceStatus.value = data?.[props.labId]
}

getDeviceStatus()

watch(
  detail,
  (data) => {
    if (!data) {
      return
    }

    queryStr.value = new URLSearchParams({
      id: props.labId,
      iotEqId: data?.info?.labIotEq?.iotEqId
    })
    console.log(queryStr.value)
  },
  { immediate: true, deep: true }
)

watch(
  iotTemHumData,
  (data) => {
    if (!data) {
      return
    }

    const temperature = data.temperature
    const humidity = data.humidity

    if (temperature && temperature.length > 0) {
      webSocketData.value.tem = Number.parseFloat(temperature[0][1])
    } else {
      webSocketData.value.tem = undefined
    }

    if (humidity && humidity.length > 0) {
      webSocketData.value.hum = Number.parseFloat(humidity[0][1])
    } else {
      webSocketData.value.hum = undefined
    }

    // 是否展示真实温湿度
    if (!detail.value?.info?.showReallyTH) {
      webSocketData.value.tem =
        (detail.value?.info?.minTemperature + detail.value?.info?.maxTemperature) / 2 || undefined
      webSocketData.value.hum =
        (detail.value?.info?.minHumidity + detail.value?.info?.maxTemperature) / 2 || undefined
    }

    if (webSocketData.value.tem !== undefined) {
      const minTemperature = detail.value?.info?.minTemperature
      const maxTemperature = detail.value?.info?.maxTemperature

      if (
        minTemperature === undefined ||
        minTemperature === null ||
        maxTemperature === undefined ||
        maxTemperature === null
      ) {
        webSocketData.value.temStatus = undefined
      } else if (
        webSocketData.value.tem >= detail.value?.info?.minTemperature &&
        webSocketData.value.tem <= detail.value?.info?.maxTemperature
      ) {
        webSocketData.value.temStatus = "达标"
      } else {
        webSocketData.value.temStatus = "超标"
      }
    } else {
      webSocketData.value.temStatus = undefined
    }

    if (webSocketData.value.hum !== undefined) {
      const minHumidity = detail.value?.info?.minHumidity
      const maxHumidity = detail.value?.info?.maxHumidity

      if (
        minHumidity === undefined ||
        minHumidity === null ||
        maxHumidity === undefined ||
        maxHumidity === null
      ) {
        webSocketData.value.humStatus = undefined
      } else if (
        webSocketData.value.hum >= detail.value?.info?.minHumidity &&
        webSocketData.value.hum <= detail.value?.info?.maxHumidity
      ) {
        webSocketData.value.humStatus = "达标"
      } else {
        webSocketData.value.humStatus = "超标"
      }
    } else {
      webSocketData.value.humStatus = undefined
    }

    getDeviceStatus()
  },
  { immediate: true, deep: true }
)
</script>
<style lang="less" scoped>
.title_status {
  font-size: 0.28rem;
  margin-left: 0.32rem;
  font-weight: normal;
  &::before {
    content: "";
    display: inline-block;
    width: 0.16rem;
    height: 0.16rem;
    margin-right: 0.14rem;
    vertical-align: middle;
    border-radius: 50%;
    background-color: var(--statusColor);
  }
}
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item {
    .t {
      display: flex;
      margin-bottom: 0.2rem;
      .label {
        color: #707c8c;
      }
      .data {
        font-weight: bold;
      }
    }
    .b {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .blt {
        font-size: 0.52rem;
        line-height: 0.6rem;
        font-weight: 900;
        margin-bottom: 0.14rem;
      }
      .br {
        img {
          width: 1rem;
          height: 1rem;
        }
      }
    }
  }
}
</style>
