<template>
  <div class="archiving hitek-height-full">
    <a-spin :spinning="spinning" class="hitek-height-full">
      <div class="spin-content hitek-height-full">
        <a-layout class="hitek-height-full" :style="{ background: 'var(--colorBgContainer)' }">
          <a-layout :style="{ background: 'var(--colorBgContainer)' }">
            <a-layout-sider
              width="320"
              :style="{
                overflow: 'auto',
                padding: '10px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                background: 'var(--colorBgContainer)',
              }"
            >
              <div>
                <div>
                  <a-button type="primary" @click="showModal(false)">
                    添加
                  </a-button>
                  <ht-modal
                    :title="isEdit ? '编辑台账大类名称' : '添加台账大类名称'"
                    :mask-closable="false"
                    :open="visible"
                    :confirm-loading="confirmLoading"
                    @ok="typeOk"
                    @cancel="typeCancel"
                  >
                    <!-- <a-form-item  :label-col="{ span:6 }" :wrapper-col="{ span: 17 }" label="台账大类名称：" > -->
                    <!-- <a-input placeholder="请输入"  v-model="editgroupName"/> -->
                    <!-- </a-form-item> -->
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label hitek-form-lable">
                        台账大类名称
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-input
                            v-model:value="editgroupName"
                            placeholder="请输入"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </ht-modal>
                  <a-button type="primary" @click="showModal(true)">
                    编辑
                  </a-button>
                  <a-button type="primary" @click="showDelete">
                    删除
                  </a-button>
                </div>
              </div>
              <a-tree
                show-line
                :tree-data="treeData"
                :selected-keys="selectedKeys"
                @select="onSelect"
              ></a-tree>
              <p v-if="isShowTree">
                暂无数据
              </p>
            </a-layout-sider>
            <a-layout :style="{ marginLeft: '320px', padding: '0px 10px', background: 'var(--colorBgContainer)' }">
              <a-layout-content
                :style="{
                  background: 'var(--colorBgContainer)',
                  padding: '10px',
                  margin: 0,
                  minHeight: '280px',
                  overflow: 'initial',
                }"
              >
                <div class="dataCollection-search">
                  <div>
                    <a-input
                      v-model:value="textName"
                      placeholder="输入台账名称后回车即可查询"
                      class="dataCollection-search-all"
                      @press-enter="searchFun"
                    />
                    <a-button @click="searchFun">
                      查询
                    </a-button>
                  </div>
                  <div class="btn-class">
                    <a-button @click="addEditRow">
                      新增
                    </a-button>
                    <a-button @click="deleteRow">
                      删除
                    </a-button>
                  </div>
                </div>
                <a-table
                  :row-selection="rowSelection"
                  :columns="columns"
                  :data-source="data"
                  row-key="id"
                  :pagination="data && data.length ? pagination : false"
                  :custom-row="customRow"
                  :row-class-name="rowClassName"
                >
                  <template #bodyCell="{ column, record, text }">
                    <template v-if="column.dataIndex === 'name'">
                      <a href="javascript:;">{{ text }}</a>
                    </template>

                    <template v-if="column.dataIndex === 'operation'">
                      <span class="table-handle">
                        <a @click="(e) => addEditRow(e, record.id)">编辑</a>
                        <a @click="(e) => addEditRow(e, record.id, true)">详情</a>
                      </span>
                    </template>
                  </template>
                </a-table>
              </a-layout-content>
            </a-layout>
          </a-layout>
        </a-layout>
      </div>
    </a-spin>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="addEditVisible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="800px"
      @cancel="handleCancel"
    >
      <AddEditComponent ref="AddEditComponent" :callback="getData" />
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import AddEditComponent from './components/addEdit.vue'

