<template>
  <div>
    <!-- 默认输入框样式 -->
    <div v-if="!$slots.default" class="flex items-center justify-between">
      <input
        :value="displayStartDate || ''"
        readonly
        :placeholder="placeholder[0]"
        class="flex-1 w-0 h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
        @click="openPicker(0)"
      />
      <span class="text-[#999] text-sm mx-2">-</span>
      <input
        :value="displayEndDate || ''"
        readonly
        :placeholder="placeholder[1]"
        class="flex-1 w-0 h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
        @click="openPicker(1)"
      />
    </div>

    <!-- 自定义样式插槽 -->
    <div v-else @click="openPicker(0)">
      <slot />
    </div>

    <!-- 日期选择弹窗 -->
    <van-popup v-model:show="showPicker" position="bottom" round>
      <van-picker-group
        v-model:active-tab="activeTab"
        :title="title"
        :tabs="pickerTabs"
        @confirm="onConfirm"
        @cancel="onCancel"
      >
        <!-- 开始日期 -->
        <van-date-picker
          v-model="startDateValue"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <!-- 开始时间（仅 showTime=true 时显示） -->
        <van-time-picker
          v-if="showTime"
          v-model="startTimeValue"
          :columns-type="['hour', 'minute', 'second']"
        />
        <!-- 结束日期 -->
        <van-date-picker
          v-model="endDateValue"
          :min-date="minDate"
          :max-date="maxDate"
        />
        <!-- 结束时间（仅 showTime=true 时显示） -->
        <van-time-picker
          v-if="showTime"
          v-model="endTimeValue"
          :columns-type="['hour', 'minute', 'second']"
        />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string[]
  title?: string
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  placeholder?: string[]
}>(), {
  modelValue: () => [],
  title: '选择日期范围',
  showTime: false,
  minDate: () => new Date(1970, 0, 1),
  maxDate: () => new Date(dayjs().year() + 50, 11, 31),
  placeholder: () => ['请选择开始日期', '请选择结束日期'],
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'change': [value: string[]]
}>()

// 弹窗显示状态
const showPicker = ref(false)

// 当前激活的 Tab 索引
const activeTab = ref(0)

// 根据 showTime 动态计算 tabs
const pickerTabs = computed(() => {
  if (props.showTime) {
    return ['开始日期', '开始时间', '结束日期', '结束时间']
  }
  return ['开始日期', '结束日期']
})

// 日期值 - van-date-picker 需要 [年, 月, 日] 格式
const startDateValue = ref<string[]>([])
const endDateValue = ref<string[]>([])

// 时间值 - van-time-picker 需要 [时, 分, 秒] 格式
const startTimeValue = ref<string[]>(['00', '00', '00'])
const endTimeValue = ref<string[]>(['23', '59', '59'])

const displayStartDate = computed(() => {
  return props.modelValue?.[0]
})

const displayEndDate = computed(() => {
  return props.modelValue?.[1]
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length === 2) {
    initFromModelValue()
  }
  else {
    initDefaultValues()
  }
}, { immediate: true, deep: true })

// 初始化默认值（当天）
function initDefaultValues() {
  const today = dayjs()
  startDateValue.value = [today.year().toString(), (today.month() + 1).toString(), today.date().toString()]
  endDateValue.value = [today.year().toString(), (today.month() + 1).toString(), today.date().toString()]

  if (props.showTime) {
    startTimeValue.value = [today.format('HH'), today.format('mm'), today.format('ss')]
    endTimeValue.value = [today.format('HH'), today.format('mm'), today.format('ss')]
  }
}

// 从 modelValue 初始化
function initFromModelValue() {
  const start = props.modelValue[0]
  const end = props.modelValue[1]

  if (start) {
    const startDay = dayjs(start)
    startDateValue.value = [startDay.year().toString(), (startDay.month() + 1).toString(), startDay.date().toString()]
    if (props.showTime && start.includes(' ')) {
      const timePart = start.split(' ')[1]
      const [hour, minute, second] = timePart.split(':')
      startTimeValue.value = [hour, minute, second || '00']
    }
  }

  if (end) {
    const endDay = dayjs(end)
    endDateValue.value = [endDay.year().toString(), (endDay.month() + 1).toString(), endDay.date().toString()]
    if (props.showTime && end.includes(' ')) {
      const timePart = end.split(' ')[1]
      const [hour, minute, second] = timePart.split(':')
      endTimeValue.value = [hour, minute, second || '00']
    }
  }
}

// 打开选择器
// type: 0-开始日期, 1-结束日期
function openPicker(type: number) {
  showPicker.value = true
  // 根据点击位置设置 activeTab
  activeTab.value = props.showTime ? (type === 0 ? 0 : 2) : type
  if (!props.modelValue || props.modelValue.length === 0) {
    initDefaultValues()
  }
}

function onCancel() {
  showPicker.value = false
}

function onConfirm() {
  const [startYear, startMonth, startDay] = startDateValue.value
  const [endYear, endMonth, endDay] = endDateValue.value

  let startStr = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`
  let endStr = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`

  if (props.showTime) {
    const [startHour, startMinute, startSecond] = startTimeValue.value
    const [endHour, endMinute, endSecond] = endTimeValue.value
    startStr += ` ${startHour}:${startMinute}:${startSecond}`
    endStr += ` ${endHour}:${endMinute}:${endSecond}`
  }

  // 自动处理日期大小
  let result: string[]
  const startDate = new Date(startStr.replace(/-/g, '/'))
  const endDate = new Date(endStr.replace(/-/g, '/'))
  if (startDate.getTime() <= endDate.getTime()) {
    result = [startStr, endStr]
  }
  else {
    result = [endStr, startStr]
  }

  emit('update:modelValue', result)
  emit('change', result)
  showPicker.value = false
}
</script>

<style scoped>
</style>
