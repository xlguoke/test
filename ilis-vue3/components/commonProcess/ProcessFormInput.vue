<template>
  <a-select
    v-if="item.type.name === 'select'"
    v-model:value="value"
    :placeholder="`请选择${item.name}`"
    style="width:100%;"
  >
    <a-select-option v-for="(comItem, index) in item.data" :key="index" :value="comItem[item.dataField.value]">
      {{ comItem[item.dataField.name] }}
    </a-select-option>
  </a-select>
  <a-radio-group
    v-else-if="item.type.name === 'boolean'"
    v-model:value="value"
    :name="item.id"
  >
    <a-radio value="1">
      是
    </a-radio>
    <a-radio value="0">
      否
    </a-radio>
  </a-radio-group>
  <a-date-picker
    v-else-if="item.type.name === 'date'"
    v-model:value="value"
    :placeholder="`请选择${item.name}`"
    style="width:100%;"
    value-format="YYYY-MM-DD"
  />
  <a-input-number
    v-else-if="item.type.name === 'long'"
    v-model:value="value"
    :placeholder="`请输入${item.name}`"
    style="width:100%;"
  />
  <a-input
    v-else
    v-model:value="value"
    :placeholder="`请输入${item.name}`"
    style="width:100%;"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: any
  item: any
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

const value = ref(props.modelValue)

watch (
  () => props.modelValue,
  (val) => {
    value.value = val
  },
)

watch (
  () => value.value,
  (val) => {
    emits('update:modelValue', val)
  },
)
</script>
