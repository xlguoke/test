<template>
  <van-popup
    v-model:show="open"
    position="bottom"
    close-on-popstate
    :style="{ height: '50%' }"
  >
    <div class="flex items-center">
      <div class="p-4 pr-8 text-gray-500" @click="onCancel">
        取消
      </div>
      <div class="flex-1 text-center text-sm font-bold">
        {{ title }}
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
import { computed, ref } from 'vue'

const props = defineProps<{
  open: boolean
  enableTime?: boolean
  title?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [value: string]
}>()

const open = computed(() => props.open)

const enableTime = computed(() => props.enableTime ?? false)

const title = computed(() => props.title || '选择日期')

const currentDate = ref([String(dayjs().year()), zeroPad(dayjs().month() + 1), zeroPad(dayjs().date())])

const currentTime = ref([zeroPad(dayjs().hour()), zeroPad(dayjs().minute()), zeroPad(dayjs().second())])

function zeroPad(num: number) {
  return num < 10 ? `0${num}` : String(num)
}

function onCancel() {
  emit('update:open', false)
}

function onConfirm() {
  if (props.enableTime) {
    emit('select', `${currentDate.value.join('-')} ${currentTime.value.join(':')}`)
  }
  else {
    emit('select', `${currentDate.value.join('-')}`)
  }

  onCancel()
}
</script>
