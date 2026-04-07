<template>
  <div style="padding: 10px">
    <a-row style="margin: 8px 0px" class="search-header">
      <a-col :span="20">
        <a-input
          v-model:value="quickQry"
          placeholder="输入规程名称/颁布号后回车即可查询"
          style="width: 240px"
          @press-enter="quickSearch"
        />
        <a-button type="primary" class="ml-2" @click="quickSearch()">
          查询
        </a-button>
      </a-col>
    </a-row>

    <div style="margin: 8px 0px">
      <a-button type="primary" @click="editPurchaseRequest(false, false)">
        新增采购申请
      </a-button>
    </div>
    <!-- 删除变量 :rowClassName="rowClassName" -->
    <a-table
      :bordered="true"
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="standardData"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @change="sorterChange"
    >
      <template #expandedRowRender="{ record }">
        <p class="my-2">
          <a-table
            :columns="expandedColumns"
            :data-source="record.standardBookPurchaseDetailVos"
            row-key="id"
            bordered
            :loading="loading"
            :pagination="false"
          >
          </a-table>
        </p>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <div class="table-handle">
            <a
              v-if="'填写中,审核未通过'.includes(record.status)"
              href="javascript:;"
              @click="editPurchaseRequest(record, false)"
            >
              &nbsp;编辑
            </a>
            <a
              v-if="'填写中,审核未通过'.includes(record.status)"
              href="javascript:;"
              @click="sumbitData(record)"
            >
              &nbsp;提交
            </a>
            <a href="javascript:;" @click="editPurchaseRequest(record, true)">
              &nbsp;详情
            </a>
            <a
              v-if="'审核中'.includes(record.status)"
              href="javascript:;"
              @click="withdraw(record)"
            >
              &nbsp;撤回
            </a>
            <a
              v-if="'填写中,审核未通过'.includes(record.status)"
              href="javascript:;"
              style="color: red"
              @click="delBooks(record)"
            >
              &nbsp;删除
            </a>
            <a @click="(e) => viewLog(e, record)"> &nbsp;日志</a>
          </div>
        </template>
      </template>
    </a-table>
    <SubmitPage ref="SubmitPage" :callback="getSubmit" />

    <AddEditComponent ref="addBookRef" :callback="handleOkAddEditCall" />

    <Logs ref="Logs" />
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import { ajaxRequest, downloadAccessory } from '~/providers/common/utils.js'
import SubmitPage from '~/providers/components/equip/submitPage.vue'

import UploadComponent from '~/providers/components/uploadComponent.vue'
import AddEditComponent from './components/addEdit.vue'
import Logs from './components/logs.vue'

