<template>
  <div class="flex-1 h-full">
    <a-spin :spinning="spinning">
      <a-input-group compact>
        <a-select v-model:value="query.queryType" :dropdown-match-select-width="false" style="width: 120px;border-right: 0;">
          <a-select-option v-for="d in queryType" :key="d.value" :value="d.value" :title="d.label">
            {{ d.label }}
          </a-select-option>
        </a-select>
        <a-input
          v-model:value.trim="query.queryParam"
          :placeholder="queryTypeTip[query.queryType]"
          :maxlength="50"
          style="width: calc(100% - 38px - 120px)"
          @press-enter="quickSearch"
        />
        <a-button
          type="primary"
          :icon="h('i', { class: 'iconfont icon-a-zu7358' })"
          style="width: 38px;" @click="quickSearch"
        >
        </a-button>
      </a-input-group>

      <div class="mt-3 flex-1 overflow-y-auto overflow-x-hidden">
        <a-tree
          v-model:expanded-keys="expandedKeys"
          v-model:checked-keys="checkedKeys"
          v-model:selected-keys="checkedKeys"
          :tree-data="treeData"
          show-line
          check-strictly
          block-node
          @expand="onExpand"
        >
          <template #title="node">
            <span
              class="flex-1 flex items-start select-none"
              @click="handleNodeClick($event, node)"
            >
              <template v-if="!node.dataRef.attributes.isSample">
                <img v-if="node.expanded" class="tree-icon tree-icon-open w-5" title="大类" :src="treeOpenSvg">
                <img v-else class="tree-icon w-5" title="大类" :src="treeCloseSvg">
              </template>
              <template v-else-if="node.dataRef.children && node.dataRef.children.length">
                <FolderOpenOutlined v-if="node.expanded" :title="term('样品')" class="text-colorPrimary mr-1 mt-[2px]" style="font-size:16px;" />
                <FolderOutlined v-else :title="term('样品')" class="text-colorPrimary mr-1 mt-[2px]" style="font-size:16px;" />
              </template>
              <FileTextOutlined v-else :title="term('样品')" class="text-colorPrimary mr-1 mt-1" style="font-size:14px;" />

              <BaseText :title="hasChildren(node) ? '双击节点可展开/收起' : ''">{{ node.title }}</BaseText>
            </span>
          </template>
          <!-- 树节点切换图标 -->
          <template #switcherIcon="{ expanded, dataRef }">
            <template v-if="!dataRef.attributes.isSample">
              <MinusSquareOutlined v-if="expanded" title="大类" />
              <PlusSquareOutlined v-else title="大类" />
            </template>
            <template v-else-if="dataRef.children && dataRef.children.length">
              <MinusSquareOutlined v-if="expanded" :title="term('样品')" />
              <PlusSquareOutlined v-else :title="term('样品')" />
            </template>
          </template>
        </a-tree>
        <a-empty v-if="treeData?.length === 0 && !spinning" />
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import type { Key } from 'ant-design-vue/es/_util/type'
import type { EventDataNode } from 'ant-design-vue/es/tree'
import type { SelectSampleEntity } from '~/views/consign/component/selectSampleParam/components/SampleTree.vue'
import type { BigCategoryTreeNode, SampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample'
import { FileTextOutlined, FolderOpenOutlined, FolderOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons-vue'
import { useIndustryStore } from '~/store/industryStore'
import { bigCategoryApi, sampleApi } from '~/views/consign/component/selectSampleParam/api'
import { ViewBigCategoryTreeNode, ViewSampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample'

interface Query {
  /** 查询类型 */
  queryType: string
  /** 模糊查询 */
  queryParam?: string
}

const emits = defineEmits<{
  (e: 'select', data: SelectSampleEntity): void
  (e: 'showExpandErrorTip'): void
}>()

const treeOpenSvg = new URL('~/assets/img/tree-open.svg', import.meta.url).href

const treeCloseSvg = new URL('~/assets/img/tree-close.svg', import.meta.url).href

const { term } = useIndustryStore()

const queryType = computed(() => [
  { label: `${term('按样品查询')}`, value: 'sample' },
  { label: `${term('按检测参数查询')}`, value: 'param' },
  { label: `${term('按规程查询')}`, value: 'standard' },
  { label: `${term('按附注查询')}`, value: 'note' },
])

const queryTypeTip = computed<{ [key: string]: string }>(() => ({
  sample: `${term('输入样品名称后回车即可查询')}`,
  param: `${term('输入检测参数后回车即可查询')}`,
  standard: `${term('输入规程名称或颁布号后回车即可查询')}`,
  note: `${term('输入附注后回车即可查询')}`,
  default: `${term('输入样品/检测参数/附注后回车即可查询')}`,
}))

// 标记是否为搜索状态
const isSearch = ref(false)

const spinning = ref(false)

// 点击相关变量
let clickTimer: ReturnType<typeof setTimeout> | null = null
let lastClickTime = 0
const DOUBLE_CLICK_DELAY = 300 // 双击间隔时间（毫秒）

const expandedKeys = ref<Key[]>([])

const checkedKeys = ref<Key[]>([])

const treeData = ref<ViewBigCategoryTreeNode[] | ViewSampleTreeNode[]>([])

const query = ref<Query>({
  queryType: 'sample',
  queryParam: '',
})

/**
 * 格式化大类节点数据
 */
function formatBigCategoryTreeData(data: BigCategoryTreeNode[]) {
  const result: ViewBigCategoryTreeNode[] = []

  for (let i = 0; i < data.length; i++) {
    const treeNode = data[i]
    const newNode = new ViewBigCategoryTreeNode()

    Object.assign(newNode, treeNode)
    newNode.title = treeNode.text
    newNode.value = treeNode.id
    newNode.key = treeNode.id
    newNode.isLoadSample = false
    newNode.isLeaf = false

    if (treeNode.children && treeNode.children.length > 0) {
      newNode.children = formatBigCategoryTreeData(treeNode.children)
    }
    result.push(newNode)
  }

  return result
}

// 获取大类
async function getBigCategory() {
  spinning.value = true
  const res = await bigCategoryApi(query.value).finally(() => {
    spinning.value = false
  })
  treeData.value = formatBigCategoryTreeData(res.data)

  // 如果进行了搜索，则默认自动展开所有节点
  if (isSearch.value && query.value.queryParam) {
    expandedKeys.value = []
    spinning.value = true
    await getAllSample(treeData.value)
    spinning.value = false
  }
}

/** # 加载节点下所有数据 */
async function getAllSample(treeNodes: ViewBigCategoryTreeNode[] | ViewSampleTreeNode[]) {
  for (let i = 0; i < treeNodes.length; i++) {
    const item = treeNodes[i]

    if (item.children && item.children.length > 0) {
      expandTreeNodes(item as ViewBigCategoryTreeNode)
      await getAllSample(item.children)
    }
    else {
      await getSample(item, true)
    }
  }
}

/** 快速搜索 */
function quickSearch() {
  expandedKeys.value = []
  treeData.value = []

  isSearch.value = !!query.value.queryParam

  emits('select', {
    sample: undefined,
    nodes: [],
  })

  getBigCategory()
}

/** # 展开节点 */
async function onExpand(_keys: Key[], info: { expanded: boolean, node: EventDataNode }) {
  const nodeData = info.node.dataRef as ViewBigCategoryTreeNode
  if (!nodeData.isLoadSample) {
    await getSample(nodeData)
  }
}

/**
 * # 获取样品
 * @param treeNode 要展开的节点
 * @param isAutoExpandChildren 是否自动展开加载的节点
 */
async function getSample(treeNode: ViewBigCategoryTreeNode | ViewSampleTreeNode, isAutoExpandChildren = false) {
  if (!treeNode) {
    return
  }

  if (!isAutoExpandChildren) {
    spinning.value = true
  }
  const res = await sampleApi({
    queryType: query.value.queryType,
    queryName: query.value.queryParam,
    bigCategoryId: treeNode.id,
  }).finally(() => {
    if (!isAutoExpandChildren) {
      spinning.value = false
    }
  })

  const data = res.data
  const appendTreeNodes: any = formatSampleTreeData(data, treeNode)

  if (!treeNode.children || treeNode.children.length === 0) {
    treeNode.children = appendTreeNodes
  }

  treeNode.isLoadSample = true

  if (isAutoExpandChildren === true) {
    expandTreeNodes(treeNode as ViewBigCategoryTreeNode)

    for (let i = 0; i < treeNode.children.length; i++) {
      const item = treeNode.children[i]
      if (item.state === 'close') {
        await getSample(item, true)
      }
    }
  }
}

/**
 * 格式化样品节点数据
 */
function formatSampleTreeData(data: SampleTreeNode[], categoryTreeNode?: ViewBigCategoryTreeNode | ViewSampleTreeNode) {
  const result: ViewSampleTreeNode[] = []

  for (let i = 0; i < data.length; i++) {
    const treeNode = data[i]
    const newNode = new ViewSampleTreeNode()
    // 附注
    const sampleNote = treeNode.attributes.sampleNote || ''

    Object.assign(newNode, treeNode)
    newNode.title = sampleNote ? `${treeNode.text}(${sampleNote})` : treeNode.text
    newNode.value = treeNode.id
    newNode.key = treeNode.id
    newNode.isLoadSample = false
    newNode.isLeaf = false
    if (categoryTreeNode) {
      newNode.categoryId = categoryTreeNode.id
      newNode.categoryName = categoryTreeNode.title
    }

    if (treeNode.children && treeNode.children.length > 0) {
      newNode.children = formatSampleTreeData(treeNode.children, categoryTreeNode)
    }

    result.push(newNode)
  }

  return result
}

// 展开节点下所有数据
function expandTreeNodes(treeNode: ViewBigCategoryTreeNode | ViewBigCategoryTreeNode) {
  if (!expandedKeys.value.includes(treeNode.id)) {
    expandedKeys.value.push(treeNode.id)
  }

  if (treeNode.children && treeNode.children.length > 0) {
    treeNode.children.forEach((item) => {
      expandTreeNodes(item)
    })
  }
}

// 判断节点是否有子节点
function hasChildren(node: any): boolean {
  const nodeData = node.dataRef || node
  return !!(nodeData.children && nodeData.children.length > 0)
}

// 处理节点点击事件（区分单击和双击）
async function handleNodeClick(_event: MouseEvent, node: any) {
  const currentTime = Date.now()
  const timeDiff = currentTime - lastClickTime

  // 清除之前的定时器
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }

  if (timeDiff < DOUBLE_CLICK_DELAY) {
    // 双击事件
    lastClickTime = 0
    await handleNodeDblClick(node)
  }
  else {
    // 单击事件 - 延迟执行以等待可能的第二次点击
    lastClickTime = currentTime
    clickTimer = setTimeout(async () => {
      lastClickTime = 0
      await handleNodeSingleClick(node)
    }, DOUBLE_CLICK_DELAY)
  }
}

// 单击节点处理
async function handleNodeSingleClick(node: any) {
  const nodeData = node.dataRef
  const key = nodeData.key
  const isCategory = !nodeData.attributes?.isSample
  const isLoadSample = (nodeData as ViewBigCategoryTreeNode).isLoadSample

  // 更新选中状态
  checkedKeys.value = [key]

  // 如果是大类且未加载数据，先加载
  if (isCategory && !isLoadSample) {
    await getSample(nodeData)
  }

  // 触发选择事件
  if (!isCategory) {
    emits('select', {
      sample: unref(nodeData),
      nodes: unref(node.parent?.nodes || []),
    })
  }
  else {
    emits('select', {
      sample: undefined,
      nodes: [],
    })
  }
}

// 双击节点展开/收起
async function handleNodeDblClick(node: any) {
  const nodeData = node.dataRef
  const key = nodeData.key

  // 如果节点有子节点或者是大类节点，则处理展开/收起
  const hasChildNodes = hasChildren(node)
  const isCategory = !nodeData.attributes?.isSample

  if (!hasChildNodes && !isCategory) {
    return
  }

  // 如果未加载过样品数据，先加载
  if (isCategory && !(nodeData as ViewBigCategoryTreeNode).isLoadSample) {
    await getSample(nodeData)
  }

  // 切换展开状态
  const index = expandedKeys.value.indexOf(key)
  if (index > -1) {
    // 收起
    expandedKeys.value.splice(index, 1)
  }
  else {
    // 展开
    expandedKeys.value.push(key)
  }
}

function clearCheckedKeys() {
  checkedKeys.value = []
}

getBigCategory()

defineExpose({
  clearCheckedKeys,
})
</script>

<style scoped>
:deep(.ant-spin-nested-loading){
  height: 100%;
  flex:1;
}
:deep(.ant-spin-container){
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.ant-tree .ant-tree-title) {
  display: flex;
  align-items: center;
}
:deep(.css-dev-only-do-not-override-wbdvke.ant-input-search >.ant-input-group >.ant-input-group-addon:last-child){
  left: 0;
}
</style>
