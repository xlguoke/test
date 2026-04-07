<template>
  <div>
    <ht-modal
      v-if="uploadVisible"
      v-model:open="uploadVisible"
      title="登记"
      centered
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      width="800px"
      class="otherAchievement-uploadModal"
      :destroy-on-close="true"
      @ok="handleSubmit"
    >
      <div style="display: flex">
        <div style="width: 300px; padding: 10px">
          <a-input
            placeholder="请输入人员查询"
            style="margin-bottom: 10px"
            @change="onChange"
          ></a-input>
          <div style="height: 500px; overflow: auto">
            <a-tree
              v-model:value="checkedKeys"
              checkable
              :expanded-keys="expandedKeys"
              :replace-fields="{ title: 'name', key: 'id' }"
              :selected-keys="selectedKeys"
              :tree-data="treeData"
              @expand="onExpand"
              @check="onCheck"
              @select="onSelect"
            >
              <!-- <template slot="title" slot-scope="{ title }">
                  <span>{{ title }}xxxxxzxxx</span>
                </template> -->
            </a-tree>
          </div>
        </div>
        <div
          style="
            width: 50%;
            height: 500px;
            overflow: auto;
            padding: 10px;
            border-left: 1px solid #ccc;
          "
        >
          <p v-for="item in selectedNode" :key="item.id" class="editPenson_row">
            <span class="name">{{ item.userName }}:</span>
            <a-input-number
              v-model:value="item.ratio"
              :min="0"
              :step="0.1"
              :max="1"
            />
          </p>
        </div>
      </div>
    </ht-modal>
  </div>
</template>

<script>
export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      testTaskId: '',
      treeData: [],
      originalTreeData: [],
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      selectedNode: [],

      uploadVisible: false,
      confirmLoading: false,
    }
  },
  watch: {},
  async created() {},

  methods: {
    getParentKey(key, arr) {
      const arrList = JSON.parse(JSON.stringify(arr))
      for (let i = 0; i < arrList.length; i++) {
        const nodep = arrList[i]
        nodep.disabled = true
        if (nodep.children && nodep.children.length) {
          for (let j = 0; j < nodep.children.length; j++) {
            const node = nodep.children[j]
            if (!node.name.includes(key)) {
              node.disabled = true
              // nodep.children.splice(j, 1)
              // j--;
            }
          }
        }
      }
      arrList.forEach((it) => {
        it.children.forEach((cit) => {
          if (!cit.disabled) {
            it.disabled = false
          }
        })
      })
      return arrList
    },

    onChange(e) {
      const value = e.target.value
      if (value) {
        this.treeData = this.getParentKey(value, this.originalTreeData)
      }
      else {
        this.treeData = this.originalTreeData
      }
      this.autoExpandParent = true
    },
    async getPersonData() {
      this.treeData = []
      this.originalTreeData = []
      const res = await window.$oAjax.get(`userController.do?getNowTopOrgUserTrees`)

      if (res.success) {
        this.treeData = res.obj
        this.originalTreeData = res.obj
      }
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    onSelect(v) {
      // eslint-disable-next-line array-callback-return
      const cancel = this.expandedKeys.some((it, i) => {
        if (v == it) {
          this.expandedKeys.splice(i, 1)
          return true
        }
      })
      if (!cancel) {
        this.expandedKeys = [...this.expandedKeys, ...v]
      }
    },
    onCheck(v, node) {
      const nodeArr = []
      const keyArr = []
      node.checkedNodes.forEach((it) => {
        if (it.data.props.type == 'USER') {
          nodeArr.push({
            userName: it.data.props.name,
            userId: it.data.props.id,
            ratio: 0,
          })
          keyArr.push(it.data.props.id)
        }
      })
      this.checkedKeys = keyArr
      this.weightMerge(nodeArr)
      this.selectedNode = nodeArr
    },

    weightMerge(arr) {
      arr.forEach((it) => {
        this.selectedNode.forEach((ct) => {
          if (it.userId == ct.userId) {
            it.ratio = ct.ratio
          }
        })
      })
    },
    showModal() {
      this.getPersonData()
      this.uploadVisible = true
    },
    cancelModal() {
      this.uploadVisible = false
    },

    handleSubmit() {
      this.callback([...this.selectedNode])
      this.uploadVisible = false
    },
  },
}
</script>

<style>
.editPenson_row {
  margin: 10px 0;
}
.editPenson_row .name {
  width: 60px;
  display: inline-block;
  text-align: right;
  margin-right: 10px;
}
.ant-tree-treenode-disabled {
  display: none !important;
}
</style>
