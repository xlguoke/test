<template>
  <ht-modal
    v-model:open="visibleSample"
    width="450px"
    :mask-closable="false"
    title="选择大类"
    class="sample-level"
    @ok="okBtn"
  >
    <a-spin :spinning="spinning">
      <a-flex class="h-[580px] mt-4" vertical>
        <a-flex align="center">
          <div class="label">
            大类名称：
          </div>
          <a-input
            v-model:value="queryParam"
            class="flex-1"
            allow-clear
            placeholder="请选择大类名称"
          />
          <a-button type="primary" @click="search()">
            搜索
          </a-button>
        </a-flex>
        <div class="flex-1 overflow-y-auto mt-4">
          <a-tree
            v-if="testTypeTree.length"
            :key="testTypeTree.length"
            block-node
            :checked-keys="selectedKeys"
            :default-expand-all="defaultExpand"
            :default-selected-keys="defaultSelectedKeys"
            :default-expanded-keys="defaultExpandedKeys"
            :tree-data="testTypeTree"
            @select="selectTree"
          />
        </div>
      </a-flex>
    </a-spin>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'TestType',
  props: ['categoryId'],
  emits: ['getTestType'],
  data() {
    return {
      visibleSample: false,
      spinning: true,
      defaultExpand: false,
      modalWarpHeight: document.body.clientHeight - 300,
      queryParam: '',
      levelPath: '',
      selectedKeys: [],
      defaultSelectedKeys: [],
      defaultExpandedKeysL: [],
      refresh: '',
      testTypeTree: [],
    }
  },
  methods: {
    showModal() {
      this.visibleSample = true
      this.selectedKeys = this.categoryId ? [this.categoryId] : []
      this.defaultExpandedKeys = this.categoryId ? [this.categoryId] : []
      this.defaultSelectedKeys = this.categoryId ? [this.categoryId] : []
      this.getTreeData()
    },
    search() {
      this.getTreeData(true)
    },
    getTreeData(open) {
      this.spinning = true
      window.$oAjax
        .get(
          `bigCategoryController.do?comboTreeSyncByName&name=${
            encodeURI(encodeURI(this.queryParam))}`,
          {
            params: {
              page: 1,
              size: 9999,
              queryParam: this.queryParam,
              queryType: 'category',
            },
          },
        )
        .then((res) => {
          const tree = res && res.length > 0 ? res : []
          ;(function setKey(tree) {
            for (let i = 0; i < tree.length; i++) {
              tree[i].key = tree[i].id
              tree[i].title = tree[i].text
              if (tree[i].children && tree[i].children.length > 0) {
                setKey(tree[i].children)
              }
              else {
                tree[i].children = undefined
              }
            }
          })(tree)
          this.testTypeTree = tree
          this.spinning = false

          open && (this.defaultExpand = true)
          this.refresh = new Date().getTime()
        })
    },
    selectTree(selectedKeys, info) {
      this.levelPath = selectedKeys.length > 0 ? info.node.pos : ''
      this.selectedKeys = selectedKeys
    },
    okBtn() {
      const levelPath = this.levelPath
      const nodes = []
      if (levelPath) {
        const levels = levelPath.split('-')
        const treeData = this.testTypeTree
        const count = 1
        ;(function _getNode(count, datas) {
          const level = levels[count]
          const node = datas[level]
          nodes.push(node)
          if (count < levels.length - 1) {
            _getNode(++count, node.children)
          }
        })(count, treeData)
      }
      let str = ''
      if (nodes.length > 0) {
        for (let i = 0; i < nodes.length; i++) {
          const item = nodes[i]
          if (item.sampleId)
            continue
          str += str == '' ? item.title : `-${item.title}`
        }
      }
      $emit(this, 'getTestType', { name: str, id: this.selectedKeys[0] })
      this.visibleSample = false
    },
  },
}
</script>
