<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <!-- <span style="margin-right: 20px">
              <span class="label">出库类型：</span>
              <a-select v-model="queryForm.type" style="width: 200px">
                <a-select-option value="">全部 </a-select-option>
                <a-select-option value="检测申领">检测申领出库 </a-select-option>
                <a-select-option value="配置溶液">配置溶液出库 </a-select-option>
                <a-select-option value="失效">失效出库 </a-select-option>
                <a-select-option value="调拨">调拨出库 </a-select-option>
                <a-select-option value="自配直接使用"
                  >自配直接使用
                </a-select-option>
              </a-select>
            </span> -->
          <a-input
            v-model:value="queryForm.query"
            placeholder="请输入评价项目，评价内容后回车即可查询"
            style="width: 300px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button @click="handleSearch">
            查询
          </a-button>
        </div>
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            新增
          </a-button>
          <a-button @click="onPreview">
            预览
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :columns="tableColumns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a @click="(e) => addEditRow(e, record)">编辑</a>
                <a style="color: red" @click="(e) => deleteRow(e, record)">删除</a>

                <!-- <a @click="(e) => addEditRow(e, record.id, true)">查看</a> -->
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <AddEditComponent ref="AddEditRef" :callback="getData" />
    <Preview ref="previewRef" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Logs from '~/providers/components/logs.vue'
import AddEditComponent from './components/addEdit.vue'
import Preview from './components/preview.vue'

export default {
  components: {
    AddEditComponent,
    // eslint-disable-next-line vue/no-unused-components
    Logs,
    Preview,
  },
  data() {
    return {
      returnRowData: {},
      queryDataType: '1',
      queryDate: '',
      queryForm: {
        query: '',
        type: '',
      },
      importUrl: `/rest/chemical/category/import`,
      getColumnUrl: 'rest/common/chosen-columns?type=chemicalCategory',
      dayjs,
      customVisible: false,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '评价项目',
          dataIndex: 'item',
        },
        {
          title: '评价内容',
          dataIndex: 'itemContent',
        },
        {
          title: '评价结果',
          dataIndex: 'candidateValue',
        },
        {
          title: '创建人',
          dataIndex: 'createName',
        },
        {
          title: '时间',
          dataIndex: 'createDate',
        },
        {
          title: '状态',
          dataIndex: 'status',
          customRender({ text }) {
            return text == 10 ? '启用' : '禁用'
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 125,
          scopedSlots: { customRender: 'operation' },
        },
      ],
      propertyProfileVisible: false,
      customFields: [],
      queryForm: {
        type: '',
        query: '',
      },
      query: '',
      spinning: false,
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
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.initFun()
  },
  methods: {
    initFun() {
      this.getData()
    },

    async onExport() {
      const a = document.createElement('a')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryForm,
      }
      let href = `/ilis2/rest/chemical/inventory/out/export`
      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    clearSelRowClass() {
      if (this.selectedRowKeys.length > 0) {
        $(
          `#tableBox tr[data-row-key="${this.selectedRowKeys[0]}"]`,
        ).removeClass('hitek-tableRow-active')
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },

    getData(flag) {
      this.visible = false
      this.spinning = true
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        size,
        ...this.queryForm,
      }
      window.$oAjax
        .get(`/rest/supplier/assess/item/list`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          this.clearSelRowClass()
          this.spinning = false
        })
    },
    returnStorage(row) {
      this.returnRowData = row
      this.$refs.putStorageRef.openModel()
    },
    addEditRow(e, echo) {
      this.$refs.AddEditRef.openModel(echo)
    },
    onPreview() {
      this.$refs.previewRef.openModel()
    },

    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete(`rest//supplier/assess/item/${record.id}`, {})
            .then((res) => {
              self.spinning = false
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.getData()
              }
              else {
                window.$oAntdMessage.warning(res.message)
              }
            })
        },
        onCancel() {},
      })
    },
    handleSearch() {
      this.getData(true)
    },
    // // 查看日志
    // viewLog(e, data) {
    //   this.$refs.Logs.showModal(data.id, "11");
    // },
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
