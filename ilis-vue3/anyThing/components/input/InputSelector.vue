<template>
  <a-input-group ref="inputRef" compact>
    <a-input
      v-bind="$attrs"
      v-model:value.trim="value"
      style="width: calc(100% - 60px)"
      @change="handleChange"
    />
    <a-button @click="handleSelect">
      {{ text || '选择' }}
    </a-button>
  </a-input-group>
</template>

<script lang="ts" setup>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import type { IInputSelectorConfig } from '~/anyThing/interface/IInputSelectorConfig'

const props = defineProps<{
  modelValue: string | number | undefined
  selectorConfig: IInputSelectorConfig
  /**
   * # 表单数据
   * 用于传递给回调，做后续处理
   */
  formData?: Record<string, any>

  /**
   * # 按钮文字
   */
  text?: string
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string | number | undefined): void
  (event: 'change', value: any): void
}>()

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})

const inputRef = ref<any>()

const selectedValue = ref()

function handleChange(e: Event) {
  if (!(e.target as HTMLInputElement).value) {
    selectedValue.value = []
    emitData()
  }
}

async function handleSelect() {
  let checkedRows = []
  if (props.selectorConfig.checkedRows) {
    checkedRows = await props.selectorConfig.checkedRows(props.formData)
  }
  const res = await AnyDialogHelper.showSelector(props.selectorConfig.selectorView, {
    checkedRows,
    multiple: props.selectorConfig.multiple,
    title: props.selectorConfig.title,
  })
  selectedValue.value = res
  emitData()
}

function emitData() {
  emits('change', selectedValue.value)
  if (props.selectorConfig.onSelect) {
    props.selectorConfig.onSelect(selectedValue.value, props.formData)
  }
}

onMounted(() => {
  // 找到inputRef下的input元素，设置readonly属性为true
  inputRef.value?.$el?.firstElementChild?.firstElementChild?.setAttribute('readonly', 'true')
})
</script>
