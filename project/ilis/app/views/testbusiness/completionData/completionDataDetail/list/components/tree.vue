<template>
  <div>
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
          <a-flex>
            <div class="flex-1">
              {{ record.title }}
            </div>
            <span
              v-if="record.isReport"
              style="color: #1890ff;width: 30px"
              title="上报工程划分"
              class="ml-2"
              @click.stop="setReport(record)"
            >
              <UploadOutlined />
            </span>
          </a-flex>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script>
import { UploadOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { insertTreeNode } from '~/providers/transformUtils/utils'

export default {
  components: {
    UploadOutlined,
  },
  props: ['treeSelect', 'setTreeReport'],
  emits: ['setTreeReport'],
  data() {
    return {
      id: getQueryVariable('id') || '',
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      treeData: [],
      reportsArr: [],
    }
  },
  watch: {},
  created() {
    this.getData()
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
          scopedSlots: {
            title: 'titleSlot',
          },
          isLeaf: false,
          isReport: data[i].type > 0,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    getData() {
      window.$oAjax
        .get(window.$oApi.completionDataDetail.getTree, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: {
            id: this.id,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.treeData = this.getTreeData(res.data)
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
        if (treeNode.children) {
          resolve()
          return
        }
        const data = {
          id:
            treeNode.type > 0
              ? treeNode.sid
              : treeNode.id,
          type: treeNode.type,
          levelCode: treeNode.levelCode || '',
        }
        // 树获取三个参数
        window.$oAjax
          .get(window.$oApi.completionDataDetail.getTree, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
            params: data,
            dataType: 'JSON',
          })
          .then((res) => {
            if (res.code === 20000) {
              const nodes = this.getTreeData(res.data)
              if (nodes.length > 0) {
                treeNode.children = nodes
              }
              insertTreeNode(this.treeData, treeNode.value, treeNode.children, 'value')
              const arrIds = nodes.map(item => item.oid)
              this.expandedKeys.push(arrIds)
              this.onExpand(this.expandedKeys)
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        resolve()
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.treeSelect(selectedKeys, info)
    },
    async setReport(record) {
      const params = {
        params: { unitProjectId: record.oid },
      }
      if (record.levelCode.length > 4) {
        const validRes = await window.$oAjax.get(window.$oApi.completionDataDetail.validation, params)
        let valid = false
        if (validRes.code === 20000) {
          valid = validRes.data
        }
        if (!valid) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              `${record.title}含有尚未上报的上级工程划分，请依次上报`,
            ),
          )
          return
        }
      }
      const res = await window.$oAjax.get(window.$oApi.completionDataDetail.subUnitProjects, params)
      if (res.data > 200) {
        Modal.confirm({
          title: '提交确认',
          content: `${record.title}一共有${res.data}个子级，预计上报耗时较长，请选择上报方式`,
          okText: '单个上报',
          cancelText: '批量上报',
          onOk: () => this.emit(record, true),
          onCancel: () => this.emit(record, false),
        })
      }
      else {
        this.emit(record, false)
      }
    },
    emit(record, single) {
      $emit(this, 'setTreeReport', record, single)
    },
  },
}
</script>

<style lang="less" scoped>
.treeBox {
  height: 570px;
  overflow: hidden;
  overflow-y: auto;
}
.tree-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 30px);
  display: inline-block;
}
.tree-name:hover {
  text-overflow: inherit;
  overflow: visible;
}
</style>
