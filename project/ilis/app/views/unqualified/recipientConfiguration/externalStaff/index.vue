<template>
  <div class="projectManageList">
    <div class="projectManageList-search">
      <a-input
        v-model:value="quickQryParam"
        placeholder="输入工程项目/施工单位/建设单位/建设项目后回车即可查询"
        @keyup.enter="search"
      />
      <a-button type="primary" class="ml-2" @click="search">
        查询
      </a-button>
    </div>

    <a-table
      :columns="tableColumns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => openUnitTable(e, record)">设置联系人</a>
          </span>
        </template>
      </template>
    </a-table>

    <a-drawer
      title="工程项目委托单位列表"
      width="520"
      :closable="false"
      :open="unitVisible"
      @close="onClose"
    >
      <a-table
        :columns="unitTableColumns"
        :data-source="unitTableData"
        :pagination="false"
        bordered
        :loading="loading"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a @click="(e) => openRecipientTable(e, record)">设置</a>
            </span>
          </template>
        </template>
      </a-table>

      <a-drawer
        title="消息接收人配置"
        width="620"
        :closable="false"
        :open="childrenDrawer"
        @close="onChildrenDrawerClose"
      >
        <div style="margin-bottom: 10px">
          <a-button type="primary" @click="addRecipient">
            新增
          </a-button>
          <a-button type="primary" @click="editRecipient">
            编辑
          </a-button>
          <a-button type="primary" @click="delRecipient">
            删除
          </a-button>
        </div>
        <a-table
          :row-selection="rowSelectionRecipient"
          :columns="recipientTableColumns"
          :custom-row="customRow"
          :data-source="recipientTableData"
          :pagination="false"
          bordered
          :loading="loading"
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a @click="(e) => openRecipientTable(e, record)">设置</a>
              </span>
            </template>
          </template>
        </a-table>
      </a-drawer>
    </a-drawer>

    <ht-modal
      v-model:open="addRecipientVisible"
      title="消息接收人"
      width="500px"
      @ok="checkoutPhoneRepetition"
    >
      <div style="height: 170px; overflow: auto; text-align: center">
        <div class="projectManageList-input">
          <label><span style="color: red">*</span>姓名：</label>
          <a-input
            v-model:value="recipientForm.realName"
            placeholder="请输入姓名"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>职务：</label>
          <a-input
            v-model:value="recipientForm.duty"
            placeholder="请输入职务"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label><span style="color: red">*</span>联系电话：</label>
          <a-input
            v-model:value="recipientForm.telephone"
            placeholder="请输入联系电话"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>备注：</label>
          <a-input
            v-model:value="recipientForm.remark"
            placeholder="请输入备注"
          ></a-input>
        </div>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'

