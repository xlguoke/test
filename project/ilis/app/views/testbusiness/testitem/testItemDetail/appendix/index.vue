<template>
  <div class="appendix">
    <div class="appendix-left">
      <a-tree
        :load-data="onLoadData"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :tree-data="treeData"
        class="testItemDetail-left-tree"
        @expand="onExpand"
        @select="onSelect"
      />
    </div>
    <div class="appendix-right">
      <div v-if="!isSelect" class="appendix-search">
        <a-input
          v-model:value="attachmentName"
          placeholder="请输入文件名称"
          class="appendix-search-all"
        />
        <a-button @click="getDataByFile">
          查询
        </a-button>
        <a-button
          v-permission="'add:attach'"

          :disabled="isDetail"
          type="primary"
          @click="uploadFile"
        >
          上传文件
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        row-key="id"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'attachmentName'">
            <a-button
              type="link"
              @click="downloadAccessory(record.attachmentId)"
            >
              {{ text }}
            </a-button>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <a-button
                v-permission="'edit:attach'"
                type="link"
                :disabled="isDetail"
                @click="edit(record)"
              >
                编辑
              </a-button>
              <a-button
                v-permission="'del:attach'"
                type="link"
                danger
                :disabled="isDetail"
                @click="deleteRow(record)"
              >
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <UploadFileModal
      ref="uploadFileModalRef"
      :is-add="isAdd"
      :callback="getNewDataByTree"
      :tree-info="treeInfo"
      :node="node"
    />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import {
  deleteAttachment,
  getAttachmentList,
} from '~/providers/api/attachment'
import {
  downloadAccessory,
  getQueryVariable,
} from '~/providers/common/utils'
import UploadFileModal from './components/uploadModal.vue'

const columns = [
  {
    title: '文件名称',
    dataIndex: 'attachmentName',
    width: '30%',
    scopedSlots: { customRender: 'attachmentName' },
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    width: '20%',
  },
  {
    title: '上传人员',
    dataIndex: 'createName',
    width: '15%',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: '15%',
  },
]
const columnsOpr = [
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    UploadFileModal,
  },
  data() {
    return {
      id: getQueryVariable('id') || '',
      isDetail: getQueryVariable('status') === '1',
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      treeData: [],
      data: [],
      columns: columns.concat(columnsOpr),
      formLayout: 'horizontal',

      loading: false,
      query: {
        page: 1,
        size: 10,
      },
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      attachmentName: '',
      rootData: '',
      type: 1,
      treeInfo: {},
      node: {},
      isAdd: true,
      page: 1,
      size: 10,
      isSelect: false,
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              if (!record.children) {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys, isSelect } = this
      if (isSelect) {
        return {
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            this.selectedRowKeys = selectedRowKeys
            this.selectedRows = selectedRows
          },
          getCheckboxProps: record => ({
            props: {
              disabled: !!record.disabled,
            },
          }),
        }
      }
      return {}
    },
  },
  created() {
    this.requestTreeData()
  },
  methods: {
    downloadAccessory,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getRootData(data) {
      if (data) {
        this.rootData = data
        this.getDataByTree(data.type, data.oid || data.id)
      }
    },
    getNewDataByTree() {
      if (!this.node?.oid) {
        this.getRootData(this.treeData[0])
      }
      else {
        this.getDataByTree(this.node.type, this.node.oid)
      }
    },
    getDataByTree(type, id) {
      if (this.type !== 1) {
        // eslint-disable-next-line ts/no-unused-expressions
        this.type === 1
        this.page = 1
        this.size = 10
      }
      this.loading = true

      const typeObj = { '-2': 'project', '-1': 'contract', 'default': 'unit' }
      getAttachmentList(
        typeObj[type] || typeObj.default,
        id,
        this.query,
      ).then((res) => {
        if (res) {
          this.attachmentName = ''
          this.type = 1
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = this.page
          this.pagination.pageSize = this.size
          this.selectedRowKeys = []
          this.loading = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getDataByFile() {
      if (!this.attachmentName.trim()) {
        this.getDataByTree(
          this.rootData.type,
          this.rootData.oid || this.rootData.id,
        )
        return
      }

      if (`${this.type}` !== '2') {
        // eslint-disable-next-line ts/no-unused-expressions
        this.type === 2
        this.page = 1
        this.size = 10
        this.selectedKeys = []
      }

      const { page, size, attachmentName } = this

      this.loading = true
      window.$oRest
        .get(`${window.$oApi.testItem.appendixByFile}/${this.id}`, {
          params: {
            page,
            size,
            attachmentName: attachmentName || null,
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    // 删除
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除 ${data.attachmentName} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.loading = true
          deleteAttachment(data.id).then((res) => {
            if (res.code && res.code !== 20010) {
              message.success('删除成功')
              this.requestTreeData()
            }
            else {
              message.warn(res.message)
            }
            this.loading = false
          })
        },
      })
    },
    uploadFile() {
      if (JSON.stringify(this.treeInfo) === '{}') {
        message.warn('请先选择左侧的合同段或单位工程')
        return
      }
      this.isAdd = true
      this.$refs.uploadFileModalRef.showModal()
    },
    requestTreeData() {
      // eslint-disable-next-line ts/no-unused-expressions
      this.id
        ? window.$oRest
            .get(window.$oApi.testItem.getTree, {
              params: { id: this.id },
            })
            .then((res) => {
              if (res.code === 20000) {
                this.treeData = this.getTreeData(res.data)
                this.getRootData(this.treeData[0])
                const arrIds = this.treeData.map(item => item.oid)
                if (
                  this.treeData[0].children
                  && this.treeData[0].children[0].oid
                ) {
                  arrIds.push(this.treeData[0].children[0].oid)
                }
                this.expandedKeys = [...this.expandedKeys, ...arrIds]
                this.onExpand(this.expandedKeys)
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        : ''
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
                treeNode.children = this.getTreeData(res.data)
                this.treeData = [...this.treeData]
                const arrIds = treeNode.children.map(item => item.oid)
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
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys

      const node = info.node.dataRef
      this.node = node

      if (info.selected) {
        if (`${node.type}` === '-1') {
          this.treeInfo = {
            contractPartId: node.oid,
            projectId: this.rootData.id,
          }
        }
        else if (`${node.type}` === '-2') {
          this.treeInfo = {
            projectId: node.oid,
          }
        }
        else {
          this.treeInfo = {
            unitProjectId: node.oid,
            projectId: this.rootData.id,
          }
        }
        this.getDataByTree(node.type, node.oid)
      }
      else {
        this.treeInfo = {}
        this.getDataByTree(
          this.rootData.type,
          this.rootData.oid || this.rootData.id,
        )
      }
    },
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
    edit(data) {
      this.isAdd = false
      this.$refs.uploadFileModalRef.showModal(data)
    },
    showModal(recordId) {
      this.id = recordId
      this.isSelect = true
      this.columns = columns
      this.selectedRowKeys = []
      this.selectedRows = []
      this.requestTreeData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
