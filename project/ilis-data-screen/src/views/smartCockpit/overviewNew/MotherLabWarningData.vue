<template>
  <FrameBox>
    <template #title>
      <FrameTitle v-model:checked="filterVal" :options="filterDateOptions" @on-select="init">
        母体试验室告警
      </FrameTitle>
    </template>
    <div class="main-area">
      <div class="main-area-item" @click="detail('温湿度设备实时离线数量')">
        <FrameIcon icon="" class="!w-170 !h-170">
          <img src="@/assets/images/smartCockpit/mother-lab-warn-icon-1.svg" class="size-80" />
        </FrameIcon>
        <div>
          <span class="main-area-count">{{ countData.totalElements }}</span>
          <span class="main-area-label">温湿度设备实时离线数量</span>
        </div>
        <span class="main-area-detail">查看详情 ></span>
      </div>
      <div class="main-area-item" @click="detail('试验过程中温湿度超标数量')">
        <FrameIcon icon="" class="!w-170 !h-170">
          <img src="@/assets/images/smartCockpit/mother-lab-warn-icon-2.svg" class="size-80" />
        </FrameIcon>
        <div>
          <span class="main-area-count">{{ countData.total }}</span>
          <span class="main-area-label">试验过程中温湿度超标数量</span>
        </div>
        <span class="main-area-detail">查看详情 ></span>
      </div>
      <div class="main-area-item" @click="detail('不合格报告数量')">
        <FrameIcon icon="" class="!w-170 !h-170">
          <img src="@/assets/images/smartCockpit/mother-lab-warn-icon-3.svg" class="size-80" />
        </FrameIcon>
        <div>
          <span class="main-area-count">{{ countData.unqualifiedCount }}</span>
          <span class="main-area-label">不合格报告数量</span>
        </div>
        <span class="main-area-detail">查看详情 ></span>
      </div>
      <div class="main-area-item" @click="detail('报告无监控视频数量')">
        <FrameIcon icon="" class="!w-170 !h-170">
          <img src="@/assets/images/smartCockpit/mother-lab-warn-icon-4.svg" class="size-80" />
        </FrameIcon>
        <div>
          <span class="main-area-count">{{ countData.lackVideoCount }}</span>
          <span class="main-area-label">报告无监控视频数量</span>
        </div>
        <span class="main-area-detail">查看详情 ></span>
      </div>
    </div>

    <UnqualifiedReport ref="unqualifiedReport" :current-filter-date="filterVal"></UnqualifiedReport>
    <LackVideoReport ref="lackVideoReport" :current-filter-date="filterVal"></LackVideoReport>
    <OfflineDevice ref="offlineDevice" :current-filter-date="filterVal"></OfflineDevice>
    <ExceedRecord ref="exceedRecord" :current-filter-date="filterVal"></ExceedRecord>
  </FrameBox>
</template>
<script lang="ts" setup>
import {
  FilterDateType,
  getHumitureOver,
  getLackVideoReportCount,
  getOfflineTempDevices,
  getUnqualifiedReportCount
} from "@/api/smartCockpit.test.api"
import FrameBox from "@/components/smartCockpit/FrameBox.vue"
import FrameTitle from "@/components/smartCockpit/FrameTitle.vue"
import { computed, ref } from "vue"
import { getDateRangeHook } from "@/hooks/useDateHooks"
import UnqualifiedReport from "./MotherLabWarningData/UnqualifiedReport.vue"
import LackVideoReport from "./MotherLabWarningData/LackVideoReport.vue"
import OfflineDevice from "./MotherLabWarningData/OfflineDevice.vue"
import ExceedRecord from "./MotherLabWarningData/ExceedRecord.vue"
import { useAutoRequestHooks } from "@/hooks/useAutoRequestHooks"
const unqualifiedReport = ref()
const lackVideoReport = ref()
const offlineDevice = ref()
const exceedRecord = ref()

// 主界面日期筛选
const filterVal = ref(FilterDateType.周)
const filterDateOptions = ref([
  { label: "周", value: FilterDateType.周, hidden: false },
  { label: "月", value: FilterDateType.月, hidden: false },
  { label: "年", value: FilterDateType.年, hidden: false }
])

const countData = ref({
  unqualifiedCount: 0,
  lackVideoCount: 0,
  totalElements: 0,
  total: 0
})

const detailType = ref("")
const param = computed(() => getDateRangeHook(filterVal.value))

async function detail(type: string) {
  try {
    detailType.value = type
    if (type === "不合格报告数量") {
      // 点击详情，只打开弹窗？？
      unqualifiedReport.value.showModal()
    } else if (type === "报告无监控视频数量") {
      lackVideoReport.value.showModal()
    } else if (type === "温湿度设备实时离线数量") {
      offlineDevice.value.showModal()
    } else if (type === "试验过程中温湿度超标数量") {
      exceedRecord.value.showModal()
    }
  } catch (error) {
    console.log(error)
  }
}

async function init() {
  getUnqualifiedReportCount(param.value).then((res: any) => {
    countData.value.unqualifiedCount = res.data[0].unqualifiedCount
  })
  getLackVideoReportCount(param.value).then((res: any) => {
    countData.value.lackVideoCount = res.data[0].lackVideoCount
  })
  getOfflineTempDevices().then((res: any) => {
    countData.value.totalElements = res.data[0].totalElements
  })
  getHumitureOver(filterVal.value).then((res: any) => {
    countData.value.total = res.data.total
  })
}

useAutoRequestHooks({
  api: init,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setData: () => {}
})
</script>

<style scoped lang="less">
.main-area {
  display: flex;
  gap: 0.24rem;
  height: 100%;
  flex-wrap: wrap;
  width: 100%;
  padding-top: 0.24rem;

  .main-area-item {
    width: calc(50% - 0.15rem);
    background: rgba(64, 231, 213, 0.1);
    display: flex;
    align-items: center;
    padding-left: 0.4rem;
    gap: 0.24rem;
    position: relative;
    cursor: pointer;
  }

  .main-area-detail {
    position: absolute;
    top: 0.24rem;
    right: 0.32rem;
    font-size: 0.28rem;
    color: #40e7d5;
  }

  .main-area-count {
    font-size: 0.58rem;
    color: #fff;
    margin-bottom: 0.16rem;
    display: block;
  }

  .main-area-label {
    font-size: 0.28rem;
    color: #b4dbd6;
  }
}
</style>
