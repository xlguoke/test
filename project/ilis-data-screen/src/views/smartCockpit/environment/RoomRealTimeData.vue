<template>
  <FrameBox>
    <template #title>
      <FrameTitle v-model:checked="filterRoomHumVal" :options="filterHumOptions">
        养护箱实时环境
      </FrameTitle>
    </template>
    <div ref="scrollRef" class="w-full h-full max-h-700 overflow-y-auto">
      <div
        v-for="(i, index) in sortedDataSource()"
        :id="`room${index}`"
        :key="i.id"
        class="p-32 mt-32 custom-card"
      >
        <a-row class="mb-24">
          <a-col :span="21">
            <div class="text-[0.32rem] text-white font-bold">
              {{ i.labName }} {{ i.name }} {{ i.sn || "" }}
            </div>
          </a-col>
          <a-col :span="3">
            <div
              v-if="i.temStatus !== undefined || i.humStatus !== undefined"
              class="before:content-[''] before:inline-block before:w-16 before:h-16 before:bg-[#FF7575] before:rounded-full before:mr-10 flex items-center justify-center text-[0.28rem]"
              :class="{
                'text-[#FF7575] before:bg-[#FF7575]!':
                  i.temStatus === '超标' || i.humStatus === '超标',
                'text-[#24B276] before:bg-[#24B276]!':
                  i.temStatus !== '超标' && i.humStatus !== '超标'
              }"
            >
              {{ i.temStatus === "超标" || i.humStatus === "超标" ? "超标" : "正常" }}
            </div>
          </a-col>
        </a-row>
        <a-row class="mb-24">
          <a-col :span="12">
            <div class="text-[0.28rem]">标准温度（℃）：{{ baseConfig.temRange || "--" }}</div>
          </a-col>
          <a-col :span="12">
            <div class="text-[0.28rem]">
              实时温度（℃）：
              <span
                :class="{
                  'text-[#FF7575]': i.temStatus === '超标'
                }"
              >
                {{ i.tem || "--" }}
              </span>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="12">
            <div class="text-[0.28rem]">标准湿度（%RH）：{{ baseConfig.humRange || "--" }}</div>
          </a-col>
          <a-col :span="12">
            <div class="text-[0.28rem]">
              实时湿度（%RH）：
              <span
                :class="{
                  'text-[#FF7575]': i.humStatus === '超标'
                }"
              >
                {{ i.hum || "--" }}
              </span>
            </div>
          </a-col>
        </a-row>
      </div>
      <div
        v-if="!loading && filterDataSource.length === 0"
        class="flex flex-col h-full items-center justify-center text-[#B4DBD6]"
      >
        <img src="@/assets/images/smartCockpit/no-data.svg" class="w-280 h-280" />
        暂无数据
      </div>
    </div>
  </FrameBox>
</template>
<script lang="ts" setup>
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { computed, onUnmounted, ref, watch } from "vue"
import request from "@/utils/request.js"
import { IotDataRequest, TsSubCmdItem } from "@/utils/iotDataRequest"
import { ILaboratory } from "@/interface/ILaboratory"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
const filterRoomHumVal = ref("全部")
const filterHumOptions = ref([
  {
    label: "全部",
    value: "全部"
  },
  {
    label: "超标",
    value: "超标"
  }
])
const baseConfig = ref({
  minTem: "",
  maxTem: "",
  minHum: "",
  maxHum: "",
  temRange: "",
  humRange: "",
  bookShow: true,
  init: false
})
const iotDataRequest = new IotDataRequest()

const dataSource = ref<ILaboratory[]>([])

const filterDataSource = computed(() => {
  if (filterRoomHumVal.value === "超标") {
    return dataSource.value.filter((item) => {
      return item.temStatus === "超标" || item.humStatus === "超标"
    })
  } else {
    return dataSource.value
  }
})

/** # 按名称首字母排序 */
const sortedDataSource = () => {
  return filterDataSource.value.sort((a, b) => {
    // 使用 localeCompare 实现中文拼音排序
    return a.name.localeCompare(b.name, "zh-Hans-CN", { sensitivity: "accent" })
  })
}

const loading = ref(false)

useAutoRequestHooks({
  loading: loading,
  api: () =>
    request({
      url: "/api/humiture/dashbord/book/page",
      method: "get"
    }),
  query: ref({}),
  setData: ({ data, code }) => {
    if (code === 20000) {
      dataSource.value = data?.rows || []
      clearInterval(timer.value)
      startScroll()
    }
  }
})

async function getBaseConfig() {
  const { data, code } = await request({
    url: "/api/humiture/book/config",
    method: "get"
  })
  if (code !== 20000) return
  if (data.minTem && data.maxTem) {
    data.temRange = `${data.minTem}-${data.maxTem}`
  }
  if (data.minHum && data.maxHum) {
    data.humRange = `${data.minHum}%-${data.maxHum}%`
  }
  data.init = true
  baseConfig.value = data
}
getBaseConfig()

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

const timer = ref()

const scrollRef = ref()
let index = 0

function startScroll() {
  timer.value = setInterval(() => {
    if (index >= filterDataSource.value?.length) {
      index = 0
    }
    const el = document.getElementById(`room${index}`)
    el?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
    index++
  }, 2 * 1000)
}

// 获取物联网设备数据
function listenIotData(listData: ILaboratory[]) {
  const lData: TsSubCmdItem[] = []

  listData.forEach((item, index) => {
    if (item.id) {
      lData.push({
        entityType: "DEVICE",
        entityId: item.id,
        cmdId: index
      })
    }
  })

  if (lData.length === 0) {
    iotDataRequest.closeWebSocket()
    return
  }
  iotDataRequest.listenDataUpdate(lData, (res) => {
    console.log(res)
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity
    const { minTem, maxTem, minHum, maxHum } = baseConfig.value

    dataSource.value.forEach((item, index) => {
      if (res.subscriptionId === index) {
        if (temperature && temperature.length > 0) {
          item.tem = Number.parseFloat(temperature[0][1])
        }

        if (humidity && humidity.length > 0) {
          item.hum = Number.parseFloat(humidity[0][1])
        }

        if (item.tem !== undefined) {
          if (item.tem >= Number(minTem || item.tem) && item.tem <= Number(maxTem || item.tem)) {
            item.temStatus = "全部"
          } else {
            item.temStatus = "超标"
          }
        } else {
          item.temStatus = undefined
        }

        if (item.hum !== undefined) {
          if (item.hum >= Number(minHum || item.hum) && item.hum <= Number(maxHum || item.hum)) {
            item.humStatus = "全部"
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

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>
<style scoped>
.custom-card {
  border: 1px solid;
  border-image: linear-gradient(to right, #40e7d5, rgba(64, 231, 213, 0.1)) 1;
  background: linear-gradient(270deg, rgba(64, 231, 213, 0) 0%, rgba(64, 231, 213, 0.2) 100%);
}
</style>
