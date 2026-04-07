<template>
  <div class="archiving hitek-height-full">
    <a-spin :spinning="spinning" class="hitek-height-full">
      <div class="spin-content hitek-height-full">
        <a-layout class="hitek-height-full">
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
                borderRight: '1px solid var(--colorSplit)',
              }"
            >
              <div>
                <div>
                  <a-button

                    v-permission="'documentGroupManage'"
                    type="primary"
                    @click="showModal(false)"
                  >
                    添加
                  </a-button>
                  <ht-modal
                    :title="isEdit ? '编辑类型名称' : '添加类型名称'"
                    :mask-closable="false"
                    :open="visible"
                    :confirm-loading="confirmLoading"
                    @ok="typeOk"
                    @cancel="typeCancel"
                  >
                    <a-form-item
                      :label-col="{ span: 6 }"
                      :wrapper-col="{ span: 17 }"
                      label="请输入类型名称："
                    >
                      <a-input
                        v-model:value="editgroupName"
                        placeholder="请输入"
                      />
                    </a-form-item>
                  </ht-modal>
                  <a-button

                    v-permission="'documentGroupManage'"
                    type="primary"
                    @click="showModal(true)"
                  >
                    编辑
                  </a-button>
                  <a-button

                    v-permission="'documentGroupManage'"
                    type="primary"
                    @click="showDelete"
                  >
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
                  <div v-if="allSearch">
                    <a-form ref="formRef" :model="formState">
                      <a-form-item
                        label="归档名称"
                        :label-col="labelCol"
                        :wrapper-col="wrapperCol"
                      >
                        <a-input v-model:value="formState.name" placeholder="请输入" />
                      </a-form-item>
                      <a-form-item
                        label="状态"
                        :label-col="labelCol"
                        :wrapper-col="wrapperCol"
                      >
                        <a-select v-model:value="formState.status" placeholder="请选择">
                          <a-select-option value="undefined">
                            全部
                          </a-select-option>
                          <a-select-option
                            v-for="(item, index) in statusData"
                            :key="index"
                            :value="item.value"
                          >
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                      <a-form-item
                        label="部门"
                        :label-col="labelCol"
                        :wrapper-col="wrapperCol"
                      >
                        <a-input
                          v-model:value="formState.depart"
                          placeholder="请输入"
                        />
                      </a-form-item>
                      <a-form-item
                        label="负责人名称"
                        :label-col="labelCol"
                        :wrapper-col="wrapperCol"
                      >
                        <a-input
                          v-model:value="formState.dutyPerson"
                          placeholder="请输入"
                        />
                      </a-form-item>
                      <a-form-item :wrapper-col="{ span: 20, offset: 2 }">
                        <a-button @click="searchFun">
                          查询
                        </a-button>
                        <a-button
                          @click="
                            () => {
                              searchType(false)
                            }
                          "
                        >
                          切换普通查询
                        </a-button>
                        <a-button @click="resetForm">
                          重置
                        </a-button>
                      </a-form-item>
                    </a-form>
                  </div>
                  <div v-else>
                    <a-input
                      v-model:value="textName"
                      placeholder="输入归档名称后回车即可查询"
                      class="dataCollection-search-all"
                      @press-enter="searchFun"
                    />
                    <a-button @click="searchFun">
                      查询
                    </a-button>
                    <a-button
                      @click="
                        () => {
                          searchType(true)
                        }
                      "
                    >
                      切换高级查询
                    </a-button>
                  </div>
                  <div style="padding-top: 10px">
                    <a-button

                      v-permission="'saveDocument'"
                      @click="addEditRow"
                    >
                      新增
                    </a-button>
                    <a-button

                      v-permission="'delDocument'"
                      @click="deleteRow"
                    >
                      删除
                    </a-button>
                    <a-button

                      v-permission="'completeDocument'"
                      @click="completeArchive"
                    >
                      完成归档
                    </a-button>
                    <a-button

                      v-permission="'downloadDocument'"
                      @click="downloadRow"
                    >
                      下载归档资料
                    </a-button>
                    <a-button

                      v-permission="'documentTemplateManage'"
                      @click="setCfigArchive"
                    >
                      档案结构模板配置
                    </a-button>
                  </div>
                </div>
                <a-table
                  :row-selection="rowSelection"
                  :columns="columns"
                  :data-source="data"
                  row-key="id"
                  :pagination="pagination"
                  :custom-row="customRow"
                  :row-class-name="rowClassName"
                >
                  <template #bodyCell="{ column, record, text }">
                    <template v-if="column.dataIndex === 'name'">
                      <a href="javascript:;">{{ text }}</a>
                    </template>
                    <template v-if="column.dataIndex === 'operation'">
                      <div class="table-handle">
                        <a v-permission="'saveDocument'" class="text-blue-500" @click="(e) => addEditRow(e, record)">编辑</a>
                        <a class="text-blue-500" @click="(e) => addEditRow(e, record, true)">详情</a>
                        <a class="text-blue-500" @click="(e) => openTab(e, record)">打开</a>
                      </div>
                    </template>
                  </template>
                </a-table>
                <AddEditComponent ref="AddEdit" :callback="getData" />
                <ConfigArchive ref="ConfigArchive" :callback="getData" />
              </a-layout-content>
            </a-layout>
          </a-layout>
        </a-layout>
      </div>
    </a-spin>
  </div>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import dayjs from 'dayjs'
