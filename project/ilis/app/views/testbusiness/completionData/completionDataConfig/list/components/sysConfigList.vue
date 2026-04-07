<template>
  <div>
    <ht-modal
      :title="title"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="80%"
      @cancel="handleCancel"
    >
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
      <div style="display: none">
        <a-input
          v-model:value="reportCode"
          placeholder="输入工程项目名称或项目编号回车即可查询"
          class="contractTestReport-search-all"
          @press-enter="searchFun"
        />
        <a-button @click="searchFun">
          查询
        </a-button>
      </div>
      <div v-if="!isSel" style="padding: 10px 0">
        <a-button type="primary" @click="addEditRow">
          新增
        </a-button>
      </div>
      <a-table
        :row-selection="rowSelection"
        :columns="columns"
        :pagination="data.length > 0 ? pagination : false"
        :data-source="data"
        :loading="loading"
        bordered
        :custom-row="customRow"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="table-handle">
              <a v-if="!isSel" @click="(e) => deleteRow(e, record)">删除</a>
              <a v-if="!isSel" @click="(e) => addEditRow(e, record)">编辑</a>
              <a @click="(e) => addEditRow(e, record, true)">详情</a>
            </div>
          </template>
        </template>
      </a-table>
    </ht-modal>
    <AddSysconfig ref="AddSysconfig" :callback="getData" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import AddSysconfig from './addSysconfig.vue'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '根路径',
    dataIndex: 'basePath',
  },
  {
    title: '目录',
    dataIndex: 'menuUri',
  },
  {
    title: '文件目录',
    dataIndex: 'documentUri',
  },
  {
    title: 'handler',
    dataIndex: 'handler',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddSysconfig,
  },
  props: ['callback'],
  data() {
    return {
      dayjs,
      visible: false,
      data: [],
      columns,
      loading: false,
      isDetail: false,
      isSel: false,
      reportCode: '',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      queryParam: null,
      page: 1,
      size: 10,
      title: '系统配置',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    searchFun() {
      this.queryParam = {
        reportCode: this.reportCode,
      }
      this.getData(true)
    },
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      if (!this.isSel) {
        this.selectedRowKeys = []
        this.selectedRows = []
      }
      const { page, size } = this
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.completionDataConfig.listSystemProfile,
        method: 'GET',
        params,
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.data = res.data
          this.pagination.total = res.data.length || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
        this.loading = false
      })
    },
    deleteRow(e, record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'DELETE',
            url: `${window.$oApi.completionDataConfig.delSystemProfile}/${record.id}`,
          }).then((res) => {
            if (res.code && res.code === 23000) {
              this.page = 1
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        },
      })
    },
    addEditRow(e, record, isDetail) {
      isDetail = !!isDetail
      this.$refs.AddSysconfig.showModal(record, isDetail)
    },
    showModal(isDetail, isSel, selectedRowKeys) {
      this.isDetail = isDetail
      this.isSel = isSel
      if (isSel) {
        this.title = '选择系统配置信息'
        this.selectedRowKeys = selectedRowKeys
      }
      this.getData()
      this.visible = true
    },
    handleOk() {
      this.handleCancel()
      this.callback(this.selectedRows)
    },
    handleCancel() {
      this.dataObj = null
      this.script = ''
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
