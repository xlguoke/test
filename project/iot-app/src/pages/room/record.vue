<template>
  <div>
    <div flex-x justify-end px16>
      <van-button size="small" type="primary" plain btn @click="show = true">
        筛选
      </van-button>
    </div>
    <CustomList
      ref="listRef"
      :api="getHumitureLogList"
      :query="query"
      p16
      total-key="total"
    >
      <template #default="{ data }">
        <RecordCard
          v-for="(item) in data"
          :key="item"
          :data="item"
          mb12
        />
      </template>
    </CustomList>
    <van-popup
      v-model:show="show"
      round
      closeable
      position="bottom"
      class="h260 "
    >
      <div class="pos-relative h-full">
        <div p16 text-center split-boder text-white>
          筛选
        </div>
        <div>
          <van-field
            readonly
            label="控制时间："
          >
            <template #input>
              <div class="flex gap-8 items-center w-full">
                <input
                  class="date-input flex-1 w25"
                  type="text"
                  :value="dateStr"
                  readonly
                  placeholder="开始时间"
                  @click="showCalendar = true"
                />
                <span text-white>-</span>
                <input
                  class="date-input flex-1 w25"
                  type="text"
                  :value="dateEndStr"
                  readonly
                  placeholder="结束时间"
                  @click="showCalendarEnd = true"
                />
              </div>
            </template>
          </van-field>
          <van-field
            label="控制类型："
          >
            <template #input>
              <van-radio-group v-model="query.commandWay" direction="horizontal" shape="dot">
                <van-radio
                  v-for="item in CommandWayTypeDict"
                  :key="(item.key as string)"
                  :name="item.key"
                >
                  {{ item.label }}
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            label="控制结果："
          >
            <template #input>
              <van-radio-group v-model="query.reqStatus" direction="horizontal" shape="dot">
                <van-radio
                  v-for="item in ReqStatusDict"
                  :key="(item.key as string)"
                  :name="item.key"
                >
                  {{ item.label }}
                </van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </div>
        <div class="fixed-box-pop grid grid-cols-2 gap-12 ">
          <van-button size="small" @click="handleReset">
            重置
          </van-button>
          <van-button size="small" type="primary" @click="handleSearch">
            确认
          </van-button>
        </div>
      </div>
    </van-popup>
    <van-calendar
      v-model:show="showCalendar"
      title="控制时间"
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      @confirm="onConfirm"
    />
    <van-calendar
      v-model:show="showCalendarEnd"
      title="控制时间"
      :show-mark="false"
      :min-date="new Date('1998-01-01')"
      @confirm="onConfirmEnd"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { CommandWayTypeDict, getHumitureLogList, ReqStatusDict } from '.'

const route = useRoute()

const roomData = route.query as ILaboratory

const show = ref(false)

const showCalendar = ref(false)
const showCalendarEnd = ref(false)

const dateStr = ref('')
const dateEndStr = ref('')

const listRef = ref()

const query = ref <Record<string, any>>({
  laboratoryId: roomData.id,
  conStartDate: '',
  conEndDate: '',
  reqStatus: '',
  commandWay: '',
})

function onConfirm(start: any) {
  query.value.conStartDate = `${useDateFormat(start, 'YYYY-MM-DD').value} 00:00:00`
  dateStr.value = `${useDateFormat(start, 'YYYY-MM-DD').value}`
  showCalendar.value = false
}

function onConfirmEnd(end: any) {
  query.value.conEndDate = `${useDateFormat(end, 'YYYY-MM-DD').value} 23:59:59`
  dateEndStr.value = `${useDateFormat(end, 'YYYY-MM-DD').value}`
  showCalendarEnd.value = false
}

function handleSearch(obj?: Record<string, any>) {
  if (obj) {
    query.value = {
      ...query.value,
      ...obj,
    }
  }
  nextTick(() => {
    show.value = false
    listRef.value.onRefresh()
  })
}

function handleReset() {
  dateStr.value = ''
  dateEndStr.value = ''
  query.value = {
    laboratoryId: roomData.id,
    conStartDate: '',
    conEndDate: '',
    reqStatus: '',
    commandWay: '',
  }
  handleSearch()
}
</script>

<route lang="json">
  {
    "name": "record",
    "meta": {
      "title": "温湿度控制记录"
    }
  }
</route>
