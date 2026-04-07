<template>
  <HtModal
    v-model:open="visible"
    title="设置数据来源"
    width="600px"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class="min-h-[200px]">
      <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item label="数据来源" name="dataFrom">
          <a-select v-model:value="form.dataFrom" class="w-full" :disabled="disabledDataFrom" placeholder="请选择数据来源">
            <a-select-option v-for="d in dataFromDict" :key="d.key" :value="d.key">
              {{ d.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="form.dataFrom === OPTIONS_DATA_SOURCE.API">
          <a-form-item label="接口地址" name="url">
            <a-input v-model:value="form.url" placeholder="请输入接口地址，如: rest/consign/list" />
          </a-form-item>
          <a-form-item label="label" name="label">
            <a-input v-model:value="form.label" placeholder="请输入label，不填时默认为label" />
          </a-form-item>
          <a-form-item label="value" name="value">
            <a-input v-model:value="form.value" placeholder="请输入value，不填时默认为value" />
          </a-form-item>
        </template>
        <a-form-item v-else-if="form.dataFrom === OPTIONS_DATA_SOURCE.DICT" label="字典编码" name="dict">
          <a-input v-model:value="form.dict" placeholder="请输入字典编码" />
        </a-form-item>
        <a-form-item v-else-if="form.dataFrom === OPTIONS_DATA_SOURCE.STATIC" label="静态数据" name="statics">
          <a-form-item-rest>
            <div v-for="(d, i) in form.statics" :key="i" class="flex items-center gap-2 mb-1">
              <a-input v-model:value="d.label" placeholder="请输入label" />
              <a-input v-model:value="d.value" placeholder="请输入value" />
              <div class="w-[80px] flex items-center gap-2 text-[16px] cursor-pointer">
                <PlusCircleOutlined class="text-colorPrimary" @click="form.statics.push({ label: '', value: '' })" />
                <MinusCircleOutlined v-if="form.statics.length > 1" class="text-[red]" @click="form.statics.splice(i, 1)" />
              </div>
            </div>
          </a-form-item-rest>
        </a-form-item>
        <a-form-item v-else-if="form.dataFrom === OPTIONS_DATA_SOURCE.COMPONENT" label="组件名称" name="component">
          <a-select v-model:value="form.component" class="w-full" placeholder="请选择组件">
            <a-select-option v-for="d in filterComponent" :key="d.value" :value="d.value">
              {{ d.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import type { DataFromConfig, IndustryConfig, IOption } from '../interface'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { INDUSTRY_COMPONENT } from '~/enum/EDynamicForm'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { EFormItemDynamicType } from '~/anyThing/enum/EFormItemType'
import { INPUT_COMPONENT, OPTIONS_DATA_SOURCE_DICT } from '../constants'
import { OPTIONS_DATA_SOURCE } from '../enum'

export interface IDataFrom {
  dataFrom: OPTIONS_DATA_SOURCE
  config: DataFromConfig
}

const props = defineProps<IDialogPropsParam<IDataFrom, IndustryConfig>>()

const visible = ref(true)

const formRef = ref()

/** 静态数据验证 */
function validStatics(_rule: any, value: IOption[], callback: any) {
  const unvalidRow = value.filter(d => (d.label && !d.value) || (!d.label && d.value))
  if (unvalidRow.length > 0)
    return callback(new Error('静态数据填写不完整，请补充未填写信息！'))

  const empytRow = value.filter(d => d.label && d.value)
  if (empytRow.length === 0)
    return callback(new Error('请添加静态数据！'))

  const repeatValue = value.filter((d, i, arr) => arr.findIndex(d2 => d2.value === d.value || d2.label === d.label) !== i)
  if (repeatValue.length > 0)
    return callback(new Error('label或value不能重复，请重新填写！'))

  callback()
}

const rules: { [key: string]: Rule[] } = {
  dataFrom: [{ required: true, message: '请选择数据来源' }],
  url: [{ required: true, message: '请输入接口地址' }],
  dict: [{ required: true, message: '请输入字典编码' }],
  statics: [{ required: true, message: '请添加静态数据' }, { validator: validStatics }],
  component: [{ required: true, message: '请选择组件' }],
}

const form = ref<{
  dataFrom: OPTIONS_DATA_SOURCE
  url?: string
  label?: string
  value?: string
  dict?: string
  component?: INDUSTRY_COMPONENT
  statics: IOption[]
}>({
  dataFrom: OPTIONS_DATA_SOURCE.API,
  statics: [{
    label: '',
    value: '',
  }],
})

const dataFromDict = OPTIONS_DATA_SOURCE_DICT.filter(d => d.key !== OPTIONS_DATA_SOURCE.NONE)
const filterComponent = INPUT_COMPONENT.filter(d => d.filed.includes(props.param.fieldCode))
/** 选择器只支持组件形式，通过配置无法满足不同的业务需求（选择器需要多个入参，无法配置） */
const disabledDataFrom = computed(() => {
  const { INPUT, INPUT_SELECTOR } = EFormItemDynamicType
  return [INPUT, INPUT_SELECTOR].includes(props.param.formType)
})

async function init() {
  const { NONE, COMPONENT, API } = OPTIONS_DATA_SOURCE
  if (!props.param || !props.param.config) {
    form.value.dataFrom = disabledDataFrom.value ? COMPONENT : API
    return
  }
  const dataFrom = props.param.dataFrom === NONE ? API : props.param.dataFrom
  const statics = props.param.config.statics
  form.value = {
    dataFrom: dataFrom || API,
    url: props.param.config.url?.url,
    label: props.param.config.url?.label,
    value: props.param.config.url?.value,
    dict: props.param.config.dict,
    component: props.param.config.component,
    statics: !statics || !statics.length ? [{ label: '', value: '' }] : statics,
  }
}
init()

async function handleOk() {
  const value = await formRef.value.validate()
  const data: IDataFrom = {
    dataFrom: value.dataFrom,
    config: {
      url: {
        url: value.url || '',
        label: value.label || '',
        value: value.value || '',
      },
      dict: value.dict || '',
      component: value.component || '',
      statics: value.statics || [],
    },
  }
  props.onConfirm(data)
  visible.value = false
}
</script>
