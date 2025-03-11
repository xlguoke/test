<template>
  <div class="h-full flex flex-col items-center justify-center overflow-auto">
    <a-empty v-if="treeData?.length === 0" />
    <div v-else class="h-full w-full">
      <a-tree
        ref="Tree"
        v-model:expandedKeys="expandedKeys"
        v-model:checkedKeys="checkedKeys"
        v-model:selectedKeys="checkedKeys"
        :tree-data="treeData"
        :disabled="disabled"
        show-line
        check-strictly
        block-node
        @select="onSelect"
      >
        <template #switcherIcon="{ expanded, dataRef }">
          <template v-if="dataRef.children && dataRef.children.length > 0">
            <img
              v-if="expanded"
              class="tree-icon tree-icon-open"
              :src="treeOpenSvg"
            >
            <img
              v-else
              class="tree-icon"
              :src="treeCloseSvg"
            >
          </template>
          <FileTextOutlined v-else style="color: #0066ec" />
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import type { TreeProps } from 'ant-design-vue'

import { FileTextOutlined } from '@ant-design/icons-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { DataNode } from 'ant-design-vue/es/tree'
import { type SampleTree, getSampleComboTree } from '../api'

export interface SampleTreeNode extends SampleTree {
  title: string
  value: string
  key: string
  disabled: boolean
  children: SampleTreeNode[]
}

const props = defineProps({
  unitSampleId: String,
  disabled: Boolean,
})

const emits = defineEmits<{
  (e: 'select', data: SampleTreeNode): void
}>()

const treeOpenSvg = new URL('~/assets/img/tree-open.svg', import.meta.url).href
const treeCloseSvg = new URL('~/assets/img/tree-close.svg', import.meta.url).href

const treeData = ref<DataNode[]>([])
const expandedKeys = ref<Key[]>([])
const checkedKeys = ref<Key[]>([])

const Tree = ref()

// 获取样品数据
watch(() => props.unitSampleId, async (id) => {
  if (!id)
    return ''
  const { data } = await getSampleComboTree(id)
  checkedKeys.value = [id]
  initExpandedKeys(data, id)
  treeData.value = formatBigCategoryTreeData(data)
}, {
  immediate: true,
})

/**
 * 格式化大类节点数据
 */
function formatBigCategoryTreeData(data: SampleTreeNode[]) {
  for (let i = 0; i < data.length; i++) {
    const treeNode = data[i]
    treeNode.title = treeNode.text
    treeNode.value = treeNode.id
    treeNode.key = treeNode.id
    treeNode.disabled = !!treeNode.chkDisabled

    if (treeNode.children && treeNode.children.length > 0) {
      treeNode.children = formatBigCategoryTreeData(treeNode.children)
    }
  }
  return data
}

/**
 * 选中节点
 */
function initExpandedKeys(data: SampleTreeNode[], selId: string) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (selId === item.id) {
      expandedKeys.value.push(item.id)
      return true
    }
    if (item.children && item.children.length > 0) {
      const isSel = initExpandedKeys(item.children, selId)
      if (isSel) {
        expandedKeys.value.push(item.id)
        return true
      }
    }
  }
  return false
}

// 选择节点：点击文本选择
const onSelect: TreeProps['onSelect'] = async (_keys, info) => {
  const { expanded, key } = info.node
  const nodeData: any = info.node.dataRef

  if (!expanded) {
    expandedKeys.value = [...expandedKeys.value, key]
  }
  if (info.selected) {
    emits('select', unref(nodeData))
  }
}
</script>

<style scoped>
:deep(.ant-spin-container){
  display: flex;
  flex-direction: column;
}
:deep(.ant-tree .ant-tree-title) {
  display: flex;
  align-items: center;
}
</style>
