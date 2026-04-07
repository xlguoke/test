<template>
  <div class="sampleScanRecord">
    <a-row :gutter="20">
      <div class="sampleScanRecord-search">
        <a-date-picker
          v-model:value="consignDateStart"
          style="width: 125px"
          value-format="YYYY-MM-DD"
          @change="chackTime"
        />
        -
        <a-date-picker
          v-model:value="consignDateEnd"
          style="width: 125px"
          value-format="YYYY-MM-DD"
          @change="chackTime"
        />

        <a-input
          v-model:value="quickQry"
          placeholder="请输入委托编号/样品编号/参数名称后回车即可查询"
          style="width: 280px"
          class="mx-2"
          @press-enter="search"
        />
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <!-- <a-button @click="reset" class="toolBtn-bar">重置</a-button> -->
        <a-button class="toolBtn-bar" @click="advancedQueryVisible = true">
          高级查询
        </a-button>
      </div>
    </a-row>
    <div style="">
      <a-button @click="downloadLedger">
        导出
      </a-button>
      <!-- <a-button @click="downloadLedger">列筛选</a-button> -->
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :scroll="{ x: 32 * 150, y: 480 }"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <!-- <Scan ref="Scan" :callback="search" @scan-sucesss="getScanResult" /> -->

      <!-- <template slot="operation" slot-scope="text, record">
          <div class='editable-row-operations'>
            <a-button type="link" @click.stop="() => consign(record)">查看委托</a-button>
            <a-button type="link" @click.stop="() => report(record)">查看报告</a-button>
            <a-button type="link" @click="(e) => viewLog(record)">查看日志</a-button>
          </div>
        </template> -->

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'actualTesters'">
          <div v-if="record.actualTesters">
            <span
              v-for="(item, index) in record.actualTesters"
              :key="index"
              style="margin-right: 10px"
            >{{ item.userName }}({{ item.ratio }})</span>
          </div>
        </template>
      </template>
    </a-table>
    <AdvancedQuery2
      ref="editModalRef"
      :visible="advancedQueryVisible"
      @visible-control="visibleControl"
      @ok="advancedQueryCB"
    />
    <!-- <Logs ref="Logs" /> -->
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import AdvancedQuery2 from './components/advancedQuery.vue'
// import Logs from "~/providers/components/logs.vue";

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: 150,
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: 150,
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
    width: 150,
  },
  {
    title: '检验类别',
    dataIndex: 'testType',
    width: 150,
  },
  {
    title: '检测大类',
    dataIndex: 'bigCategory',
    width: 150,
  },
  {
    title: '检验参数类别',
    dataIndex: 'paramCategory',
    width: 150,
  },
  {
    title: '检测参数',
    dataIndex: 'testParam',
    width: 150,
  },
  {
    title: '检测参数应收费用',
    dataIndex: 'paramReceivable',
    width: 150,
  },
  {
    title: '检测参数实收费用',
    dataIndex: 'paramActualFee',
    width: 150,
  },
  {
    title: '参数合同价格',
    dataIndex: 'paramContractFee',
    width: 150,
  },
  {
    title: '委托应收费用',
    dataIndex: 'consignReceivable',
    width: 150,
  },
  {
    title: '委托实收费用',
    dataIndex: 'consignActualFee',
    width: 150,
  },
  {
    title: '缴费状态',
    dataIndex: 'feeStatus',
    width: 150,
  },
  {
    title: '检测人',
    dataIndex: 'tester',
    width: 150,
  },
  {
    title: '登记人员',
    dataIndex: 'actualTesters',
    width: 150,
  },

  {
    title: '复核人',
    dataIndex: 'reviewer',
    width: 150,
  },
  {
    title: '审核人',
    dataIndex: 'auditor',
    width: 150,
  },
  {
    title: '批准人',
    dataIndex: 'approver',
    width: 150,
  },
  {
    title: '记录人',
    dataIndex: 'recorder',
    width: 150,
  },
  {
    title: '协助人',
    dataIndex: 'assistant',
    width: 150,
  },
  {
    title: '报告编写人',
    dataIndex: 'editor',
    width: 150,
  },
  {
    title: '签发日期',
    dataIndex: 'signDate',
    width: 150,
  },
  {
    title: '批准操作日期',
    dataIndex: 'approvePassDate',
    width: 150,
  },
  {
    title: '项目编号',
    dataIndex: 'consignProjectSn',
    width: 150,
  },
  {
    title: '工程项目',
    dataIndex: 'consignProject',
    width: 150,
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
    width: 150,
  },
  {
    title: '收费标准',
    dataIndex: 'chargeStandard',
    width: 150,
  },
  {
    title: '合同名称',
    dataIndex: 'contractName',
    width: 150,
  },
  {
    title: '合同编号',
    dataIndex: 'contractSn',
    width: 150,
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    width: 150,
  },
  {
    title: '合同折扣率',
    dataIndex: 'contractDepositRate',
    width: 150,
  },
  {
    title: '合同负责人',
    dataIndex: 'contractResponsiblePerson',
    width: 150,
  },
  // {
  //   title: '操作',
  //   width: 230,
  //   fixed: 'right',
  //   dataIndex: 'operation',
  //   scopedSlots: { customRender: 'operation' }
  // }
]

