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
      <a-checkbox-group v-model:value="checkedFormKeys" class="grid gap-x-3 custom-checkbox-group" :class="[`grid-cols-${cols}`]">
        <slot name="form-before" :data="formState"></slot>

        <component
          :is="groupConfigObj ? renderGroupedForm : renderNormalForm"
        />

        <slot name="form-after" :data="formState"></slot>
      </a-checkbox-group>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormProps } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { IGroupConfig } from '~/anyThing/interface/IGroupConfig'
import type { AnyBaseModel } from '~/anyThing/model/AnyBaseModel'
import type { ClassConstructor } from '~/anyThing/types/ClassConstructor'
import { Card, Checkbox, FormItem } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDataTransformHelper } from '~/anyThing/helper/AnyDataTransformHelper'
import { AnyValidatorHelper } from '~/anyThing/helper/AnyValidatorHelper'
import { useIndustryStore } from '~/store/industryStore'

const props = withDefaults(defineProps<{
  /** # 配置实体 */
  entity: ClassConstructor<AnyBaseModel>

  /** # 列数 */
  cols?: number

  /** # 初始数据 */
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

  /** # 需要禁用的字段列表 */
  disabledFields?: string[]

  /** # 需要隐藏的字段列表 */
  hiddenFields?: string[]
} & FormProps>(), {
  cols: 2,
  labelCol: () => ({ style: { width: '110px' } }),
})

const emit = defineEmits<{
  (event: 'change'): void
}>()

const { term } = useIndustryStore()

const formRef = ref<FormExpose>()
const formState = ref(props.initData || new props.entity!())
const checkedFormKeys = ref<string[]>([])
const slots = useSlots()

const groupConfigObj = computed(() => {
  return formState.value.getGroupConfigObj() as IGroupConfig<AnyBaseModel>[]
})

const formFieldList = computed(() => {
  const list = formState.value.getFormFieldList()
  let res = list
  if (props.fieldList?.length) {
    res = list.filter(item => props.fieldList?.includes(item))
  }
  return AnyDataTransformHelper.sortByArray(res, props.fieldOrder || []) as (keyof InstanceType<ClassConstructor<AnyBaseModel>>)[]
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
  emit('change')
  if (e) {
    checkedFormKeys.value = Array.from(new Set([...checkedFormKeys.value, field]))
  }
  nextTick(() => {
    formRef.value?.validate([field]).catch((err: any) => {
      console.error(err)
    })
  })
}

/** # 渲染单个表单字段 */
function renderFormField(field: string) {
  if (props.hiddenFields?.includes(field))
    return null

  const isDisabled = props.disabled
    || formFieldConfigObj.value?.[field]?.disabled
    || props.disabledFields?.includes(field)

  return h('div', { class: 'flex items-center gap-3' }, [
    props.showCheckbox && h(Checkbox, {
      style: { marginBottom: '24px' },
      value: field,
    }),
    h(FormItem, {
      name: field,
      class: 'flex-1',
    }, {
      label: () => {
        const label = formState.value.getFormFieldLabel(field)
        return h('span', { class: 'whitespace-pre-wrap leading-4' }, term(label || ''))
      },
      default: () => {
        // 检查是否有对应的插槽
        const fieldSlot = slots[field]
        if (fieldSlot) {
          return fieldSlot({ data: formState.value })
        }
        // 默认渲染IlisInput
        return h(IlisInput, {
          'modelValue': (formState.value as any)[field],
          'style': { minWidth: '200px', width: '100%' },
          'entity': props.entity,
          'field': field,
          'formData': formState.value,
          'selectorConfig': formFieldConfigObj.value?.[field]?.selectorConfig,
          'disabled': isDisabled,
          'options': formState.value.getOptions(field),
          'checkedValue': formFieldConfigObj.value?.[field]?.checkedValue,
          'unCheckedValue': formFieldConfigObj.value?.[field]?.unCheckedValue,
          ...(formFieldConfigObj.value?.[field]?.attributes as any || {}),
          'onUpdate:modelValue': (value: any) => {
            (formState.value as any)[field] = value
            handleChange(value, field)
          },
        })
      },
    }),
  ])
}

/** # 渲染分组表单 */
function renderGroupedForm() {
  return groupConfigObj.value.map(group =>
    h(Card, {
      key: group.name,
      title: term(group.name || ''),
      style: { marginBottom: '12px' },
    }, {
      default: () => group?.fieldList?.map(field => renderFormField(field)) || [],
    }),
  )
}

/** # 渲染普通表单 */
function renderNormalForm() {
  return formFieldList.value.map(field => renderFormField(field))
}

async function getFormData() {
  return new Promise((resolve) => {
    formRef.value?.validate().then(() => {
      resolve(formState.value)
    }).catch((err: any) => {
      formRef.value?.scrollToField(err?.errorFields?.[0]?.name, {
        behavior: 'smooth',
        block: 'center',
      })
    })
  })
}

defineExpose({
  getFormData,
  checkedFormKeys,
  handleChange,
  validateFields: (fields: string[]) => {
    formRef.value?.validateFields(fields)
  },
})
</script>

<style scoped>
:deep(.ant-form-item .ant-form-item-label > label) {
  width: 100%;
  justify-content: flex-end;
}

:deep(.custom-checkbox-group) {
  display: grid !important;
}
</style>
