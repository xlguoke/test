<template>
  <a-spin :spinning="spinning">
    <a-input-group compact>
      <a-select v-model:value="query.queryType" :dropdown-match-select-width="false">
        <a-select-option v-for="d in queryType" :key="d.value" :value="d.value">
          {{ d.label }}
        </a-select-option>
      </a-select>
      <a-input
        v-model:value.trim="query.queryParam"
        :placeholder="queryTypeTip[query.queryType]"
        :maxlength="50"
        class="w-[260px]"
        @press-enter="quickSearch"
        @search="quickSearch"
      />
      <a-button type="primary" style="width: 38px;" @click="quickSearch">
        <img :src="searchIcon" alt="搜索" title="搜索" class="w-full" />
      </a-button>
    </a-input-group>
    <div ref="treeWrap" class="mt-2 flex-1 h-0 overflow-auto">
      <a-tree
        v-model:expanded-keys="expandedKeys"
        v-model:checked-keys="checkedKeys"
        v-model:selected-keys="checkedKeys"
        :tree-data="treeData"
        :height="treeHeight"
        show-line
        check-strictly
        block-node
        @expand="onExpand"
      >
        <template #title="node">
          <!-- 树节点标题内容 -->
          <span
            class="flex-1 flex items-start select-none"
            @click="handleNodeClick($event, node)"
          >
            <template v-if="!node.dataRef.attributes.isSample">
              <img v-if="node.expanded" class="tree-icon tree-icon-open" style="width:20px;" title="大类" :src="treeOpenSvg">
              <img v-else class="tree-icon" style="width:20px;" title="大类" :src="treeCloseSvg">
            </template>
            <template v-else-if="node.dataRef.children && node.dataRef.children.length">
              <FolderOpenOutlined v-if="node.expanded" :title="term('样品')" class="text-colorPrimary mr-1 mt-[2px]" style="font-size:16px;" />
              <FolderOutlined v-else :title="term('样品')" class="text-colorPrimary mr-1 mt-[2px]" style="font-size:16px;" />
            </template>
            <FileTextOutlined v-else :title="term('样品')" class="text-colorPrimary mr-1 mt-1" style="font-size:14px;" />

            <span :title="hasChildren(node) ? '双击节点可展开/收起' : ''">{{ displaySampleName(node) }}</span>
          </span>
          <EditOutlined v-if="node.attributes.isSample" class="mx-1 text-colorPrimary" @click.stop="addNote(node)" />
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
      <a-empty v-if="treeData?.length === 0" />
    </div>

    <AddNote
      v-model:open="visible"
      :value="sampleNote"
      :loading="loading"
      @save="submit"
    />
  </a-spin>
</template>

