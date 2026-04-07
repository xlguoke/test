<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <span style="margin-right: 20px">
            <span class="label">出库类型：</span>
            <a-select v-model:value="queryForm.type" style="width: 200px">
              <a-select-option value="">全部 </a-select-option>
              <a-select-option value="检测申领">检测申领出库 </a-select-option>
              <a-select-option value="配置溶液">配置溶液出库 </a-select-option>
              <a-select-option value="失效">失效出库 </a-select-option>
              <a-select-option value="调拨">调拨出库 </a-select-option>
              <a-select-option value="自配直接使用">自配直接使用
              </a-select-option>
            </a-select>
          </span>
          <a-input
            v-model:value="queryForm.quickQry"
            placeholder="请输入出库批号、品名、化学品编号后回车即可"
            style="width: 200px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button @click="handleSearch">
            查询
          </a-button>
        </div>
        <div style="padding: 10px 0">
          <a-button v-permission="'stockout::register::edit'" type="primary" @click="addEditRow">
            新增
          </a-button>
          <a-button v-permission="'stockout::register::export'" @click="onExport">
            导出
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
          :scroll="{ x: 1600 }"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  v-if="record.status == '创建中'"
                  v-permission="'stockout::register::edit'"
                  @click="(e) => addEditRow(e, record.id)"
                >编辑</a>
                <a
                  v-if="record.status == '创建中'"
                  v-permission="'stockout::register::delete'"
                  style="color: red"
                  @click="(e) => deleteRow(e, record)"
                >删除</a>
                <a
                  v-if="record.status == '已领取' && record.remainingAmount > 0"
                  v-permission="'stockout::register::srockin'"
                  @click="(e) => returnStorage(record)"
                >返还入库</a>
                <a @click="(e) => addEditRow(e, record.id, true)">查看</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <AddEditComponent ref="AddEditComponentRef" :callback="getData" />
    <PutStorage ref="putStorageRef" :callback="putStorageCallBack" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import AddEditComponent from './components/addEdit.vue'
import PutStorage from './components/putStorage.vue'

export default {
  components: {
    AddEditComponent,
    PutStorage,
  },
  data() {
    return {
      returnRowData: {},
      queryDataType: '1',
      queryDate: '',
      queryForm: {
        quickQry: '',
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
          title: '状态',
          dataIndex: 'status',
          width: 80,
        },
        {
          title: '出库批号',
          dataIndex: 'batchSn',
          width: 120,
        },
        {
          title: '出库类型',
          dataIndex: 'type',
          width: 120,
        },
        {
          title: '化学名称',
          dataIndex: 'name',
          width: 120,
        },
        {
          title: '品名编号',
          dataIndex: 'sn',
          width: 120,
        },
        {
          title: '品名',
          dataIndex: 'categoryName',
          width: 120,
        },
        {
          title: '申请日期',
          dataIndex: 'applyTime',
          width: 120,
        },
        {
          title: '预计出库日期',
          dataIndex: 'planOutboundDate',
          width: 120,
        },
        {
          title: '预计归还日期',
          dataIndex: 'planReturnDate',
          width: 120,
        },
        {
          title: '领取部门',
          dataIndex: 'receiveDepart',
          width: 120,
        },
        {
          title: '领取人',
          dataIndex: 'receivers',
          width: 100,
        },
        {
          title: '申领数量',
          dataIndex: 'amount',
          width: 100,
        },
        {
          title: '出库人',
          dataIndex: 'outboundPersons',
          width: 100,
        },
        {
          title: '实际出库日期',
          dataIndex: 'outboundDate',
          width: 120,
        },
        {
          title: '关联任务',
          dataIndex: 'testTaskCodes',
          width: 120,
        },
        {
          title: '可用余量',
          dataIndex: 'remainingAmount',
          width: 100,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 150,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 200,
          fixed: 'right',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      propertyProfileVisible: false,
      customFields: [],
      queryForm: {
        type: '',
        quickQry: '',
      },
      quickQry: '',
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
    async putStorageCallBack(d) {
      this.spinning = true
      this.$refs.putStorageRef.closeModel()
      const res = await window.$oAjax.post(
        'rest/chemical/inventory/out/returnInventory',
        { ...d, chemicalInventoryOutId: this.returnRowData.id },
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
      this.spinning = false
      if (res.code === 20000) {
        window.$oAntdMessage.success('操作成功')
        this.visible = false
        this.getData()
        this.callback()
      }
      else {
        window.$oAntdMessage.warning(res.message)
      }
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
        .get(`/rest/chemical/inventory/out/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows
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
    addEditRow(e, id, isDetail) {
      this.$refs.AddEditComponentRef.openModel(id, isDetail)
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
            .delete(`rest/chemical/inventory/out/${record.id}`, {})
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
