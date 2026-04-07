<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择样品"
      :mask-closable="false"
      width="80%"
      class="testResultStatistic-selectSapmle"
      @ok="getSample"
      @cancel="cancelModal"
    >
      <div>
        <a-spin :spinning="loadingLeft">
          <div class="testResultStatistic-selectSapmle-left">
            <a-directory-tree
              :tree-data="leftData"
              :default-expanded-keys="defaultExpandedKeysLeft"
              @select="selectBigCatalog"
            />
          </div>
          <div class="testResultStatistic-selectSapmle-right">
            <a-tree
              show-line
              multiple
              :tree-data="rightData"
              :selected-keys="selectedKeys"
              :expanded-keys="defaultExpandedKeysRight"
              @select="selectSample"
              @expand="expandRight"
            />
          </div>
          <div style="clear: both"></div>
        </a-spin>
      </div>
    </ht-modal>
  </div>
</template>

<script>
export default {
  props: ['callback'],
  data() {
    return {
      leftData: [],
      rightData: [],
      visible: false,
      loadingLeft: false,
      selectedKeys: [],
      node: [],
      defaultExpandedKeysLeft: [],
      defaultExpandedKeysRight: [],
    }
  },
  methods: {
    getData() {
      this.defaultExpandedKeysLeft = []
      this.loadingLeft = true
      this.loading = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.testResultStatistic.getTree,
      }).then((res) => {
        if (res) {
          this.leftData = this.formatData(res, 'defaultExpandedKeysLeft')
          this.loadingLeft = false
        }
        else {
          this.loadingLeft = false
        }
      })
    },
    getSampleData(bigCategoryId) {
      this.defaultExpandedKeysRight = []
      this.loadingLeft = true
      window.$oAjax({
        methods: 'POST',
        url: window.$oApi.testResultStatistic.getSampleData,
        params: { bigCategoryId },
      }).then((res) => {
        if (res) {
          this.rightData = this.formatData(res, 'defaultExpandedKeysRight')
          this.loadingLeft = false
        }
        else {
          this.loadingLeft = false
        }
      })
    },
    formatData(data, field) {
      const arr = []
      if (Array.isArray(data)) {
        // eslint-disable-next-line array-callback-return
        data.map((item) => {
          let children = []
          if (item.children && item.children.length > 0) {
            children = this.formatData(item.children, field)
            this[field].push(item.id)
          }
          arr.push({
            title: item.text,
            key: item.id,
            isLeaf: children.length == 0,
            children,
          })
        })
      }
      else {
        return []
      }

      return arr
    },
    showModal() {
      this.getData()
      this.visible = true
    },
    cancelModal() {
      this.leftData = []
      this.rightData = []
      this.selectedKeys = []
      this.node = []
      this.visible = false
    },
    selectBigCatalog(keys) {
      if (keys.length > 0) {
        this.getSampleData(keys[0])
      }
    },
    selectSample(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.node = info.selectedNodes
      if (info.selected) {
        const data = info.node.dataRef
        this.children(data)
      }
    },
    getSample() {
      this.callback(this.node)
      this.cancelModal()
    },
    children(data) {
      if (data.children && data.children.length > 0) {
        // eslint-disable-next-line array-callback-return
        data.children.map((item) => {
          this.children(item)
          if (!this.selectedKeys.includes(item.key)) {
            this.selectedKeys.push(item.key)
            this.node.push(item)
          }
        })
      }
    },
    expandRight(data) {
      this.defaultExpandedKeysRight = data
    },
  },
}
</script>

<style lang="less" scoped>
.testResultStatistic-selectSapmle {
  height: 300px;
  .testResultStatistic-selectSapmle-left {
    float: left;
    width: 40%;
    height: 300px;
    overflow-y: auto;
    border: solid 1px #e2e2e2;
    margin-right: 15px;
  }

  .testResultStatistic-selectSapmle-right {
    overflow: hidden;
    height: 300px;
    overflow-y: auto;
    margin-left: 15px;
    border: solid 1px #e2e2e2;
  }
}
</style>
