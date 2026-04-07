<template>
  <div class="invoiceIssuance" style="margin-top: 10px">
    <div>
      <a-input
        v-model:value.trim="queryParams.q"
        placeholder="输入结算单编号后回车即可查询"
        style="width: 300px"
        @press-enter="search"
        @keyup.enter="search"
      />
      <a-button class="ml-2" @click="search">
        查询
      </a-button>
      <a-button @click="seniorQueryFun">
        切换到高级查询
      </a-button>
    </div>
    <div
      style="
        padding-bottom: 10px;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px #e2e2e2;
      "
    >
      <a-button type="primary" @click="settle">
        结算办理
      </a-button>
      <a-button @click="sendBack">
        退回
      </a-button>
      <a-button @click="onAbolish">
        作废
      </a-button>
      <a-button type="primary" @click="onExport">
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
        emptyText: '未查询到数据',
      }"
      :scroll="{ x: 1800 }"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <div class="table-handle">
            <a
              href="javascript:;"
              title="查看详情"
              class="toolBtn-bar"
              @click.stop="onCheckInfo(record)"
            >详情</a>
            <a
              v-if="record.settlementType != 'CONTRACT_PROCESS'"
              href="javascript:;"
              title="下载"
              class="toolBtn-bar"
              @click.stop="onDownload(record)"
            >下载</a>
            <a href="javascript:;" class="toolBtn-bar" @click.stop="openLog(record)">日志</a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span v-if="record.status == 'WAITING'">待结算</span>
          <span v-else-if="record.status == 'IN_SETTLEMENT'">结算中</span>
          <span v-else-if="record.status == 'PARTIAL_PAY'">已开票(部分回款)</span>
          <span v-else-if="record.status == 'WAIT_PAY'">已开票(未回款)</span>
          <span v-else-if="record.status == 'PAYED'">已开票(全部回款)</span>
        </template>

        <template v-if="column.dataIndex === 'settlementType'">
          <span v-if="record.settlementType == 'CONTRACT_BILL'">合同任务</span>
          <span v-else-if="record.settlementType == 'CONTRACT_PROCESS'">合同约定时间</span>
          <span v-else-if="record.settlementType == 'SPORADIC'">无合同任务</span>
        </template>

        <template v-if="column.dataIndex === 'collectionAmount'">
          <a-button type="link" @click="returnedRegister(record)">
            {{ record.collectionAmount }}
          </a-button>
        </template>

        <template v-if="column.dataIndex === 'processStatus'">
          <span v-if="record.processStatus == 'NORMAL'">正常</span>
          <span v-else-if="record.processStatus == 'BACK'">回退</span>
          <span v-else-if="record.processStatus == 'DISCARD'">作废</span>
          <span v-else-if="record.processStatus == 'WITHDRAW'">撤回</span>
        </template>
      </template>
    </a-table>

    <Invoice ref="Invoice" @on-success="getData" />

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

    <ht-modal
      title="退回"
      :open="backvisible"
      :confirm-loading="confirmLoading"
      @ok="handleBackOk"
      @cancel="backvisible = false"
    >
      <div>
        <span>退回原因：</span>
        <a-input v-model:value="remark" style="width: 300px" />
      </div>
    </ht-modal>

    <ht-modal
      title="作废"
      :open="abolishvisible"
      :confirm-loading="confirmLoading"
      @ok="handleAbolishOk"
      @cancel="abolishvisible = false"
    >
      <div>
        <span>作废原因：</span>
        <a-input v-model:value="remark" style="width: 300px" />
      </div>
    </ht-modal>

    <ht-modal
      title="回款登记"
      width="800px"
      :open="returnedVisible"
      :confirm-loading="confirmLoading"
      @ok="returnedVisible = false"
      @cancel="returnedVisible = false"
    >
      <a-table
        :columns="columnsReturned"
        :data-source="dataReturned"
        :loading="loading"
        bordered
        :pagination="false"
        row-key="id"
        :locale="{
          emptyText: '未查询到数据',
        }"
      >
      </a-table>
    </ht-modal>

    <ContarctBillDet ref="ContarctBillDet" />
    <ContarctPross ref="ContarctPross" />

    <Logs ref="Logs"></Logs>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import ajax from '~/providers/common/ajax'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { getList } from '../api'
import ContarctBillDet from './components/contarctBill.vue'
import ContarctPross from './components/contarctPross.vue'
import Invoice from './components/Invoice.vue'
import Logs from './components/logs.vue'

