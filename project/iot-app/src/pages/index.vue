<template>
  <div class=" h-full flex-y">
    <VanNavBar
      v-if="InEmbed"
      title="功能室"
      :fixed="true"
      clickable
      placeholder
      :left-arrow="true"
      @click-left="onBack"
    />
    <div v-else class="w-full px16 pt16">
      <div class="mt-16 text-18 font-bold ">
        海特智慧试验室温湿度控制系统
      </div>
      <p>
        今天又是美好的一天！
      </p>
    </div>
    <div class=" w-full flex-1 overflow-y-auto">
      <div v-if="!InEmbed" class="w-full grid grid-cols-3 gap-12 px-16">
        <div class="mb-12 flex-y justify-between card" @click="router.push('/message')">
          <img src="@/assets/message.png" class="h-51 w-51 mb8" alt="">
          <div flex-y>
            <div class="text-18 font-bold mb8 line-height-26">
              <van-loading v-if="messageCount === null" size="16" />
              <template v-else>
                {{ messageCount }}
              </template>
            </div>
            <div mb-10 line-height-22>
              消息提醒
            </div>
          </div>
        </div>
        <div class="mb-12 flex-y justify-between card" @click="router.push('/ledger-proc')">
          <img src="@/assets/standingBook.png" class="h-51 w-51 mb8" alt="">
          <div flex-y>
            <div class="text-18 font-bold mb8 line-height-26">
              <van-loading v-if="ledgerHandlerCount === null" size="16" />
              <template v-else>
                {{ ledgerHandlerCount }}
              </template>
            </div>
            <div mb-10 line-height-22>
              台账处理
            </div>
          </div>
        </div>
        <div class="mb-12 flex-y justify-between card" @click="router.push('/audit')">
          <img src="@/assets/process.png" class="h-51 w-51 mb8" alt="">
          <div flex-y>
            <div class="text-18 font-bold mb8 line-height-26">
              <van-loading v-if="auditCount === null" size="16" />
              <template v-else>
                {{ auditCount }}
              </template>
            </div>
            <div mb-10 line-height-22>
              异常审核
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-12 px-16">
        <van-search
          v-model="queryStr"
          class="flex-1 p-0"
          placeholder="请输入功能室"
          @search="onSearch"
        >
          <template #left-icon>
            <div flex-x items-center>
              <img src="@/assets/searchIcon.svg" w16 h16 alt="">
            </div>
          </template>
        </van-search>
        <van-button
          v-if="showBatchAction"
          size="small"
          type="primary"
          plain
          @click="
            showVerify = true;
            controlType = ControlType.CLOSE;
            customVerifyDialogKey += 1
          "
        >
          全部关闭
        </van-button>
        <van-button
          v-if="showBatchAction"
          size="small"
          type="primary"
          plain
          @click="
            showVerify = true;
            controlType = ControlType.OPEN;
            customVerifyDialogKey += 1
          "
        >
          全部开启
        </van-button>
      </div>
      <CustomList
        ref="listRef"
        :api="getLaboratory"
        :query="{
          quickQry: queryStr,
          isIotLab: '1',
        }"
      >
        <template #default="{ data }">
          <div class="grid grid-cols-2 gap-12 px-16 py12">
            <!-- 这个是不得已而为之的骚操作，为了通过websocket的回调更新数据 -->
            <div hidden>
              {{ setData(data) }}
            </div>
            <RoomCard
              v-for="(item) in dataSource"
              :key="item.id"
              :data="(item as ILaboratory)"
              :device-status="statusMap?.[item.id]"
              @refresh="listRef.onRefresh"
            />
          </div>
        </template>
      </CustomList>
      <CustomVerifyDialog
        :key="customVerifyDialogKey"
        v-model:show="showVerify"
        @confirm="handleConfirm"
      ></CustomVerifyDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ControlType,
  displayconAll,
  getLaboratory,
  getLaboratoryDeviceStatusData,
  type LaboratoryDeviceStatus,
  type TemHumControl,
} from '@/api'
import { useUserStore } from '@/stores'
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { IotDataRequest, type TsSubCmdItem } from './iotDataRequest'
import { closeToast, showLoadingToast, showSuccessToast } from 'vant'
import { InEmbed } from '@/utils/referrer'
import { getMessage } from './message/index'
import { getHumitureRecordList } from './ledger-proc'
import { getAuditList } from './audit'
import { AuditTypeEnum } from '@/api/common'

