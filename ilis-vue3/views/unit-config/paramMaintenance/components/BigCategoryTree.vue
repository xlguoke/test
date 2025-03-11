<template>
  <div class="h-full overflow-auto">
    <a-tree
      v-model:expandedKeys="expandedKeys"
      :selected-keys="selectedKeys"
      show-line
      block-node
      :tree-data="treeData"
      :field-names="{
        title: 'name',
        key: 'id',
      }"
      @select="onSelectTreeNode"
    >
      <template #switcherIcon="{ expanded }">
        <FolderOpenFilled v-if="expanded" class="text-[#0066ec] text-lg" />
        <FolderFilled v-else class="text-[#0066ec] text-lg" />
      </template>
    </a-tree>
  </div>
</template>

<script setup lang='ts'>
import { FolderFilled, FolderOpenFilled } from '@ant-design/icons-vue'
import { getBigCategoryTree } from '~/views/unit-config/paramMaintenance/api.ts'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
})

const emits = defineEmits(['update:value'])

const selectedKeys = computed(() => props.value ? [props.value] : [])

const expandedKeys = ref([])

const treeData = ref([])

function onSelectTreeNode(key, item) {
  const node = item.node

  if (node.id !== '8888-8888-8888' && key.length > 0) {
    emits('update:value', key[0])
  }

  if (node.children && node.children.length > 0 && !expandedKeys.value.includes(node.id)) {
    expandedKeys.value.push(node.id)
  }
}

async function init() {
  const res = await getBigCategoryTree()
  const data = res.data

  treeData.value = data
  expandedKeys.value = [data[0].id]
}

init()
</script>