import AddEditComponent from './components/addEdit.vue'
import ConfigArchive from './components/configArchive.vue'
import qs from 'qs'

const columns = [
  { title: '归档名称', dataIndex: 'name', width: '30%' },
  {
    title: '状态',
    dataIndex: 'status',
    customRender: ({ text }) => {
      let obj = { 0: '进行中', 1: '已完成' }
      return text ? obj[text] : ''
    },
  },
  { title: '部门', dataIndex: 'departs' },
  { title: '创建人', dataIndex: 'createName' },
  { title: '归档负责人', dataIndex: 'dutyPersons' },
  { title: '归档参与人', dataIndex: 'players' },
  {
    title: '操作',
    dataIndex: 'operation',
    minWidth: 80,
  },
]
export default {
  name: 'list',
  data() {
    return {
      columns,
      
      labelCol: { span: 2 },
      wrapperCol: { span: 10 },
      statusData: [
        { name: '进行中', value: '0' },
        { name: '已完成', value: '1' },
      ],
      allSearch: false,
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
      formState: {},
      // fileList:[],
      spinning: false,
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              let arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex((item) => item === record.id),
                1
              )
              this.selectedRows = this.selectedRows.filter(
                (item) => item.id !== record.id
              )
            } else {
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
  components: {
    AddEditComponent,
    ConfigArchive,
  },
  created() {
    this.getTreeData()
  },
  computed: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1) className = 'dark-row'
      return className
    },
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
  methods: {
    // 保存分组
    typeOk(e) {
      this.confirmLoading = true
      let data = {}
      if (this.isEdit) {
        data = {
          id: this.groupSel[0].id,
          pid: this.groupSel[0].pid,
          name: this.editgroupName,
        }
      } else {
        data = {
          name: this.editgroupName,
          pid: this.groupSel.length > 0 ? this.groupSel[0].id : '',
        }
      }
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.archiving.saveGroup,
        data: qs.stringify(data),
      }).then((res) => {
        this.visible = false
        this.confirmLoading = false
        if (res.code === 20000) {
          this.getTreeData()
        } else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    typeCancel(e) {
      this.visible = false
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.selectedRowKeys = []
      this.selectedRows = []
      if (info.selected) {
        let treeRow = info.selectedNodes[0]
        this.pages = 1
        this.groupSel = [{ ...treeRow }]
        this.getData()
      } else {
        this.groupSel = []
      }
    },
    renderTreeNodes(data, defaultChecke) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.renderTreeNodes(data[i].children, false)
        }
        if (0 === i && defaultChecke) {
          if (this.groupSel.length > 0) {
            this.selectedKeys.push(this.groupSel[0].id)
          } else {
            this.groupSel = [{ ...data[i] }]
            this.selectedKeys.push(data[i].id)
          }
          this.getData()
        }
        let obj = {
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
        url: window.$oApi.archiving.getAll,
        params: {
          ...data,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.selectedKeys = []
          this.isShowTree = false
          this.treeData = this.renderTreeNodes(res.data, true)
        } else {
          this.treeData = []
          this.isShowTree = true
        }
      })
    },
    getData() {
      let { page, size } = this
      let data
      if (this.groupSel.length > 0) {
        data = {
          groupId: this.groupSel[0].id,
        }
      }
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.archiving.list, {
          params: {
            page,
            rows: size,
            ...data,
            ...this.queryParam,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows
            this.pagination.pageSize = size
            this.pagination.current = page
            this.pagination.total = res.data.count
          } else {
            this.data = []
            this.selectedRowKeys = []
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
    },
    resetForm() {
      this.page = 1
      this.formState = {};
      this.textName = ''
      this.queryParam = null
      this.getData()
    },
    searchFun() {
      this.page = 1
      if (this.allSearch) {
        this.$refs.formRef.validateFields().then(() => {
          const values = this.formState;
          let data = {
            ...values,
          }
          if (values.stamp) {
            data.nodeDate = dayjs(values.stamp).format('YYYY-MM-DD')
          }
          if (data.status === 'undefined') {
            delete data.status
          }
          delete data.stamp
          this.queryParam = data
          this.getData()
        })
      } else {
        this.queryParam = { quickQryParam: this.textName }
        this.getData()
      }
    },
    // 切换搜索类型
    searchType: function (bool) {
      this.allSearch = bool
    },
    showModal(isEdit) {
      this.isEdit = isEdit
      this.editgroupName = isEdit ? this.groupSel[0].name : ''
      this.visible = true
    },
    // 删除分组
    showDelete() {
      let self = this
      if (this.groupSel[0].id) {
        window.$oAntdConfirm({
          title: '提示',
          content: '确定要删除吗?',
          onOk() {
            window.$oAjax({
                method: 'get',
                url: window.$oApi.archiving.delGroup,
                params: {
                  groupId: self.groupSel[0].id,
                },
              })
              .then((res) => {
                if (res.code === 20000) {
                  self.groupSel = []
                  self.visible = false
                  self.confirmLoading = false
                  self.getTreeData()
                } else {
                  window.$oAntdMessage.error(res.msg || res.message)
                }
              })
          },
          onCancel() {},
        })
      } else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配'))
      }
    },
    addEditRow(e, record, isDetail) {
      e.stopPropagation()
      e.preventDefault()
      if (this.groupSel.length > 0) {
        let recordId = record ? record.id : ''
        this.$refs.AddEdit.showModal(this.groupSel[0].id, recordId, isDetail)
      } else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择目录'))
      }
    },
    setCfigArchive() {
      this.$refs.ConfigArchive.showModal()
    },
    downloadRow() {
      window.$oAjax({
        url: window.$oApi.archiving.downloadData,
        params: {
          id: this.selectedRowKeys.join(','),
        },
        timeout: 30 * 1000, //通过timeout属性，设置超时时间
      })
        .then((res) => {
          if (res.code === 20000) {
            for (let i = 0; i < res.data.length; i++) {
              setTimeout(() => {
                window.open(res.data[i], '_self')
              }, i * 1000)
            }
          } else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch((err) => {
          if (err.message.includes('timeout')) {
            let msgStr =
              '要下载的文件可能较大,服务器正在压缩中,压缩完成后将通过系统消息通知您.请注意该消息并从其中获取下载地址'
            window.$oAntdModal.warning(window.$oMsgTips.info(msgStr))
          }
        })
    },
    completeArchive() {
      window.$oAjax({
        url: window.$oApi.archiving.complete,
        params: {
          id: this.selectedRowKeys.join(','),
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.getData()
        } else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    deleteRow() {
      if (this.selectedRowKeys.length > 0) {
        var self = this
        window.$oAntdConfirm({
          title: '提示',
          content: '确定要删除吗?',
          onOk() {
            let data = {
              id: self.selectedRowKeys.join(','),
            }
            window.$oAjax
              .get(window.$oApi.archiving.delDocument, {
                params: {
                  ...data,
                },
              })
              .then((res) => {
                if (res.code === 20000) {
                  self.selectedRowKeys = []
                  self.getData()
                } else {
                  window.$oAntdMessage.error(res.message || res.msg)
                }
              })
          },
        })
      } else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
      }
    },
    openTab(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // let newName = data.name ? encodeURI(data.name.replace("#", "_jinghao")) : "";
      // let newDescription = data.description ? encodeURI(data.description.replace("#", "_jinghao")) : "";
      top.addTabs &&
        top.addTabs({
          id: record.id,
          title: '资料归档详情',
          close: false,
          url: `documentController.do?goDocumentDetail&documentId=${record.id}`,
        })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
