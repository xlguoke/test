<template>
  <a-input-search
    v-model:value="searchValue"
    style="margin-bottom: 8px"
    placeholder="搜索文件夹名称"
    @change="handleSearch"
  />
  <div v-if="isFiltering" style="padding: 8px 0; color: #999; font-size: 12px;">
    已过滤显示 {{ filteredCount }} 个文件夹
  </div>
  <a-button
    v-permission="'fileManageAdd'"
    class="w-full mb-[12px]"
    type="primary"
    @click.stop="AnyDialogHelper.showModel(AddFoder).then(() => {
      getTreeData()
    })"
  >
    新建目录
  </a-button>
  <a-tree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    show-line
    :tree-data="(filteredTreeData as any)"
    :field-names="fieldNames"
    @select="onSelect"
  >
    <template #switcherIcon="{ expanded, dataRef }">
      <div class="h-full flex items-center justify-center">
        <img v-if="dataRef?.children?.length && !expanded" :src="foderCloseIcon" />
        <img v-else-if="dataRef?.children?.length && expanded" :src="folderOpenIcon" />
        <img v-else :src="folderLeafIcon" />
      </div>
    </template>
    <template #title="row">
      <div class=" w-full flex items-center">
        <div class="flex-1 w-0" :title="row.name">
          <div v-if="!searchValue" class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {{ row.name }}
          </div>
          <div v-else class="w-full overflow-hidden text-ellipsis whitespace-nowrap" v-html="highlightText(row.name, searchValue)"></div>
        </div>
        <a-tooltip title="新建子目录">
          <a-button
            v-permission="'fileManageAdd'"
            size="small"
            type="ghost"
            :icon="h(PlusCircleOutlined)"
            @click.stop="AnyDialogHelper.showModel(AddFoder, row).then(() => {
              getTreeData()
            })"
          />
        </a-tooltip>
        <a-tooltip title="编辑">
          <a-button
            v-permission="'fileManageEdit'"
            size="small"
            type="ghost"
            :icon="h(EditOutlined)"
            @click.stop="AnyDialogHelper.showModel(EditFoder, row).then(() => {
              getTreeData()
            })"
          />
        </a-tooltip>
        <a-tooltip title="删除">
          <a-button
            v-permission="'fileManageDel'"
            size="small"
            type="ghost"
            :icon="h(DeleteOutlined)"
            @click.stop="handleDelete(row)"
          />
        </a-tooltip>
        <a-tooltip title="分享">
          <a-button
            v-permission="'fileManageShare'"
            size="small"
            type="ghost"
            :icon="h('img', { src: shareIcon })"
            @click.stop="AnyDialogHelper.showModel(ShareModal, row)"
          />
        </a-tooltip>
      </div>
    </template>
  </a-tree>
  <div v-if="isFiltering && filteredCount === 0" style="text-align: center; padding: 20px; color: #999;">
    未找到匹配的文件夹
  </div>
</template>

<script lang="ts" setup>
import type { Key } from 'ant-design-vue/es/_util/type'
import type { FolderTree } from '../api'
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { computed, ref, watch } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { deleteFolder, getFileCount, getFolderTree } from '../api'
import AddFoder from './AddFoder.vue'
import EditFoder from './EditFoder.vue'
import ShareModal from './ShareModal.vue'

const emits = defineEmits<{
  (e: 'select', folderId: string): void
}>()
const folderLeafIcon = new URL('~/assets/img/foder-leaf.svg', import.meta.url).href
const folderOpenIcon = new URL('~/assets/img/foder-open.svg', import.meta.url).href
const foderCloseIcon = new URL('~/assets/img/foder-close.svg', import.meta.url).href
const shareIcon = new URL('~/assets/img/share.svg', import.meta.url).href

/** # 原始树数据 */
const originalTreeData = ref<FolderTree[]>()

/** # 过滤后的树数据 */
const filteredTreeData = ref<FolderTree[]>()

/** # 搜索关键词 */
const searchValue = ref('')

/** # 是否正在过滤 */
const isFiltering = computed(() => !!searchValue.value.trim())

/** # 过滤后的文件夹数量 */
const filteredCount = ref(0)

/** # 展开的节点 */
const expandedKeys = ref<Key[]>([])

/** # 选中的节点 */
const selectedKeys = ref<Key[]>([])