const tableColumns = [
  // {
  //   title: '序号',
  //   dataIndex: 'name',
  //   key: 'name',
  // },
  {
    title: '工程项目',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
    key: 'projectCode',
  },
  {
    title: '施工单位',
    dataIndex: 'constructionUnitName',
    key: 'constructionUnitName',
  },
  {
    title: '建设单位',
    dataIndex: 'buildUnitName',
    key: 'buildUnitName',
  },
  {
    title: '建设项目',
    dataIndex: 'buildProjectName',
    key: 'buildProjectName',
  },
  {
    title: '监理单位',
    dataIndex: 'witnessUnitName',
    key: 'witnessUnitName',
  },
  {
    title: '项目地址',
    dataIndex: 'projectAddress',
    key: 'projectAddress',
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 120,
  },
]
const unitTableColumns = [
  {
    title: '委托单位名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    key: 'operation',
    width: 120,
    dataIndex: 'operation',
  },
]
const recipientTableColumns = [
  {
    title: '姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '职务',
    dataIndex: 'duty',
    key: 'duty',
  },
  {
    title: '联系电话',
    dataIndex: 'telephone',
    key: 'telephone',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
]

export default {
  components: {},
  data() {
    return {
      selectedRecipientKeys: [],
      selectedRecipientRows: [],
      addRecipientVisible: false,
      selProjectRows: {},
      selConsignUnit: {},
      recipientForm: {
        realName: '',
        duty: '',
        telephone: '',
        remark: '',
      },
      unitVisible: false,
      childrenDrawer: false,
      queryVisible: false,
      tableData: [],
      tableColumns,
      unitTableColumns,
      unitTableData: [],
      recipientTableColumns,
      recipientTableData: [],

      page: 1,
      size: 10,
      quickQryParam: '',
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
            const isadd = this.selectedRecipientKeys.find((item) => {
              return item == record.id
            })
            if (!isadd) {
              this.selectedRecipientKeys.push(record.id)
              this.selectedRecipientRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelectionRecipient() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRecipientKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRecipientKeys = selectedRowKeys
          this.selectedRecipientRows = selectedRows
        },
      }
    },
  },
  created() {
    this.initFun()
  },
  methods: {
    openUnitTable(v, row) {
      this.selProjectRows = row
      this.unitVisible = true
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        method: 'post',
        url: `projectController.do?getProjectConsignUnits`,
        data: qs.stringify({
          id: row.id,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).then((res) => {
        if (res.rows && res.rows.length) {
          that.unitTableData = res.rows
        }
      })
    },
    openRecipientTable(v, row) {
      this.selConsignUnit = row
      this.getRecipientList()
      this.childrenDrawer = true
    },

    // 获取消息接收人数据
    getRecipientList() {
      window.$oRest
        .get('rest/unqualifiedUser/external/list', {
          params: {
            projectId: this.selProjectRows.id,
            consignUnitId: this.selConsignUnit.id,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.recipientTableData = res.data
            this.loading = false
          }
        })
    },
    showChildrenDrawer() {
      this.childrenDrawer = true
    },
    onClose() {
      this.unitVisible = false
    },
    onChildrenDrawerClose() {
      this.selectedRecipientKeys = []
      this.selectedRecipientRows = []
      this.childrenDrawer = false
    },
    // 新增人员
    addRecipient() {
      this.addRecipientVisible = true
      this.recipientForm = {
        realName: '',
        duty: '',
        telephone: '',
        remark: '',
      }
    },
    // 编辑人员
    editRecipient() {
      if (this.selectedRecipientRows.length != 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑')
        return
      }
      this.addRecipientVisible = true
      this.recipientForm = {
        id: this.selectedRecipientRows[0].id,
        realName: this.selectedRecipientRows[0].realName,
        duty: this.selectedRecipientRows[0].duty,
        telephone: this.selectedRecipientRows[0].telephone,
        remark: this.selectedRecipientRows[0].remark,
      }
    },
    // 删除人员
    delRecipient() {
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
              this.getRecipientList()
              window.$oAntdMessage.success('操作成功')
            }
          })
        },
      })
    },

    initFun() {
      this.getData()
    },
    // 提交消息接收人表单
    async submitRecipient() {
      this.addRecipientVisible = false
      const method = this.recipientForm.id ? 'put' : 'post'

      window.$oAjax({
        method,
        url: `rest/unqualifiedUser/external`,
        data: {
          projectId: this.selProjectRows.id,
          consignUnitId: this.selConsignUnit.id,
          ...this.recipientForm,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.getRecipientList()
          this.selectedRecipientKeys = []
          this.selectedRecipientRows = []
          window.$oAntdMessage.success('操作成功')
        }
      })
    },

    checkoutPhoneRepetition() {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const patt = /^(0|86|17951)?(13\d|15[0-35-9]|166|19[89]\]|17[013-8]|18\d|14[579])\d{8}$/
      if (!this.recipientForm.realName) {
        window.$oAntdMessage.warning('请输入姓名')
        return
      }
      else if (
        !this.recipientForm.telephone
        || !patt.test(this.recipientForm.telephone)
      ) {
        window.$oAntdMessage.warning('请检查电话号码')
        return
      }

      window.$oAjax({
        method: 'GET',
        url: 'rest/unqualifiedUser/external/repeat/telephone',
        params: {
          telephone: this.recipientForm.telephone,
          id: this.recipientForm.id,
        },
      }).then((res) => {
        if (res.code === 20000) {
          if (res.data.length) {
            window.$oAntdConfirm({
              title: '提示',
              content: `系统中已存在相同手机号，是否继续？`,
              okText: '确认',
              mask: false,
              cancelText: '取消',
              onOk: () => {
                this.submitRecipient()
              },
            })
          }
          else {
            this.submitRecipient()
          }
        }
      })
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.getData()
    },

    getData() {
      const { page, size, quickQryParam } = this
      this.loading = true
      const params = {
        page,
        size,
        quickQryParam,
        // ...advancedQuery,
      }
      window.$oRest
        .get('projectController.do?datagridNew', { params })
        .then((res) => {
          if (res && res.rows) {
            this.tableData = res.rows
            this.pagination.total = res.total
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