const router = useRouter()

const { unitCode } = toRefs(useUserStore())

toggleDark(false)

const listRef = ref()

const queryStr = ref('')

const iotDataRequest = new IotDataRequest()

const dataSource = ref<ILaboratory[]>([])

const showVerify = ref(false)

const controlType = ref(ControlType.CLOSE)

const customVerifyDialogKey = ref(0)

const messageCount = ref(null)

const ledgerHandlerCount = ref(null)

const auditCount = ref(null)

const statusMap = ref<Record<string, LaboratoryDeviceStatus>>({})

const showBatchAction = computed(() => !['yljc'].includes(unitCode.value))

function setData(listData: ILaboratory[]) {
  dataSource.value = listData
}

watch(() => dataSource.value, async (val) => {
  if (val?.length) {
    listenIotData(val)
    statusMap.value = await getLaboratoryDeviceStatusData(val.map(item => item.id).join(','))
  }
})

if (!InEmbed) {
  getMessage({
    page: 1,
    size: 1,
    messageType: 'humiture',
    beenRead: '0',
  }).then((res) => {
    messageCount.value = res.data.count
  })

  getHumitureRecordList({
    page: 1,
    size: 1,
    abnormal: true,
    status: 10,
  }).then((res) => {
    ledgerHandlerCount.value = res.data.total
  })

  getAuditList({
    page: 1,
    size: 1,
    queryType: 10,
    businessType: `${AuditTypeEnum.温湿度巡查台账审批},${AuditTypeEnum.温湿度巡查异常处理}`,
  }).then((res) => {
    auditCount.value = res.data.count
  })
}

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
function onSearch() {
  listRef.value.onRefresh()
}

async function handleConfirm() {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  const data: TemHumControl = {
    type: 'all',
    minTem: 22, // 一键开启使用标准区间
    maxTem: 28,
    minHum: 33,
    maxHum: 77,
  }
  await displayconAll(data, controlType.value)
    .then(() => {
      listRef.value.onRefresh() // 刷新首页数据状态
      showSuccessToast('操作成功')
    })
    .finally(() => {
      closeToast()
    })
}

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

  iotDataRequest.listenDataUpdate(lData, (res) => {
    const data = res.data
    const temperature = data.temperature
    const humidity = data.humidity

    dataSource.value.forEach((item, index) => {
      if (res.subscriptionId === index) {
        if (temperature && temperature.length > 0) {
          item.tem = Number.parseFloat(temperature[0][1])
        }
        else {
          item.tem = undefined
        }

        if (humidity && humidity.length > 0) {
          item.hum = Number.parseFloat(humidity[0][1])
        }
        else {
          item.hum = undefined
        }

        if (item.tem !== undefined) {
          if (!isDefined(item.minTemperature) || !isDefined(item.maxTemperature)) {
            item.temStatus = '未配置'
          }
          else if (item.tem >= item.minTemperature && item.tem <= item.maxTemperature) {
            item.temStatus = '达标'
          }
          else {
            item.temStatus = '超标'
          }
        }
        else {
          item.temStatus = undefined
        }

        if (item.hum !== undefined) {
          if (!isDefined(item.minHumidity) || !isDefined(item.maxHumidity)) {
            item.humStatus = '未配置'
          }
          else if (item.hum >= item.minHumidity && item.hum <= item.maxHumidity) {
            item.humStatus = '达标'
          }
          else {
            item.humStatus = '超标'
          }
        }
        else {
          item.humStatus = undefined
        }
      }
    })
  })
}

onUnmounted(() => {
  iotDataRequest.closeWebSocket()
})
</script>

<style scoped>

</style>

<route lang="json">
  {
    "name": "home",
    "meta": {
      "title": "功能室",
      "hiddenNavBar": true
    }
  }
</route>
