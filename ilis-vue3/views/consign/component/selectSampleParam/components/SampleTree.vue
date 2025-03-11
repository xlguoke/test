<template>
  <a-spin :spinning="spinning">
    <a-space wrap>
      <a-select v-model:value="query.queryType">
        <a-select-option v-for="d in queryType" :key="d.value" :value="d.value">
          {{ d.label }}
        </a-select-option>
      </a-select>
      <a-input-search
        v-model:value.trim="query.queryParam"
        :placeholder="queryTypeTip[query.queryType]"
        class="w-[260px]"
        @press-enter="quickSearch"
        @search="quickSearch"
      >
        <template #enterButton>
          <a-button type="primary" class="flex items-center">
            <SearchOutlined />
          </a-button>
        </template>
      </a-input-search>
    </a-space>
    <div class="mt-2 flex-1 overflow-auto">
      <a-tree
        ref="Tree"
        v-model:expanded-keys="expandedKeys"
        v-model:checked-keys="checkedKeys"
        v-model:selected-keys="checkedKeys"
        :tree-data="treeData"
        show-line
        check-strictly
        block-node
        @expand="onExpand"
        @select="onSelect"
      >
        <template #title="node">
          <span class="flex-1">{{ node.title }}</span>
          <EditOutlined v-if="node.attributes.isSample" class="mx-1 text-[#0066ec]" @click.stop="addNote(node)" />
        </template>
        <template #switcherIcon="{ expanded, dataRef }">
          <!-- 大类 -->
          <template v-if="!dataRef.attributes.isSample">
            <img
              v-if="expanded"
              class="tree-icon tree-icon-open"
              title="大类"
              :src="treeOpenSvg"
            >
            <img
              v-else
              class="tree-icon"
              title="大类"
              :src="treeCloseSvg"
            >
          </template>
          <!-- 存在子级的样品 -->
          <template v-else-if="dataRef.children && dataRef.children.length">
            <FolderOpenOutlined v-if="expanded" title="样品" class="text-[#0066ec] text-lg" />
            <FolderOutlined v-else title="样品" class="text-[#0066ec] text-lg" />
          </template>
          <FileTextOutlined v-else title="样品" class="text-[#0066ec]" />
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
import { reactive, ref } from 'vue'
import type { TreeProps } from 'ant-design-vue'
import type { EventDataNode } from 'ant-design-vue/es/vc-tree/interface'
import { EditOutlined, FileTextOutlined, FolderOpenOutlined, FolderOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import { addSampleNoteApi, bigCategoryApi, sampleApi } from '../api'
import AddNote from './AddNote.vue'
import type { BigCategoryTreeNode, SampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import { ViewBigCategoryTreeNode, ViewSampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'

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

// 样品信息页面的基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo

const treeOpenSvg = new URL('~/assets/img/tree-open.svg', import.meta.url).href

const treeCloseSvg = new URL('~/assets/img/tree-close.svg', import.meta.url).href

// 是否为简易模式，变量定义在父组件SelectSampleParam.vue中
const isSimpleMode = ref(inject('isSimpleMode') as boolean)

const queryType = reactive([
  { label: '按样品查询', value: 'sample' },
  { label: '按参数查询', value: 'param' },
  { label: '按规程查询', value: 'standard' },
  { label: '按附注查询', value: 'note' },
])

const queryTypeTip: { [key: string]: string } = {
  sample: '输入样品名称后回车即可查询',
  param: '输入检测参数后回车即可查询',
  standard: '输入规程名称或颁布号后回车即可查询',
  note: '输入附注后回车即可查询',
  default: '输入样品/参数名称/附注后回车即可查询',
}

const query = ref<Query>({
  queryType: 'sample',
  queryParam: '',
  isSimplePattern: isSimpleMode.value,
  queryScope: MainController.isCreateTestPage ? 2 : undefined,
})

// 标记是否为搜索状态
const isSearch = ref(false)

const spinning = ref(false)

const treeData = ref<ViewBigCategoryTreeNode[] | ViewSampleTreeNode[]>([])

const expandedKeys = ref<Key[]>([])

const checkedKeys = ref<Key[]>([])

const Tree = ref()

// 页面初始化
async function init() {
  await getBigCategory()

  // 回显大类树节点选中状态
  await expandDefaultBigCategoryNodes()
}

init()

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
    const item = treeNodes[i]

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
    expandTreeNodes(treeNode)

    for (let i = 0; i < treeNode.children.length; i++) {
      const item = treeNode.children[i]
      if (item.state === 'close') {
        await getSample(item, true)
      }
    }
  }
}

// 选择节点：点击文本选择
const onSelect: TreeProps['onSelect'] = async (_keys, info) => {
  const { expanded, key } = info.node
  const nodeData: any = info.node.dataRef
  // 是否为大类
  const isCategory = !nodeData.attributes.isSample
  const { isLoadSample } = nodeData

  if (!expanded) {
    expandedKeys.value.push(key)
  }

  if (isCategory && !isLoadSample) {
    await getSample(nodeData)
  }

  if (!isCategory && info.selected) {
    emits('select', {
      sample: unref(nodeData),
      nodes: unref(info.node.parent.nodes),
    })
  }
  else {
    emits('select', {
      sample: undefined,
      nodes: [],
    })
  }
}

// 展开节点
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
    const item = data[i]

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
    const item = children[i]

    _recordNodesList.push(item)

    if (item.id === findId) {
      return {
        node: item,
        path: _recordNodesList,
      }
    }
    else if (item.children && item.children.length > 0) {
      const r = findTreeNode(findId, item.children, _recordNodesList)
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
    const tree = treeData[i]
    if (tree.id === addNoteSampleId.value) {
      if (!tree.attributes) {
        tree.attributes = {}
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
watch(() => isSimpleMode.value, (val: boolean) => {
  query.value.queryParam = ''
  query.value.isSimplePattern = val

  checkedKeys.value = []
  expandedKeys.value = []

  quickSearch()
})
// 切换专业/简易模式 end------------------
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