const queryDataC = [
  {
    type: 'select',
    field: 'settlementStatus',
    title: '结算状态',
    options: [
      { id: 'WAITING', name: '待结算' },
      { id: 'IN_SETTLEMENT ', name: '结算中' },
      { id: 'WAIT_PAY', name: '已开票(未回款)' },
      { id: 'PARTIAL_PAY ', name: '已开票(部分回款)' },
      { id: 'PAYED', name: '已开票(全部回款)' },
    ],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'settlementCode',
    title: '结算单编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'settlementType',
    title: '结算类型',
    options: [
      { id: 'CONTRACT_BILL', name: '合同任务' },
      { id: 'CONTRACT_PROCESS', name: '合同约定时间' },
      { id: 'SPORADIC', name: '无合同任务' },
    ],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'settlementDate',
    title: '结算申请日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'settlementRegister',
    title: '结算办理日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'contractName',
    title: '合同名称',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'contractCode',
    title: '合同编号',
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
    type: 'input',
    field: 'submitter',
    title: '申请人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    Invoice,
    SeniorQuery,
    ContarctBillDet,
    ContarctPross,
    Logs,
  },
  data() {
    return {
      returnedVisible: false,
      remark: '',
      confirmLoading: false,
      backvisible: false,
      abolishvisible: false,
      issuanceVisible: false,
      data: [],
      tabIndex: 0,
      queryData: queryDataC,
      queryParams: {
        q: '',
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
      dataReturned: [],
      columnsReturned: [
        { title: '开票日期', width: 120, dataIndex: 'registerDate' },
        { title: '开票金额', width: 100, dataIndex: 'registerAmount' },
        { title: '回款登记时间', width: 120, dataIndex: 'collectionDate' },
        { title: '回款金额', width: 100, dataIndex: 'collectionAmount' },
        { title: '备注', width: 300, dataIndex: 'remark' },
      ],
      columns: [
        // {
        //   title: "标记",
        //   dataIndex: "processStatus",
        //   align: "center",
        //   scopedSlots: { customRender: "mark" },
        // },
        {
          title: '流程状态',
          width: 80,
          dataIndex: 'processStatus',
          align: 'center',
          scopedSlots: { customRender: 'processStatus' },
        },
        {
          title: '结算状态',
          width: 140,
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '结算单编号',
          width: 120,
          dataIndex: 'settlementCode',
          sorter: true,
        },
        {
          title: '结算类型',
          width: 120,
          dataIndex: 'settlementType',
          scopedSlots: { customRender: 'settlementType' },
        },
        { title: '结算金额(元)', width: 120, dataIndex: 'settlementAmount' },
        { title: '结算申请日期', width: 120, dataIndex: 'settlementDate' },
        { title: '结算办理日期', width: 120, dataIndex: 'registerDate' },
        {
          title: '已回款金额',
          width: 120,
          dataIndex: 'collectionAmount',
          scopedSlots: { customRender: 'collectionAmount' },
        },
        { title: '未回款金额', width: 120, dataIndex: 'uncollectedAmount' },
        { title: '中间差价', width: 100, dataIndex: 'differenceAmount' },
        { title: '回款次数', width: 90, dataIndex: 'collectedCount' },
        { title: '合同名称', width: 150, dataIndex: 'contractName' },
        { title: '合同编号', width: 120, dataIndex: 'contractCode' },
        { title: '工程项目', width: 150, dataIndex: 'project' },
        { title: '负责人', width: 100, dataIndex: 'linkman' },
        { title: '联系电话', width: 120, dataIndex: 'tel' },
        { title: '申请人', width: 100, dataIndex: 'submitter' },
        {
          title: '操作',
          dataIndex: 'options',
          width: 180,
          fixed: 'right',
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
  watch: {},
  created() {
    this.getData()
  },
  methods: {
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        this.sortParams = {
          sort: sorter.field,
          order: sorter.order == 'ascend' ? 'asc' : 'desc',
        }
      }
      else {
        this.sortParams = {}
      }
      this.getData()
    },
    async returnedRegister(row) {
      this.returnedVisible = true
      const res = await ajax.get(
        `/rest/fee/settlement/register/collection/${row.id}`,
      )
      if (res.code == '20000') {
        this.dataReturned = res.data
      }
    },
    async handleBackOk() {
      const res = await ajax.get(
        `/rest/fee/settlement/destroy/BACK/${this.selectedRows[0].id}`,
        {
          params: {
            remark: this.remark,
          },
        },
      )
      if (res.code === 20000) {
        message.success('操作成功')
        this.backvisible = false
        this.getData()
      }
      else {
        message.error(res.message)
      }
    },
    async handleAbolishOk() {
      const res = await ajax.get(
        `/rest/fee/settlement/destroy/DISCARD/${this.selectedRows[0].id}`,
        {
          params: {
            remark: this.remark,
          },
        },
      )
      if (res.code === 20000) {
        message.success('操作成功')
        this.abolishvisible = false
        this.getData()
      }
      else {
        message.error(res.message)
      }
    },
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
        q: this.queryParams.q,
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
        // issued: this.tabIndex == 1 ? true : false,
      }

      // 获取列表
      this.loading = true
      const p = JSON.parse(JSON.stringify(params))
      if (p.settlementDate && p.settlementDate.length) {
        p.settlementDateStart = formatTime(
          params.settlementDate[0],
          'YYYY-MM-DD',
        )
        p.settlementDateEnd = formatTime(params.settlementDate[1], 'YYYY-MM-DD')
        delete p.settlementDate
      }
      if (p.settlementRegister && p.settlementRegister.length) {
        p.settlementRegisterStart = formatTime(
          params.settlementRegister[0],
          'YYYY-MM-DD',
        )
        p.settlementRegisterEnd = formatTime(
          params.settlementRegister[1],
          'YYYY-MM-DD',
        )
        delete p.settlementRegister
      }
      try {
        const res = await getList(p)
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
      if (arr.length == 2) {
        num = arr[0]
        const money = (`${num}`).replace(reg, '$&,')
        const dd = arr[1]
        return `${money}.${dd.length == 2 ? dd : `${dd}0`}`
      }
      else {
        const money = (`${num}`).replace(reg, '$&,')
        if (d) {
          if (money != '' && money != null && money != undefined) {
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
    // 结算
    settle() {
      if (this.selectedRowKeys.length != 1) {
        message.warning('请选择一条进行登记')
        return
      }
      if (this.selectedRows[0].processStatus == 'DISCARD') {
        message.warning('不能选择已作废数据进行登记')
        return
      }
      this.$refs.Invoice.visible = true
      this.$refs.Invoice.getData(this.selectedRows[0])
    },
    // 退回
    sendBack() {
      if (this.selectedRowKeys.length != 1) {
        message.warning('请选择一条进行操作')
        return
      }
      if (this.selectedRows[0].processStatus == 'DISCARD') {
        message.warning('不能选择已作废数据进行退回')
        return
      }
      this.remark = ''
      this.backvisible = true
    },
    onAbolish() {
      if (this.selectedRowKeys.length != 1) {
        message.warning('请选择一条进行操作')
        return
      }
      if (this.selectedRows[0].processStatus == 'DISCARD') {
        message.warning('不能选择已作废数据进行作废')
        return
      }
      this.remark = ''
      this.abolishvisible = true
    },
    // // 撤销发放
    // onRevoke(row) {
    //   Modal.confirm({
    //     title: "撤销发放发票",
    //     content: `确认撤销吗？`,
    //     okText: "确认",
    //     cancelText: "取消",
    //     onOk: async () => {
    //       await revokeIssuance(row.id);
    //       message.success("操作成功");
    //       this.getData();
    //     },
    //   });
    // },
    // 导出
    async onExport() {
      message.info('正在导出，请稍等...')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryParams,
        ...this.sortParams,
        // issued: this.tabIndex == 1 ? true : false,
      }
      delete params.page
      delete params.size

      const keys = Object.keys(params)
      let exportUrl = `/ilis2/rest/fee/settlement/export`
      // eslint-disable-next-line array-callback-return
      keys.map((key, index) => {
        exportUrl += `${index == 0 ? '?' : '&'}${key}=${params[key]}`
      })
      window.open(exportUrl)
    },
    onDownload(row) {
      const exportUrl = `/ilis2/rest/fee/settlement/export/${row.id}`
      window.open(exportUrl)
    },
    // 查看详情
    onCheckInfo(row) {
      let type
      if (row.settlementType == 'CONTRACT_BILL') {
        type = 'contract'
        this.$refs.ContarctBillDet.getData(row.id, type)
      }
      else if (row.settlementType == 'SPORADIC') {
        type = 'contractNot'
        this.$refs.ContarctBillDet.getData(row.id, type)
      }
      else if (row.settlementType == 'CONTRACT_PROCESS') {
        this.$refs.ContarctPross.getData(row.id)
      }
    },

    openLog(row) {
      if (!row.id) {
        message.warning('未办理结算单')
        return
      }
      // this.selLogsId = row.settlementId
      // this.openLogUrl = "/rest/fee/settlement/log/{settlementId}=" + row.settlementId
      // this.setLogVisible = true
      this.$refs.Logs.showModal(row.id)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
