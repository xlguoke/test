<template>
  <a-tree-select
    v-model:value="val"
    style="min-width: 240px"
    allow-clear
    show-search
    tree-node-filter-prop="text"
    :tree-data="treeData"
    :field-names="{
      label: 'text',
      value: 'id',
    }"
    :placeholder="placeholder"
    @change="props.onChange"
  />
</template>

<script lang="ts" setup>
import { getOrgComboTree } from '~/api/common'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  onChange?: (value: string) => void
}>(), {
  placeholder: '请选择组织机构',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const treeData = ref<IDepartmentEntity[]>([])

const val = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

async function getData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

getData()
</script>
