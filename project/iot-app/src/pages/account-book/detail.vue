<template>
  <div px16 py12>
    <div mb-12 flex-x gap12>
      <van-button
        size="small"
        type="primary"
        plain
        @click="showPickerStatus = true"
      >
        记录状态
      </van-button>
      <van-button
        size="small"
        type="primary"
        plain
        @click="showCalendar = true"
      >
        巡查时间
      </van-button>
    </div>
    <div flex-x gap12>
      <van-tag
        :show="!!type.length"
        closeable
        mb16
        size="medium"
        type="primary"
        @close="handleCloaseStatus"
      >
        {{ StatusTypeDict.getLabelByKey(type?.[0]) }}
      </van-tag>
      <van-tag
        :show="!!defaultDate.length"
        closeable
        mb16
        size="medium"
        type="primary"
        @close="handleCloaseDate"
      >
        {{ `${dayjs(defaultDate[0]).format('YYYY-MM-DD')}-${dayjs(defaultDate[1]).format('YYYY-MM-DD')}` }}
      </van-tag>
    </div>
    <div v-if="detailData" mb12 card>
      <div mb12 ellipsis>
        <span font-700>{{ detailData.name }}</span> （{{ detailData.ledgerSn }}）
      </div>
      <div mb12>
        <span label>创建人员：</span>
        <span>{{ detailData.createName }}</span>
      </div>
      <div pos-relative flex-x items-center justify-between>
        <span label>试验室：</span>
        <div flex-1>
          <van-text-ellipsis :content="detailData.laboratoryName" expand-text="更多" collapse-text="收起" />
        </div>
      </div>
    </div>
    <CustomList
      ref="listRef"
      :api="getHumitureLedgerDetailList"
      :query="query"
      total-key="total"
    >
      <template #default="{ data }">
        <div
          v-for="(item) in data"
          :key="item.id"
          class="mb12 card line-height-22"
        >
          <div mb8 flex-x justify-between>
            <span>{{ item.laboratoryName }}</span>
            <span><i
              dot
              :class="{
                'bg-red': item.temStatus !== MStatus.正常 || item.humStatus !== MStatus.正常,
              }"
            ></i>{{ item.temStatus !== MStatus.正常 || item.humStatus !== MStatus.正常 ? '超标' : '正常' }}</span>
          </div>
          <div mb8 flex-x justify-between>
            <span label>标准温湿度</span>
            <span>{{ `${item.minTem}℃-${item.maxTem}℃；${item.minHum}%rh-${item.maxHum}%rh` }}</span>
          </div>
          <div mb8 flex-x justify-between>
            <span label>巡查温度</span>
            <span
              :class="{
                'text-danger': item.temStatus !== MStatus.正常,
              }"
            >{{ item.tem || '-' }}℃</span>
          </div>
          <div mb8 flex-x justify-between>
            <span label>巡查湿度</span>
            <span
              :class="{
                'text-danger': item.humStatus !== MStatus.正常,
              }"
            >
              >{{ item.hum || '-' }}%rh</span>
          </div>
          <div mb8 flex-x justify-between>
            <span label>巡查时间</span>
            <span>{{ dayjs(item.recordDate).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </div>
          <div flex-x justify-between>
            <span label>巡查人</span>
            <span>{{ item.createName || '--' }}</span>
          </div>
        </div>
      </template>
    </CustomList>
    <van-popup v-model:show="showPickerStatus" round position="bottom">
      <van-picker
        v-model="type"
        :columns="columnsStatus"
        @cancel="showPickerStatus = false;type = []"
        @confirm="onConfirm"
      />
    </van-popup>
    <van-calendar
      v-model:show="showCalendar"
      :default-date="defaultDate"
      title="控制时间"
      type="range"
      allow-same-day
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      @confirm="onConfirmCalendar"
    />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { getHumitureLedgerDetail, getHumitureLedgerDetailList, type IHumitureLedger, StatusTypeDict } from '.'
import { MStatus } from '../ledger-proc'

const route = useRoute()

const id = route.query.id as string

// const showMore = ref(true)

const showPickerStatus = ref(false)

const showCalendar = ref(false)

const columnsStatus = StatusTypeDict.map(item => ({
  text: item.label,
  value: item.key as string,
}))

const detailData = ref<IHumitureLedger>()

const type = ref([])

const defaultDate = ref([])

const listRef = ref()

const query = ref({
  id,
  type: undefined,
  recordStartDate: undefined,
  recordEndDate: undefined,
})

showLoadingToast({
  duration: 0,
  forbidClick: true,
})
getHumitureLedgerDetail(id).then((res) => {
  detailData.value = res.data
}).finally(closeToast)

function handleSearch() {
  listRef.value?.onRefresh()
}

function onConfirm() {
  query.value.type = type.value?.[0]
  showPickerStatus.value = false
  handleSearch()
}

function onConfirmCalendar(values: any) {
  const [start, end] = values
  query.value.recordStartDate = `${useDateFormat(start, 'YYYY-MM-DD').value} 00:00:00`
  query.value.recordEndDate = `${useDateFormat(end, 'YYYY-MM-DD').value} 23:59:59`
  defaultDate.value = values
  showCalendar.value = false
  handleSearch()
}

function handleCloaseStatus() {
  type.value = []
  query.value.type = undefined
  handleSearch()
}

function handleCloaseDate() {
  query.value.recordStartDate = undefined
  query.value.recordEndDate = undefined
  defaultDate.value = []
  handleSearch()
}
</script>

<route lang="json">
  {
    "name": "account-book-detail",
    "meta": {
      "title": "台账详情"
    }
  }
</route>
