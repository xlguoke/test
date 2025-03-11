<template>
  <a-form
    v-bind="$attrs"
    ref="formRef"
    :model="formState"
    :rules="rules"
    :disabled="props.disabled"
    :label-col="labelCol"
    label-wrap
    @submit="props.onSubmit"
    @finish="props.onFinish"
  >
    <div>
      <a-checkbox-group v-model:value="checkedFormKeys" class="grid gap-x-3" :class="[`grid-cols-${cols}`]">
        <slot name="form-before" :data="formState"></slot>
        <div
          v-for="field in formFieldList"
          :key="field"
          class=" flex items-center gap-3"
        >
          <a-checkbox v-if="showCheckbox" class="mb-[24px]" :value="field"></a-checkbox>
          <a-form-item :name="field" class="flex-1">
            <template #label>
              <span style="max-width: calc(100% - 20px);">
                <BaseText>{{ formState.getFormFieldLabel(field) }}</BaseText>
              </span>
            </template>
            <slot :name="field" :data="formState">
              <IlisInput
                v-model="formState[field]"
                style="min-width: 200px;width: 100%;"
                :entity="entity"
                :field="field"
                :form-data="formState"
                :selector-config="formFieldConfigObj?.[field]?.selectorConfig"
                :disabled="props.disabled || formFieldConfigObj?.[field]?.disabled"
                :options="formState.getOptions(field)"
                :checked-value="formFieldConfigObj?.[field]?.checkedValue"
                :un-checked-value="formFieldConfigObj?.[field]?.unCheckedValue"
                @change="handleChange($event, field)"
              />
            </slot>
          </a-form-item>
        </div>
        <slot name="form-after" :data="formState"></slot>
      </a-checkbox-group>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormProps } from 'ant-design-vue'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { Rule } from 'ant-design-vue/es/form'
import { IlisInput } from '.'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'

const props = withDefaults(defineProps<{
  /** # 配置实体 */
  entity: ClassConstructor<AnyBaseModel>

  /**  # 列数 */
  cols?: number

  /** # 初始数据  */
  initData?: InstanceType<ClassConstructor<AnyBaseModel>>

  /** # 要展示的字段列表 */
  fieldList?: string[]

  /** # 字段排序参考 */
  fieldOrder?: string[]

  /** 额外的验证规则（会与实体的配置合并） */
  mixinRules?: Record<string, Rule[]>

  /** # 表单label布局 */
  labelCol?: object

  /** # 是否显示复选框(开启后可手动获取一组选中字段) */
  showCheckbox?: boolean

  /** # 是否可选(开启后，无效化表单项的必填验证) */
  isOptional?: boolean
} & FormProps>(), {
  cols: 2,
  labelCol: () => ({ style: { width: '74px' } }),
})

const formRef = ref<FormExpose>()

const formState = ref(props.initData || new props.entity!())

const checkedFormKeys = ref<string[]>([])

const formFieldList = computed(() => {
  const list = formState.value.getFormFieldList()
  let res = list
  if (props.fieldList?.length) {
    res = list.filter(item => props.fieldList?.includes(item))
  }
  return AnyDataTransformHelper.sortByArray(res, props.fieldOrder || [])
})

const rules = computed(() => {
  return AnyValidatorHelper.getValidateRules(formState.value, props.mixinRules, props.isOptional)
})

const formFieldConfigObj = computed(() => {
  return formState.value.getFormFieldConfigObj()
})

watch(() => props.initData, (newVal) => {
  if (newVal) {
    formState.value = newVal
  }
})

function handleChange(e: any, field: string) {
  if (e) {
    checkedFormKeys.value = Array.from(new Set([...checkedFormKeys.value, field]))
  }
  nextTick(() => {
    formRef.value?.validate([field]).catch((err) => {
      console.error(err)
    })
  })
  return e
}

async function getFormData() {
  return new Promise((resolve) => {
    formRef.value?.validate().then(() => {
      resolve(formState.value)
    })
  })
}

defineExpose({ getFormData, checkedFormKeys })
</script>

<style scoped>
:deep(.ant-form-item .ant-form-item-label >label){
  width: 100%;
  justify-content: flex-end;
}
</style>
