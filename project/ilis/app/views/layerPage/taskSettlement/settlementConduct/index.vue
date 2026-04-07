<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="invoiceIssuance">
    <a-space style="padding: 10px 0" class="text-sm">
      <span>结算状态：</span>
      <a-select
        v-model:value="queryParams.settlementStatus"
        style="width: 120px"
        @change="search"
      >
        <a-select-option value="">
          全部
        </a-select-option>
        <a-select-option value="WAITING">
          待结算
        </a-select-option>
        <a-select-option value="IN_SETTLEMENT">
          结算中
        </a-select-option>
        <a-select-option value="WAIT_PAY">
          已开票(未回款)
        </a-select-option>
        <a-select-option value="PARTIAL_PAY">
          已开票(部分回款)
        </a-select-option>
        <a-select-option value="PAYED">
          已开票(全部回款)
        </a-select-option>
      </a-select>

      <span>数据状态：</span>
      <a-select
        v-model:value="queryParams.process"
        style="width: 120px"
        @change="search"
      >
        <a-select-option value="">
          全部
        </a-select-option>
        <a-select-option value="委托填写中">
          委托填写中
        </a-select-option>
        <a-select-option value="委托已作废">
          委托已作废
        </a-select-option>
        <a-select-option value="退回委托修改中">
          退回委托修改中
        </a-select-option>
        <a-select-option value="通知修改委托">
          通知修改委托
        </a-select-option>
        <a-select-option value="复核确认中">
          复核确认中
        </a-select-option>
        <a-select-option value="报告审核中">
          报告审核中
        </a-select-option>
        <a-select-option value="报告批准中">
          报告批准中
        </a-select-option>
        <a-select-option value="报告已批准">
          报告已批准
        </a-select-option>
        <a-select-option value="试验检测中">
          试验检测中
        </a-select-option>
        <a-select-option value="收费确认中">
          收费确认中
        </a-select-option>
        <a-select-option value="待分配任务">
          待分配任务
        </a-select-option>
      </a-select>

      <a-input
        v-model:value.trim="queryParams.q"
        placeholder="请输入编号/单位/工程项目后回车"
        style="width: 300px"
        @press-enter="search"
      />
      <a-button class="toolBtn-bar" @click="search">
        查询
      </a-button>
    </a-space>

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
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <a
            href="javascript:;"
            title="查看详情"
            class="text-blue-500"
            @click.stop="onCheckInfo(record)"
          >
            查看
          </a>
        </template>

        <template v-if="column.dataIndex === 'processStatus'">
          <span v-if="record.processStatus == 'NORMAL'">正常</span>
          <span v-else-if="record.processStatus == 'BACK'">回退</span>
          <span v-else-if="record.processStatus == 'DISCARD'">作废</span>
          <span v-else-if="record.processStatus == 'WITHDRAW'">撤回</span>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span v-if="record.status == 'WAITING'">待结算</span>
          <span v-else-if="record.status == 'IN_SETTLEMENT'">结算中</span>
          <span v-else-if="record.status == 'PARTIAL_PAY'">已开票(部分回款)</span>
          <span v-else-if="record.status == 'WAIT_PAY'">已开票(未回款)</span>
          <span v-else-if="record.status == 'PAYED'">已开票(全部回款)</span>
        </template>

        <template v-if="column.dataIndex === 'feeStatus'">
          <span v-if="record.feeStatus == '0'">已作废</span>
          <span v-else-if="record.feeStatus == '1'">已结清</span>
          <span v-else-if="record.feeStatus == '2'">部分结清</span>
          <span v-else-if="record.feeStatus == '3'">未缴费</span>
        </template>

        <template v-if="column.dataIndex === 'paidAmount'">
          <span
            v-if="record.paidAmount != record.receivableAmount"
            style="color: red"
          >{{ record.paidAmount }}</span>
          <span v-else>{{ record.paidAmount }}</span>
        </template>
      </template>
    </a-table>

    <a-alert
      style="margin: 10px 0"
      :message="tipMessage"
      type="info"
      show-icon
    />

    <!-- <a-button @click="confirmCallBack">下一步</a-button> -->
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
          :src="detailsUrl"
        ></iframe>
      </div>
    </ht-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { getList } from '../api'

export default {
  components: {},
  data() {
    return {
      visibleDet: false,
      detailsUrl: '',
      contractId: localStorage.getItem('contractId') || '',
      data: [],
      queryParams: {
        q: '',
        settlementStatus: '',
      },
      sortParams: {},
      loading: false,
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 30, 40, 50, 100, 200, 500],
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
          title: '数据状态',
          width: '60px',
          dataIndex: 'process',
          align: 'center',
        },
        {
          title: '流程状态',
          dataIndex: 'processStatus',
          align: 'center',
          scopedSlots: { customRender: 'processStatus' },
        },
        { title: '委托编号', dataIndex: 'consignCode', sorter: true },
        { title: '工程项目', dataIndex: 'consignProject' },
        { title: '委托单位', dataIndex: 'consignUnit' },
        { title: '费用类型', dataIndex: 'feeType' },
        {
          title: '结算状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          sorter: true,
        },
        {
          title: '缴费状态',
          dataIndex: 'feeStatus',
          scopedSlots: { customRender: 'feeStatus' },
          sorter: true,
        },
        { title: '应缴费用（元）', dataIndex: 'receivableAmount' },
        {
          title: '已收取费用（元）',
          dataIndex: 'paidAmount',
          scopedSlots: { customRender: 'paidAmount' },
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
            if (this.selectedRowKeys.includes(record.consignId)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(
                item => item !== record.consignId,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.consignId !== record.consignId,
              )
            }
            else {
              this.selectedRowKeys.push(record.consignId)
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
    tipMessage() {
      let p = 0
      this.selectedRows.forEach((it) => {
        p += it.receivableAmount
      })
      return `已选择 ${
        this.selectedRows.length
      } 项，应缴费用总计：￥ ${this.formatMoney(p, 2)}`
    },
  },
  watch: {},
  created() {
    this.contractId = localStorage.getItem('contractId')
    this.getData()
    window.confirmCallBack = this.confirmCallBack
  },
  methods: {
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
      const { page, size, queryParams, sortParams } = this
      const params = {
        page,
        size,
        ...queryParams,
        ...sortParams,
        contractId: this.contractId,
        settlementType: 'CONTRACT_BILL',
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
    // 搜索
    search(e) {
      e.preventDefault && e.preventDefault()
      this.getData(true)
    },
    reset() {
      this.queryParam = {}
      this.getData(true)
    },

    // 导出
    async onExport() {},
    // 查看详情
    onCheckInfo(row) {
      if (!row.feeId) {
        return
      }
      this.detailsUrl = `/ilis2/feeModelController.do?goConsignFeeDetail&id=${row.feeId}`
      this.visibleDet = true
    },
    confirmCallBack() {
      // if (!this.selectedRowKeys.length) {
      //   window.$oAntdMessage.warning("请选择结算委托");
      //   return
      // }
      // localStorage.setItem("consignIds", this.selectedRowKeys.join(","))
      // localStorage.setItem("contractId", this.contractId)
      return this.selectedRows
    },

    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        const sorterObj = { ascend: 'ASC', descend: 'DESC' }
        this.sortParams = {
          order: sorterObj[sorter.order],
          sort: sorter.field,
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
