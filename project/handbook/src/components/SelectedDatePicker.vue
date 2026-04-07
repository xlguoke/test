<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import type { TimePickerColumnType } from 'vant'

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
  timeColumnsType: {
    type: Array as PropType<TimePickerColumnType[]>,
    default: () => ['hour', 'minute', 'second'],
  },
  showTime: Boolean,
})
const emit = defineEmits(['update:show', 'change', 'cancel'])

const tabs = ['选择日期', '选择时间']

const timeColumnsType = computed(() => props.timeColumnsType)

const activeTab = ref(0)
const showPicker = ref(false)
const pickerValue = ref<string[]>([])
const dateValue = ref<string[]>([])
const timeValue = ref<string[]>([])
const result = ref('')
function onConfirm({ selectedValues }: { selectedValues: string[] }) {
  if (props.showTime) {
    result.value = `${dateValue.value.join('-')} ${timeValue.value.join(':')}`
  }
  else {
    result.value = selectedValues.join('-')
    pickerValue.value = selectedValues
  }
  showPicker.value = false
  emit('change', result.value)
}

watch(
  () => props.show,
  (val) => {
    if (!val)
      return
    showPicker.value = val
    if (props.defaultValue) {
      if (props.showTime) {
        const [d, t] = props.defaultValue.split(' ')
        dateValue.value = d.split('-')
        timeValue.value = t.split(':')
      }
      else {
        pickerValue.value = props.defaultValue.split('-')
      }
    }
    else {
      const date = new Date().toLocaleDateString()
      if (props.showTime) {
        const time = new Date().toLocaleTimeString()
        timeValue.value = time.split(':')
        dateValue.value = date.split('/')
      }
      else {
        pickerValue.value = date.split('/')
      }
    }
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

/** 取消选择 */
function onCancel() {
  showPicker.value = false
  activeTab.value = 0
  emit('cancel')
}
</script>

<template>
  <van-popup v-model:show="showPicker" destroy-on-close position="bottom" teleport="body" :z-index="5999">
    <van-picker-group
      v-if="showTime"
      v-model:active-tab="activeTab"
      :title="title"
      :tabs="tabs"
      @confirm="onConfirm"
      @cancel="onCancel"
    >
      <van-date-picker v-model="dateValue" />
      <van-time-picker
        v-model="timeValue"
        :columns-type="timeColumnsType"
      />
    </van-picker-group>
    <van-date-picker
      v-else
      :model-value="pickerValue"
      :title="title"
      @confirm="onConfirm"
      @cancel="showPicker = false"
    />
  </van-popup>
</template>

<style></style>
