<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="invoiceIssuance">
    <div style="padding: 10px 0">
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
    </div>
    <!-- <p style="margin: 10px;text-align: right;color: #1890ff;">注：灰色数据表示编号相同结算单。</p> -->
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :pagination="false"
      row-key="id"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到数据',
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <div class="table-handle">
            <a
              href="javascript:;"
              title="查看详情"
              class="toolBtn-bar"
              @click.stop="openDetails(record)"
            >
              详情
            </a>
            <a
              v-if="record.status == 'IN_SETTLEMENT'"
              href="javascript:;"
              title="撤回"
              class="toolBtn-bar"
              @click.stop="onRevoke(record)"
            >
              撤回
            </a>
            <a
              href="javascript:;"
              title="查看日志"
              class="toolBtn-bar"
              @click.stop="openLog(record)"
            >
              日志
            </a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'processStatus'">
          <span v-if="record.processStatus == 'NORMAL'">正常</span>
          <span v-else-if="record.processStatus == 'BACK'">回退</span>
          <span v-else-if="record.processStatus == 'DISCARD'">作废</span>
          <span v-else-if="record.processStatus == 'WITHDRAW'">撤回</span>
        </template>

        <template v-if="column.dataIndex === 'settlementType'">
          <span v-if="record.settlementType == 'CONTRACT_BILL'">合同任务</span>
          <span v-else-if="record.settlementType == 'CONTRACT_PROCESS'">合同约定时间</span>
          <span v-else-if="record.settlementType == 'SPORADIC'">无合同任务</span>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span v-if="record.status == 'WAITING'">待结算</span>
          <span v-else-if="record.status == 'IN_SETTLEMENT'">结算中</span>
          <span v-else-if="record.status == 'PARTIAL_PAY'">已开票(部分回款)</span>
          <span v-else-if="record.status == 'WAIT_PAY'">已开票(未回款)</span>
          <span v-else-if="record.status == 'PAYED'">已开票(全部回款)</span>
        </template>
      </template>
    </a-table>

    <ContarctBillDet ref="ContarctBillDet" />
    <ContarctPross ref="ContarctPross" />

    <Logs ref="Logs"></Logs>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message, Modal } from 'ant-design-vue'
import ajax from '~/providers/common/ajax'
import ContarctBillDet from '../components/contarctBill.vue'
import ContarctPross from '../components/contarctPross.vue'
import Logs from '../components/logs.vue'

export default {
  components: {
    ContarctBillDet,
    ContarctPross,
    Logs,
  },
  data() {
    return {
      contractId: localStorage.getItem('contractId'),
      detailsVisible: false,
      issuanceVisible: false,
      data: [],
      tabIndex: 0,
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
      columns: [
        {
          title: '流程状态',
          dataIndex: 'processStatus',
          align: 'center',
          scopedSlots: { customRender: 'processStatus' },
        },
        {
          title: '结算状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        { title: '结算单编号', dataIndex: 'settlementCode' },
        {
          title: '结算类型',
          dataIndex: 'settlementType',
          scopedSlots: { customRender: 'settlementType' },
        },
        { title: '结算金额(元)', dataIndex: 'settlementAmount' },
        { title: '结算申请日期', dataIndex: 'settlementDate' },
        {
          title: '结算申请人',
          dataIndex: 'submitter',
          align: 'right',
        },
        { title: '结算期别', dataIndex: 'settlementPeriod' },
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
  watch: {},
  created() {
    this.getData()
  },
  methods: {
    openLog(row) {
      // if (!row.settlementId) {
      //   message.warning("未办理结算单");
      //   return
      // }
      // this.selLogsId = row.settlementId
      // this.openLogUrl = "/rest/fee/settlement/log/{settlementId}=" + row.settlementId
      // this.setLogVisible = true
      this.$refs.Logs.showModal(row.id)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    /**
     * 获取列表
     * @param backFirst 是否返回第一页
     */
    async getData(backFirst) {
      if (backFirst) {
        this.page = 1
      }

      // 获取列表
      this.loading = true
      try {
        const p = {
          q: this.queryParams.q,
          isPager: false,
          contractId: this.contractId,
        }
        const res = await ajax.get('/rest/fee/settlement/page', { params: p })
        this.loading = false
        if (res.code === 20000) {
          this.data = res.data.rows
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

    // 撤回
    onRevoke(row) {
      Modal.confirm({
        title: '撤回',
        content: `确认撤回结算单？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          const res = await ajax.get(
            `/rest/fee/settlement/destroy/WITHDRAW/${row.id}`,
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

    // 查看发放发票详情
    openDetails(row) {
      if (row.settlementType == 'CONTRACT_BILL') {
        this.$refs.ContarctBillDet.getData(row.id)
      }
      else {
        this.$refs.ContarctPross.getData(row.id)
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
