<template>
  <div>
    <div v-if="!pageType">
      请选择需要将所属工程划分调整到的位置：
    </div>
    <a-tree
      :load-data="onLoadData"
      :tree-data="treeData"
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :selected-keys="selectedKeys"
      @expand="onExpand"
      @select="onSelect"
    />
    <!-- <a-button @click="handleSubmit">提交</a-button> -->
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  name: 'SelTree',
  props: ['callback'],
  data() {
    return {

      treeData: [],
      idArr: [],
      selectedKeys: [],
      selData: [],
      id: getQueryVariable('id') || '',
      pageType: getQueryVariable('page') || '',
      selId: getQueryVariable('selId') || '',
      expandedKeys: [],
      autoExpandParent: true,
    }
  },
  created() {
    if (this.selId) {
      this.selectedKeys = [this.selId]
    }
    this.getData()
  },
  mounted() {
    // window.layerOkCallback = this.handleSubmit;
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    window.layerOkCallback = (layerI, successFunc) => {
      successFunc(layerI, self.handleSubmit())
    }
  },
  methods: {
    getTreeData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.getTreeData(data[i].children)
        }
        const obj = {
          ...data[i],
          id: data[i].sid || data[i].id,
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          isLeaf: false,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    getData() {
      window.$oRest
        .get(window.$oApi.testItem.getTree, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: { id: this.id },
          dataType: 'JSON',
        })
        .then((res) => {
          if (res.code === 20000) {
            this.treeData = this.formatData(res.data)
            this.treeData = this.getTreeData(this.treeData)

            this.rootData && this.rootData(this.treeData[0])
            const arrIds = this.treeData.map(item => item.oid)
            if (this.treeData[0].children && this.treeData[0].children[0].oid) {
              arrIds.push(this.treeData[0].children[0].oid)
            }
            this.expandedKeys = [...this.expandedKeys, ...arrIds]
            this.onExpand(this.expandedKeys)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    formatData(data) {
      if (data && data.length > 0) {
        data = data.map(item => ({
          ...item,
          disabled:
            !!(item.pid === null && item.disabledParam === true),
        }))
      }

      return data
    },
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.children) {
          resolve()
          return
        }
        setTimeout(() => {
          const data = {
            id:
              treeNode.type > 0
                ? treeNode.sid
                : treeNode.id,
            type: treeNode.type,
            levelCode: treeNode.levelCode || '',
          }
          // 树获取三个参数
          window.$oRest
            .get(window.$oApi.testItem.getTree, {
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
              },
              params: data,
              dataType: 'JSON',
            })
            .then((res) => {
              if (res.code === 20000) {
                treeNode.dataRef.children = this.getTreeData(res.data)
                const arrIds = treeNode.dataRef.children.map(item => item.oid)
                this.expandedKeys.push(arrIds)
                this.onExpand(this.expandedKeys)
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })

          resolve()
        }, 1000)
      })
    },
    onSelect(selectedKeys, info) {
      this.selData = info.node.dataRef
      this.selectedKeys = selectedKeys
    },
    showModal(idArr) {
      this.idArr = idArr
    },
    handleSubmit() {
      if (
        (this.selectedKeys.length === 0 || this.selData.length === 0)
        && !this.selId
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }
      if (this.pageType && this.pageType === 'unitProject') {
        return this.selData
      }
      else {
        this.confirmLoading = true
        let type
        if (this.selData.type === -2) {
          type = 1
        }
        else if (this.selData.type === -1) {
          type = 2
        }
        else {
          type = 3
        }
        const data = {
          consignIds: this.idArr.join(','),
          id: this.selData.oid,
          name: this.selData.name,
          type,
        }
        window.$oRest({
          method: 'POST',
          url: 'rest/synthesis/report-belongs',
          params: data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.code) {
              window.$oAntdMessage.success(res.message)
              this.handleCancel()
              this.callback()
            }
            this.confirmLoading = false
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      }
    },
    handleCancel() {
      this.selectedKeys = []
      this.selData = []
    },
  },
}
</script>

<style scoped></style>
