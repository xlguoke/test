<template>
  <a-input-number
    v-if="customOption.columnType === FORM_TYPE.INPUT_NUMBER"
    v-model:value="value"
    allow-clear
    style="width:100%;"
    :placeholder="placeholder"
  />
  <a-input
    v-else-if="customOption.columnType === FORM_TYPE.INPUT"
    :ref="customOption.id"
    v-model:value="value"
    style="width:100%;"
    allow-clear
    :ref-val="customOption.id"
    :placeholder="placeholder"
  />
  <a-radio-group
    v-else-if="customOption.columnType === FORM_TYPE.RADIO"
    v-model:value="value"
    style="width:100%;"
    name="radioGroup"
  >
    <div class=" w-full flex flex-wrap gap-3">
      <a-radio
        v-for="(v, index) in customOption.options ? customOption.options.split(',') : []"
        :key="index"
        :value="v"
      >
        {{ v }}
      </a-radio>
    </div>
  </a-radio-group>
  <a-select
    v-else-if="customOption.columnType === FORM_TYPE.SELECT || customOption.columnType === FORM_TYPE.SELECT_MULTIPLE"
    v-model:value="value"
    style="width:100%;"
    allow-clear
    :mode="isMultiple"
    :placeholder="placeholder"
  >
    <a-select-option
      v-for="(v, index) in customOption.options ? customOption.options.split(',') : []"
      :key="index"
      allow-clear
      :value="v"
    >
      {{ v }}
    </a-select-option>
  </a-select>
  <a-auto-complete
    v-else-if="customOption.columnType === FORM_TYPE.SELECT_INPUT"
    v-model:value="value"
    style="width:100%;"
    allow-clear
    :options="customOption.options ? customOption.options.split(',')?.map((customOption:any) => ({ value: customOption })) : []"
    :placeholder="placeholder"
  />
  <a-textarea
    v-else-if="customOption.columnType === FORM_TYPE.TEXT_AREA"
    :ref="customOption.id"
    v-model:value="value"
    style="width:100%;"
    allow-clear
    :ref-val="customOption.id"
  />
  <a-date-picker
    v-else-if="customOption.columnType === FORM_TYPE.DATE"
    v-model:value="value"
    :placeholder="placeholder"
    allow-clear
    style="width:100%;"
    format="YYYY-MM-DD"
    value-format="YYYY-MM-DD"
  />
</template>

<script lang="ts" setup>
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import { FORM_TYPE } from '../customAttribute'

const props = defineProps<{
  /** # 双向绑定数据 */
  modelValue: any
  /** # 自定义属性配置 */
  customOption: ICustomProperties
  /** # 占位符 */
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const isMultiple = computed(() => {
  return props.customOption.columnType === FORM_TYPE.SELECT_MULTIPLE ? 'multiple' : undefined
})

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  },
})
</script>
