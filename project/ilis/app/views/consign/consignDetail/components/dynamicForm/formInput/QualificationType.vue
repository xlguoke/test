<template>
  <!-- 资质类型 -->
  <CustomInput
    v-model="value"
    :form-field-config="formFieldConfig"
    :allow-clear="false"
    :controls="false"
    :disabled="systemParams.SET_QUA_WITH_OBJECT || disabled"
    @change="handleChange"
  />
</template>

<script setup lang='ts'>
import type { CustomFormFieldConfig } from '~/anyThing/components/input/CustomInput.vue'
import type { IndustryLayoutConfig } from '~/api/consign/consign-form-layout/types'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'
import CustomInput from '~/anyThing/components/input/CustomInput.vue'
import { useSystemParamStore } from '~/store/systemParamStore'
import { qualificationsApi } from '~/views/consign/consignList/api'

const props = defineProps<{
  modelValue: string[] | undefined
  disabled?: boolean
  /** # 字段布局配置 */
  layoutItem: IndustryLayoutConfig
  /** 委托详情 */
  consignDetail?: IConsignDataDTO
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string[] | undefined): void
  (event: 'change', value: string[] | undefined): void
}>()
/** 【业务控制参数】 */
const { systemParams } = useSystemParamStore()

/** 表单配置 */
const formFieldConfig = reactive<CustomFormFieldConfig>({
  formType: props.layoutItem.formType,
  allowClear: false,
  multiple: true,
  placeholder: props.disabled ? '' : `请选择${props.layoutItem.fieldName}`,
  options: props.layoutItem.options || [],
})

const value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    if (JSON.stringify(props.modelValue) !== JSON.stringify(val)) {
      emits('update:modelValue', val)
    }
  },
})

async function getQualifications() {
  const { data } = await qualificationsApi()

  formFieldConfig.options = data.map(item => ({
    ...item,
    label: item.name,
    value: item.id,
  }))
  localStorage.setItem('qualifications', JSON.stringify(data))
}

watch(
  () => [props.consignDetail, formFieldConfig.options],
  (data: any) => {
    const [consignDetail, options] = data
    if ((consignDetail && !consignDetail.status) && options && options.length > 0) {
      // 新增委托时,布局配置中设置了默认值,则使用布局配置中的默认值
      if (props.layoutItem.value && props.layoutItem.value.length > 0) {
        value.value = props.layoutItem.value as string[]
        return
      }
      const item = formFieldConfig.options?.filter((i: any) => i.defaultFlag)
      if (item && item.length > 0)
        value.value = item.map((d: any) => d.id)
      else if (formFieldConfig.options)
        value.value = [formFieldConfig.options[0].value]
    }
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  getQualifications()
})

function handleChange(val: string[]) {
  emits('change', val)
}
</script>

<style>

</style>
