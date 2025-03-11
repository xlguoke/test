<template>
  <a-tree
    v-model:selected-keys="selectedKeys"
    show-line
    block-node
    :tree-data="treeData"
    @select="onSelect"
  />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import { type StandardGroupType, treeListApi } from '~/views/unit-config/standard/api'

export interface TreeData extends StandardGroupType {
  title: string
  key: string
  value: string
}

const emits = defineEmits<{
  (e: 'select', data?: TreeData): void
}>()
const treeData = ref<TreeData[]>([])
const isDisabledDel = ref(false)
const isDisabledEdit = ref(false)
const selectedRow = ref<TreeData>()
const selectedKeys = ref<Key[]>([])

onMounted(() => {
  getTreeList()
})

// 获取数据
async function getTreeList() {
  selectedRow.value = undefined
  selectedKeys.value = []
  const { data } = await treeListApi()
  treeData.value = renderTreeNodes(data.rows)
}

/** 处理树形数据 */
function renderTreeNodes(data: StandardGroupType[]) {
  const list = []
  for (const keys in data) {
    const item = data[keys]
    if (item.children && item.children.length) {
      item.children = renderTreeNodes(item.children)
    }
    list.push({
      ...item,
      title: item.name,
      key: item.id,
      value: item.id,
    })
  }
  return list
}
/** 选择分组 */
function onSelect(_selectedKeys: Key[], info: any) {
  if (info.selected) {
    const treeRow = info.selectedNodes[0]
    isDisabledDel.value = false

    if (treeRow.children && treeRow.children.length > 0)
      isDisabledDel.value = true

    if (treeRow.sourceType === '1')
      isDisabledEdit.value = true
    else
      isDisabledEdit.value = false

    selectedRow.value = treeRow
    selectedKeys.value = [treeRow.id]
  }
  else {
    selectedRow.value = undefined
    selectedKeys.value = []
    isDisabledDel.value = true
  }
}

watch(() => selectedKeys.value, () => {
  emits('select', selectedRow.value)
})
</script>

<style>

</style>
