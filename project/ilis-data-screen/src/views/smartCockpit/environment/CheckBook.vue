<template>
  <FrameBox :loading="loading">
    <template #title>
      <FrameTitle v-model:checked="filterPatrolVal" @on-select="init">温湿度自动采集</FrameTitle>
    </template>
    <DataTable :columns="columns" :loading="loading" :datas="dataSource" :is-deep-list="false">
      <template #tc="{ item }">
        <span v-if="!item.minTemperature || !item.maxTemperature">--</span>
        <span v-else>{{ `${item.minTemperature || "-"}~${item.maxTemperature || "-"}` }}</span>
      </template>
      <template #rhc="{ item }">
        <span v-if="!item.minHumidity || !item.maxHumidity">--</span>
        <span v-else>{{ `${item.minHumidity || "-"}~${item.maxHumidity || "-"}` }}</span>
      </template>
      <template #hum="{ item }">
        <span
          :class="{
            'text-[#FF7575]': item.hum_Status === '超标' || item.hum_Status === '超标'
          }"
        >
          {{ item.hum || "--" }}
        </span>
      </template>
      <template #tem="{ item }">
        <span
          :class="{
            'text-[#FF7575]': item.temStatus === '超标' || item.temStatus === '超标'
          }"
        >
          {{ item.tem || "--" }}
        </span>
      </template>
      <template #isOver="{ item }">
        <span v-if="item.temStatus === '超标' || item.humStatus === '超标'" class="text-[#FF7575]">
          超标
        </span>
        <span v-else-if="item.temStatus === '正常' || item.humStatus === '正常'">正常</span>
        <span v-else>--</span>
      </template>
    </DataTable>
  </FrameBox>
</template>
<script setup lang="ts">
import { DataTableHead } from "@/components/smartCockpit/DataTable.vue"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
import { ref, watch } from "vue"
import request from "@/utils/request.js"
import dayjs from "dayjs"
import { IotDataRequest, TsSubCmdItem } from "@/utils/iotDataRequest"
import { ILaboratory } from "@/interface/ILaboratory"
import { formatDate } from "@/utils/utils"

const filterDayOptions = [
  { label: "今日", value: "TODAY" },
  { label: "昨日", value: "YESTERDAY" },
  { label: "近7日", value: "SEVEN_DAYS" }
]
const filterPatrolVal = ref("SEVEN_DAYS")
const loading = ref(false)
const columns = ref<DataTableHead[]>([
  { title: "功能室", key: "name", align: "left", width: "3.5rem" },
  { title: "温度控制值℃", key: "tc", align: "left" },
  { title: "相对湿度控制值", key: "rhc", align: "left", width: "3.5rem" },
  { title: "实测温度值℃", key: "tem" },
  { title: "实测湿度值%RH", key: "hum", width: "3.5rem" },
  { title: "是否超标", key: "isOver" },
  { title: "试验状态", key: "status" },
  { title: "采集时间", key: "recordDate", width: "4rem" }
])
const dataSource = ref<any[]>([])

const init = useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: `/api/humiture/dashbord/gather`,
      method: "get",
      query: filterPatrolVal
    }),
  query: filterPatrolVal,
  setData: (res) => {
    dataSource.value = res.data
  }
})

watch(
  () => dataSource.value,
  async (val) => {
    if (val?.length) {
      listenIotData(val)
    }
  },
  {
    immediate: true
  }
)
const iotDataRequest = new IotDataRequest()

// 获取物联网设备数据
function listenIotData(listData: ILaboratory[]) {
  const lData: TsSubCmdItem[] = []

  listData.forEach((item, index) => {
    if (item.iotEqId) {
      lData.push({
        entityType: "DEVICE",
        entityId: item.iotEqId,
        cmdId: index
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }

  iotDataRequest.listenDataUpdate(lData, (res) => {
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity

    dataSource.value.forEach((item, index) => {
      if (res.subscriptionId === index) {
        if (temperature && temperature.length > 0) {
          item.recordDate = formatDate(temperature[0][0], 2)
          item.tem = Number.parseFloat(temperature[0][1])
        } else {
          item.tem = undefined
        }

        if (humidity && humidity.length > 0) {
          item.recordDate = formatDate(humidity[0][0], 2)
          item.hum = Number.parseFloat(humidity[0][1])
        } else {
          item.hum = undefined
        }

        if (!item.showReallyTh) {
          item.tem = (item.minTemperature + item.maxTemperature) / 2 || undefined
          item.hum = (item.minHumidity + item.maxHumidity) / 2 || undefined
        }

        if (item.tem !== undefined) {
          if (item.tem >= item.minTemperature && item.tem <= item.maxTemperature) {
            item.temStatus = "正常"
          } else {
            item.temStatus = "超标"
          }
        } else {
          item.temStatus = undefined
        }

        if (item.hum !== undefined) {
          if (item.hum >= item.minHumidity && item.hum <= item.maxHumidity) {
            item.humStatus = "正常"
          } else {
            item.humStatus = "超标"
          }
        } else {
          item.humStatus = undefined
        }
      }
    })
  })
}
</script>
