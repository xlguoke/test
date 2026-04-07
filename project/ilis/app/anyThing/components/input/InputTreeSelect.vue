<template>
  <a-tree-select
    v-model:value="value"
    style="min-width: 240px"
    allow-clear
    show-search
    tree-node-filter-prop="label"
    tree-default-expand-all
    @change="onChange"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: string | number | undefined
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: string | number | undefined): void
  (event: 'change', value: any, lableList: any[]): void
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    emits('update:modelValue', val)
  },
})

function onChange(value: any, lableList: any[]) {
  emits('change', value, lableList)
}
</script>
