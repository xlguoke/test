<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import type { TimePickerColumnType } from 'vant'
import dayjs from 'dayjs'

const props = defineProps({
  title: {
    type: String,
    default: '选择日期',
  },
  defaultValue: {
    type: String,
    default: '',
  },
  show: {
    type: Boolean,
    default: false,
  },
  enableTime: Boolean,
  timeColumns: {
    type: Array as PropType<TimePickerColumnType[]>,
  },
})

const emit = defineEmits(['update:show', 'change'])

const timeColumns = computed(() => props.timeColumns || ['hour', 'minute', 'second'] as TimePickerColumnType[])

const show = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  },
})

const enableTime = computed(() => props.enableTime)

const defaultValue = computed(() => props.defaultValue)

const currentDate = ref([String(dayjs().year()), zeroPad(dayjs().month() + 1), zeroPad(dayjs().date())])

const currentTime = ref([zeroPad(dayjs().hour()), zeroPad(dayjs().minute()), zeroPad(dayjs().second())])

watch(defaultValue, (val?: string) => {
  if (val) {
    if (enableTime.value) {
      const arr = val.split(' ')
      currentDate.value = arr[0].split('-').map(i => zeroPad(Number(i)))
      currentTime.value = arr[1].split(':').map(i => zeroPad(Number(i)))
    }
    else {
      currentDate.value = val.split('-').map(i => zeroPad(Number(i)))
    }
  }
  else {
    currentDate.value = [String(dayjs().year()), zeroPad(dayjs().month() + 1), zeroPad(dayjs().date())]
    currentTime.value = [zeroPad(dayjs().hour()), zeroPad(dayjs().minute()), zeroPad(dayjs().second())]
  }
}, { immediate: true })

function zeroPad(num: number) {
  return num < 10 ? `0${num}` : String(num)
}

function onConfirm() {
  if (enableTime.value)
    emit('change', `${currentDate.value.join('-')} ${getSelectTime()}`)
  else
    emit('change', currentDate.value.join('-'))

  onCancel()
}

function getSelectTime() {
  const timeData = [...currentTime.value]

  return timeData.join(':')
}

/** 取消选择 */
function onCancel() {
  show.value = false
}
</script>

<template>
  <van-popup v-model:show="show" destroy-on-close position="bottom" teleport="body" :z-index="5999">
    <div class="date-time-picker">
      <div class="date-time-picker-tool">
        <div @click="onCancel">
          取消
        </div>
        <div>{{ title }}</div>
        <div @click="onConfirm">
          确认
        </div>
      </div>
      <div class="date-time-picker-main">
        <van-date-picker
          v-model="currentDate"
          :show-toolbar="false"
        />
        <van-time-picker
          v-if="enableTime"
          v-model="currentTime"
          :columns-type="timeColumns"
          :show-toolbar="false"
        />
      </div>
    </div>
  </van-popup>
</template>

<style lang="less" scoped>
.date-time-picker {
  display: flex;
  flex-direction: column;

  .date-time-picker-tool {
    display: flex;
    align-items: center;

    div {
      padding: 16px;

      &:nth-child(1) {
        padding-right: 32px;
        color: #999;
      }

      &:nth-child(2) {
        flex: 1;
        text-align: center;
        font-weight: bold;
      }

      &:nth-child(3) {
        padding-left: 32px;
        color: #0066ec;
      }
    }
  }

  .date-time-picker-main {
    display: flex;
    align-items: center;

    .van-picker {
      flex: 1;
    }
  }
}
</style>
