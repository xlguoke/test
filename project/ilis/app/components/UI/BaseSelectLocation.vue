<template>
  <a-tree-select
    v-model:value="val"
    style="min-width: 240px"
    allow-clear
    show-search
    tree-node-filter-prop="name"
    :tree-data="treeData"
    tree-default-expand-all
    :field-names="{
      label: 'name',
      value: fieldValue,
    }"
    :placeholder="placeholder"
    @change="props.onChange"
  />
</template>

<script lang="ts" setup>
import type { IProjectOrgEntity } from '~/interface/IDepartmentEntity'
import { getProjectOrg } from '~/api/common'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  fieldValue?: string
  onChange?: (value: string) => void
}>(), {
  placeholder: '请选择所在位置',
  fieldValue: 'id',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const treeData = ref<IProjectOrgEntity[]>([])

const val = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

async function getData() {
  const { data } = await getProjectOrg()
  data.forEach((item: any) => {
    item.id = item.name
  })
  treeData.value = data
}

getData()
</script>
