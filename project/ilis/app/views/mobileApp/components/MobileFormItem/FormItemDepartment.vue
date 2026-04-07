<template>
  <div>
    <van-field
      readonly
      label-align="left"
      input-align="right"
      is-link
      :model-value="displayValue"
      v-bind="$attrs"
      @click="openPicker"
    />

    <van-popup v-model:show="open" position="bottom" :style="{ height: '80%' }">
      <div class="department-picker">
        <div class="picker-header">
          <span @click="onCancel">
            取消
          </span>
          <span class="picker-title">选择部门</span>
          <span class="text-[#154bd0]" @click="onConfirm">
            确定
          </span>
        </div>
        <div class="picker-content">
          <van-empty v-if="departmentTree.length === 0">
            暂无数据
          </van-empty>
          <div v-else class="tree-container">
            <DepartmentTreeNode
              v-for="d in departmentTree"
              :key="d.id"
              :node="d"
              :selected-ids="tempSelectedIds"
              :enable-multiple="enableMultiple"
              @toggle-expand="onToggleExpand"
              @select="onNodeSelect"
            />
          </div>
        </div>

        <!-- 底部数据栏（多选模式且有选中数据时显示） -->
        <div v-if="showBottomBar" class="picker-bottom-bar">
          <span class="selected-count">已选 {{ tempSelectedItems.length }} 项</span>
          <span class="clear-btn" @click="onClearSelection">清空</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang='ts'>
import { showLoadingToast } from 'vant'
import { computed, ref } from 'vue'
import { getDepartmentOptions } from '../../provides/api/chemical.api'
import DepartmentTreeNode from './DepartmentTreeNode.vue'

interface DepartmentOption {
  id: string
  text: string
  children?: Array<DepartmentOption>
  expand?: boolean
}

interface DepartmentItem {
  id: string
  name: string
}

const props = defineProps({
  value: [Object, Array] as PropType<DepartmentItem | DepartmentItem[]>,
  enableMultiple: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:value', 'select'])

const attrs = useAttrs()

const open = ref(false)
const departmentTree = ref<DepartmentOption[]>([])

// 临时选中的数据（用于弹窗内操作，确定后才同步）
const tempSelectedIds = ref<string[]>([])
const tempSelectedItems = ref<DepartmentItem[]>([])

// 是否显示底部数据栏（多选模式且有选中数据时显示）
const showBottomBar = computed(() => {
  return props.enableMultiple && tempSelectedItems.value.length > 0
})

// 计算显示值
const displayValue = computed(() => {
  if (!props.value) {
    return ''
  }
  if (props.enableMultiple) {
    const items = props.value as DepartmentItem[]
    if (items.length === 0) {
      return ''
    }
    if (items.length === 1) {
      return items[0].name
    }
    return `${items[0].name} 等${items.length}个部门`
  }
  return (props.value as DepartmentItem)?.name || ''
})

// 加载部门数据
async function loadDepartmentData() {
  const loadingToast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  })
  try {
    const res: any = await getDepartmentOptions()
    const trees = res || []
    departmentTree.value = trees.filter((d: DepartmentOption) => !!d.id)
  }
  catch (error) {
    console.error('加载部门数据失败:', error)
    departmentTree.value = []
  }
  finally {
    loadingToast.close()
  }
}

// 打开选择器
function openPicker() {
  if (attrs.readonly || attrs.disabled) {
    return
  }
  open.value = true
  // 初始化临时选中状态
  initTempSelection()
  // 加载数据
  if (departmentTree.value.length === 0) {
    loadDepartmentData()
  }
}

// 初始化临时选中状态
function initTempSelection() {
  tempSelectedIds.value = []
  tempSelectedItems.value = []

  if (props.value) {
    if (props.enableMultiple) {
      const items = props.value as DepartmentItem[]
      items.forEach((item) => {
        tempSelectedIds.value.push(item.id)
        tempSelectedItems.value.push(item)
      })
    }
    else {
      const item = props.value as DepartmentItem
      if (item) {
        tempSelectedIds.value.push(item.id)
        tempSelectedItems.value = [item]
      }
    }
  }
}

// 切换展开状态
function onToggleExpand(node: DepartmentOption) {
  node.expand = !node.expand
}

// 清空选中数据
function onClearSelection() {
  tempSelectedIds.value = []
  tempSelectedItems.value = []
}

// 选中节点
function onNodeSelect(node: DepartmentOption, selected: boolean) {
  if (props.enableMultiple) {
    // 多选模式
    if (selected) {
      // 添加节点
      if (!tempSelectedIds.value.includes(node.id)) {
        tempSelectedIds.value.push(node.id)
        tempSelectedItems.value.push({ id: node.id, name: node.text })
      }
    }
    else {
      // 删除节点
      tempSelectedIds.value = tempSelectedIds.value.filter(id => id !== node.id)
      tempSelectedItems.value = tempSelectedItems.value.filter(item => item.id !== node.id)
    }
  }
  else {
    // 单选模式
    tempSelectedIds.value = []
    tempSelectedItems.value = []
    if (selected) {
      tempSelectedIds.value.push(node.id)
      tempSelectedItems.value.push({ id: node.id, name: node.text })
    }
  }
}

// 取消选择
function onCancel() {
  // 还原临时数据
  initTempSelection()
  open.value = false
}

// 确认选择
function onConfirm() {
  if (props.enableMultiple) {
    emits('update:value', [...tempSelectedItems.value])
    emits('select', [...tempSelectedItems.value])
  }
  else {
    const item = tempSelectedItems.value[0] || null
    emits('update:value', item)
    emits('select', item)
  }
  open.value = false
}
</script>

<style scoped>
.department-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.picker-title {
  font-weight: 600;
  color: #323233;
}

.picker-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

.picker-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.selected-count {
  font-size: 14px;
  color: #323233;
}

.clear-btn {
  font-size: 14px;
  color: #154bd0;
  cursor: pointer;
}

.tree-container {
  background: #fff;
  padding: 0 16px;
}
</style>
