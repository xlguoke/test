<template>
  <a-directory-tree
    v-model:expanded-keys="expandedKeys"
    v-model:selected-keys="selectedKeys"
    class="custom-tree"
    :load-data="onLoadData"
    :tree-data="treeData"
    :loaded-keys="loadedKeys"
    @select="handleSelect"
  >
    <template #title="val">
      <slot name="title" v-bind="val"></slot>
    </template>
  </a-directory-tree>
</template>

<script lang="ts" setup>
import type { TreeProps } from 'ant-design-vue'
import type { Key } from 'ant-design-vue/es/_util/type'
import type { DataNode } from 'ant-design-vue/es/tree'
import type { IReportSignature } from '..'
import type { IReportSignatureFile } from '../api'
import { getSignatureFileByReportId } from '../api'

const props = defineProps<{ reportList: IReportSignature[] }>()

const value = defineModel<IReportSignatureFile>()

const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const treeData = ref<TreeProps['treeData']>([])
const loadedKeys = ref<string[]>([])

const onLoadData: TreeProps['loadData'] = (treeNode) => {
  loadedKeys.value.push(String(treeNode.dataRef!.key))
  return new Promise<void>((resolve) => {
    if (treeNode.dataRef?.children) {
      resolve()
      return
    }
    getSignatureFileByReportId(String(treeNode.dataRef!.key)).then(({ data }) => {
      treeNode.dataRef!.children = data?.map(item => ({
        title: item.attachmentName,
        key: item.reportFileId,
        isLeaf: true,
        ...item,
      })) || []
      treeData.value = [...(treeData.value as any)]
      resolve()
      if (selectedKeys.value && data.some(item => item.reportFileId === selectedKeys.value[0])) {
        value.value = data.find(item => item.reportFileId === selectedKeys.value[0]) as IReportSignatureFile
      }
    }).catch(() => {
      resolve()
    })
  })
}

function handleSelect(_selectedKeys: Key[], { selectedNodes }: { selectedNodes: DataNode[] | undefined }) {
  // 单选，只选择叶子节点
  value.value = selectedNodes?.filter(item => item.isLeaf)?.[0] as IReportSignatureFile | undefined
}

function init() {
  loadedKeys.value = []
  treeData.value = props.reportList?.map(item => ({
    title: item.reportNumber,
    key: item.reportId,
    isLeaf: false,
    ...item,
  }))
}

onMounted(() => {
  init()
  // 初始化时展开第一个报告
  // expandedKeys.value = [props.reportList?.[0]?.reportId]
})

// 暴露属性给父组件
defineExpose({
  expandedKeys,
  init,
})
</script>

<style lang="less">
.custom-tree{
  .ant-tree-treenode{
    .anticon{
      color: var(--colorPrimary);
    }
    &-selected{
      .anticon{
        color: #fff;
      }
    }
  }
  .ant-tree-switcher{
    height: 21px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .ant-tree-iconEle{
    vertical-align: unset !important;
    height: unset !important;
  }
  .ant-tree-node-content-wrapper{
    width: 100%;
    display: flex;
    align-items: center;
    .ant-tree-title{
      flex: 1;
    }
  }

}
</style>
