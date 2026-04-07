<template>
  <div class="standardList hitek-height-full">
    <a-spin :spinning="spinning" class="hitek-height-full">
      <a-layout class="hitek-height-full" :style="{ background: 'var(--colorBgContainer)' }">
        <a-layout style="background-color: var(--colorBgContainer);">
          <a-layout-sider
            width="240"
            :style="{
              overflow: 'auto',
              padding: '10px',
              height: '100vh',
              position: 'fixed',
              left: 0,
              background: 'var(--colorBgContainer)',
            }"
          >
            <div class="mb-2">
              <a-button type="primary" @click="showModal(false)">
                添加
              </a-button>
              <ht-modal
                :title="isEdit ? '编辑大类' : '添加大类'"
                :mask-closable="maskClosable"
                :open="visible"
                :confirm-loading="confirmLoading"
                @ok="typeOk"
                @cancel="typeCancel"
              >
                <a-form-item
                  :label-col="{ span: 8 }"
                  :wrapper-col="{ span: 15 }"
                  label="大类名称："
                >
                  <a-input
                    v-model:value="treeName"
                    placeholder="请输入类型名称"
                  />
                </a-form-item>
              </ht-modal>
              <a-button
                class="toolBtn-bar"
                :disabled="currentId ? false : true"
                @click="showModal(true)"
              >
                编辑
              </a-button>
              <a-button
                class="toolBtn-bar"
                :disabled="currentId ? false : true"
                @click="showDelete"
              >
                删除
              </a-button>
            </div>
            <a-tree show-line :tree-data="treeData" @select="onSelect">
            </a-tree>
          </a-layout-sider>
          <a-layout :style="{ marginLeft: '240px', padding: '0px 10px', background: 'var(--colorBgContainer)' }">
            <a-layout-content
              :style="{
                background: 'var(--colorBgContainer)',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <div class="mb-2">
                <a-button type="primary" @click="(e) => addEditTable('')">
                  新增
                </a-button>
                <ht-modal
                  :title="
                    isDetail
                      ? '检测类别详情'
                      : categoryId
                        ? '编辑检测类别'
                        : '新增检测类别'
                  "
                  :mask-closable="maskClosable"
                  :open="visibleRules"
                  :confirm-loading="confirmLoadingRules"
                  @cancel="
                    () => {
                      handleCancelAddEdit()
                    }
                  "
                >
                  <template #footer>
                    <a-button
                      :type="isDetail ? 'primary' : 'default'"
                      @click="
                        () => {
                          handleCancelAddEdit()
                        }
                      "
                    >
                      取消
                    </a-button>
                    <a-button
                      v-show="!isDetail"
                      type="primary"
                      @click="handleOkAddEdit"
                    >
                      确定
                    </a-button>
                  </template>
                  <AddEditChild ref="AddEditChild" :callback="getData" />
                </ht-modal>
              </div>
              <a-table
                :columns="columns"
                :data-source="data"
                row-key="id"
                :pagination="pagination"
                :row-class-name="rowClassName"
                :custom-row="customRow"
                :loading="loading"
              >
                <template #bodyCell="{ column, record, text }">
                  <template v-if="column.dataIndex === 'name'">
                    <a href="javascript:">{{ text }}</a>
                  </template>

                  <template v-if="column.dataIndex === 'operation'">
                    <div class="editable-row-operations">
                      <a-button type="link" size="small" @click="(e) => addEditTable(record)">
                        修改
                      </a-button>
                      <a-popconfirm
                        title="确定要删除吗?"
                        @confirm="() => cancelTable(record)"
                      >
                        <a-button type="link" size="small" danger>
                          删除
                        </a-button>
                      </a-popconfirm>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>
  </div>
</template>

<script>
import AddEditChild from '../addEdit/index.vue'

