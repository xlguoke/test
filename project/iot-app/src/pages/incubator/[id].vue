<template>
  <div px-15 flex flex-col h-full>
    <div card py8>
      {{ eqName }}
    </div>
    <div
      card
      mt4
      py8
      flex
      items-center
      @click="activeTab = 0;showPickerStartDate = true"
    >
      <span v-if="startDateStr" flex-1 w-0>{{ startDateStr }}</span>
      <span v-else text-gray flex-1>请选择采集时间</span>
      <img src="@/assets/icon-time.svg" w-12 ml-2>
    </div>
    <div flex-1 h-0 overflow-auto mt6>
      <table whitespace-nowrap>
        <thead>
          <tr text-10>
            <td>采集时间</td>
            <td>标准温湿度</td>
            <td>当前温度</td>
            <td>当前湿度</td>
            <td>状态</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in datas" :key="index" class="tr-bg" text-9>
            <td>{{ item.time }}</td>
            <td>
              {{ baseConfig.temRange || '--' }};
              {{ baseConfig.humRange || '--' }}
            </td>
            <td :class="statusObj[item.time]?.temperature ? 'text-red-500' : ''">
              {{ item.temperature || '--' }}<span v-if="item.temperature">℃</span>
            </td>
            <td :class="statusObj[item.time]?.humidity ? 'text-red-500' : ''">
              {{ item.humidity || '--' }}<span v-if="item.humidity">%rh</span>
            </td>
            <td>
              <span v-if="statusObj[item.time]?.temperature || statusObj[item.time]?.humidity" class="text-red-500">
                超标
              </span>
              <span v-else-if="!isBaseConfig || (!item.temperature && !item.humidity)">--</span>
              <span v-else>正常</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <van-popup v-model:show="showPickerStartDate" position="bottom" round>
      <van-picker-group
        v-model:active-tab="activeTab"
        next-step-text="下一步"
        title="采集时间"
        :tabs="['选择开始日期', '选择开始时间', '选择结束日期', '选择结束时间']"
        @confirm="onConfirm"
        @cancel="showPickerStartDate = false"
      >
        <van-date-picker
          v-model="startDate"
        />
        <van-time-picker
          v-model="startTime"
          :columns-type="['hour', 'minute', 'second']"
        />
        <van-date-picker
          v-model="endDate"
        />
        <van-time-picker
          v-model="endTime"
          :columns-type="['hour', 'minute', 'second']"
        />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<script setup lang='ts'>
import { useIncubatorConfig } from './modules/useIncubatorConfig'

const {
  datas,
  dayBeforeDate,
  nowDate,
  baseConfig,
  statusObj,
  isBaseConfig,
  getHumitureBookDetail,
} = useIncubatorConfig()

const route = useRoute()
const eqName = ref(route.query.name)
const showPickerStartDate = ref(false)
const activeTab = ref(0)
const startDate = ref([])
const startTime = ref([])
const endDate = ref([])
const endTime = ref([])
const startDateStr = ref('')
const dataId = (route.params as any).id

onMounted(async () => {
  showLoadingToast({ duration: 0, forbidClick: true })
  const startDateTime = dayBeforeDate.split(' ')
  const endDateTime = nowDate.split(' ')
  startDate.value = startDateTime[0].split('-')
  startTime.value = startDateTime[1].split(':')
  endDate.value = endDateTime[0].split('-')
  endTime.value = endDateTime[1].split(':')
  startDateStr.value = `${dayBeforeDate} ~ ${nowDate}`
  datas.value = await getHumitureBookDetail(dataId)
  closeToast()
})

async function onConfirm() {
  showLoadingToast({ duration: 0, forbidClick: true })
  showPickerStartDate.value = false
  let startDateTime = `${startDate.value.join('-')} ${startTime.value.join(':')}`
  let endDateTime = `${endDate.value.join('-')} ${endTime.value.join(':')}`
  if (new Date(startDateTime) > new Date(endDateTime)) {
    const s = startDateTime
    const sd = startDate.value
    const st = startTime.value
    startDate.value = endDate.value
    startTime.value = endTime.value
    endDate.value = sd
    endTime.value = st

    startDateTime = endDateTime
    endDateTime = s
    showToast({ message: '开始时间不能大于结束时间，已自动为您切换', position: 'top' })
  }

  startDateStr.value = `${startDateTime} ~ ${endDateTime}`
  datas.value = await getHumitureBookDetail(dataId, {
    startDate: startDateTime,
    endDate: endDateTime,
  })
  closeToast()
}
</script>

<route lang="json">
  {
    "name": "IncubatorDetail",
    "meta": {
      "title": "调养箱数据详情"
    }
  }
</route>

<style scoped lang="less">
table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 0.4rem 0.2rem;
  }
}
.tr-bg:nth-child(even) {
  background: rgba(245, 247, 250, 0.3);
}
</style>
