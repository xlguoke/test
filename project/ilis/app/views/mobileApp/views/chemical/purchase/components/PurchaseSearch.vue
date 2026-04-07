<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="modelValue"
      @update:show="$emit('update:modelValue', $event)"
    >
      <div class="h-full flex flex-col bg-white">
        <MobileTitleBar
          left-arrow
          title="数据筛选"
          @click-left="clickLeft"
        />

        <!-- 模糊查询 -->
        <div class="px-4 pt-4">
          <div class="text-sm text-[#333] mb-2">
            查询项目
          </div>
          <input
            v-model.trim="formData.q"
            placeholder="请输入化学名称/化学品编号/入库批号"
            class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
          />
        </div>

        <div class="flex-1 overflow-y-auto pb-12">
          <!-- 登记时间 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              登记时间
            </div>
            <MobileDateRange
              v-model="dateRange"
              title="选择登记时间范围"
              @change="onDateChange"
            />
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="fixed bottom-0 left-0 right-0 h-[46px]">
          <van-row>
            <van-col span="12">
              <van-button block square @click="onCancel">
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

// 日期范围
const dateRange = ref<string[]>([])

// 表单数据
interface FormData {
  q: string
  registerTimeStart: string
  registerTimeEnd: string
}

const formData = reactive<FormData>({
  q: '',
  registerTimeStart: '',
  registerTimeEnd: '',
})

// 监听初始数据变化
watch(() => props.initialData, (val) => {
  if (val) {
    formData.q = val.q || ''
    formData.registerTimeStart = val.registerTimeStart || ''
    formData.registerTimeEnd = val.registerTimeEnd || ''
    if (formData.registerTimeStart && formData.registerTimeEnd) {
      dateRange.value = [formData.registerTimeStart, formData.registerTimeEnd]
    }
  }
}, { immediate: true, deep: true })

// 日期变化
function onDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.registerTimeStart = `${val[0]} 00:00:00`
    formData.registerTimeEnd = `${val[1]} 23:59:59`
  }
  else {
    formData.registerTimeStart = ''
    formData.registerTimeEnd = ''
  }
}

// 取消/重置
function onCancel() {
  formData.q = ''
  formData.registerTimeStart = ''
  formData.registerTimeEnd = ''
  dateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}

// 确定
function onOk() {
  emit('callback', { ...formData })
  emit('update:modelValue', false)
}

// 返回
function clickLeft() {
  emit('update:modelValue', false)
}
</script>
