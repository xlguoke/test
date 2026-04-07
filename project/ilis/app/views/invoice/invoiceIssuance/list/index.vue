<template>
  <div class="invoiceIssuance">
    <a-tabs v-model:active-key="tabIndex">
      <a-tab-pane :key="0" tab="待发放发票"></a-tab-pane>
      <a-tab-pane :key="1" tab="已发放发票"></a-tab-pane>
    </a-tabs>
    <a-space>
      <a-input
        v-model:value.trim="queryParams.query"
        placeholder="输入发票号码/发票抬头后回车即可查询"
        style="width: 300px"
        @press-enter="search"
      />
      <a-button @click="search">
        查询
      </a-button>
      <a-button @click="seniorQueryFun">
        切换到高级查询
      </a-button>
    </a-space>
    <div
      style="
        padding-bottom: 10px;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px #e2e2e2;
      "
    >
      <a-button
        v-show="tabIndex === 0"
        v-permission="'invoice:issuance'"
        type="primary"
        @click="onAdd"
      >
        发放发票
      </a-button>
      <a-button
        v-if="tabIndex === 1"
        v-permission="'invoice:export'"
        @click="onExport"
      >
        导出
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :pagination="pagination"
      row-key="id"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到发票数据',
      }"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <div class="table-handle">
            <a
              v-if="tabIndex === 1"
              href="javascript:;"
              title="查看发放发票详情"
              class="toolBtn-bar"
              @click.stop="onIssuanceCheckInfo(record)"
            >
              查看发放发票详情
            </a>
            <a
              href="javascript:;"
              title="查看发票详情"
              class="toolBtn-bar"
              @click.stop="onCheckInfo(record)"
            >
              查看发票详情
            </a>
            <a
              v-if="tabIndex === 1"
              v-permission="'invoice:issuance'"
              href="javascript:;"
              title="编辑发放发票"
              class="toolBtn-bar"
              @click.stop="onEdit(record)"
            >
              编辑发放发票
            </a>
            <a
              v-if="tabIndex === 1"
              v-permission="'invoice:issuance:recover'"
              href="javascript:;"
              title="撤销发放"
              class="toolBtn-bar"
              @click.stop="onRevoke(record)"
            >
              撤销发放
            </a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'mark'">
          <span
            v-if="record.deprecated"
            class="invoiceIssuance-deprecated"
            title="已作废"
          >废</span>
        </template>
      </template>
    </a-table>

    <Issuance
      v-model:value="issuanceVisible"
      :invoice-ids="invoiceIds"
      :type="issuanceType"
      :row-data="rowData"
      @on-success="getData"
    />

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      class="invoiceIssuance-query"
    >
      <template #invoicingDate>
        <a-range-picker
          v-model:value="invoicingDate"
          style="width: 100%"
          format="YYYY-MM-DD"
        />
      </template>
    </SeniorQuery>
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { exportStandingBook, getList, revokeIssuance } from '../api'
import Issuance from './components/issuance.vue'