const columns = [
  { title: '类型名称', dataIndex: 'name' },
  { title: '检验类别全称', dataIndex: 'fullName' },
  { title: '标准类别名称', dataIndex: 'standardType' },
  {
    title: '是否收费',
    dataIndex: 'isCharge',
    customRender: ({ text }) => (text === '1' ? '√' : '×'),
  },
  {
    title: '是否默认类型',
    dataIndex: 'isDefault',
    customRender: ({ text }) => (text === '1' ? '√' : '×'),
  },
  {
    title: '适用范围',
    dataIndex: 'scopeOfApp',
    customRender: ({ text }) =>
      text === '1' ? '现场检测' : text === '2' ? '非现场检测' : '全部',
  },
  { title: '添加时间', dataIndex: 'createDate' },
  { title: '备注', dataIndex: 'remark' },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 120,
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  name: 'List',
  components: {
    AddEditChild,
  },
  data() {
    return {
      columns,
      queryParams: {},
      treeName: '',
      pid: '',
      currentId: '',
      treeRowName: '',
      isEdit: false, // 是否编辑大类
      visible: false,
      isDisabledEdit: false,
      confirmLoading: false,
      maskClosable: false,
      treeData: [],
      data: [],
      totals: 0,
      visibleRules: false,
      confirmLoadingRules: false,
      categoryId: '', // 检测类别id
      isDetail: false,
      executeDate: '',
      pages: 1,
      pageSize: 10,
      pagination: {
        current: 1,
        pageSize: 10,
        ...window.pageConfig,
        onShowSizeChange: (current, pageSize) => {
          this.pageSize = pageSize
          this.pages = 1
          this.selectedRowKeys = this.selectedRows = []
          this.getData()
        },
        onChange: (page) => {
          this.pages = page
          this.selectedRowKeys = this.selectedRows = []
          this.getData()
        },
        total: 0, // 总条数
      },
      spinning: false,
      loading: false,
      selectedRowKeys: [],
      selectedRows: [], // 选中的行
      customRow: () => {
        return {
          onClick: () => {},
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys, selectedRows } = this
      return {
        selectedRowKeys,
        selectedRows,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
    this.getTreeData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(isEdit) {
      if (isEdit && !this.currentId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要编辑的数据'))
        return
      }
      this.isEdit = isEdit
      this.treeName = this.isEdit ? this.treeRowName : ''
      this.visible = true
    },
    typeOk() {
      // 大类新增编辑
      this.confirmLoading = true
      let data = {}
      let method = 'POST'
      if (this.isEdit) {
        method = 'PUT'
        data = {
          id: this.currentId,
          name: this.treeName,
          pid: this.pid,
        }
      }
      else {
        data = {
          name: this.treeName,
          pid: this.currentId,
        }
      }

      !data.pid && delete data.pid
      window.$oAjax({
        url: window.$oApi.testCategory.addUpdateCategory,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 21000 || res.code === 22000) {
          this.getTreeData()
          this.visible = false
          window.$oAntdMessage.success('操作成功')
          this.treeRowName = this.treeName
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    typeCancel() {
      this.visible = false
    },
    handleCancelAddEdit() {
      this.visibleRules = false
      this.$refs.AddEditChild.resetForm()
    },
    handleOkAddEdit() {
      this.$refs.AddEditChild.handleSubmit()
    },
    showDelete() {
      if (this.currentId) {
        window.$oAntdConfirm({
          title: '提示',
          content: '大类下的检测类别也将一并删除，是否继续？',
          onOk: () => {
            window.$oAjax({
              url: `${window.$oApi.testCategory.delCategory}/${this.currentId}`,
              method: 'DELETE',
            }).then((res) => {
              if (res.code === 23000) {
                this.currentId = ''
                this.visible = false
                this.confirmLoading = false
                this.queryParams = {}
                this.getTreeData()
                this.getData()
                window.$oAntdMessage.success('操作成功')
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
          },
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择类型'))
      }
    },
    addEditTable(record) {
      if (record) {
        this.categoryId = record.id
        this.visibleRules = true
        window.$oNextTick(() => {
          this.$refs.AddEditChild.showModal(record.categoryId, record, false)
        })
      }
      else {
        if (this.currentId) {
          this.visibleRules = true
          this.categoryId = ''
          window.$oNextTick(() => {
            this.$refs.AddEditChild.showModal(this.currentId, '', false)
          })
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择大类'))
        }
      }
      this.isDetail = false
    },
    cancelTable(record) {
      window.$oAjax({
        url: window.$oApi.testCategory.doDelInspects,
        method: 'POST',
        data: window.$oQs.stringify({ id: record.id }),
      }).then((res) => {
        if (res.success) {
          this.getData()
        }
      })
    },
    getData() {
      this.visibleRules = false
      const data = {
        // page: this.pages || 1,
        // rows: this.pageSize || 10,
      }
      this.loading = true
      window.$oAjax({
        method: 'get',
        url: window.$oApi.testCategory.getInspects,
        params: { ...data, ...this.queryParams },
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data
          this.pagination.total = res.data.length
          this.pagination.current = this.pages
          this.pagination.pageSize = this.pageSize
          this.categoryId = ''
        }
        else if (res.msg) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.loading = false
      })
    },
    getTreeData() {
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.testCategory.getCategories,
      }).then((res) => {
        if (res.code === 20000) {
          this.treeData = this.renderTreeNodes(res.data)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    renderTreeNodes(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.renderTreeNodes(data[i].children)
        }
        const obj = {
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          key: data[i].id,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    onSelect(selectedKeys, info) {
      if (info.selected) {
        this.currentId = selectedKeys[0]
        const treeRow = info.selectedNodes[0]
        if (treeRow.sourceType === '1') {
          this.isDisabledEdit = true
        }
        else {
          this.isDisabledEdit = false
        }
        this.treeRowName = treeRow.name
        this.pid = treeRow.pid
        this.queryParams = { categoryId: this.currentId }
        this.pages = 1
      }
      else {
        this.pid = this.treeRowName = this.currentId = ''
        this.queryParams = {}
      }
      this.getData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
