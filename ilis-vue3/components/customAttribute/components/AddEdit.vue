<template>
  <a-modal
    v-model:open="visible"
    title="自定义字段配置"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="loading"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      class="pt-4 h-[300px]"
      :model="form"
      :rules="rules"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="属性名称" name="columnName">
        <a-input
          v-model:value="form.columnName"
          autocomplete="off"
          :maxlength="AppConfig.MAX_LENGTH_INPUT"
          placeholder="请输入属性名称"
        />
      </a-form-item>
      <a-form-item label="属性类型" name="columnType">
        <a-select v-model:value="form.columnType" placeholder="请选择属性类型">
          <a-select-option v-for="(item) in FORM_TYPE_DICT" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="showColumnValue" label="属性候选值" name="columnValue">
        <a-popover title="提示">
          <template #content>
            <p>多个候选值以半角逗号分隔。</p>
            <p>例如： <span class="tag-css">普通送检,定期检查</span></p>
          </template>
          <a-select
            v-model:value="form.columnValue"
            :allow-clear="true"
            :token-separators="[',']"
            mode="tags"
            placeholder="请输入属性候选值"
            @change="changeSelect"
          >
            <a-select-option v-for="item in items" :key="item + 1" :value="item">
              {{ item }}
            </a-select-option>
          </a-select>
        </a-popover>
      </a-form-item>
      <a-form-item v-if="showColumnValue" label="默认值" name="defaultValue">
        <a-select
          v-model:value="form.defaultValue"
          :allow-clear="true"
          placeholder="请输入属性候选值"
        >
          <a-select-option v-for="item in form.columnValue" :key="item + 1" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="排序号" name="columnIndex">
        <a-input-number v-model:value="form.columnIndex" :max="AppConfig.MAX_NUMBER" placeholder="请输入排序号" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Rule, RuleObject } from 'ant-design-vue/es/form'
import { type AddEditData, saveApi } from '../api'
import type { CustomAttributeEntity } from '../'
import { FORM_TYPE, FORM_TYPE_DICT } from '../'
import { AppConfig } from '~/anyThing/AppConfig'

const props = defineProps<{
  open: boolean
  customizeType: string
  columnNameList: string[]
  detailData?: CustomAttributeEntity
}>()
const emits = defineEmits<{
  (e: 'update:open', data: boolean): void
  (e: 'save'): void
}>()

const INIT_FORM = {
  columnIndex: 0,
  columnName: '',
  columnType: FORM_TYPE.INPUT,
  customizeType: props.customizeType,
  visible: true,
}

const visible = ref(props.open)
const loading = ref(false)
const formRef = ref()
const form = ref<AddEditData>({
  ...INIT_FORM,
})

const rules: { [key: string]: RuleObject[] } = {
  columnName: [
    { required: true, message: '请输入属性名称', trigger: 'change' },
    { validator: validateHeaderName, message: '属性名称已存在' },
  ],
  columnType: [{ required: true, message: '请选择属性类型', trigger: 'change' }],
  columnIndex: [{ required: true, message: '请输入排序号', trigger: 'change' }],
}

const showColumnValue = computed(() => {
  const { SELECT, SELECT_INPUT, RADIO } = FORM_TYPE
  return [SELECT, SELECT_INPUT, RADIO].includes(form.value.columnType)
})

const items = ref([])
const repeatNames = computed(() => {
  if (!props.detailData)
    return props.columnNameList

  return props.columnNameList.filter(d => d !== props.detailData?.columnName)
})
/** 名称重复验证 */
function validateHeaderName(_rule: Rule, value: string) {
  if (repeatNames.value.includes(value)) {
    return Promise.reject(new Error('属性名称已存在'))
  }
  return Promise.resolve()
}

watch(() => props.open, (val) => {
  visible.value = val
  loading.value = false
  if (!val)
    return
  nextTick(() => {
    if (props.detailData) {
      const values = props.detailData.columnValue ? props.detailData.columnValue.split(',') : undefined
      form.value = {
        id: props.detailData.id || '',
        columnIndex: props.detailData.columnIndex || 0,
        columnName: props.detailData.columnName || '',
        columnType: props.detailData.columnType || FORM_TYPE.INPUT,
        columnValue: values,
        defaultValue: props.detailData.defaultValue || undefined,
        customizeType: props.customizeType,
        visible: true,
        isDelete: false,
      }
    }
  })
})
watch(() => visible.value, () => {
  emits('update:open', visible.value)
})

/** 修改候选者 */
function changeSelect() {
  const { defaultValue, columnValue } = form.value
  if (defaultValue && columnValue && columnValue.length) {
    if (!columnValue.includes(defaultValue)) {
      form.value.defaultValue = undefined
    }
  }
}

/** 保存 */
async function handleOk() {
  try {
    await formRef.value.validateFields()
    loading.value = true
    const data = { ...form.value }
    if (!showColumnValue.value) {
      delete data.columnValue
    }
    await saveApi(data)
    message.success('保存成功!')
    handleCancel()
    emits('save')
  }
  catch (err) {
    loading.value = false
    console.error(err)
  }
}

function handleCancel() {
  visible.value = false
  formRef.value.resetFields()
  form.value = { ...INIT_FORM }
}
</script>

<style scoped>
.tag-css{
  padding: 2px 4px;
  display: inline-block;
  font-size: 12px;
  background-color: #ccc;
  border-radius: 2px;
}
</style>
