<template>
  <a-form
    ref="formRef"
    :model="customProperties"
    :disabled="disabled"
    :label-col="labelCol"
    label-wrap
    class="grid gap-x-3 w-full"
    :class="[`grid-cols-${cols}`]"
  >
    <a-form-item
      v-for="(item, i) in customProperties"
      :key="item.id"
      :name="[i, 'columnValue']"
      :rules="getRules(item)"
    >
      <template #label>
        <span style="max-width: calc(100% - 20px);">
          <BaseText>{{ item.columnName }}</BaseText>
        </span>
      </template>
      <a-input-number
        v-if="item.columnType === FORM_TYPE.INPUT_NUMBER"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        style="width:100%;"
        :placeholder="getPlaceHolder(item, i)"
      />
      <a-input
        v-else-if="item.columnType === FORM_TYPE.INPUT"
        :ref="item.id"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :ref-val="item.id"
        :placeholder="getPlaceHolder(item, i)"
      />
      <a-radio-group
        v-else-if="item.columnType === FORM_TYPE.RADIO"
        v-model:value="customProperties[i].columnValue"
        name="radioGroup"
      >
        <a-radio
          v-for="(v, index) in item.options ? item.options.split(',') : []"
          :key="index"
          :value="v"
        >
          {{ v }}
        </a-radio>
      </a-radio-group>
      <a-select
        v-else-if="item.columnType === FORM_TYPE.SELECT"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :placeholder="getPlaceHolder(item, i)"
      >
        <a-select-option
          v-for="(v, index) in item.options ? item.options.split(',') : []"
          :key="index"
          allow-clear
          :value="v"
        >
          {{ v }}
        </a-select-option>
      </a-select>
      <a-auto-complete
        v-else-if="item.columnType === FORM_TYPE.SELECT_INPUT"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :options="item.options ? item.options.split(',')?.map((item:any) => ({ value: item })) : []"
        :placeholder="getPlaceHolder(item, i)"
      />
      <a-textarea
        v-else-if="item.columnType === FORM_TYPE.TEXT_AREA"
        :ref="item.id"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :ref-val="item.id"
      />
      <a-date-picker
        v-else-if="item.columnType === FORM_TYPE.DATE"
        v-model:value="customProperties[i].columnValue"
        :placeholder="getPlaceHolder(item, i)"
        allow-clear
        style="width:100%;"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import type { RuleObject } from 'ant-design-vue/es/form'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import { FORM_TYPE } from '../customAttribute'
import { AppConfig } from '~/anyThing/AppConfig'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { getCustomProperties } from '~/api/common'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'

const props = withDefaults(defineProps<{
  /** # 自定义属性配置的类型 */
  customizeType: string

  /** # 默认值 */
  defaultValue?: ICustomProperties[]

  /** # 是否禁用 */
  disabled?: boolean

  /**  # 表单label宽度 */
  labelCol?: object

  /**  # 列数 */
  cols?: number
}>(), {
  labelCol: () => ({ style: { width: '74px' } }),
  cols: 1,
})

const customProperties = ref<ICustomProperties[]>([])

const formRef = ref<FormExpose>()

function getRules(item: ICustomProperties) {
  return [
    ...(item.columnType === FORM_TYPE.INPUT ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_INPUT), trigger: 'change' }] : []),
    ...(item.columnType === FORM_TYPE.SELECT_INPUT ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_INPUT), trigger: 'change' }] : []),
    ...(item.columnType === FORM_TYPE.TEXT_AREA ? [{ validator: AnyValidatorHelper.isLengthGreaterThan(AppConfig.MAX_LENGTH_AREA), trigger: 'change' }] : []),
    ...(item.columnType === FORM_TYPE.INPUT_NUMBER ? [{ validator: AnyValidatorHelper.isGreaterThan(AppConfig.MAX_NUMBER), trigger: 'change' }] : []),
  ] as RuleObject[]
}

function getPlaceHolder(item: ICustomProperties, index: number) {
  if (props.disabled && !customProperties.value?.[index]?.columnValue) {
    return ''
  }

  if ([FORM_TYPE.INPUT, FORM_TYPE.INPUT_NUMBER, FORM_TYPE.TEXT_AREA].includes(item.columnType)) {
    return `请输入${item.columnName}`
  }
  else {
    return `请选择${item.columnName}`
  }
}

async function getCustomPropertieList() {
  const { data } = await getCustomProperties(props.customizeType)
  let defaultValueMap: Record<string, any> = {}
  if (props.defaultValue?.length) {
    defaultValueMap = props.defaultValue.reduce((acc, cur) => {
      acc[cur.columnId] = cur.columnValue
      return acc
    }, {} as Record<string, any>)
  }
  customProperties.value = data?.map((item) => {
    // 设置option
    if (
      item.columnType === FORM_TYPE.SELECT
      || item.columnType === FORM_TYPE.RADIO
      || item.columnType === FORM_TYPE.SELECT_INPUT
    ) {
      item.options = item.columnValue
      item.columnValue = undefined
    }
    if (props.defaultValue?.length) {
      item.columnValue = defaultValueMap[item.id]
    }
    else {
      item.columnValue = item.defaultValue
    }
    // 设置默认值
    return item
  })
}

function getFormData() {
  return new Promise((resolve) => {
    formRef.value?.validate().then(() => {
      const data = customProperties.value.map((item) => {
        return {
          columnId: item.id,
          columnValue: item.columnValue,
          columnName: item.columnName,
        }
      })
      resolve(data)
    })
  })
}

function init() {
  getCustomPropertieList()
}

init()

defineExpose({
  getFormData,
})
</script>

<style scoped>
:deep(.ant-form-item .ant-form-item-label >label){
  width: 100%;
  justify-content: flex-end;
}
</style>