const queryDataC = [
  {
    type: 'input',
    field: 'no',
    title: '发票号码',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'subject',
    title: '发票抬头',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'paymentUnit',
    title: '缴费单位',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'invoicingPerson',
    title: '开票人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'custom',
    field: 'invoicingDate',
    title: '开票日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'radio',
    field: 'deprecated',
    title: '发票是否作废',
    options: [
      { name: '正常发票', id: '0' },
      { name: '已作废发票', id: '1' },
      { name: '全部', id: '2' },
    ],
    default: '2',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    Issuance,
    SeniorQuery,
  },
  data() {
    return {
      issuanceVisible: false,
      data: [],
      tabIndex: 0,
      queryData: queryDataC,
      queryParams: {
        query: '',
      },
      sortParams: {},
      issuanceType: 'add',
      rowData: {},
      invoicingDate: [],
      invoiceIds: [],
      loading: false,
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
      columns: [
        {
          title: '标记',
          dataIndex: 'mark',
          align: 'center',
          width: '5%',
          scopedSlots: { customRender: 'mark' },
        },
        { title: '发票号码', dataIndex: 'no' },
        {
          title: '开票日期',
          dataIndex: 'invoicingDate',
          sorter: true,
        },
        { title: '发票抬头', width: '15%', dataIndex: 'subject' },
        { title: '缴费单位', width: '15%', dataIndex: 'paymentUnit' },
        { title: '开票人', width: '10%', dataIndex: 'invoicingPerson' },
        {
          title: '开票金额',
          dataIndex: 'amount',
          align: 'right',
          width: '10%',
          customRender: ({ text }) =>
            !text && text !== 0 ? '' : `¥ ${this.formatMoney(text || 0, 2)}`,
        },
        {
          title: '操作',
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
        },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(
                item => item !== record.id,
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
  watch: {
    tabIndex(val) {
      if (val === 0) {
        this.columns = this.columns.filter(
          item =>
            item.dataIndex !== 'issuanceType'
            && item.dataIndex !== 'issuanceDate',
        )
      }
      else {
        this.columns.splice(3, 0, {
          title: '发放方式',
          dataIndex: 'issuanceType',
          customRender: ({ text }) => {
            if (text === 1) {
              return '自取'
            }
            else if (text === 2) {
              return '邮寄'
            }
            else if (text === 3) {
              return '传真'
            }
            else {
              return ''
            }
          },
        })
        this.columns.splice(3, 0, {
          title: '发放日期',
          dataIndex: 'issuanceDate',
          sorter: true,
        })
      }
      this.getData(true)
    },
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryData, params)
    },
    // 高级查询 重置
    resetCall() {
      // this.$refs.SeniorQuery.handleCancel();
      this.queryParams = {
        query: this.queryParams.query,
      }
      this.invoicingDate = []
      this.amount = []

      this.getData(true)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      }

      this.getData(true)
    },
    /**
     * 获取列表
     * @param backFirst 是否返回第一页
     */
    async getData(backFirst) {
      if (backFirst) {
        this.page = 1
      }
      const { page, size, queryParams, sortParams } = this
      const params = {
        page,
        size,
        ...queryParams,
        ...sortParams,
        issued: this.tabIndex === 1,
      }

      // 格式化数据为后端需要的格式
      if (this.invoicingDate && this.invoicingDate.length === 2) {
        params.invoicingDate = [
          formatTime(this.invoicingDate[0], 'YYYY-MM-DD'),
          formatTime(this.invoicingDate[1], 'YYYY-MM-DD'),
        ].join(',')
      }
      else {
        params.invoicingDate = undefined
      }

      // eslint-disable-next-line eqeqeq
      if (params.deprecated == 0) {
        params.deprecated = false
      }
      // eslint-disable-next-line eqeqeq
      else if (params.deprecated == 1) {
        params.deprecated = true
      }
      else {
        params.deprecated = undefined
      }

      // 获取列表
      this.loading = true
      try {
        const res = await getList(params)
        this.loading = false

        if (res.code === 20000) {
          this.data = res.data.rows

          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.selectedRows = []
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        this.loading = false
      }
    },
    // 金额格式化为千分位
    formatMoney(num, d) {
      let arr = []
      if (num) {
        arr = String(num).split('.')
      }
      else {
        return '0.00'
      }

      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /\d{1,3}(?=(\d{3})+$)/g
      if (arr.length === 2) {
        num = arr[0]
        const money = (`${num}`).replace(reg, '$&,')
        const dd = arr[1]
        return `${money}.${dd.length === 2 ? dd : `${dd}0`}`
      }
      else {
        const money = (`${num}`).replace(reg, '$&,')
        if (d) {
          if (money !== '' && money != null && money !== undefined) {
            return `${money}.00`
          }
          else {
            return money
          }
        }
        else {
          return money
        }
      }
    },
    // 搜索
    search(e) {
      e.preventDefault()
      this.getData(true)
    },
    reset() {
      this.queryParam = {}
      this.getData(true)
    },
    // 发放发票
    onAdd() {
      if (this.selectedRowKeys.length === 0) {
        message.warning('请选择要发放的发票')
        return
      }

      const deprecateds = this.selectedRows.filter(
        item => item.deprecated === true,
      )
      if (deprecateds.length > 0) {
        message.warning('已作废的发票不能进行发放')
        return
      }
      this.issuanceType = 'add'
      this.invoiceIds = this.selectedRowKeys
      this.issuanceVisible = true
    },
    // 撤销发放
    onRevoke(row) {
      Modal.confirm({
        title: '撤销发放发票',
        content: `确认撤销吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          await revokeIssuance(row.id)
          message.success('操作成功')
          this.getData()
        },
      })
    },
    // 导出
    async onExport() {
      message.info('正在导出，请稍等...')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryParams,
        ...this.sortParams,
        issued: this.tabIndex === 1,
      }
      delete params.page
      delete params.size
      exportStandingBook(params)
    },
    // 查看发票详情
    onCheckInfo(row) {
      top.addTabs
      && top.addTabs({
        id: row.id,
        title: '发票详情',
        close: false,
        url: `invoice.do?goInvoice&type=detail&id=${row.id}`,
      })
    },
    // 查看发放发票详情
    onIssuanceCheckInfo(row) {
      try {
        this.issuanceType = 'detail'
        this.invoiceIds = [row.id]
        this.rowData = JSON.parse(row.issuanceContent)
        this.issuanceVisible = true
      }
      catch (e) {
        message.warning('数据异常，无法查看，请联系管理员')
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    // 编辑发放发票
    onEdit(row) {
      try {
        this.issuanceType = 'edit'
        this.invoiceIds = [row.id]
        this.rowData = JSON.parse(row.issuanceContent)
        this.issuanceVisible = true
      }
      catch (e) {
        message.warning('数据异常，无法查看，请联系管理员')
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        this.sortParams = {
          sort: sorter.field,
          order: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      }
      else {
        this.sortParams = {}
      }
      this.getData()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