const columns = [
  {
    title: ' 申请人',
    dataIndex: 'applyPerson',
  },
  {
    title: '填写时间',
    dataIndex: 'createDate',
    sorter: true,
    customRender: ({ text }) =>
      text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '',
  },
  {
    title: '总金额',
    dataIndex: 'totalAll',
  },
  {
    title: '申请说明',
    dataIndex: 'explains',
  },
  { title: '申请状态', dataIndex: 'status' },
  {
    title: '操作',
    dataIndex: 'options',
    scopedSlots: { customRender: 'options' },
    align: 'center',
    width: '220px',
  },
]
const expandedColumns = [
  {
    title: '规程名称',
    dataIndex: 'bookName',
  },
  {
    title: '颁布号',
    dataIndex: 'publishCode',
  },
  {
    title: '单价/元',
    dataIndex: 'price',
  },
  {
    title: '数量',
    dataIndex: 'amount',
  },
  {
    title: '小计',
    dataIndex: 'total',
  },
  {
    title: '原因及用途',
    dataIndex: 'purpose',
  },
]
export default {
  name: 'List',
  components: {
    AddEditComponent,
    // eslint-disable-next-line vue/no-unused-components
    UploadComponent,
    Logs,
    SubmitPage,
  },
  data() {
    return {
      sorter: {},
      standardData: [],
      quickQry: '',
      selectedRows: [],
      selectedKeys: [],
      columns,
      expandedColumns,
      standardVisible: false,
      queryParam: '',
      order: '',
      typeName: '',
      isEdit: false,
      visible: false,
      confirmLoading: false,
      groupSel: [],
      treeData: [],
      data: [],
      totals: 0,
      selectedRowKeys: [],
      page: 1,
      size: 10,
      pagination: {
        ...window.pageConfig,
        current: 1,
        total: 0,
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
      loading: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  beforeCreate() {
    // 如果有id直接跳转到详情页，用于通用审核查看详情
    if (getQueryVariable('standardBookPurchaseId')) {
      this.$router.push({ name: 'details' })
    }
  },
  created() {
    this.getData()
  },
  methods: {
    withdraw(row) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '撤回采购计划的申请，是否继续?',
        cancelText: '取消',
        okText: '确定',
        onOk() {
          window.$oAjax
            .get('rest/standardBookPurchaseController?revokeProcess', {
              params: {
                businessKey: row.id,
              },
            })
            .then((res) => {
              if (res.code === 20000) {
                self.selTreeLocation = {}
                self.visible = false
                self.confirmLoading = false
                self.getData()
                window.$oAntdMessage.success(res.msg || '操作成功！')
              }
              else {
                window.$oAntdMessage.error(res.message || res.msg)
              }
            })
        },
        onCancel() {},
      })
    },
    sumbitData(record) {
      this.$refs.SubmitPage.showModal(record, '190')
    },
    getSubmit(data) {
      window.$oAjax({
        method: 'POST',
        url: 'rest/standardBookPurchaseController?submitBookPurchaseAuditProcess',
        data: qs.stringify(data),
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.$refs.SubmitPage.handleCancel()
          this.getData()
        }
        else {
          this.$refs.SubmitPage.spinning = false
          this.$refs.SubmitPage.confirmLoading = false
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },

    ajaxRequest,
    downloadAccessory,
    expiredFun() {},
    // showModal(isEdit) {
    //   this.isEdit = isEdit;
    //   this.typeName = isEdit ? this.groupSel[0].typeName : "";
    //   this.visible = true;
    // },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id)
    },

    giveBackRow(row) {
      this.$refs.giveBackRef.showModal(row)
    },

    delBooksRow(row) {
      this.selectedRowKeys = [row.id]
      this.selectedRows = [row]
      this.delBooks()
    },
    editPurchaseRequest(row, isDetail = false) {
      this.$refs.addBookRef.showModal(row, isDetail)
    },
    // editPurchaseRequestRow(row) {
    //   this.selectedRowKeys = [row.id];
    //   this.selectedRows = [row];

    //
    //
    //
    //   this.editPurchaseRequest(true);
    // },

    typeCancel() {
      this.visible = false
    },

    delBooks(row) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确认删除?',
        cancelText: '取消',
        okText: '确定',
        onOk() {
          // eslint-disable-next-line unused-imports/no-unused-vars
          const data = {
            ids: self.selectedRowKeys.join(','),
          }
          window.$oAjax
            .get('rest/standardBookPurchaseController?del', {
              params: {
                bookPurchaseId: row.id,
              },
            })
            .then((res) => {
              if (res.code === 20000) {
                self.selTreeLocation = {}
                self.visible = false
                self.confirmLoading = false
                self.getData()
                window.$oAntdMessage.success(res.msg || '删除成功！')
              }
              else {
                window.$oAntdMessage.error(res.message || res.msg)
              }
            })
        },
        onCancel() {},
      })
    },

    handleOkAddEditCall() {
      this.getData()
    },
    editTable() {
      this.$refs.addBookRef.showModal()
    },

    cancelTableCall(res) {
      if (res.success) {
        this.getData()
      }
    },
    getData() {
      const { page, size } = this
      const data = {
        quickQry: this.quickQry,
        page,
        size,
        ...this.sorter,
      }
      // eslint-disable-next-line ts/no-unused-expressions
      this.sort ? (data[this.sort] = this.order) : ''
      this.loading = true
      window.$oAjax
        .get('rest/standardBookPurchaseController?dataGrid', {
          params: {
            ...data,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            this.standardData = res.data.rows
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
        })
    },

    quickSearch() {
      // 快速查询
      this.getData()
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        this.sorter.orderBy = sorter.field
        if (sorter.order === 'descend') {
          this.sorter.order = 'desc'
        }
        else if (sorter.order === 'ascend') {
          this.sorter.order = 'asc'
        }
        else {
          this.sorter.order = ''
          this.sorter.orderBy = ''
        }
        this.getData()
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.required label::before {
  content: '*';
  color: red;
}
</style>