export default {
  components: {
    AdvancedQuery2,
    // Logs
  },
  data() {
    return {
      consignDateStart: '',
      consignDateEnd: '',

      exportParams: {},
      advancedQueryVisible: false,
      editId: '',
      data: [],
      quickQry: '',
      query: {},
      sortParams: null,
      columns,
      showCustomerSampleCode: false,
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
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
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
      }
    },
  },
  created() {
    this.consignDateEnd = dayjs().format('YYYY-MM-DD')
    this.consignDateStart = dayjs().subtract(1, 'month').format('YYYY-MM-DD')

    this.getData()
  },
  methods: {
    // viewLog(e, data) {
    //   this.$refs.Logs.showModal(data.id, '3');
    // },

    chackTime() {
      if (
        dayjs(this.consignDateEnd).diff(
          dayjs(this.consignDateStart),
          'days',
        ) > 365
      ) {
        this.consignDateEnd = dayjs().format('YYYY-MM-DD')
        this.consignDateStart = dayjs()
          .subtract(1, 'month')
          .format('YYYY-MM-DD')
        window.$oAntdMessage.warning('间隔不能大于一年，请重新选择!')
      }
    },

    advancedQueryCB(data) {
      this.query = { ...data }
      this.quickQry = ''
      this.page = 1

      this.getData()
      this.advancedQueryVisible = false
    },
    visibleControl(v) {
      this.advancedQueryVisible = v
    },
    // sorterChange(pagination, filters, sorter) {
    //   if (sorter.order) {
    //     let sorterObj = { "ascend": "asc", "descend": "desc" };
    //     this.sortParams = {
    //       "order": sorterObj[sorter.order],
    //       "sort": sorter.field
    //     };
    //   } else {
    //     this.sortParams = {};
    //   }
    //   this.getData();
    // },

    downloadLedger() {
      const p = qs.stringify(this.exportParams)
      window.open(`/ilis2/rest/user-production/export?${p}`)
    },
    onSelectChange(selectedRowKeys, row) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = row
    },
    getScanResult(result) {
      this.query.scode = result
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.query = { quickQry: this.quickQry }
      this.$refs.editModalRef.clearForm()
      this.getData()
    },

    reset() {
      this.query = {}
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size } = this
      this.loading = true

      const keyArr = Object.keys(this.query)
      const newData = {}
      keyArr.forEach((it) => {
        if (this.query[it] && this.query[it].length) {
          newData[it] = this.query[it]
        }
      })
      const params = {
        page,
        size,
        ...newData,
        consignDateStart: this.consignDateStart,
        consignDateEnd: this.consignDateEnd,
      }
      this.exportParams = params // 导出ex
      window.$oAjax({
        method: 'get',
        params,
        url: `/rest/user-production/pages`,
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
    returnSel() {
      return this.selectedRows
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
