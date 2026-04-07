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
              placeholder="请输入标准物质名称/保管人"
              class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
            />
          </div>

          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              标记
            </div>
            <ul class="grid grid-cols-3 gap-2">
              <li
                v-for="item in tagList"
                :key="item.value"
                class="h-8 leading-7 text-center rounded text-sm border-2"
                :class="selectedTag === item.value ? 'bg-[#fdf3f2] border-[#cc5e4d] text-[#333]' : 'bg-[#e8f4ff] border-[#e8f4ff] text-[#333]'"
                @click="selectTag(item.value)"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>

          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              生产日期
            </div>
            <MobileDateRange
              v-model="productionDateRange"
              title="选择生产日期范围"
              @change="onProductionDateChange"
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

const tagList = [
  { label: '全部', value: '' },
  { label: '过期失效', value: 'expired' },
  { label: '余量预警', value: 'warning' },
]

const productionDateRange = ref<string[]>([])
const selectedTag = ref('')

const formData = reactive({
  keyword: '',
  isExpired: '',
  isWarning: '',
  productionDateStart: '',
  productionDateEnd: '',
})

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    if (newVal.productionDateStart && newVal.productionDateEnd) {
      productionDateRange.value = [newVal.productionDateStart, newVal.productionDateEnd]
    }
    // 根据初始数据还原选中的标记
    if (newVal.isExpired === true || newVal.isExpired === 'true') {
      selectedTag.value = 'expired'
    }
    else if (newVal.isWarning === true || newVal.isWarning === 'true') {
      selectedTag.value = 'warning'
    }
    else {
      selectedTag.value = ''
    }
  }
}, { deep: true, immediate: true })

function close() {
  emit('update:modelValue', false)
}

function selectTag(value: string) {
  selectedTag.value = selectedTag.value === value ? '' : value
}

function onProductionDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.productionDateStart = val[0] ? `${val[0]} 00:00:00` : ''
    formData.productionDateEnd = val[1] ? `${val[1]} 23:59:59` : ''
  }
}

function onOk() {
  const result: Record<string, any> = {}

  // 添加关键字
  if (formData.keyword) {
    result.keyword = formData.keyword
  }

  // 根据选中的标记设置对应的参数
  if (selectedTag.value === 'expired') {
    result.isExpired = true
  }
  else if (selectedTag.value === 'warning') {
    result.isWarning = true
  }

  // 添加生产日期
  if (formData.productionDateStart) {
    result.productionDateStart = formData.productionDateStart
  }
  if (formData.productionDateEnd) {
    result.productionDateEnd = formData.productionDateEnd
  }

  emit('callback', result)
  emit('update:modelValue', false)
}

function onReset() {
  selectedTag.value = ''
  Object.assign(formData, {
    keyword: '',
    isExpired: '',
    isWarning: '',
    productionDateStart: '',
    productionDateEnd: '',
  })
  productionDateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}
</script>
