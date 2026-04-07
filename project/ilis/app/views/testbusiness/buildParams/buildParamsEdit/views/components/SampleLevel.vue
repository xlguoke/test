<template>
  <ht-modal
    v-model:open="visibleSample"
    :dialog-style="{ top: '40px' }"
    width="450px"
    :mask-closable="false"
    title="选择样品层级"
    class="sample-level"
    @ok="okBtn"
  >
    <div class="modal-warp" :style="`height:${modalWarpHeight}px`">
      <a-checkbox v-model:checked="checkedAll" @change="changeCheckedAll">
        全选
      </a-checkbox>
      <a-tree
        v-if="sampleTree.length > 0"
        :checked-keys="checkedKeys"
        checkable
        block-node
        check-strictly
        :tree-data="sampleTree"
        :default-checked-keys="filterDefaultKeys"
        :default-expand-all="true"
        @check="changeCheckedKeys"
      />
    </div>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'SampleLevel',
  props: ['sampleTree', 'sampleDefaultKeys'],
  emits: ['getSample'],
  data() {
    return {
      visibleSample: false,
      checkedAll: false,
      modalWarpHeight: document.body.clientHeight - 220,
      checkedKeys: [],
      allTreeIds: [],
      filterDefaultKeys: [], // 过滤掉样品被删除，但打包参数中适用样品层级还保存着的样品id
      refresh: '',
    }
  },
  methods: {
    showModal() {
      this.getAllTreeIds()
      this.visibleSample = true
      this.checkedAll = this.filterDefaultKeys.length === this.allTreeIds.length
      this.checkedKeys = this.filterDefaultKeys
      this.refresh = new Date().getTime()
    },
    // 拿到样品层级树中所有项的id
    getAllTreeIds() {
      const allKeys = []
      const filterDefaultKeys = []
      const defaultKeys = this.sampleDefaultKeys
      ;(function getTreeId(treeList) {
        for (let i = 0; i < treeList.length; i++) {
          const node = treeList[i]
          allKeys.push(node.id)
          if (defaultKeys.includes(node.id)) {
            filterDefaultKeys.push(node.id)
          }
          if (node.children && node.children.length > 0) {
            getTreeId(node.children)
          }
        }
      })(this.sampleTree)
      this.filterDefaultKeys = filterDefaultKeys
      this.allTreeIds = allKeys
    },
    changeCheckedAll() {
      const check = this.checkedAll
      this.checkedKeys = check ? this.allTreeIds : []
    },
    changeCheckedKeys(checkedKeys) {
      this.checkedAll = checkedKeys.checked.length === this.allTreeIds.length
      this.checkedKeys = checkedKeys.checked
    },
    okBtn() {
      if (this.checkedKeys.length === 0) {
        window.$oAntdMessage.warning('请选择样品')
        return
      }
      $emit(this, 'getSample', this.checkedKeys)
      this.visibleSample = false
    },
  },
}
</script>

<style lang="less" scoped>
.modal-warp {
  overflow: auto;
}
</style>
