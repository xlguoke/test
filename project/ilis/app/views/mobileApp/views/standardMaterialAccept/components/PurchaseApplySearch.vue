<template>
  <div>
    <van-popup
      position="right"
      :style="{ width: '90%', height: '100%' }"
      :show="modelValue"
      @update:show="$emit('update:modelValue', $event)"
    >
      <div class="h-full flex flex-col bg-white">
        <MobileTitleBar
          left-arrow
          title="数据筛选"
          @click-left="close"
        />

        <div class="flex-1 overflow-y-auto pb-20">
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              查询项目
            </div>
            <input
              v-model.trim="formData.keyword"
              placeholder="输入标准物质名称或申请人后回车即可查询"
              class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
            />
          </div>

          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              填写日期
            </div>
            <MobileDateRange
              v-model="applyDateRange"
              title="选择填写日期范围"
              @change="onApplyDateChange"
            />
          </div>
        </div>

        <div class="fixed bottom-0 left-0 right-0 h-[46px]">
          <van-row>
            <van-col span="12">
              <van-button block square @click="onReset">
                重置
              </van-button>
            </van-col>
            <van-col span="12">
              <van-button block type="primary" square @click="onOk">
                确定
              </van-button>
            </van-col>
          </van-row>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { reactive, ref, watch } from 'vue'
import MobileDateRange from '~/views/mobileApp/components/mobileDateRange/index.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

const props = defineProps<{
  modelValue: boolean
  initialData?: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'callback': [data: Record<string, any>]
}>()

const applyDateRange = ref<string[]>([])

const formData = reactive({
  keyword: '',
  createDateStart: '',
  createDateEnd: '',
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    if (newVal.createDateStart && newVal.createDateEnd) {
      applyDateRange.value = [newVal.createDateStart, newVal.createDateEnd]
    }
  }
}, { deep: true, immediate: true })

function close() {
  emit('update:modelValue', false)
}

function onApplyDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.createDateStart = val[0] ? dayjs(val[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
    formData.createDateEnd = val[1] ? dayjs(val[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
  }
  else {
    formData.createDateStart = ''
    formData.createDateEnd = ''
  }
}

function onOk() {
  const result: Record<string, any> = {}
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value
    }
  })
  emit('callback', result)
  emit('update:modelValue', false)
}

function onReset() {
  Object.assign(formData, {
    keyword: '',
    createDateStart: '',
    createDateEnd: '',
  })
  applyDateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}
</script>
