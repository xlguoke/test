<template>
  <div class="tree-node">
    <div
      class="node-content"
      :class="{ selected: isSelected }"
      @click="onNodeClick"
    >
      <span
        v-if="hasChildren"
        class="expand-icon"
        @click.stop="onExpandClick"
      >
        <van-icon :name="isExpanded ? 'arrow-down' : 'arrow'" size="14" />
      </span>
      <span v-else class="expand-icon-placeholder"></span>
      <span class="node-text">{{ node.text }}</span>
    </div>
    <div v-if="hasChildren && isExpanded" class="children-container">
      <DepartmentTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-ids="selectedIds"
        :enable-multiple="enableMultiple"
        @toggle-expand="$emit('toggleExpand', $event)"
        @select="(node, selected) => $emit('select', node, selected)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DepartmentOption {
  id: string
  text: string
  children?: Array<DepartmentOption>
  expand?: boolean
}

const props = defineProps<{
  node: DepartmentOption
  selectedIds: string[]
  enableMultiple?: boolean
}>()

const emit = defineEmits<{
  toggleExpand: [node: DepartmentOption]
  select: [node: DepartmentOption, selected: boolean]
}>()

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const isExpanded = computed(() => {
  return props.node.expand === true
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.node.id)
})

function onExpandClick() {
  emit('toggleExpand', props.node)
}

function onNodeClick() {
  const newSelected = !isSelected.value
  emit('select', props.node, newSelected)
}
</script>

<style scoped>
.tree-node {
  margin-bottom: 2px;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.node-content.selected {
  background: #e6f7ff;
}

.node-content.selected .node-text {
  color: #1890ff;
  font-weight: 500;
}

.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  cursor: pointer;
  color: #999;
}

.expand-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 4px;
}

.node-text {
  font-size: 14px;
  color: #333;
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
}

.children-container {
  margin-top: 2px;
  margin-left: 28px;
  position: relative;
}

.children-container::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #f0f0f0;
}
</style>
