<!-- 单位工程 -->
<template>
  <ht-modal
    v-model:open="internalOpen"
    width="600px"
    title="选择单位工程"
    :loading="loading"
    :after-close="onClosed"
    @ok="handleConfirm"
  >
    <div class="min-h-[50vh]">
      <a-tree
        v-model:expanded-keys="expandedKeys"
        v-model:checked-keys="checkedKeys"
        v-model:selected-keys="checkedKeys"
        :load-data="onLoadData"
        :tree-data="treeData"
        show-line
        check-strictly
        block-node
        @expand="onExpand"
        @select="onSelect"
      >
        <template #switcherIcon="{ expanded }">
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
      </a-tree>
    </div>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IConsignProcessor } from '../../../interface'
import type { IDialogPropsSelector } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { getUnitProjectApi } from '~/api/consign/consign-management'

interface IOriginTreeNode {
  id: string
  name: string
  pid?: string
  sid?: string
  type: number
  levelCode?: string
  disabledParam: boolean
  children?: IOriginTreeNode[]
}

interface ITreeNode extends IOriginTreeNode {
  title: string
  key: string
  value: string
  disabled?: boolean
  isLeaf?: boolean
  children?: ITreeNode[]
}

interface DialogProp {
  consignProcessor: IConsignProcessor
}

const props = defineProps<IDialogPropsSelector<ITreeNode>>()

const customParams = props.customParams as DialogProp

const treeOpenSvg = new URL('~/assets/img/tree-open.svg', import.meta.url).href
const treeCloseSvg = new URL('~/assets/img/tree-close.svg', import.meta.url).href

const internalOpen = ref(true)
const loading = ref(false)

const expandedKeys = ref<string[]>([])
const checkedKeys = ref<string[]>([])
const checkedNode = ref<ITreeNode>()
const treeData = ref<ITreeNode[]>([])

function onExpand(expandedKeysValue: any) {
  expandedKeys.value = expandedKeysValue
}
function onSelect(selectedKeys: any[], info: any) {
  if (info.selected) {
    checkedKeys.value = selectedKeys
    checkedNode.value = info.node.dataRef
  }
  else {
    checkedKeys.value = []
    checkedNode.value = undefined
  }
}

async function init() {
  const formData = customParams.consignProcessor.data
  const id = formData.project?.projectId || ''
  loading.value = true
  const { data } = await getUnitProjectApi({ id }).finally(() => {
    loading.value = false
  })
  const options = initOption(data || [])
  if (options[0].key === id) {
    treeData.value = options
  }
  else {
    const rootNode: any = {
      title: formData.project?.projectTenderName,
      key: formData.project?.projectId,
      value: formData.project?.projectId,
      isLeaf: true,
      children: options,
    }
    treeData.value = [rootNode]
  }
  const ids = treeData.value.map(d => d.key)
  expandedKeys.value = ids
}

function initOption(trees: ITreeNode[]): ITreeNode[] {
  trees.forEach((item) => {
    if (item.children && item.children.length) {
      item.children = initOption(item.children)
    }
    else {
      delete item.children
    }
    item.title = item.name
    item.value = item.id
    item.key = item.id
    item.isLeaf = false
    item.disabled = !!(item.pid === null && item.disabledParam)
  })
  return trees
}

async function onLoadData(treeNode: any) {
  const params = {
    id: treeNode.type > 0 ? treeNode.sid || '' : treeNode.id,
    type: treeNode.type,
    levelCode: treeNode.levelCode,
  }
  loading.value = true
  const { data } = await getUnitProjectApi(params).finally(() => {
    loading.value = false
  })
  treeNode.dataRef.children = initOption(data || [])
}

onMounted(() => {
  init()
})

/**
 * # 确认
 */
function handleConfirm() {
  if (!checkedNode.value)
    return message.warning('请选择单位工程')

  props.onConfirm(checkedNode.value as any)
  internalOpen.value = false
}
</script>
