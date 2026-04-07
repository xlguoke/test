<template>
  <ht-modal
    v-model:open="visible"
    :title="`${props.detailData ? '编辑' : '新增'}属性`"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      class="pt-4 min-h-[320px]"
      :model="form"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 17 }"
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
        <a-select v-model:value="form.columnType" placeholder="请选择属性类型" @change="changeColumnType">
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
          :mode="form.columnType === FORM_TYPE.SELECT_MULTIPLE ? 'multiple' : undefined"
        >
          <a-select-option v-for="item in form.columnValue" :key="item + 1" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="排序号" name="columnIndex">
        <a-input-number v-model:value="form.columnIndex" :max="AppConfig.MAX_NUMBER" placeholder="请输入排序号" />
      </a-form-item>
      <a-form-item v-if="showBlindCol" label="是否盲样" name="blind">
        <a-radio-group v-model:value="form.blind">
          <a-radio :value="1">
            是
          </a-radio>
          <a-radio :value="0">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="showPreConsignCol" label="应用到预委托" name="preVisible">
        <a-radio-group v-model:value="form.preVisible">
          <a-radio :value="1">
            是
          </a-radio>
          <a-radio :value="0">
            否
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { Rule, RuleObject } from 'ant-design-vue/es/form'
import type { CustomAttributeEntity } from '../'
import type { AddEditData } from '../api'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { AppConfig } from '~/anyThing/AppConfig'
import { FORM_TYPE, FORM_TYPE_DICT } from '../'
import { saveApi } from '../api'

const props = defineProps<{
  open: boolean
  customizeType: string
  columnNameList: string[]
  detailData?: CustomAttributeEntity
  showBlindCol?: boolean
  showPreConsignCol?: boolean
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
  blind: 0,
  preVisible: 0,
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
  blind: [{ required: true, message: '请选择是否盲样', trigger: 'change' }],
  preVisible: [{ required: true, message: '请选择是否应用到预委托', trigger: 'change' }],
}

const showColumnValue = computed(() => {
  const { SELECT, SELECT_INPUT, SELECT_MULTIPLE, RADIO } = FORM_TYPE
  return [SELECT, SELECT_INPUT, SELECT_MULTIPLE, RADIO].includes(form.value.columnType)
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
        blind: props.detailData.blind || 0,
        preVisible: props.detailData.preVisible ? 1 : 0,
        visible: true,
        isDelete: false,
      }
    }
  })
})
watch(() => visible.value, () => {
  emits('update:open', visible.value)
})

/** 改变属性类型 */
function changeColumnType(type: any) {
  const v = form.value.defaultValue || ''
  if (v && type !== FORM_TYPE.SELECT_MULTIPLE && Array.isArray(v)) {
    form.value.defaultValue = v[0] ? v[0].toString() : undefined
  }
}

/** 修改候选值 */
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
    if (props.showBlindCol && data.blind !== undefined) {
      data.columnName = `${data.blind}${data.columnName}`
    }
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
