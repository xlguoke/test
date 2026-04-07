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
      <div class="modal-warp" :style="`height:${modalWarpHeight}px`">
        <div class="search-top">
          <span class="label">大类名称：</span>
          <a-input
            v-model:value="queryParam"
            allow-clear
            placeholder="请选择大类名称"
          />
          <a-button type="primary" @click="search()">
            搜索
          </a-button>
        </div>
        <div class="tree-box">
          <a-tree
            v-if="testTypeTree.length > 0"
            block-node
            :default-expand-all="defaultExpand"
            :tree-data="testTypeTree"
            @select="selectTree"
          />
        </div>
      </div>
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
      refresh: '',
      testTypeTree: [],
    }
  },
  methods: {
    showModal() {
      this.refresh = new Date().getTime()
      this.visibleSample = true
      this.selectedKeys = this.categoryId ? [this.categoryId] : []
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
              queryType: 'sample',
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
      this.levelPath = info.node.pos
      this.selectedKeys = selectedKeys
    },
    okBtn() {
      const levelPath = this.levelPath
      const levels = levelPath.split('-')
      const treeData = this.testTypeTree
      const nodes = []
      const count = 1
      ;(function _getNode(count, datas) {
        const level = levels[count]
        const node = datas[level]
        nodes.push(node)
        if (count < levels.length - 1) {
          _getNode(++count, node.children)
        }
      })(count, treeData)
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

<style lang="less" scoped>
.modal-warp {
  .search-top {
    display: flex;
    align-items: center;
    .label {
      width: 100px;
      text-align: right;
    }
    .ant-input-affix-wrapper {
      margin: 0 10px;
    }
    button {
      width: 80px;
    }
  }
  .tree-box {
    margin-top: 10px;
    height: calc(100% - 40px);
    overflow: auto;
  }
}
</style>
