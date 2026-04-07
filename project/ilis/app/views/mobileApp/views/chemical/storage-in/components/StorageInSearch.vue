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
              placeholder="请输入化学名称/化学品编号/入库批号"
              class="w-full h-8 px-2 bg-[#e8f4ff] border-0 rounded text-sm text-[#333] placeholder:text-[#999]"
            />
          </div>

          <!-- 入库状态 - 标签选择 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              入库状态
            </div>
            <ul class="grid grid-cols-4 gap-2">
              <li
                v-for="item in statusList" :key="item.value" class="h-8 leading-7 text-center rounded text-sm border-2"
                :class="formData.inventoryStatus === item.value ? 'bg-[#fdf3f2] border-[#cc5e4d] text-[#333]' : 'bg-[#e8f4ff] border-[#e8f4ff] text-[#333]'"
                @click="selectStatus(item.value)"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>

          <!-- 管理级别 - 标签选择 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              管理级别
            </div>
            <ul class="grid grid-cols-4 gap-2">
              <li
                v-for="item in levelList" :key="item.id" class="h-8 leading-7 text-center rounded text-sm border-2"
                :class="formData.manageLevelId === item.id ? 'bg-[#fdf3f2] border-[#cc5e4d] text-[#333]' : 'bg-[#e8f4ff] border-[#e8f4ff] text-[#333]'"
                @click="selectLevel(item.id)"
              >
                {{ item.displayName }}
              </li>
            </ul>
          </div>

          <!-- 生产日期 -->
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

          <!-- 失效日期 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              失效日期
            </div>
            <MobileDateRange
              v-model="invalidDateRange"
              title="选择失效日期范围"
              @change="onInvalidDateChange"
            />
          </div>

          <!-- 入库日期 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              入库日期
            </div>
            <MobileDateRange
              v-model="putawayDateRange"
              title="选择入库日期范围"
              @change="onPutawayDateChange"
            />
          </div>

          <!-- 是否更换容器储存 - Radio 单选 -->
          <div class="px-4 pt-4">
            <div class="text-sm text-[#333] mb-2">
              是否更换容器储存
            </div>
            <div class="flex items-center bg-[#e8f4ff] rounded p-2">
              <van-radio-group v-model="formData.allowChangeContainer" direction="horizontal">
                <van-radio name="1" class="mr-4">
                  是
                </van-radio>
                <van-radio name="0">
                  否
                </van-radio>
              </van-radio-group>
            </div>
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
import type { StorageInListQueryParams } from '~/views/mobileApp/types/chemical/storage-in'
import { onMounted, reactive, ref, watch } from 'vue'
import MobileDateRange from '~/views/mobileApp/components/mobileDateRange/index.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { getManageLevelOptions } from '~/views/mobileApp/provides/api/chemical.api'

const props = defineProps<{
  modelValue: boolean
  initialData?: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'callback': [data: Record<string, any>]
  'select-chemical': []
}>()

// 状态列表
const statusList = [
  { label: '创建中', value: '创建中' },
  { label: '已入库', value: '已入库' },
]

// 级别列表
const levelList = ref()

// 加载管理级别选项
async function loadManageLevelOptions() {
  try {
    const res = await getManageLevelOptions()
    if (res.code !== 20010 && res.data) {
      levelList.value = res.data
        .filter(item => item.enabled)
    }
  }
  catch (error) {
    console.error('加载管理级别选项失败:', error)
  }
}

onMounted(() => {
  loadManageLevelOptions()
})

// 日期范围
const productionDateRange = ref<string[]>([])
const invalidDateRange = ref<string[]>([])
const putawayDateRange = ref<string[]>([])

// 表单数据 - 使用 StorageInListQueryParams 的筛选字段
const formData = reactive<Partial<StorageInListQueryParams>>({
  quickQry: '',
  inventoryStatus: '',
  categoryName: '',
  manageLevelId: '',
  productionDateStart: '',
  productionDateEnd: '',
  invalidDateStart: '',
  invalidDateEnd: '',
  putawayDateStart: '',
  putawayDateEnd: '',
  allowChangeContainer: '1',
})

// 监听初始数据变化
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    // 初始化日期范围
    if (newVal.productionDateStart && newVal.productionDateEnd) {
      productionDateRange.value = [newVal.productionDateStart, newVal.productionDateEnd]
    }
    if (newVal.invalidDateStart && newVal.invalidDateEnd) {
      invalidDateRange.value = [newVal.invalidDateStart, newVal.invalidDateEnd]
    }
    if (newVal.putawayDateStart && newVal.putawayDateEnd) {
      putawayDateRange.value = [newVal.putawayDateStart, newVal.putawayDateEnd]
    }
  }
}, { deep: true, immediate: true })

function close() {
  emit('update:modelValue', false)
}

function selectStatus(value: string) {
  formData.inventoryStatus = formData.inventoryStatus === value ? '' : value
}

function selectLevel(value: string) {
  formData.manageLevelId = formData.manageLevelId === value ? '' : value
}

function onProductionDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.productionDateStart = val[0] || ''
    formData.productionDateEnd = val[1] || ''
  }
}

function onInvalidDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.invalidDateStart = val[0] || ''
    formData.invalidDateEnd = val[1] || ''
  }
}

function onPutawayDateChange(val: string[]) {
  if (val && val.length === 2) {
    formData.putawayDateStart = val[0] || ''
    formData.putawayDateEnd = val[1] || ''
  }
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
    quickQry: '',
    inventoryStatus: '',
    categoryName: '',
    manageLevelId: '',
    productionDateStart: '',
    productionDateEnd: '',
    invalidDateStart: '',
    invalidDateEnd: '',
    putawayDateStart: '',
    putawayDateEnd: '',
    allowChangeContainer: '1',
  })
  productionDateRange.value = []
  invalidDateRange.value = []
  putawayDateRange.value = []
  emit('callback', {})
  emit('update:modelValue', false)
}
</script>

<style scoped>
</style>
