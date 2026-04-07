<script setup lang='ts'>
import { ref, toRefs, watch } from 'vue'
import dayjs from 'dayjs'
import type { IotDeviceRecordDTO, UdrIotDataCollect } from '..'
import SelectedDatePicker from '@/components/SelectedDatePicker.vue'
import { formatDate, uuid } from '@/utils'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useDeviceDataCollectionStore } from '@/views/udr/provider/useDeviceDataCollectionStore'
import { request } from '@/axios'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

const deviceDataCollectionStore = useDeviceDataCollectionStore()

const { panelManager } = toRefs(useUdrStore())

const { inUseCollectionDevice, collectionRecordMap } = toRefs(deviceDataCollectionStore)

const showStartPicker = ref(false)

const showEndPicker = ref(false)

const defaultDate = formatDate(new Date())

const checkedList = ref<string[]>([])

const queryStartDate = ref('')

const queryEndDate = ref('')

const eqCollectionHistoryRecord = ref<IotDeviceRecordDTO[]>([])

function onCheckAll() {
  checkedList.value = eqCollectionHistoryRecord.value.map(i => i.id) as string[]
}

function onUse(item: IotDeviceRecordDTO) {
  const data: UdrIotDataCollect = {
    deviceId: inUseCollectionDevice.value?.id as string,
    deviceName: inUseCollectionDevice.value?.name as string,
    deviceTypeName: inUseCollectionDevice.value?.name as string,
    data: [item.value],
  }
  udrCore.$this.iotDataCollect(JSON.stringify(data))
}

function onBatchUse() {
  if (!checkedList.value.length) {
    // eslint-disable-next-line no-alert
    alert('请先勾选数据！')
    return
  }

  const useList = eqCollectionHistoryRecord.value.filter(i => checkedList.value.includes(i.id || ''))

  const data: UdrIotDataCollect = {
    deviceId: inUseCollectionDevice.value?.id as string,
    deviceName: inUseCollectionDevice.value?.name as string,
    deviceTypeName: inUseCollectionDevice.value?.name as string,
    data: useList.map(i => i.value),
  }

  udrCore.$this.iotDataCollect(JSON.stringify(data))
  checkedList.value = []
}

// 刷新数据采集历史记录
async function refreshHistoryRecord() {
  udrCore.$this.setUdrVisibility(false)

  showLoadingToast({ duration: 0, forbidClick: true })
  const res: any = await request('/ilis2/rest/eq/iot/device/values', {
    params: {
      iotEquipmentId: inUseCollectionDevice.value?.id,
      start: queryStartDate.value ? dayjs(queryStartDate.value).startOf('D').valueOf() : '',
      end: queryEndDate.value ? dayjs(queryEndDate.value).endOf('D').valueOf() : '',
    },
  }).finally(() => {
    closeToast()
    udrCore.$this.setUdrVisibility(true)
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(`设备采集历史记录获取失败：${err.message}`)
  })

  if (!res.value) {
    eqCollectionHistoryRecord.value = []
    return
  }

  eqCollectionHistoryRecord.value = res.value.map((item: IotDeviceRecordDTO) => ({
    ...item,
    id: uuid(),
  }))
}

function init() {
  if (inUseCollectionDevice.value) {
    const beginUseTime = collectionRecordMap.value[inUseCollectionDevice.value?.id]
    queryStartDate.value = formatDate(beginUseTime)
  }

  refreshHistoryRecord()
}

watch(inUseCollectionDevice, (val) => {
  if (val && panelManager.value.eqCollectionHistoryOpen)
    init()
}, { immediate: true, deep: true })
</script>

<template>
  <div class="collection-history">
    <div class="collection-history-title">
      历史数据采集
      <van-icon name="cross" @click="panelManager.eqCollectionHistoryOpen = false" />
    </div>
    <div>{{ inUseCollectionDevice?.name }}</div>
    <div class="collection-history-date">
      <input
        :value="queryStartDate" type="text" readonly placeholder="开始时间" @click="() => {
          udrCore.$this.setUdrVisibility(false);
          showStartPicker = true;
        }"
      />
      -
      <input
        :value="queryEndDate" type="text" readonly placeholder="结束时间" @click="() => {
          udrCore.$this.setUdrVisibility(false);
          showEndPicker = true;
        }"
      />
    </div>

    <div class="collection-history-handle">
      <div>
        <a href="javascript:;" style="margin-right: 1.6rem;" @click="onCheckAll">全选</a>
        <a href="javascript:;" @click="onBatchUse">批量使用</a>
      </div>
      <a href="javascript:;" @click="refreshHistoryRecord">刷新</a>
    </div>

    <div class="collection-history-ul">
      <van-checkbox-group v-model="checkedList" shape="square">
        <div v-for="item in eqCollectionHistoryRecord" :key="item.id" class="collection-history-li">
          <div class="collection-history-li-body">
            <van-checkbox :name="item.id"></van-checkbox>
            <div style="flex: 1;">
              <div class="collection-history-li-row">
                采集时间：<div>{{ formatDate(item.ts, 2) }}</div>
              </div>
              <div class="collection-history-li-row" style="margin-top: 1.6rem;">
                采集内容：<div>{{ item.value }}</div>
              </div>
            </div>
          </div>
          <div class="collection-history-li-btn">
            <!-- <a href="javascript:;">详情</a> -->
            <a href="javascript:;" @click="onUse(item)">使用</a>
          </div>
        </div>
      </van-checkbox-group>
    </div>

    <!-- 开始时间 -->
    <SelectedDatePicker
      v-model:show="showStartPicker"
      :default-value="defaultDate"
      @change="(val) => { queryStartDate = val }"
    />

    <!-- 结束时间 -->
    <SelectedDatePicker
      v-model:show="showEndPicker"
      :default-value="defaultDate"
      @change="(val) => { queryEndDate = val }"
    />
  </div>
</template>

<style scoped lang="less">
.collection-history {
  background: #fff;
  font-size: 1.4rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  width: 100%;

  a {
    color: #0066EC;
  }

  .collection-history-title {
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .van-icon {
      font-size: 18px;
      cursor: pointer;
    }
  }

  .collection-history-date {
    display: flex;
    gap: 1.6rem;
    align-items: center;
    margin-top: 2.4rem;

    input {
      flex: 1;
      width: 0;
      height: 3.2rem;
      border-radius: 2px;
      background: #F5F5F5;
      color: #151515;
      font-size: 1.4rem;
      text-align: center;
      border: 0;
    }
  }

  .collection-history-handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.6rem;
  }

  .collection-history-ul {
    flex: 1;
    overflow-y: auto;
    margin-top: 3.2rem;
  }

  .collection-history-li {
    margin-bottom: 3.2rem;

    .collection-history-li-body {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .collection-history-li-row {
      display: flex;

      div {
        display: block;
        flex: 1;
        width: 0;
      }
    }

    .collection-history-li-btn {
      display: flex;
      justify-content: flex-end;
      gap: 1.6rem;
      margin-top: 1.2rem;
    }
  }
}
</style>
