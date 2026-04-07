<template>
  <div>
    <a-spin :spinning="spinning">
      <div>
        <div v-if="!!isTitle" style="margin: 12px 0">
          <a-checkbox
            v-model:checked="isDel"
            style="font-size: 12px"
            name="type"
            @change="getNewData"
          >
            显示已删除的工程划分
          </a-checkbox>
        </div>
        <div class="treeBox">
          <a-tree
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :selected-keys="selectedKeys"
            :load-data="onLoadData"
            :tree-data="treeData"
            class="testItemDetail-left-tree"
            @expand="onExpand"
            @select="onSelect"
          >
            <template #title="record">
              {{ record.name }}
              <span v-if="isDel && record.deleted" style="color: red"> 删除</span>
            </template>
          </a-tree>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  props: ['treeSelect', 'rootData', 'isTitle'],
  data() {
    return {
      id: getQueryVariable('id') || '',
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      treeData: [],
      isDel: false,
      spinning: false,
    }
  },
  watch: {
    checkedKeys() {},
    isTitle() {},
  },
  created() {
    this.getData()
  },
  methods: {
    getNewData() {
      this.getData()
    },
    getTreeData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.getTreeData(data[i].children)
        }
        const obj = {
          ...data[i],
          id: data[i].sid || data[i].id,
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          scopedSlots: {
            title: 'titleSlot',
          },
          isLeaf: false,
          children,
        }
        if (this.isDel) {
          obj.deleted = data[i].deleted
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    getData() {
      window.$oRest
        .get(window.$oApi.testItem.getTree, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: {
            id: this.id,
            showDeleted: this.isDel,
          },
          dataType: 'JSON',
        })
        .then((res) => {
          if (res.code === 20000) {
            this.treeData = this.getTreeData(res.data)

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
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.children && treeNode.children.length > 0) {
          resolve()
          return
        }
        this.spinning = true
        const data = {
          id:
            treeNode.type > 0
              ? treeNode.sid
              : treeNode.id,
          type: treeNode.type,
          levelCode: treeNode.levelCode || '',
          showDeleted: this.isDel,
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
              const children = this.getTreeData(res.data)
              treeNode.dataRef.children = children
              this.treeData = [...this.treeData]
              const arrIds = children.map(item => item.oid)
              this.expandedKeys.push(arrIds)
              this.onExpand(this.expandedKeys)
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
            // 在数据处理完成后再resolve
            resolve()
          })
          .catch((error) => {
            console.error('加载树节点失败:', error)
            this.spinning = false
            resolve()
          })
      })
    },
    onExpand(expandedKeys, obj) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
      if (obj && obj.expanded) {
        this.onLoadData(obj.node)
      }
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys

      this.treeSelect(selectedKeys, info)
    },
  },
}
</script>

<style scoped>
.treeBox {
  height: 570px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
