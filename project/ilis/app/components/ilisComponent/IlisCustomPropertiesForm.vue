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
      <IlisCustomPropertiesInput
        v-model="customProperties[i].columnValue"
        :custom-option="item"
        :placeholder="getPlaceHolder(item)"
      ></IlisCustomPropertiesInput>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormExpose } from 'ant-design-vue/es/form/Form'
import type { ICustomProperties } from '~/views/equipment/check/checkSend/component/customRecord'
import { useCustomPropertiesHooks } from '~/hooks/useCustomPropertiesHooks'

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

const formRef = ref<FormExpose>()

const {
  customProperties,
  getRules,
  getPlaceHolder,
} = useCustomPropertiesHooks({
  customizeType: props.customizeType,
  initData: props.defaultValue,
  readonly: props.disabled,
})

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
