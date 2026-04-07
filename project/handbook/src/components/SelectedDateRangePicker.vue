<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import type { TimePickerColumnType } from 'vant'

const props = defineProps({
  defaultValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  show: {
    type: Boolean,
    default: false,
  },
  showTime: Boolean,
  title: {
    type: String,
    default: '选择日期',
  },
  /** showTime为true时生效 */
  columnsType: {
    type: Array as PropType<TimePickerColumnType[]>,
    default: () => ['hour', 'minute', 'second'],
  },
})
const emit = defineEmits(['update:show', 'confirm', 'cancel'])
const tabs = computed(() =>
  props.showTime
    ? ['开始日期', '开始时间', '结束日期', '结束时间']
    : ['开始日期', '结束日期'],
)
const activeTab = ref(0)

const showPicker = ref(false)
const startDate = ref<string[]>([])
const startTime = ref<string[]>([])
const endDate = ref<string[]>([])
const endTime = ref<string[]>([])
const result = ref(['', ''])

/** 确认选择 */
function onConfirm() {
  if (props.showTime) {
    const s = `${startDate.value.join('-')} ${startTime.value.join(':')}`
    const e = `${endDate.value.join('-')} ${endTime.value.join(':')}`
    result.value = [s, e]
  }
  else {
    result.value = [startDate.value.join('-'), endDate.value.join('-')]
  }

  if (
    new Date(result.value[0]).getTime() > new Date(result.value[1]).getTime()
  ) {
    showToast({
      message: '开始日期不能大于结束日期',
      type: 'fail',
    })
    return
  }

  emit('confirm', result.value)
  showPicker.value = false
  activeTab.value = 0
}

/** 取消选择 */
function onCancel() {
  showPicker.value = false
  activeTab.value = 0
  emit('cancel')
}

/** 初始化日期 */
const timeLen = props.columnsType.length
function initDefaultValue(t: string): string[][] {
  const date = t ? new Date(t) : new Date()

  return [
    date.toLocaleDateString().split('/'),
    date.toLocaleTimeString().split(':').slice(0, timeLen),
  ]
}

/** 初始值 */
watch(
  () => props.show,
  (bol) => {
    if (!bol)
      return

    const val = props.defaultValue || []
    const s = initDefaultValue(val[0])
    const e = initDefaultValue(val[1])
    startDate.value = s[0]
    endDate.value = e[0]

    if (props.showTime) {
      startTime.value = s[1]
      endTime.value = e[1]
    }
    showPicker.value = bol
  },
)
watch(
  () => showPicker.value,
  (val) => {
    if (val)
      return
    emit('update:show', val)
  },
)
</script>

<template>
  <van-popup v-model:show="showPicker" destroy-on-close :z-index="9999" position="bottom">
    <van-picker-group
      v-model:active-tab="activeTab"
      :title="title"
      :tabs="tabs"
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <van-date-picker v-model="startDate" />
      <van-time-picker
        v-if="showTime"
        v-model="startTime"
        :columns-type="columnsType"
      />
      <van-date-picker v-model="endDate" />
      <van-time-picker
        v-if="showTime"
        v-model="endTime"
        :columns-type="columnsType"
      />
    </van-picker-group>
  </van-popup>
</template>

<style></style>
