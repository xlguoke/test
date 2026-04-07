<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, ref, toRefs, watch } from 'vue'
import type { MainDeviceDto } from '..'
import SelectedDatePicker from '@/components/SelectedDatePicker.vue'
import { formatDate } from '@/utils'
import { udrCore } from '@/views/udr/provider/UdrCore'
import { useDeviceDataCollectionStore } from '@/views/udr/provider/useDeviceDataCollectionStore'
import { request } from '@/axios'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'

const deviceDataCollectionStore = useDeviceDataCollectionStore()

const { panelManager } = toRefs(useUdrStore())

const { inUseCollectionDevice, collectionRecordMap } = toRefs(deviceDataCollectionStore)

const inUseCollectionMainDevice = computed(() => inUseCollectionDevice.value) as unknown as Ref<MainDeviceDto | null>

const showStartPicker = ref(false)

const showEndPicker = ref(false)

const defaultDate = formatDate(new Date())

const queryStartDate = ref('')

const queryEndDate = ref('')

const igonreField = ['yangpbh', 'sbbianhao', 'sbmingcheng', 'gongcbw', 'jcshijian', 'syshijian', 'createDate']

const activeTestTypeId = ref<string>()

const testTypeList = computed(() => {
  const result: Array<{ id: string, name: string }> = [];

  (inUseCollectionMainDevice.value?.jsonDataList || []).forEach((item: MainDeviceDto) => {
    if (!result.find(i => i.id === item.testTypeId)) {
      result.push({
        id: item.testTypeId,
        name: item.testType,
      })
    }
  })

  return result
})

const customFields = ref<{
  filedCode: string
  filedName: string
}[]>([])

const eqCollectionHistoryRecord = computed(() => {
  if (inUseCollectionMainDevice.value) {
    let result = [...inUseCollectionMainDevice.value.jsonDataList]
    if (queryStartDate.value)
      result = result.filter(item => new Date(item.CollectTime || item.collectTime).getTime() >= new Date(queryStartDate.value).getTime())

    if (queryEndDate.value)
      result = result.filter(item => new Date(item.CollectTime || item.collectTime).getTime() <= new Date(queryEndDate.value).getTime())

    if (activeTestTypeId.value)
      result = result.filter(item => item.testTypeId === activeTestTypeId.value)

    return result
  }

  return []
})

// 刷新数据采集字段
async function refreshTestFields() {
  udrCore.$this.setUdrVisibility(false)

  showLoadingToast({ duration: 0, forbidClick: true })
  const res: any = await request('/ilis2/rest/testField/show-fields', {
    params: {
      testTypeId: activeTestTypeId.value,
    },
  }).finally(() => {
    closeToast()
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(`数据采集字段获取失败：${err.message}`)
  })

  customFields.value = res || []
}

function init() {
  if (inUseCollectionDevice.value) {
    const beginUseTime = collectionRecordMap.value[inUseCollectionDevice.value?.id]
    queryStartDate.value = formatDate(beginUseTime)
  }

  if (testTypeList.value.length > 0)
    activeTestTypeId.value = testTypeList.value[0].id

  refreshTestFields()
}

watch(inUseCollectionDevice, (val) => {
  if (val && panelManager.value.eqCollectionHistoryOpen)
    init()
}, { immediate: true, deep: true })
</script>

<template>
  <div class="collection-history">
    <div class="collection-history-title">
      主设备历史数据采集
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
      <a
        href="javascript:;" @click="() => {
          queryStartDate = '';
          queryEndDate = '';
        }"
      >清空时间</a>
    </div>

    <van-tabs v-model:active="activeTestTypeId" shrink>
      <van-tab v-for="testTypeItem in testTypeList" :key="testTypeItem.id" :title="testTypeItem.name" :name="testTypeItem.id" swipeable>
      </van-tab>
    </van-tabs>

    <div class="collection-history-ul">
      <div v-for="item in eqCollectionHistoryRecord" :key="item.id" class="collection-history-li">
        <div class="collection-history-li-row">
          采集时间：<div>{{ item.CollectTime || item.collectTime }}</div>
        </div>
        <div v-for="field in customFields.filter(i => !igonreField.includes(i.filedCode))" :key="field.filedCode" class="collection-history-li-row">
          {{ field.filedName }}：<div>{{ item[field.filedCode] || '' }}</div>
        </div>
      </div>

      <van-empty v-if="!eqCollectionHistoryRecord.length" description="暂无数据"></van-empty>
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
    justify-content: flex-end;
    margin-top: 1.6rem;
  }

  .collection-history-ul {
    flex: 1;
    overflow-y: auto;
    margin-top: 1.6rem;
  }

  .collection-history-li {
    border: solid 1px #e2e2e2;
    margin-bottom: 1.6rem;
    padding: 0.8rem;
    border-radius: 2px;

    .collection-history-li-row {
      display: flex;
      margin-top: 0.8rem;

      &:first-child {
        margin-top: 0;
      }

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
