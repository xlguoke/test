<template>
  <div>
    <ht-modal
      title="选择费用"
      centered
      :mask-closable="false"
      :open="value"
      width="900px"
      :footer="false"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div>
            <a-input
              v-model:value="queryParams.query"
              placeholder="输入编号/委托单位/工程项目后回车即可查询"
              style="width: 300px"
            />
            <a-button class="toolBtn-bar" @click="handleSearch">
              查询
            </a-button>
            <a-button class="toolBtn-bar" @click="seniorQueryFun">
              切换到高级查询
            </a-button>
          </div>
          <a-table
            style="margin-top: 16px"
            :columns="columns"
            :pagination="data.length > 0 ? pagination : false"
            :data-source="data"
            :row-class-name="rowClassName"
            bordered
            :custom-row="customRow"
            :row-selection="rowSelection"
            row-key="feeModelId"
            :scroll="{ y: 350 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'invoicedAmount'">
                <span
                  v-if="
                    record.invoicedAmount == null
                      || record.invoicedAmount == undefined
                  "
                ></span>
                <span
                  v-else-if="record.invoicedAmount == record.totalAmount"
                  style="color: green"
                >¥ {{ record.invoicedAmount }}</span>
                <span
                  v-else-if="record.invoicedAmount > (record.totalAmount || 0)"
                  style="color: red"
                >¥ {{ record.invoicedAmount }}</span>
                <span v-else>¥ {{ record.invoicedAmount }}</span>
              </template>

              <template v-if="column.dataIndex === 'pendingInvoicingAmount'">
                <span
                  v-if="
                    record.pendingInvoicingAmount == null
                      || record.pendingInvoicingAmount == undefined
                  "
                ></span>
                <span
                  v-else-if="record.invoicedAmount == record.totalAmount"
                  style="color: green"
                >¥ {{ record.pendingInvoicingAmount }}</span>
                <span
                  v-else-if="record.invoicedAmount > (record.totalAmount || 0)"
                  style="color: red"
                >¥ {{ record.pendingInvoicingAmount }}</span>
                <span v-else>¥ {{ record.pendingInvoicingAmount }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </a-spin>
      <template #footer>
        <div class="expense-footer">
          <div class="expense-footer-left">
            <strong>已勾选合计：</strong>
            <p>
              应缴费用：¥ {{ totalAmount }}，已缴费用：¥
              {{ paidAmount }}，已开票金额：¥
              {{ invoicedAmount }}，待开票金额：¥ {{ pendingInvoicingAmount }}
            </p>
          </div>
          <div class="expense-footer-right">
            <a-button type="primary" @click="handleOk">
              确定
            </a-button>
            <a-button class="toolBtn-bar" @click="handleCancel">
              取消
            </a-button>
          </div>
        </div>
      </template>
    </ht-modal>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      class="invoiceManagement-query"
      widths="800px"
    >
      <template #kpje>
        <a-input style="width: 336px"></a-input> 至
        <a-input style="width: 336px"></a-input>
      </template>
    </SeniorQuery>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { getFeeList } from '../api'

const feeType = [
  { name: '委托费用', id: 'FeeConsign' },
  { name: '合同费用', id: 'FeeContract' },
  { name: '综合报告费用', id: 'FeeReport' },
  { name: '报告重打费用', id: 'FeeReType' },
  { name: '报告修改费用', id: 'FeeUpdateReport' },
  { name: '其他费用', id: 'FeeOther' },
]

const queryDataC = [
  {
    type: 'select',
    field: 'typeOfBill',
    title: '费用类型',
    options: feeType,
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'code',
    title: '委托/报告/合同编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'consignUnit',
    title: '委托单位',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'project',
    title: '工程项目',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'dates',
    title: '费用生成日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    SeniorQuery,
  },
  props: ['value'],
  emits: ['on-change', 'update:value'],
  data() {
    return {
      dayjs,
      totalAmount: 0,
      paidAmount: 0,
      invoicedAmount: 0,
      pendingInvoicingAmount: 0,
      data: [],
      columns: [
        {
          title: '费用类型',
          dataIndex: 'objectType',
          customRender: ({ text }) => {
            const obj = this.feeType.find(i => i.id == text)
            if (obj) {
              return obj.name
            }
            else {
              return ''
            }
          },
        },
        {
          title: '委托/报告/合同编号',
          dataIndex: 'code',
        },
        {
          title: '委托单位',
          dataIndex: 'consignUnit',
        },
        {
          title: '工程项目',
          dataIndex: 'project',
        },
        {
          title: '费用生成日期',
          dataIndex: 'createDate',
        },
        {
          title: '应缴费用',
          dataIndex: 'totalAmount',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0)}`,
        },
        {
          title: '已缴费用',
          dataIndex: 'paidAmount',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0)}`,
        },
        {
          title: '已开票金额',
          dataIndex: 'invoicedAmount',
          align: 'right',
          scopedSlots: { customRender: 'invoicedAmount' },
        },
        {
          title: '待开票金额',
          dataIndex: 'pendingInvoicingAmount',
          align: 'right',
          scopedSlots: { customRender: 'pendingInvoicingAmount' },
        },
      ],
      queryData: queryDataC,
      queryParams: {},
      spinning: false,
      feeType,
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
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.feeModelId)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.feeModelId),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.feeModelId !== record.feeModelId,
              )
            }
            else {
              if (!record.children) {
                this.selectedRowKeys.push(record.feeModelId)
                this.selectedRows.push(record)
              }
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
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  watch: {
    value(val) {
      if (val === true) {
        this.getData()
      }
      else {
        this.handleCancel()
      }
    },
    selectedRowKeys() {
      this.calcFee()
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
    // 根据勾选的数据计算金额
    calcFee() {
      let _totalAmount = 0
      let _paidAmount = 0
      let _invoicedAmount = 0
      let _pendingInvoicingAmount = 0

      // eslint-disable-next-line array-callback-return
      this.selectedRows.map((item) => {
        const {
          totalAmount,
          paidAmount,
          invoicedAmount,
          pendingInvoicingAmount,
        } = item
        _totalAmount += totalAmount || 0
        _paidAmount += paidAmount || 0
        _invoicedAmount += invoicedAmount || 0
        _pendingInvoicingAmount += pendingInvoicingAmount || 0
      })

      this.totalAmount = this.formatMoney(_totalAmount)
      this.paidAmount = this.formatMoney(_paidAmount)
      this.invoicedAmount = this.formatMoney(_invoicedAmount)
      this.pendingInvoicingAmount = this.formatMoney(_pendingInvoicingAmount)
    },
    // 金额格式化为千分位
    formatMoney(num) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /\d{1,3}(?=(\d{3})+$)/g
      return (`${num}`).replace(reg, '$&,')
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryData, params)
    },
    // 高级查询 重置
    resetCall() {
      this.queryParams = {}
      this.$refs.SeniorQuery.handleCancel()
      this.page = 1
      this.getData()
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      }

      this.page = 1
      this.getData()
    },
    handleOk() {
      $emit(this, 'on-change', this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.queryParams = {}
      $emit(this, 'update:value', false)
    },
    async getData() {
      const { page, size, queryParams } = this
      const params = {
        page,
        size,
        ...queryParams,
      }

      // 格式化数据为后端需要的格式
      if (params.dates && params.dates.length == 2) {
        params.dates = [
          formatTime(params.dates[0], 'YYYY-MM-DD'),
          formatTime(params.dates[1], 'YYYY-MM-DD'),
        ].join(',')
      }
      else {
        params.dates = undefined
      }

      this.spinning = true
      const res = await getFeeList(params)
      this.spinning = false
      if (res.code === 20000) {
        this.data = res.data.rows
        this.pagination.total = res.data.count || 0
        this.pagination.current = page
        this.pagination.pageSize = size
      }
    },
    handleReset() {
      this.page = 1
      this.queryParams = {}
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
    },
  },
}
</script>

<style lang="less" scoped>
.expense-footer {
  display: flex;
  padding-top: 10px;
  align-items: center;
  border-top: solid 1px #e2e2e2;
  .expense-footer-left {
    flex: 1;
  }

  .expense-footer-right {
    width: 200px;
    text-align: right;
  }
}
</style>
