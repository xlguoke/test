<template>
  <a-input-group ref="inputRef" compact>
    <a-input
      v-bind="$attrs"
      v-model:value.trim="value"
      style="width: calc(100% - 60px)"
      :disabled="props.disabled"
      @change="handleChange"
      @blur="handleBlur"
    />
    <a-button class="h-full" type="primary" :disabled="props.disabled" @click="handleSelect">
      {{ text || '选择' }}
    </a-button>
  </a-input-group>
</template>

<script lang="ts" setup>
import type { IInputSelectorConfig } from '~/anyThing/interface/IInputSelectorConfig'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

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
  disabled?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string | number | undefined): void
  (event: 'change', value: any): void
}>()

const value = computed({
  get: () => props.modelValue,
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

// 仅在允许输入（props.selectorConfig.allowInput）时触发
function handleBlur(e: Event) {
  if (props.selectorConfig.allowInput) {
    const input = (e.target as HTMLInputElement).value
    selectedValue.value = []
    emitData()
    nextTick(() => {
      value.value = input
    })
  }
}

async function handleSelect() {
  let payload = {}
  let checkedRows = []
  if (props.selectorConfig?.payload) {
    payload = await props.selectorConfig.payload(props.formData)
  }
  if (props.selectorConfig.checkedRows) {
    checkedRows = await props.selectorConfig.checkedRows(props.formData)
  }
  if (!props.selectorConfig.selectorView) {
    message.warning('请配置选择器视图组件')
    return
  }

  const res = await AnyDialogHelper.showSelector(props.selectorConfig.selectorView, {
    payload,
    checkedRows,
    multiple: props.selectorConfig.multiple,
    title: props.selectorConfig.title,
    initData: props.selectorConfig.initData,
    isCacheSelect: props.selectorConfig.isCacheSelect,
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
  // 允许输入
  if (props.selectorConfig.allowInput)
    return
  // 找到inputRef下的input元素，设置readonly属性为true
  inputRef.value?.$el?.firstElementChild?.firstElementChild?.setAttribute('readonly', 'true')
})
</script>
