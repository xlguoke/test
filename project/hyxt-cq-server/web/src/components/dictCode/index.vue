<template>
  <a-radio-group
    v-if="type == 'radio'"
    v-model:value="dictVal"
    :disabled="disabled"
    @change="changeDictRadio"
  >
    <a-radio v-for="d in dictDatas" :key="d[rowKey]" :value="d[rowKey]">{{ d.name }}</a-radio>
  </a-radio-group>
  <a-checkbox-group
    v-else-if="type == 'checkbox'"
    v-model:value="dictVal"
    :disabled="disabled"
    @change="changeDictCheckbox"
  >
    <a-checkbox v-for="d in dictDatas" :key="d[rowKey]" :value="d[rowKey]">{{ d.name }}</a-checkbox>
  </a-checkbox-group>
  <a-select
    v-else
    v-model:value="dictVal"
    :mode="multiple ? 'multiple' : ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :options="dictDatas"
    :field-names="{ label: 'name', value: rowKey }"
    allow-clear
    @change="changeDict"
  ></a-select>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { getDetailByCode } from "@/api/dictCode.api"

export interface DictItem {
  name: string
  code: string
  id: string
  categoryId: string
}

export interface ChangeEvent {
  value: any
  option: any
}

const props = defineProps({
  value: {
    type: [String, Array<String>],
    default: ""
  },
  code: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请选择"
  },
  type: {
    type: String,
    default: "default" // default-下拉框，radio-单选， checkbox-多选
  },
  /** value绑定值 */
  rowKey: {
    type: String,
    default: "code"
  },
  disabled: Boolean,
  multiple: Boolean
})

const emit = defineEmits<{
  (e: "update:value", data: Boolean): void
  (e: "change", data: ChangeEvent): void
}>()

const dictVal = ref()
const dictDatas = ref<DictItem[]>([])
onMounted(() => {
  dictVal.value = props.value || (props.multiple ? [] : null)
  getDatas()
})

watch(
  () => props.value,
  (val) => {
    dictVal.value = val || (props.multiple ? [] : null)
  }
)

watch(
  () => props.code,
  (val) => {
    if (!val) return
    getDatas()
  }
)

const getDatas = () => {
  if (!props.code) {
    console.log("数据字典组件需要传入字典编码")
    return
  }
  getDetailByCode(props.code).then((res: any) => {
    dictDatas.value = res.dict
  })
}

const changeDictRadio = () => {
  const value = dictVal.value
  const option = dictDatas.value.find((d) => d[props.rowKey] == value) as DictItem
  emit("update:value", value)
  emit("change", { value, option })
}

const changeDictCheckbox = () => {
  const value = dictVal.value
  const option = dictDatas.value.filter((d) => value.includes(d[props.rowKey]))
  emit("update:value", value)
  emit("change", { value, option })
}

const changeDict = (value, option) => {
  emit("update:value", value)
  emit("change", { value, option })
}
</script>

<style></style>
