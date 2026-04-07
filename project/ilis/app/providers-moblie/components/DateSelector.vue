<template>
  <van-popup
    v-model:show="open"
    position="bottom"
    :style="{ height: '50%' }"
  >
    <div class="flex items-center">
      <div class="p-4 pr-8 text-gray-500" @click="onCancel">
        取消
      </div>
      <div class="flex-1 text-center text-sm font-bold">
        选择日期
      </div>
      <div class="p-4 pl-8 text-blue-500" @click="onConfirm">
        确认
      </div>
    </div>
    <div class="flex">
      <van-date-picker
        v-model="currentDate"
        class="flex-1"
        :show-toolbar="false"
      />

      <van-time-picker
        v-if="enableTime"
        v-model="currentTime"
        class="flex-1"
        :columns-type="['hour', 'minute', 'second']"
        :show-toolbar="false"
      />
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import dayjs from 'dayjs'

const props = defineProps({
  value: String,
  open: Boolean,
  format: EDateFormatType,
  enableTime: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open', 'select'])

const open = computed(() => props.open)

const enableTime = computed(() => props.enableTime)

const currentDate = ref([String(dayjs().year()), zeroPad(dayjs().month() + 1), zeroPad(dayjs().date())])

const currentTime = ref([zeroPad(dayjs().hour()), zeroPad(dayjs().minute()), zeroPad(dayjs().second())])

function zeroPad(num) {
  return num < 10 ? `0${num}` : String(num)
}

function onCancel() {
  emit('update:open', false)
}

function onConfirm() {
  emit('select', `${currentDate.value.join('-')} ${currentTime.value.join(':')}`)
  onCancel()
}
</script>
