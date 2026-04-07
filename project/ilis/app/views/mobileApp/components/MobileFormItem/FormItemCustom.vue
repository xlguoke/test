<template>
  <div class="form-item-custom">
    <template v-for="item in customFields" :key="item.id">
      <!-- 文本输入 -->
      <FormItemInput
        v-if="item.columnType === 'input'"
        v-model:value="item.columnValue"
        :label="item.columnName"
        :placeholder="`请输入${item.columnName}`"
        :disabled="disabled"
      />

      <!-- 数字输入 -->
      <van-field
        v-else-if="item.columnType === 'inputNumber'"
        v-model="item.columnValue"
        input-align="right"
        :label="item.columnName"
        :placeholder="`请输入${item.columnName}`"
        :disabled="disabled"
        type="number"
      />

      <!-- 单选 -->
      <FormItemRadio
        v-else-if="item.columnType === 'radio'"
        v-model:value="item.columnValue"
        :label="item.columnName"
        :options="[
          { label: '是', value: '是' },
          { label: '否', value: '否' },
        ]"
        :disabled="disabled"
      />

      <!-- 下拉选择 -->
      <FormItemPicker
        v-else-if="item.columnType === 'select'"
        v-model:value="item.columnValue"
        :label="item.columnName"
        :placeholder="`请选择${item.columnName}`"
        :options="getSelectOptions(item.columnOption)"
        :disabled="disabled"
      />

      <!-- 多行文本 -->
      <van-field
        v-else-if="item.columnType === 'textArea'"
        v-model="item.columnValue"
        input-align="right"
        :label="item.columnName"
        :placeholder="`请输入${item.columnName}`"
        :disabled="disabled"
        type="textarea"
        rows="2"
      />

      <!-- 日期选择 -->
      <FormItemDate
        v-else-if="item.columnType === 'date'"
        v-model:value="item.columnValue"
        :label="item.columnName"
        :placeholder="`请选择${item.columnName}`"
        :disabled="disabled"
      />
    </template>

    <!-- 暂无自定义字段 -->
    <div v-if="customFields.length === 0 && showEmpty" class="py-4 text-center text-gray-400 text-sm">
      暂无自定义字段
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { request } from '~/views/mobileApp/provides/utils/mRequest'
import FormItemDate from './FormItemDate.vue'
import FormItemInput from './FormItemInput.vue'
import FormItemPicker from './FormItemPicker.vue'
import FormItemRadio from './FormItemRadio.vue'

export interface CustomField {
  id: string
  columnId?: string
  columnName: string
  columnType: string
  columnValue: string | undefined
  columnOption?: string[]
}

interface Props {
  // 自定义类型，如 'chemicalInventoryIn'
  customizeType: string
  // 初始值（编辑时使用）
  initialValue?: Array<{ columnId: string, columnValue: string }>
  // 是否禁用
  disabled?: boolean
  // 无数据时是否显示提示
  showEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: () => [],
  disabled: false,
  showEmpty: true,
})

const emit = defineEmits<{
  'update:modelValue': [fields: CustomField[]]
  'loaded': [fields: CustomField[]]
}>()

const customFields = ref<CustomField[]>([])

// 组件挂载时加载自定义字段配置
onMounted(() => {
  loadCustomFields()
})

// 监听initialValue变化（编辑时回填数据）
watch(() => props.initialValue, (val) => {
  if (val && val.length > 0 && customFields.value.length > 0) {
    mergeInitialValues(val)
  }
}, { immediate: false })

// 监听customFields变化，通知父组件
watch(customFields, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

// 获取自定义字段配置
async function loadCustomFields() {
  try {
    const res = await request.get<{
      id: string
      columnName: string
      columnType: string
      columnValue?: string
    }[]>('/rest/common/custom-properties', {
      params: { customizeType: props.customizeType },
    })

    if (res.code === 20000 && res.data) {
      const list = res.data || []
      // 处理自定义字段，将columnValue拆分为选项数组
      const fields = list.map((item) => {
        const field: CustomField = {
          id: item.id,
          columnName: item.columnName,
          columnType: item.columnType,
          columnValue: undefined,
        }
        if (item.columnType === 'select' && item.columnValue) {
          field.columnOption = item.columnValue.split(',')
        }
        return field
      })

      customFields.value = fields

      // 如果有初始值，进行合并
      if (props.initialValue && props.initialValue.length > 0) {
        mergeInitialValues(props.initialValue)
      }

      emit('loaded', customFields.value)
    }
  }
  catch (error) {
    console.error('获取自定义字段失败:', error)
  }
}

// 合并初始值到字段配置
function mergeInitialValues(initialValues: Array<{ columnId: string, columnValue: string }>) {
  customFields.value = customFields.value.map((field) => {
    const savedValue = initialValues.find(v => v.columnId === field.id)
    if (savedValue) {
      return {
        ...field,
        columnId: savedValue.columnId,
        columnValue: savedValue.columnValue,
      }
    }
    return field
  })
}

// 转换下拉选项格式
function getSelectOptions(options?: string[]) {
  if (!options || options.length === 0)
    return []
  return options.map(opt => ({
    text: opt,
    value: opt,
  }))
}

// 获取保存格式的数据
function getSaveData(): Array<{ columnId: string, columnValue: string }> {
  return customFields.value
    .map(item => ({
      columnId: item.columnId || item.id,
      columnValue: String(item.columnValue),
    }))
}

// 暴露方法给父组件
defineExpose({
  getSaveData,
  getCustomFields: () => customFields.value,
})
</script>
