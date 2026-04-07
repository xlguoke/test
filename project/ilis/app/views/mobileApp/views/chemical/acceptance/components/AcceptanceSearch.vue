<template>
  <van-popup
    position="right"
    :style="{ width: '100%', height: '100%' }"
    :show="modelValue"
    @update:show="$emit('update:modelValue', $event)"
  >
    <div class="h-full flex flex-col bg-white">
      <!-- 标题栏 -->
      <MobileTitleBar
        left-arrow
        title="数据筛选"
        @click-left="close"
      />

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto pb-20">
        <!-- 查询项目 -->
        <div class="px-4 pt-4">
          <div class="text-sm text-[#333] mb-2">
            查询项目
          </div>
          <input
            v-model.trim="formData.q"
            placeholder="请输入采购登记编号/登记人/验收人查询"
            class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
          />
        </div>

        <!-- 验收状态 -->
        <div class="px-4 pt-4">
          <div class="text-sm text-[#333] mb-2">
            验收状态
          </div>
          <ul class="grid grid-cols-4 gap-2">
            <li
              v-for="status in statusOptions"
              :key="status.value"
              class="h-8 leading-7 text-center rounded text-sm border-2"
              :class="formData.status === status.value ? 'bg-[#fdf3f2] border-[#cc5e4d] text-[#333]' : 'bg-[#e8f4ff] border-[#e8f4ff] text-[#333]'"
              @click="toggleStatus(status.value as any)"
            >
              {{ status.label }}
            </li>
          </ul>
        </div>

        <!-- 登记时间 -->
        <div class="px-4 pt-4">
          <div class="text-sm text-[#333] mb-2">
            登记时间
          </div>
          <MobileDateRange
            v-model="registerDateRange"
            title="选择登记时间范围"
            @change="onRegisterDateChange"
          />
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
            <van-button block type="primary" square @click="onConfirm">
              确定
            </van-button>
          </van-col>
        </van-row>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import type { PurchaseListQueryParams, PurchaseStatus } from '~/views/mobileApp/types/chemical/purchase'
import { reactive, ref, watch } from 'vue'
import MobileDateRange from '~/views/mobileApp/components/mobileDateRange/index.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

interface Props {
  modelValue?: boolean
  initialData?: Partial<PurchaseListQueryParams>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  initialData: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'callback': [data: Partial<PurchaseListQueryParams>]
}>()

// 状态选项
const statusOptions = [
  { label: '待验收', value: 'IN_FILLING' },
  { label: '待提交', value: 'PENDING_SUBMIT' },
  { label: '审核中', value: 'UNDER_REVIEW' },
  { label: '未通过', value: 'NOT_APPROVED' },
  { label: '已通过', value: 'COMPLETED' },
]

// 表单数据
const formData = reactive<Partial<PurchaseListQueryParams>>({
  q: '',
  status: undefined,
  registerTimeStart: '',
  registerTimeEnd: '',
})

// 登记时间范围
const registerDateRange = ref<string[]>([])

// 监听初始数据
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.q = newVal.q || ''
    formData.status = newVal.status
    formData.registerTimeStart = newVal.registerTimeStart || ''
    formData.registerTimeEnd = newVal.registerTimeEnd || ''

    // 初始化日期范围
    if (newVal.registerTimeStart && newVal.registerTimeEnd) {
      registerDateRange.value = [newVal.registerTimeStart, newVal.registerTimeEnd]
    }
  }
}, { deep: true, immediate: true })

// 切换状态选择
function toggleStatus(value: PurchaseStatus) {
  formData.status = formData.status === value ? undefined : value
}

// 登记时间变化处理
function onRegisterDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.registerTimeStart = `${val[0]} 00:00:00` || ''
    formData.registerTimeEnd = `${val[1]} 23:59:59` || ''
  }
}

// 关闭弹窗
function close() {
  emit('update:modelValue', false)
}

// 重置
function onReset() {
  formData.q = ''
  formData.status = undefined
  formData.registerTimeStart = ''
  formData.registerTimeEnd = ''

  // 清空日期范围
  registerDateRange.value = []

  emit('callback', {})
  close()
}

// 确认
function onConfirm() {
  const data: Partial<PurchaseListQueryParams> = {}

  if (formData.q) {
    data.q = formData.q
  }
  if (formData.status) {
    data.status = formData.status
  }
  if (formData.registerTimeStart) {
    data.registerTimeStart = formData.registerTimeStart
  }
  if (formData.registerTimeEnd) {
    data.registerTimeEnd = formData.registerTimeEnd
  }

  emit('callback', data)
  close()
}
</script>
