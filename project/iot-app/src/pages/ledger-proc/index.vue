<template>
  <div class=" h-full flex-y">
    <van-space class="w-full py12 px16 ">
      <van-button
        type="primary"
        :plain="query.status === LedgerStatusType.待处理 ? false : true"
        size="small"
        @click="handleClick(LedgerStatusType.待处理)"
      >
        待处理
      </van-button>
      <van-button
        type="primary"
        :plain="query.status === LedgerStatusType.审核中 ? false : true"
        size="small"
        @click="handleClick(LedgerStatusType.审核中)"
      >
        审核中
      </van-button>
      <van-button
        type="primary"
        :plain="query.status === LedgerStatusType.已退回 ? false : true"
        size="small"
        @click="handleClick(LedgerStatusType.已退回)"
      >
        已退回
      </van-button>
      <van-button
        type="primary"
        :plain="query.status === LedgerStatusType.已完成 ? false : true"
        size="small"
        @click="handleClick(LedgerStatusType.已完成)"
      >
        已完成
      </van-button>
    </van-space>
    <div class=" w-full flex-1 overflow-y-auto">
      <CustomList
        ref="listRef"
        px-16
        :api="getHumitureRecordList"
        :query="query"
        total-key="total"
      >
        <template #default="{ data }">
          <div v-for="(item, index) in data" :key="index" mb-12 card>
            <div class="mb-12 flex-x justify-between font-700">
              <span>试验室名称：{{ item.laboratoryName }}</span>
              <span>{{ LedgerStatusTypeDict.getLabelByKey(item.status) }}</span>
            </div>
            <div mb-12 flex-x justify-between>
              <span label>巡查时间：</span>
              <span>{{ dayjs(item.recordDate).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
            <div mb-12>
              <div :span="24" mb-12 flex-x justify-between>
                <span label>标准温度（℃）：</span>
                <span>{{ item.standardTem }}</span>
              </div>
              <div :span="24" mb-12 flex-x justify-between>
                <span label>标准湿度（%RH）：</span>
                <span>{{ item.standardHum }}</span>
              </div>
              <div :span="24" mb-12 flex-x justify-between>
                <span label>巡查温度：</span>
                <span>{{ item.tem }}℃ <span ml-8><i
                  dot
                  :class="{
                    'bg-red-500!': item.temStatus !== MStatus.正常,
                  }"
                ></i>{{ MStatusDict.getLabelByKey(item.temStatus) }}</span></span>
              </div>
              <div :span="24" flex-x justify-between>
                <span label>巡查湿度：</span>
                <span>{{ item.hum }}%rh <span ml-8><i
                  dot
                  :class="{
                    'bg-red-500!': item.humStatus !== MStatus.正常,
                  }"
                ></i>{{ MStatusDict.getLabelByKey(item.humStatus) }}</span></span>
              </div>
            </div>
            <div class="flex-x justify-end">
              <van-button
                v-if="[LedgerStatusType.待处理, LedgerStatusType.已退回].includes(item.status)"
                size="small"
                type="primary"
                plain
                w-60
                @click="router.push({ path: '/ledger-proc/edit', query: item })"
              >
                处理
              </van-button>
            </div>
          </div>
        </template>
      </CustomList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { getHumitureRecordList, LedgerStatusType, LedgerStatusTypeDict, MStatus, MStatusDict } from '.'

const router = useRouter()

const query = ref({
  abnormal: true,
  status: LedgerStatusType.待处理,
})

const listRef = ref()

function handleClick(val: LedgerStatusType) {
  query.value.status = val
  listRef.value?.onRefresh()
}
</script>

<route lang="json">
  {
    "name": "ledger-proc",
    "meta": {
      "title": "台账处理"
    }
  }
</route>
