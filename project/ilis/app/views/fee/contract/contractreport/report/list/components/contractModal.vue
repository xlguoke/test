<template>
  <div>
    <ht-modal
      title="选择合同"
      :open="visible"
      width="90%"
      wrap-class-name="report-contractModal-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="margin-bottom: 10px">
        <a-input
          v-model:value="quickQryParam"
          placeholder="请输入合同编号/合同方"
          style="width: 300px; vertical-align: middle; margin-right: 15px"
        />
        <a-button type="primary" style="vertical-align: middle" @click="getData">
          查询
        </a-button>
        <a-button
          class="toolBtn-bar"
          style="vertical-align: middle"
          @click="getInitialData"
        >
          重置
        </a-button>
      </div>
      <a-table
        :row-selection="rowSelection"
        :pagination="pagination"
        :scroll="{ y: 180, x: 2000 }"
        :columns="columns"
        :data-source="data"
        bordered
        :loading="loading"
        row-key="id"
        :custom-row="customRow"
        :row-class-name="rowClassName"
      />
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'

const status = {
  0: '合同已完结',
  1: '合同执行中',
  2: '合同录入中',
  3: '合同审核中',
  4: '审核不通过',
}

function formatMoney(num) {
  if (num) {
    return `￥ ${num}`
  }
  else {
    return '￥ 0'
  }
}

const columns = [
  {
    title: '合同编号',
    dataIndex: 'code',
    width: '9%',
  },
  {
    title: '合同方',
    dataIndex: 'unitName',
    width: '9%',
  },
  {
    title: '合同状态',
    dataIndex: 'status',
    customRender: ({ text }) => status[text],
    width: '9%',
  },
  {
    title: '合同金额',
    dataIndex: 'totalFee',
    customRender: ({ text }) => formatMoney(text),
    width: '9%',
  },
  {
    title: '已完成产值',
    dataIndex: 'outPutValue',
    customRender: ({ text }) => formatMoney(text),
    width: '9%',
  },
  {
    title: '累计应收款',
    dataIndex: 'appointTotal',
    customRender: ({ text }) => formatMoney(text),
    width: '9%',
  },
  {
    title: '累计已收款',
    dataIndex: 'paidTotal',
    customRender: ({ text }) => formatMoney(text),
    width: '9%',
  },
  {
    title: '累计未收款',
    dataIndex: 'waitPayTotal',
    customRender: ({ text }) => formatMoney(text ? text * -1 : text),
    width: '9%',
  },
  {
    title: '生效日期',
    dataIndex: 'availabilityDate',
    customRender: ({ text }) => text && formatTime(text, 'YYYY-MM-DD'),
    width: '9%',
  },
  {
    title: '失效日期',
    dataIndex: 'expiryDate',
    customRender: ({ text }) => text && formatTime(text, 'YYYY-MM-DD'),
    width: '9%',
  },
  {
    title: '登记日期',
    dataIndex: 'createDate',
    customRender: ({ text }) => text && formatTime(text, 'YYYY-MM-DD'),
    width: '9%',
  },
]

export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      isAdd: true,
      quickQryParam: '',
      loading: false,
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
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
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
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
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal() {
      this.visible = true
      this.getData()
    },
    handleCancel() {
      this.visible = false
      this.quickQry = ''
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleOk() {
      this.callback(this.selectedRows)
      this.handleCancel()
    },
    getInitialData() {
      this.quickQryParam = ''
      this.getData()
    },
    getData() {
      const { page, size, quickQryParam } = this
      this.loading = true
      window.$oAjax({
        url: `${window.$oApi.contractTestReport.contractList}&feeType=1`,
        method: 'POST',
        data: qs.stringify({
          page,
          rows: size,
          // sort: "experience",
          order: 'desc',
          quickQryParam,
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.rows) {
          this.data = res.rows
          this.pagination.pageSize = size
          this.pagination.current = page
          this.pagination.total = res.total
          this.loading = false
        }
      })
    },
  },
}
</script>

<style lang="less">
.report-contractModal-modal {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    word-wrap: break-word;
  }
}
</style>
