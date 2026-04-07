<template>
  <a-select
    v-if="type === 'select'"
    v-model:value="dictVal"
    class="w-full"
    allow-clear
    :placeholder="placeholder"
    :mode="mode"
    :disabled="disabled"
    @change="changeSelect"
  >
    <a-select-option v-for="item in dictDatas" :key="item.value" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
  <a-radio-group
    v-else-if="type === 'radio'"
    v-model:value="dictVal"
    :options="dictDatas"
    :disabled="disabled"
    @change="changeRadio"
  />
  <a-checkbox-group
    v-else-if="type === 'checkbox'"
    v-model:value="dictVal"
    :options="dictDatas"
    :disabled="disabled"
    @change="changeMultiple"
  />
</template>

<script setup lang='ts'>
import { getDictByCode } from '~/api/common'

const props = withDefaults(defineProps<{
  value: string | number | undefined | Array<any>
  code: string
  labelKey?: string
  valueKey?: string
  type?: 'select' | 'radio' | 'checkbox'
  placeholder?: string
  /** 设置 Select 的模式为多选或标签 */
  mode?: 'multiple' | 'tags'
  disabled?: boolean
}>(), {
  labelKey: 'typeName',
  valueKey: 'typeCode',
  type: 'select',
  placeholder: '请选择',
})
const emits = defineEmits<{
  (e: 'update:value', value: string | number | Array<any> | undefined): void
  (e: 'change', value: string | number | Array<any> | undefined, data: any[]): void
}>()

const dictVal = ref()
const dictDatas: any = ref([])

onMounted(async () => {
  const { data } = await getDictByCode(props.code)
  dictDatas.value = data.map((d: any) => ({
    originData: { ...d },
    label: d[props.labelKey],
    value: d[props.valueKey],
  }))
})

watch(
  () => props.value,
  (val) => {
    dictVal.value = val
  },
  {
    immediate: true,
  },
)

function changeSelect(val: any) {
  if (props.mode) {
    changeMultiple(val)
  }
  else {
    changeRadio()
  }
}

function changeRadio() {
  const opt = dictDatas.value.find((d: any) => d.value === dictVal.value)
  emits('update:value', dictVal.value)
  emits('change', dictVal.value, opt)
}

function changeMultiple(v: any) {
  const opts = dictDatas.value.filter((d: any) => v.includes(d.value))
  emits('update:value', v)
  emits('change', v, opts)
}
</script>

<style>

</style>
