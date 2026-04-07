<template>
  <div>
    <van-popup
      position="right"
      :style="{ width: '100%', height: '100%' }"
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
          <!-- 查询项目 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              查询项目
            </div>
            <input
              v-model.trim="formData.quickQry"
              placeholder="请输入出库批号/品名/化学品编号"
              class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
            />
          </div>

          <!-- 出库类型 - 标签选择 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              出库类型
            </div>
            <ul class="grid grid-cols-3 gap-2">
              <li
                v-for="item in outTypeList" :key="item.value" class="h-8 leading-7 text-center rounded text-sm border-2"
                :class="formData.type === item.value ? 'bg-[#fdf3f2] border-[#cc5e4d] text-[#333]' : 'bg-[#e8f4ff] border-[#e8f4ff] text-[#333]'"
                @click="selectOutType(item.value)"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 底部按钮 -->
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
import type { StorageOutListQueryParams } from '~/views/mobileApp/types/chemical/storage-out'
import { reactive, ref, watch } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

const props = defineProps<{
  modelValue: boolean
  initialData?: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'callback': [data: Record<string, any>]
}>()

// 出库类型列表 - 与PC端保持一致
const outTypeList = [
  { label: '检测申领', value: '检测申领' },
  { label: '配置溶液', value: '配置溶液' },
  { label: '失效', value: '失效' },
  { label: '调拨', value: '调拨' },
  { label: '自配直接使用', value: '自配直接使用' },
]

// 日期范围
const productionDateRange = ref<string[]>([])
const invalidDateRange = ref<string[]>([])

// 表单数据
const formData = reactive<Partial<StorageOutListQueryParams>>({
  quickQry: '',
  type: '',
  storageOutTimeBegin: '',
  storageOutTimeEnd: '',
})

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    // 初始化日期范围
    if (newVal.storageOutTimeBegin && newVal.storageOutTimeEnd) {
      productionDateRange.value = [newVal.storageOutTimeBegin, newVal.storageOutTimeEnd]
    }
  }
}, { deep: true, immediate: true })

function close() {
  emit('update:modelValue', false)
}

function selectOutType(value: string) {
  formData.type = formData.type === value ? '' : value
}

function onOk() {
  // 过滤掉空值
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
    q: '',
    type: '',
    storageOutTimeBegin: '',
    storageOutTimeEnd: '',
  })
  productionDateRange.value = []
  invalidDateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}
</script>

<style scoped>
</style>
