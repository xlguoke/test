<template>
  <div class="projectManageList">
    <div class="projectManageList-btn">
      <a-button type="primary" @click="openImportPersonnel">
        导入
      </a-button>
      <a-button @click="delPersonnel">
        删除
      </a-button>
    </div>
    <!-- 主table -->
    <a-table
      :row-selection="rowRecipientSelection"
      :custom-row="customRecipientRow"
      :columns="tableColumns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'systemUserType'">
          <span>
            {{ text == 1 ? '业务类账户' : '管理类账户' }}
          </span>
        </template>
      </template>
    </a-table>

    <ht-modal
      v-model:open="userTableVisible"
      title="选择人员"
      width="850px"
      @ok="importPersonnelFun"
    >
      <a-table
        :row-selection="rowSelection"
        :custom-row="customRow"
        :columns="userTableColumns"
        :scroll="{ y: 440 }"
        :data-source="userTableData"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'type'">
            <span>
              {{ text == 1 ? '业务类账户' : '管理类账户' }}
            </span>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <span v-if="text == 1"> 激活 </span>
            <span v-else-if="text == 0"> 未激活 </span>
            <span v-else> 管理员 </span>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'

const tableColumns = [
  {
    title: '用户账号',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '用户名称',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '账户类型',
    dataIndex: 'systemUserType',
    key: 'systemUserType',
    scopedSlots: { customRender: 'systemUserType' },
  },
  {
    title: '部门',
    dataIndex: 'departname',
    key: 'departname',
  },
  {
    title: '联系方式',
    dataIndex: 'telephone',
    key: 'telephone',
  },
]
const userTableColumns = [
  {
    title: '用户账号',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '用户名称',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '账户类型',
    dataIndex: 'type',
    key: 'type',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '部门',
    dataIndex: 'userOrgList.tsDepart.departname',
    key: 'userOrgList.tsDepart.departname',
  },
  {
    title: '角色',
    dataIndex: 'userKey',
    key: 'userKey',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    scopedSlots: { customRender: 'status' },
  },
]

export default {
  components: {},
  data() {
    return {
      selectedRecipientRowKeys: [],
      selectedRecipientRows: [],
      userTableVisible: false,
      tableData: [],
      tableColumns,
      userTableColumns,
      userTableData: [],
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      queryParam: '',
      loading: false,
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
      customRow: (record) => {
        return {
          onClick: () => {
            const isadd = this.selectedRowKeys.find((item) => {
              return item == record.id
            })
            if (!isadd) {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
      customRecipientRow: (record) => {
        return {
          on: {
            click: () => {
              const isadd = this.selectedRecipientRowKeys.find((item) => {
                return item == record.id
              })
              if (!isadd) {
                this.selectedRecipientRowKeys.push(record.id)
                this.selectedRecipientRows.push(record)
              }
            },
          },
        }
      },
    }
  },
  computed: {
    rowRecipientSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRecipientRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRecipientRowKeys = selectedRowKeys
          this.selectedRecipientRows = selectedRows
        },
      }
    },

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
  created() {
    this.getUserList()
    this.getData()
  },
  methods: {
    openImportPersonnel() {
      this.userTableVisible = true
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 获取所有用户
    getUserList() {
      window.$oAjax
        .post(
          'userController.do?datagrid&field=id,userName,realName,type,TSDepart_id,userOrgList.tsDepart.departname,userKey,createBy,createDate,updateBy,updateDate,status,deleteFlag',
          qs.stringify({ rows: 9999, page: 1 }),
        )
        .then((res) => {
          if (res.rows.length) {
            this.userTableData = res.rows
          }
        })
    },
    // 导入人员
    importPersonnelFun() {
      this.userTableVisible = false
      const ids = this.selectedRows.map((item) => {
        return item.id
      })
      window.$oAjax({
        method: 'post',
        url: `rest/unqualifiedUser/internal/import`,
        data: ids,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    // 删除人员
    delPersonnel() {
      if (!this.selectedRecipientRows.length) {
        window.$oAntdMessage.warning('请至少选中一条数据')
        return
      }
      const ids = this.selectedRecipientRows.map((item) => {
        return item.id
      })
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'delete',
            url: `rest/unqualifiedUser`,
            data: ids,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 20000) {
              this.getData()
              window.$oAntdMessage.success('操作成功')
            }
          })
        },
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    getData() {
      const { page, size } = this
      this.loading = true

      const params = {
        page,
        size,
        // queryParam,
      }

      window.$oRest
        .get('rest/unqualifiedUser/internal/page', { params })
        .then((res) => {
          if (res && res.data) {
            this.tableData = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
        })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style lang="less">
tr.ant-table-expanded-row td > .ant-table-wrapper {
  margin: 0px;
}

.ant-radio-group {
  width: 400px;
  text-align: left;
}

.projectManageList-input label {
  display: inline !important;
}

.projectManageList-input {
  display: flex;
  margin-bottom: 8px;

  label {
    text-align: right;
    display: block;
    padding-right: 8px;
    line-height: 28px;
  }

  .ant-calendar-picker,
  .ant-select,
  .ant-input {
    width: 340px;
  }
}
</style>