<script setup lang='ts'>
import type { TreeProps } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { EventDataNode } from 'ant-design-vue/es/vc-tree/interface'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { BigCategoryTreeNode, SampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { EditOutlined, FileTextOutlined, FolderOpenOutlined, FolderOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useIndustryStore } from '~/store/industryStore.ts'
import { selectSampleParamStore } from '~/views/consign/component/selectSampleParam/hooks/useSelectSampleParamStore.ts'
import { ViewBigCategoryTreeNode, ViewSampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { addSampleNoteApi, bigCategoryApi, sampleApi } from '../api'
import AddNote from './AddNote.vue'

interface Query {
  /** 查询类型 */
  queryType: string
  /** 模糊查询 */
  queryParam?: string
  /** 是否简易模式 */
  isSimplePattern?: boolean
  /** 是否综合试验 */
  queryScope?: number
}

export interface SelectSampleEntity {
  /** 样品信息 */
  sample?: ViewSampleTreeNode
  /** 展开节点信息 */
  nodes: Array<BigCategoryTreeNode | ViewSampleTreeNode>
}

const emits = defineEmits<{
  (e: 'select', data: SelectSampleEntity): void
  (e: 'showExpandErrorTip'): void
}>()

const { term } = useIndustryStore()

const mainController = inject('mainController') as MainController

// 样品信息页面的基础信息
const useBasicInfo = mainController.useBasicInfo

const treeOpenSvg = new URL('~/assets/img/tree-open.svg', import.meta.url).href

const treeCloseSvg = new URL('~/assets/img/tree-close.svg', import.meta.url).href

const searchIcon = new URL('~/assets/img/icon-search.svg', import.meta.url).href

const queryType = computed(() => ([
  { label: term('按样品查询'), value: 'sample' },
  { label: `按${term('参数')}查询`, value: 'param' },
  { label: '按规程查询', value: 'standard' },
  { label: '按附注查询', value: 'note' },
]))

const queryTypeTip: any = computed(() => ({
  sample: term('输入样品名称后回车即可查询'),
  param: `输入${term('检测参数')}后回车即可查询`,
  standard: '输入规程名称或颁布号后回车即可查询',
  note: '输入附注后回车即可查询',
  default: `输入${term('样品')}/${term('参数')}名称/附注后回车即可查询`,
}))

const query = ref<Query>({
  queryType: 'sample',
  queryParam: '',
  isSimplePattern: selectSampleParamStore.isSimpleMode,
  queryScope: mainController.pageState.isCreateTest ? 2 : undefined,
})

// 标记是否为搜索状态
const isSearch = ref(false)

const spinning = ref(false)

// 点击相关变量
let clickTimer: ReturnType<typeof setTimeout> | null = null
let lastClickTime = 0
const DOUBLE_CLICK_DELAY = 300 // 双击间隔时间（毫秒）

const treeData = ref<ViewBigCategoryTreeNode[] | ViewSampleTreeNode[]>([])

const expandedKeys = ref<Key[]>([])

const checkedKeys = ref<Key[]>([])

// 计算树节点高度，设置tree height属性，改为虚拟滚动
const treeWrap = ref<HTMLElement>()
const treeHeight = ref(300)
function calculateTreeHeight() {
  const wrapH = treeWrap.value?.clientHeight || 0
  treeHeight.value = wrapH || 300
}
useResizeObserver(treeWrap, calculateTreeHeight)

// 页面初始化
async function init() {
  await getBigCategory()

  // 回显大类树节点选中状态
  await expandDefaultBigCategoryNodes()
}

init()

// 判断节点是否有子节点
function hasChildren(node: any): boolean {
  const nodeData = node.dataRef || node
  return !!(nodeData.children && nodeData.children.length > 0)
}

/** 样品节点名称 */
function displaySampleName(node: ViewSampleTreeNode) {
  const displayName = node.attributes?.displayName || ''
  let name = node.title
  if (displayName && node.text !== displayName)
    name += `（${displayName}）`
  return name
}

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

// 快速搜索
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

// 加载节点下所有数据
async function getAllSample(treeNodes: ViewBigCategoryTreeNode[] | ViewSampleTreeNode[]) {
  for (let i = 0; i < treeNodes.length; i++) {
    const item: any = treeNodes[i]

    if (item.children && item.children.length > 0) {
      expandTreeNodes(item)
      await getAllSample(item.children)
    }
    else {
      await getSample(item, true)
    }
  }
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

/**
 * 获取样品
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
    isSimplePattern: query.value.isSimplePattern,
    queryType: query.value.queryType,
    queryName: query.value.queryParam,
    queryScope: query.value.queryScope,
    bigCategoryId: treeNode.id,
    sampleId: useBasicInfo.data.testUnitTestSampleId || undefined,
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
    expandTreeNodes(treeNode as any)

    for (let i = 0; i < treeNode.children.length; i++) {
      const item = treeNode.children[i]
      if (item.state === 'close') {
        await getSample(item, true)
      }
    }
  }
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
  const hasChildren = nodeData.children && nodeData.children.length > 0
  const isCategory = !nodeData.attributes?.isSample

  if (!hasChildren && !isCategory) {
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

// 展开节点（点击展开图标时触发）
const onExpand: TreeProps['onExpand'] = async (_keys, info) => {
  const nodeData = info.node.dataRef as ViewBigCategoryTreeNode

  if (!nodeData.isLoadSample) {
    await getSample(nodeData)
  }
}

// 展开默认的大类树节点
async function expandDefaultBigCategoryNodes() {
  const bigCategoryId = useBasicInfo.data.bigCategoryId
  const data = treeData.value

  for (let i = 0; i < data.length; i++) {
    const item: any = data[i]

    if (item.id === bigCategoryId) {
      expandedKeys.value.push(item.id)
      await getSample(item)
      const children = item.children as ViewSampleTreeNode[]
      await expandDefaultSampleNodes([item], children)
      break
    }

    if (item.children && item.children.length > 0) {
      const bigCategoryNodesList: ViewBigCategoryTreeNode[] = [item]
      const result = findTreeNode(bigCategoryId, item.children)

      if (result) {
        const { node, path } = result
        bigCategoryNodesList.push(...path)
        const expandIds = bigCategoryNodesList.map(j => j.id)
        expandedKeys.value.push(...expandIds)

        await getSample(node)
        const children = node.children as ViewSampleTreeNode[]
        await expandDefaultSampleNodes(bigCategoryNodesList, children)
        break
      }
    }
  }
}

// 展开默认的样品树节点
async function expandDefaultSampleNodes(nodeList: ViewBigCategoryTreeNode[], children: ViewSampleTreeNode[]) {
  const sampleId = useBasicInfo.data.testUnitTestSampleId

  for (let i = 0; i < children.length; i++) {
    const item = children[i]

    if (item.id === sampleId) {
      emits('select', {
        sample: unref(item),
        nodes: nodeList,
      })
      checkedKeys.value = [item.id]
      break
    }

    if (item.children && item.children.length > 0) {
      const sampleNodesList: ViewSampleTreeNode[] = [item]
      const result = findTreeNode(sampleId, item.children)

      if (result) {
        const { node, path } = result

        sampleNodesList.push(...path)
        sampleNodesList.pop()
        const expandIds = sampleNodesList.map(j => j.id)
        expandedKeys.value.push(...expandIds)

        emits('select', {
          sample: unref(node),
          nodes: [...nodeList, ...sampleNodesList],
        })
        checkedKeys.value = [node.id]
        break
      }
    }
  }
}

function findTreeNode(findId: string, children: ViewSampleTreeNode[] | BigCategoryTreeNode[], recordNodesList?: ViewSampleTreeNode[] | BigCategoryTreeNode[]) {
  for (let i = 0; i < children.length; i++) {
    const _recordNodesList = recordNodesList || []
    const item: any = children[i]

    _recordNodesList.push(item)

    if (item.id === findId) {
      return {
        node: item,
        path: _recordNodesList,
      }
    }
    else if (item.children && item.children.length > 0) {
      const r: any = findTreeNode(findId, item.children, _recordNodesList)
      if (r) {
        return {
          node: r.node,
          path: r.path,
        }
      }
      else {
        _recordNodesList.pop()
      }
    }
    else {
      _recordNodesList.pop()
    }
  }
}

// 添加附注 start-----------------
const visible = ref(false)
const loading = ref(false)
const addNoteSampleId = ref('')
const sampleNote = ref('')
// 打开附注弹窗
function addNote(node: EventDataNode) {
  addNoteSampleId.value = node.id
  sampleNote.value = node.dataRef?.attributes?.sampleNote || ''
  visible.value = true
}
// 保存附注信息
async function submit(val: string) {
  try {
    loading.value = true
    await addSampleNoteApi({
      id: addNoteSampleId.value,
      sampleNote: val,
    })
    visible.value = false
    updateTreeNode(treeData.value, val)
    sampleNote.value = ''
    addNoteSampleId.value = ''
  }
  finally {
    loading.value = false
  }
}
// 更新节点
function updateTreeNode(treeData: BigCategoryTreeNode[] | ViewSampleTreeNode[], note: string) {
  for (let i = 0; i < treeData.length; i++) {
    const tree: any = treeData[i]
    if (tree.id === addNoteSampleId.value) {
      if (!tree.attributes) {
        tree.attributes = {} as any
      }
      tree.attributes.sampleNote = note
      tree.title = note ? `${tree.text}(${note})` : tree.text
      break
    }
    if (tree.children && tree.children.length > 0) {
      updateTreeNode(tree.children, note)
    }
  }
}
// 添加附注 end-----------------
// 切换专业/简易模式 start------------------
watch(() => selectSampleParamStore.isSimpleMode, (val: boolean) => {
  query.value.queryParam = ''
  query.value.isSimplePattern = val

  treeData.value = []
  checkedKeys.value = []
  expandedKeys.value = []

  quickSearch()
})
// 切换专业/简易模式 end------------------
</script>

<style scoped>
.ant-spin-nested-loading{
  height: 100%;
}
:deep(.ant-spin-container){
  display: flex;
  flex-direction: column;
  height: 100%;
}
:deep(.ant-tree .ant-tree-title) {
  display: flex;
  align-items: center;
}
</style>