const columns = [
  { title: '台账名称', dataIndex: 'name', width: '30%' },
  { title: '创建人', dataIndex: 'createName' },
  {
    title: '操作',
    dataIndex: 'operation',
    minWidth: 80,
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  name: 'List',
  components: {
    AddEditComponent,
  },
  data() {
    return {
      columns,

      isDetail: false,
      addEditVisible: false,
      addEditTitle: '新增台账',
      queryParam: null,
      textName: '',
      editgroupName: '',
      selectedKeys: [],
      groupSel: [],
      isShowTree: false,
      isEdit: false, //
      visible: false,
      confirmLoading: false,
      treeData: [],
      data: [],
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
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
      // fileList:[],
      spinning: false,
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
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getTreeData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 保存分组
    typeOk() {
      if (!this.editgroupName) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入台账大类名称'))
        return
      }
      this.confirmLoading = true
      let data = {}
      let method = 'POST'
      if (this.isEdit) {
        data = {
          ...this.groupSel[0],
          name: this.editgroupName,
        }
        method = 'PUT'
      }
      else {
        data = {
          name: this.editgroupName,
          pid: this.groupSel.length > 0 ? this.groupSel[0].id : '',
        }
      }
      window.$oAjax({
        method,
        url: window.$oApi.ledgerSetting.addUpdateClass,
        data,
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        this.visible = false
        this.confirmLoading = false
        if (res.code === 21000 || res.code === 22000) {
          this.getTreeData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    typeCancel() {
      this.visible = false
    },
    showModal(isEdit) {
      this.isEdit = isEdit
      if (isEdit && this.groupSel.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账大类'))
        return
      }
      this.editgroupName = isEdit ? this.groupSel[0].name : ''
      this.visible = true
    },
    // 删除分组
    showDelete() {
      if (this.groupSel.length) {
        window.$oAntdConfirm({
          title: '提示',
          content: '确定要删除吗?',
          onOk: () => {
            window.$oAjax({
              method: 'DELETE',
              url: `${window.$oApi.ledgerSetting.delClass}/${this.groupSel[0].id}`,
            }).then((res) => {
              if (res.code === 23000) {
                this.groupSel = []
                this.visible = false
                this.confirmLoading = false
                this.getTreeData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
          },
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账大类'))
      }
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.selectedRowKeys = []
      this.selectedRows = []
      if (info.selected) {
        const treeRow = info.node.dataRef
        this.pages = 1
        this.groupSel = [{ ...treeRow }]
        this.getData()
      }
      else {
        this.groupSel = []
      }
    },
    renderTreeNodes(data, defaultChecke) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.renderTreeNodes(data[i].children, false)
        }
        if (i === 0 && defaultChecke) {
          if (this.groupSel.length > 0) {
            this.selectedKeys.push(this.groupSel[0].id)
          }
          else {
            this.groupSel = [{ ...data[i] }]
            this.selectedKeys.push(data[i].id)
          }
          this.getData()
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
    getTreeData() {
      const data = {
        page: 1,
        size: 9999,
      }
      window.$oAjax({
        url: window.$oApi.ledgerSetting.getTree,
        params: {
          ...data,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.selectedKeys = []
          this.isShowTree = false
          this.treeData = this.renderTreeNodes(res.data, true)
        }
        else {
          this.treeData = []
          this.isShowTree = true
        }
      })
    },
    getData() {
      const { page, size } = this
      this.addEditVisible = false
      let data
      if (this.groupSel.length > 0) {
        data = {
          categoryId: this.groupSel[0].id,
        }
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.ledgerSetting.getData,
        params: {
          page,
          rows: size,
          ...data,
          ...this.queryParam,
        },
      }).then((res) => {
        this.selectedRowKeys = []
        this.selectedRows = []
        if (res.code === 20000) {
          this.data = res.data
          this.pagination.pageSize = size
          this.pagination.current = page
          // this.pagination.total = res.data.count;
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    searchFun() {
      this.page = 1
      if (this.groupSel.length > 0) {
        this.queryParam = { name: this.textName }
        this.getData()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账大类'))
      }
    },
    addEditRow(e, recordId, isDetail) {
      e.stopPropagation()
      e.preventDefault()
      if (this.groupSel.length > 0) {
        this.addEditVisible = true
        recordId = recordId || ''
        this.isDetail = !!isDetail
        if (recordId) {
          this.addEditTitle = '编辑台账'
        }
        else {
          this.addEditTitle = '新增台账'
        }
        if (this.isDetail) {
          this.addEditTitle = '查看台账'
        }
        const groupObj = {
          categoryId: this.groupSel[0].id,
          category: this.groupSel[0].name,
        }
        window.$oNextTick(() => {
          // this.$refs.Add.showModal(recordId,this.isDetail)
          this.$refs.AddEditComponent.showModal(groupObj, recordId, isDetail)
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账大类'))
      }
    },
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.addEditVisible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    deleteRow() {
      if (this.selectedRowKeys.length > 0) {
        window.$oAntdConfirm({
          title: '提示',
          content: '确定要删除吗?',
          onOk: () => {
            const id = this.selectedRowKeys.join(',')
            window.$oAjax({
              method: 'DELETE',
              url: `${window.$oApi.ledgerSetting.delLedger}/${id}`,
            }).then((res) => {
              if (res.code === 23000) {
                this.getData()
              }
              else {
                window.$oAntdMessage.error(res.message || res.msg)
              }
            })
          },
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账'))
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
