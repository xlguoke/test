<!-- eslint-disable vue/eqeqeq -->
<template>
  <IlisContainer app-id="disqualificationMessageConfig">
    <div class="pb-4">
      <!-- <a-button @click="addRecipient" type="primary">新增</a-button> -->
      <a-button @click="editRecipient">
        修改
      </a-button>
    </div>
    <!-- 主table -->
    <a-table
      :row-selection="rowTemplateSelection"
      :custom-row="customTemplateRow"
      :columns="tableColumns"
      :data-source="tableData"
      bordered
      :pagination="false"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'node'">
          <span>
            {{ String(text) === '10' ? ' 数据采集后' : '报告提交时' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => openLogTable(record.id)">日志</a>
          </span>
        </template>
      </template>
    </a-table>

    <ht-modal
      v-model:open="logTableVisible"
      title="日志"
      width="850px"
      ok-text="确定"
      cancel-text="取消"
      @ok="logTableVisible = false"
    >
      <a-table
        :columns="logTableColumns"
        :data-source="logTableData"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
      >
      </a-table>
    </ht-modal>

    <ht-modal
      v-model:open="addTemplateVisible"
      title="消息配置"
      ok-text="确定"
      cancel-text="取消"
      width="500px"
      @ok="submitRecipient"
    >
      <div style="height: 170px; overflow: auto;">
        <div>
          <label><span style="color: red">*</span>推送节点：</label>
          <a-select
            v-model:value="templateForm.node"
            style="width: 320px"
            disabled
            placeholder="请选择推送节点"
          >
            <a-select-option value="10">
              数据采集后
            </a-select-option>
            <a-select-option value="20">
              报告提交时
            </a-select-option>
          </a-select>
        </div>
        <div class="mt-4">
          <label class="align-top"><span style="color: red">*</span>消息配置：</label>
          <a-textarea
            v-model:value="templateForm.template"
            placeholder="请输入消息配置"
            :rows="4"
            style="width: 320px"
          />
        </div>
      </div>
    </ht-modal>
  </IlisContainer>
</template>

<script>
const tableColumns = [
  {
    title: '消息推送节点',
    dataIndex: 'node',
    key: 'node',
    scopedSlots: { customRender: 'node' },
  },
  {
    title: '消息配置',
    dataIndex: 'template',
    key: 'template',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate',
  },
  {
    title: '可用字段说明',
    dataIndex: 'availableFields',
    key: 'availableFields',
  },
  {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 120,
  },
]
const logTableColumns = [
  {
    title: '修改前信息配置',
    dataIndex: 'preTemplate',
    key: 'preTemplate',
  },
  {
    title: '修改后信息配置',
    dataIndex: 'postTemplate',
    key: 'postTemplate',
  },
  {
    title: '修改人',
    dataIndex: 'createName',
    key: 'createName',
  },
  {
    title: '修改时间',
    dataIndex: 'createDate',
    key: 'createDate',
  },
]

export default {
  components: {},
  data() {
    return {
      templateForm: {
        template: '',
        node: '',
      },
      addTemplateVisible: false,
      selectedTemplateKeys: [],
      selectedTemplateRows: [],
      logTableVisible: false,
      tableData: [],
      tableColumns,
      logTableColumns,
      logTableData: [],
      loading: false,
      // pagination: {
      //     current: 1,
      //     total: 0,
      //     ...window.pageConfig,
      //     onChange: (page) => {
      //         this.page = page;
      //         this.getData();
      //     },
      //     onShowSizeChange: (page, size) => {
      //         this.page = 1;
      //         this.size = size;
      //         this.getData();
      //     },
      // },

      customTemplateRow: (record) => {
        return {
          on: {
            click: () => {
              const isadd = this.selectedTemplateKeys.find((item) => {
                return item === record.id
              })
              if (!isadd) {
                this.selectedTemplateKeys.push(record.id)
                this.selectedTemplateRows.push(record)
              }
            },
          },
        }
      },
    }
  },
  computed: {
    rowTemplateSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedTemplateKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedTemplateKeys = selectedRowKeys
          this.selectedTemplateRows = selectedRows
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
    this.getData()
  },
  methods: {
    // 编辑
    editRecipient() {
      if (this.selectedTemplateRows.length !== 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑')
        return
      }
      this.addTemplateVisible = true
      this.templateForm = {
        id: this.selectedTemplateRows[0].id,
        node: this.selectedTemplateRows[0].node,
        template: this.selectedTemplateRows[0].template,
      }
    },

    submitRecipient() {
      if (!this.templateForm.node) {
        window.$oAntdMessage.warning('请选择节点')
        return
      }
      else if (!this.templateForm.template) {
        window.$oAntdMessage.warning('请输入模板')
        return
      }

      this.addTemplateVisible = false
      const method = this.templateForm.id ? 'put' : 'post'

      window.$oAjax({
        method,
        url: `rest/unqualifiedTemplate`,
        data: this.templateForm,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.getData()
          window.$oAntdMessage.success('操作成功')
          this.selectedTemplateKeys = []
          this.selectedTemplateRows = []
        }
      })
    },
    // 新增
    addRecipient() {
      this.addTemplateVisible = true
      this.templateForm = {
        node: '10',
        template: '',
      }
    },
    openImportPersonnel() {
      this.logTableVisible = true
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 日志
    openLogTable(objectId) {
      this.logTableVisible = true
      window.$oAjax
        .get(`rest/unqualifiedTemplateLog/list?objectId=${objectId}`)
        .then((res) => {
          if (res.code === 20000) {
            this.logTableData = res.data
          }
        })
    },

    // //删除人员
    // delPersonnel() {
    //     if (!this.selectedTemplateRows.length) {
    //         window.$oAntdMessage.warning('请至少选中一条数据');
    //         return
    //     }
    //     let ids = this.selectedTemplateRows.map(item => {
    //         return item.id
    //     })
    //     window.$oAntdConfirm({
    //         title: '删除',
    //         content: `确认删除吗？`,
    //         okText: '确认',
    //         mask: false,
    //         cancelText: '取消',
    //         onOk: () => {
    //             window.$oAjax({
    //                 method: "delete",
    //                 url: `rest/unqualifiedUser`,
    //                 data: ids,
    //                 headers: {
    //                     "X-Requested-With": "XMLHttpRequest",
    //                     "content-type": "application/json"
    //                 }
    //             }).then(res => {
    //                 if (res.code === 20000) {
    //                     this.getData();
    //                     window.$oAntdMessage.success('操作成功');
    //                 }
    //             })
    //         }
    //     });
    // },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, queryParam, advancedQuery } = this
      this.loading = true

      const params = {
        // page,
        // size,
        // queryParam,
      }

      window.$oRest
        .get('rest/unqualifiedTemplate/list', { params })
        .then((res) => {
          if (res && res.code === 20000) {
            this.tableData = res.data
            // this.pagination.total = res.data.count;
            // this.pagination.current = page;
            // this.pagination.pageSize = size;
            this.loading = false
          }
        })
    },
  },
}
</script>
