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
              placeholder="输入标准物质名称或验收人后回车即可查询"
              class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
            />
          </div>

          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              购置日期
            </div>
            <MobileDateRange
              v-model="purchaseDateRange"
              title="选择购置日期范围"
              @change="onPurchaseDateChange"
            />
          </div>

          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              验收日期
            </div>
            <MobileDateRange
              v-model="acceptDateRange"
              title="选择验收日期范围"
              @change="onAcceptDateChange"
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

const purchaseDateRange = ref<string[]>([])
const acceptDateRange = ref<string[]>([])

const formData = reactive({
  keyword: '',
  purchaseDateStart: '',
  purchaseDateEnd: '',
  acceptDateStart: '',
  acceptDateEnd: '',
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    if (newVal.purchaseDateStart && newVal.purchaseDateEnd) {
      purchaseDateRange.value = [newVal.purchaseDateStart, newVal.purchaseDateEnd]
    }
    if (newVal.acceptDateStart && newVal.acceptDateEnd) {
      acceptDateRange.value = [newVal.acceptDateStart, newVal.acceptDateEnd]
    }
  }
}, { deep: true, immediate: true })

function close() {
  emit('update:modelValue', false)
}

function onPurchaseDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.purchaseDateStart = val[0] ? dayjs(val[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
    formData.purchaseDateEnd = val[1] ? dayjs(val[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
  }
  else {
    formData.purchaseDateStart = ''
    formData.purchaseDateEnd = ''
  }
}

function onAcceptDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.acceptDateStart = val[0] ? dayjs(val[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
    formData.acceptDateEnd = val[1] ? dayjs(val[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') : ''
  }
  else {
    formData.acceptDateStart = ''
    formData.acceptDateEnd = ''
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
    purchaseDateStart: '',
    purchaseDateEnd: '',
    acceptDateStart: '',
    acceptDateEnd: '',
  })
  purchaseDateRange.value = []
  acceptDateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}
</script>
