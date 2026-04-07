<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="invoiceIssuance">
    <a-tabs v-model:active-key="tabIndex" @change="switchTab">
      <a-tab-pane :key="0" tab="待提交任务"></a-tab-pane>
      <a-tab-pane :key="1" tab="已提交任务"></a-tab-pane>
    </a-tabs>
    <div>
      <a-input
        v-model:value.trim="queryParams.q"
        placeholder="输入委托编号/委托单位/工程项目/样品编号后回车即可查询"
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
      <a-button
        v-show="tabIndex == 0"
        type="primary"

        @click="settleHandle()"
      >
        结算办理
      </a-button>
      <a-button v-show="tabIndex == 1" @click="onRecall()">
        撤回
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
      row-key="consignId"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到数据',
      }"
      :scroll="{ x: 1600 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <a
            href="javascript:;"
            title="日志"
            class="text-blue-500"
            @click.stop="openLog(record)"
          >
            日志
          </a>
          <!-- <a href="javascript:;" title="详情" class="toolBtn-bar" @click.stop="viewDetail(record)">
              详情
            </a> -->
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span v-if="record.status == 'WAITING'">待结算</span>
          <span v-else-if="record.status == 'IN_SETTLEMENT'">结算中</span>
          <span v-else-if="record.status == 'PARTIAL_PAY'">已开票(部分回款)</span>
          <span v-else-if="record.status == 'WAIT_PAY'">已开票(未回款)</span>
          <span v-else-if="record.status == 'PAYED'">已开票(全部回款)</span>
        </template>

        <template v-if="column.dataIndex === 'feeStatus'">
          <span v-if="record.feeStatus == '1'">已结清</span>
          <span v-else-if="record.feeStatus == '2'">部分结清</span>
          <span v-else-if="record.feeStatus == '3'">未缴费</span>
        </template>

        <template v-if="column.dataIndex === 'consignStatus'">
          <span v-if="record.consignStatus == '10'">委托填写中</span>
          <span v-else-if="record.consignStatus == '20'">委托填写完成</span>
          <span v-else-if="record.consignStatus == '40'">退回修改中</span>
          <span v-else-if="record.consignStatus == '45'">有样品退回</span>
          <span v-else-if="record.consignStatus == '50'">通知修改中</span>
          <span v-else-if="record.consignStatus == '30'">委托作废</span>
        </template>

        <template v-if="column.dataIndex === 'processStatus'">
          <span v-if="record.processStatus == 'NORMAL'">正常</span>
          <span v-else-if="record.processStatus == 'BACK'">回退</span>
          <span v-else-if="record.processStatus == 'DISCARD'">作废</span>
          <span v-else-if="record.processStatus == 'WITHDRAW'">撤回</span>
        </template>
      </template>
    </a-table>

    <SettlementApply ref="settlementApply" @get-data="getData()" />

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      class="invoiceIssuance-query"
    >
      <!-- <template slot="invoicingDate">
          <a-range-picker v-model="invoicingDate" style="width: 100%" format="YYYY-MM-DD" />
        </template> -->
    </SeniorQuery>
    <Logs ref="Logs"></Logs>

    <ht-modal
      title="详情"
      :open="visibleDet"
      width="80%"
      centered
      @ok="visibleDet = false"
      @cancel="visibleDet = false"
    >
      <div>
        <iframe
          style="border: 0"
          width="100%"
          height="400"
          :src="detUrl"
        ></iframe>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import ajax from '~/providers/common/ajax'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { getList } from '../api/index.js'
import Logs from './components/logs.vue'
import settlementApply from './components/settlementApply.vue'