/** # 字段映射配置 */
const fieldNames = ref({
  title: 'name',
  key: 'id',
  children: 'children',
})

/** # 获取树数据 */
async function getTreeData() {
  const { data } = await getFolderTree()
  originalTreeData.value = data
  filteredTreeData.value = data
  updateFilteredCount()
  // 默认选中第一个节点
  selectFirstNode(data)
}

/** # 选中第一个节点 */
function selectFirstNode(nodes: FolderTree[] | undefined) {
  if (!nodes || nodes.length === 0) {
    selectedKeys.value = []
    return
  }
  // 获取第一个节点的ID
  const firstNodeId = nodes[0].id
  selectedKeys.value = [firstNodeId]
  // 触发选中事件
  emits('select', String(firstNodeId))
  // 展开第一个节点
  expandedKeys.value = [firstNodeId]
}

/** # 处理搜索 */
function handleSearch() {
  if (!searchValue.value.trim()) {
    // 清空搜索，恢复原始数据
    filteredTreeData.value = originalTreeData.value
    expandedKeys.value = []
  }
  else {
    // 执行过滤
    filterTreeData()
  }
  updateFilteredCount()
}

/** # 过滤树数据 */
function filterTreeData() {
  if (!originalTreeData.value || !searchValue.value.trim()) {
    filteredTreeData.value = originalTreeData.value
    return
  }

  const searchText = searchValue.value.toLowerCase().trim()

  /** # 递归过滤树节点 */
  const filterNodes = (nodes: FolderTree[]): FolderTree[] => {
    return nodes
      .map((node) => {
        const matches = node.name.toLowerCase().includes(searchText)

        // 如果节点本身匹配，保留整个节点及其子节点
        if (matches) {
          return { ...node }
        }

        // 如果节点不匹配，但子节点有匹配的，保留节点但只保留匹配的子节点
        if (node.children && node.children.length > 0) {
          const filteredChildren = filterNodes(node.children)
          if (filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren,
            }
          }
        }

        return null
      })
      .filter(Boolean) as FolderTree[]
  }

  filteredTreeData.value = filterNodes(originalTreeData.value)

  // 过滤后自动展开所有节点，方便查看匹配结果
  if (filteredTreeData.value && filteredTreeData.value.length > 0) {
    expandedKeys.value = getAllNodeKeys(filteredTreeData.value)
  }
  else {
    expandedKeys.value = []
  }
}

/** # 获取所有节点的key */
function getAllNodeKeys(nodes: FolderTree[]): Key[] {
  const keys: Key[] = []

  const traverse = (nodeList: FolderTree[]) => {
    nodeList.forEach((node) => {
      keys.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(nodes)
  return keys
}

/** # 更新过滤计数 */
function updateFilteredCount() {
  if (!filteredTreeData.value) {
    filteredCount.value = 0
    return
  }

  const countNodes = (nodes: FolderTree[]): number => {
    return nodes.reduce((count, node) => {
      count++ // 当前节点
      if (node.children && node.children.length > 0) {
        count += countNodes(node.children)
      }
      return count
    }, 0)
  }

  filteredCount.value = countNodes(filteredTreeData.value)
}

/** # 高亮匹配文本 */
function highlightText(text: string, searchText: string): string {
  if (!searchText.trim())
    return text

  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<span style="color: var(--colorPrimary); font-weight: bold;">$1</span>')
}

/** # 处理节点选择 */
function onSelect(selectedKeys: Key[]) {
  emits('select', String(selectedKeys[0]))
}

/** # 处理删除 */
async function handleDelete(row: FolderTree) {
  const { data: count } = await getFileCount(row.id)
  const messageStr = count ? `删除目录将会删除当前目录下的${count}个文件，是否继续？` : '确定删除文件夹吗？'
  Modal.confirm({
    title: '提示',
    type: 'warning',
    content: messageStr,
    onOk: async () => {
      await deleteFolder(row.id)
      message.success('删除成功')
      if (row.id === selectedKeys.value[0])
        selectedKeys.value = []
      emits('select', '')
      getTreeData()
    },
  })
}

// 监听搜索值变化，实现实时过滤
watch(searchValue, () => {
  handleSearch()
})

getTreeData()
</script>

<style>
.ant-tree-treenode {
  width: 100% !important;
}
.ant-tree-node-content-wrapper {
  flex: 1;
}
</style>