const queryDataC = [
  {
    type: 'select',
    field: 'feeStatus',
    title: '缴费状态',
    options: [
      { id: '1', name: '已结清' },
      { id: '2', name: '部分结清' },
      { id: '3', name: '未缴费' },
    ],
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
    field: 'consignDate',
    title: '委托日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'qualificationType',
    title: '资质类型',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'codeType',
    title: '编号类型',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'checkType',
    title: '检测类别',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    SettlementApply: settlementApply,
    SeniorQuery,
    Logs,
  },
  data() {
    return {
      visibleDet: false,
      detUrl: '',
      settlementApplyVisible: false,
      data: [],
      setLogVisible: false,
      tabIndex: 0,
      queryData: queryDataC,
      queryParams: {
        q: '',
      },
      sortParams: {},
      issuanceType: 'add',
      rowData: {},
      invoicingDate: [],
      consignIds: [],
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
          title: '流程状态',
          width: 80,
          dataIndex: 'processStatus',
          align: 'center',
          scopedSlots: { customRender: 'processStatus' },
        },
        // { title: "结算单编号", dataIndex: "settlementCode", },
        { title: '委托编号', width: 120, dataIndex: 'consignCode' },
        { title: '样品编号', width: 120, dataIndex: 'sampleCode' },
        { title: '委托人', width: 100, dataIndex: 'sampleSender' },
        { title: '委托单位', width: 150, dataIndex: 'consignUnit' },
        { title: '资质类型', width: 100, dataIndex: 'qualificationType' },
        { title: '编号类型', width: 100, dataIndex: 'codeType' },
        { title: '检测类型', width: 100, dataIndex: 'checkType' },
        { title: '工程项目', width: 150, dataIndex: 'project' },
        { title: '委托费用', width: 100, dataIndex: 'consignFee' },
        { title: '委托日期', width: 100, dataIndex: 'consignDate' },
        { title: '收样人', width: 100, dataIndex: 'sampleAcceptor' },
        {
          title: '委托状态',
          width: 100,
          dataIndex: 'consignStatus',
          scopedSlots: { customRender: 'consignStatus' },
        },
        {
          title: '缴费状态',
          width: 120,
          dataIndex: 'feeStatus',
          scopedSlots: { customRender: 'feeStatus' },
        },
        { title: '已缴费用', width: 100, dataIndex: 'paidAmount' },
        { title: '说明', width: 150, dataIndex: 'consignRemark' },
        {
          title: '操作',
          width: 80,
          fixed: 'right',
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
        },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      customRow: () => {
        return {
          onClick: () => {
            // if (this.selectedRowKeys.includes(record.consignId)) {
            //   this.selectedRowKeys = this.selectedRowKeys.filter(
            //     (item) => item !== record.consignId
            //   );
            //   this.selectedRows = this.selectedRows.filter(
            //     (item) => item.consignId !== record.consignId
            //   );
            // } else {
            //   this.selectedRowKeys.push(record.consignId);
            //   this.selectedRows.push(record);
            // }
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
    tabIndex() {
      this.getData(true)
    },
  },
  created() {
    this.getQualifications()
    this.getCheckType()
    this.getCodeType()
    this.getData()
  },
  methods: {
    async getQualifications() {
      // 获取资质
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax.get('/rest/common-body/qualification/list').then((res) => {
        that.queryData.forEach((it) => {
          if (it.field === 'qualificationType') {
            res.data.forEach((its) => {
              it.options.push({
                id: its.id,
                name: its.name,
              })
            })
          }
        })
      })
    },
    getCodeType() {
      // 获取编号类型
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        url: 'tSnCategoryController.do?getSnCategoryUser',
        method: 'GET',
      }).then((res) => {
        if (res.success) {
          that.queryData.forEach((it) => {
            if (it.field === 'codeType') {
              res.obj.forEach((its) => {
                it.options.push({
                  id: its.id,
                  name: its.name,
                })
              })
            }
          })
        }
      })
    },
    switchTab(v) {
      const c = [
        { title: '委托编号', width: 120, dataIndex: 'consignCode' },
        { title: '样品编号', width: 120, dataIndex: 'sampleCode' },
        { title: '委托人', width: 100, dataIndex: 'sampleSender' },
        { title: '委托单位', width: 150, dataIndex: 'consignUnit' },
        { title: '资质类型', width: 100, dataIndex: 'qualificationType' },
        { title: '编号类别', width: 100, dataIndex: 'codeType' },
        { title: '检测类型', width: 100, dataIndex: 'checkType' },
        { title: '工程项目', width: 150, dataIndex: 'project' },
        { title: '委托费用', width: 100, dataIndex: 'consignFee' },
        { title: '委托日期', width: 100, dataIndex: 'consignDate' },
        { title: '收样人', width: 100, dataIndex: 'sampleAcceptor' },
        {
          title: '委托状态',
          width: 100,
          dataIndex: 'consignStatus',
          scopedSlots: { customRender: 'consignStatus' },
        },
        {
          title: '缴费状态',
          width: 120,
          dataIndex: 'feeStatus',
          scopedSlots: { customRender: 'feeStatus' },
        },
        { title: '已缴费用', width: 100, dataIndex: 'paidAmount' },
        { title: '说明', width: 150, dataIndex: 'consignRemark' },
        {
          title: '操作',
          width: 80,
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
        },
      ]
      // eslint-disable-next-line eqeqeq
      if (v == 1) {
        this.columns = [
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
          { title: '结算单编号', width: 120, dataIndex: 'settlementCode' },
          ...c,
        ]
      }
      // eslint-disable-next-line eqeqeq
      else if (v == 0) {
        this.columns = [
          {
            title: '流程状态',
            width: 80,
            dataIndex: 'processStatus',
            align: 'center',
            scopedSlots: { customRender: 'processStatus' },
          },
          ...c,
        ]
      }
    },
    openLog(row) {
      if (!row.settlementId) {
        message.warning('未办理结算单')
        return
      }
      // this.selLogsId = row.settlementId
      // this.openLogUrl = "/rest/fee/settlement/log/{settlementId}=" + row.settlementId
      // this.setLogVisible = true
      this.$refs.Logs.showModal(row.settlementId)
    },
    getCheckType() {
      // 获取检测类别
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        url: '/rest/system-config/inspects',
        method: 'GET',
      }).then((res) => {
        that.queryData.forEach((it) => {
          if (it.field === 'checkType') {
            res.data.forEach((its) => {
              it.options.push({
                id: its.id,
                name: its.name,
              })
            })
          }
        })
      })
    },

    onClose(b) {
      this.settlementApplyVisible = b
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
      this.$refs.SeniorQuery.handleCancel()
      this.queryParams = {
        q: this.queryParams.q,
      }
      this.invoicingDate = []
      this.amount = []

      this.getData(true)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = JSON.parse(
        JSON.stringify({
          ...this.queryParams,
          ...params,
        }),
      )

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
        sporadicType: this.tabIndex,
      }

      // 格式化数据为后端需要的格式
      if (params.consignDate && params.consignDate.length) {
        params.consignDateStart = formatTime(
          params.consignDate[0],
          'YYYY-MM-DD',
        )
        params.consignDateEnd = formatTime(params.consignDate[1], 'YYYY-MM-DD')
        delete params.consignDate
      }
      // if (params.deprecated == 0) {
      //   params.deprecated = false;
      // } else if (params.deprecated == 1) {
      //   params.deprecated = true;
      // } else {
      //   params.deprecated = undefined;
      // }

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
          // eslint-disable-next-line eqeqeq
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
    // 结算办理
    settleHandle() {
      if (this.selectedRowKeys.length === 0) {
        message.warning('请选择至少一条数据')
        return
      }
      // eslint-disable-next-line eqeqeq
      if (this.selectedRows[0].feeStatus != 3) {
        message.warning('只能登记办理未结清的数据')
        return
      }
      const unitIds = []
      const projectId = []
      let havaFee = false
      this.selectedRows.forEach((it) => {
        projectId.push(it.project)
        unitIds.push(it.consignUnit)
        // eslint-disable-next-line eqeqeq
        if (it.feeStatus == 1) {
          havaFee = true
        }
      })
      if (havaFee) {
        message.warning('当前选择任务包含已结清的任务，请重新选择')
        return
      }
      // eslint-disable-next-line eqeqeq
      if (this.unique(unitIds).length != 1) {
        message.warning(
          '当前选择任务包含多个委托单位，或多工程项目，请重新选择。',
        )
        return
      }
      // eslint-disable-next-line eqeqeq
      else if (this.unique(projectId).length != 1) {
        message.warning(
          '当前选择任务包含多个委托单位，或多工程项目，请重新选择。',
        )
        return
      }

      // this.issuanceType = "add";
      // this.invoiceIds = this.selectedRowKeys;
      this.$refs.settlementApply.getData(this.selectedRowKeys)
    },
    onRecall() {
      // eslint-disable-next-line eqeqeq
      if (this.selectedRows.length != 1) {
        message.warning('请选择一条进行撤回')
        return
      }
      const row = this.selectedRows[0]
      Modal.confirm({
        title: '撤回',
        content: `确认撤回结算单？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          const res = await ajax.get(
            `/rest/fee/settlement/destroy/WITHDRAW/${row.settlementId}`,
          )
          if (res.code === 20000) {
            message.success('操作成功')
            this.getData()
          }
          else {
            message.error(res.message)
          }
        },
      })
    },
    unique(arr) {
      return Array.from(new Set(arr))
    },

    // 导出
    async onExport() {
      message.info('正在导出，请稍等...')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryParams,
        ...this.sortParams,
        // eslint-disable-next-line eqeqeq
        issued: this.tabIndex == 1,
      }
      delete params.page
      delete params.size
      // exportStandingBook(params)
    },
    // 查看发票详情
    viewDetail(row) {
      // top.addTabs &&
      //   top.addTabs({
      //     id: row.id,
      //     title: "发票详情",
      //     close: false,
      //     url: `reportApproveController.do?goConsignDetailPage&id=${row.consignId}&detail=detailPage&openType=3`,
      //   });
      this.detUrl = `reportApproveController.do?goConsignDetailPage&id=${row.consignId}&detail=detailPage&openType=3`
      this.visibleDet = true
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
