<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="settlementApply text-sm" style="padding: 10px">
    <div class="from_wrap">
      <div class="input_box">
        <span class="lable">结算单编号：</span>
        <span class="value">{{ statementInfo.settlementCode }}</span>
      </div>
      <div class="input_box">
        <span class="lable">合同名称：</span>
        <span class="value">{{ statementInfo.contractName }}</span>
      </div>

      <div class="input_box">
        <span class="lable">合同编号：</span>
        <span class="value">{{ statementInfo.contractCode }}</span>
      </div>

      <div class="input_box">
        <span class="lable">合同类型：</span>
        <span v-if="statementInfo.contractType == 1" class="value">全包合同</span>
        <span v-else-if="statementInfo.contractType == 2" class="value">折扣合同</span>
        <span v-else-if="statementInfo.contractType == 4" class="value">单价合同</span>
      </div>
      <div class="input_box">
        <span class="lable"><span style="color: red">*</span>发票类型：</span>
        <span class="value">
          <a-select
            v-model:value="statementInfo.invoiceType"
            style="width: 200px"
          >
            <a-select-option value="VAT"> 增值税发票 </a-select-option>
            <a-select-option value="ORDINARY"> 普通发票 </a-select-option>
          </a-select>
        </span>
      </div>
      <div class="input_box">
        <span class="lable"><span style="color: red">*</span>结算日期：</span>
        <span class="value">
          <a-date-picker
            v-model:value="statementInfo.settlementDate"
            style="width: 200px"
            value-format="YYYY-MM-DD"
          /></span>
      </div>
      <div class="input_box">
        <span class="lable">结算期别：</span>
        <span class="value">
          <a-input-number
            v-model:value="statementInfo.settlementPeriod"
            placeholder="请输入期别"
            type=""
            style="width: 200px"
            @blur="chackPeriod"
          />
        </span>
      </div>
      <div class="input_box">
        <span class="lable">备注：</span>
        <span class="value">
          <a-input
            v-model:value="statementInfo.remark"
            placeholder="请输入备注"
            style="width: 200px"
          />
        </span>
      </div>
    </div>

    <div class="tle" style="">
      <h3>结算明细</h3>
      <span style="color: #29a915">注：若需在当前结算单中取消某费用项的结算，取消勾选该项费用即可</span>
    </div>

    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :scroll="{ x: 1500 }"
      :data-source="statementInfo.items"
      :loading="loading"
      bordered
      :pagination="false"
      row-key="consignId"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到数据',
      }"
    >
    </a-table>

    <div></div>
    <div class="tip_box">
      <span>
        本次结算金额合计:
        <a-input-number
          v-if="statementInfo.contractType == 1"
          v-model:value="statementInfo.settlementAmount"
          placeholder="请输入合计金额"
          style="width: 100px"
        />
        <span v-else>{{ statementInfo.settlementAmount }}</span>
      </span>
      <span style="margin: 0 30px">
        提交人：{{ statementInfo.submitter }}
      </span>
      <span> 提交日期：{{ statementInfo.submitTime }} </span>
    </div>

    <div>
      <a-upload
        :multiple="true"
        :file-list="fileList"
        :action="uploadUrl"
        :disabled="isDetail"
        @change="handleFileChange"
      >
        <a-button>选择文件 </a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
      </a-upload>
    </div>

    <div style="text-align: right">
      <!-- <a-button type="primary" @click="confirmCallBack">提交结算</a-button> -->
      <a-button type="primary" @click="downloadStatement">
        下载结算单
      </a-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import ajax from '~/providers/common/ajax'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import {
  createFinalStatement,
} from '../api'

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    SeniorQuery,
  },
  data() {
    return {
      pass: true,
      isDetail: false,
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      contractId: localStorage.getItem('contractId'),
      consignIds: localStorage.getItem('consignIds'),
      fileList: [],
      issuanceVisible: false,
      data: [],
      statementInfo: {
        settlementAmount: 0,
        settlementDate: dayjs().format('YYYY-MM-DD'),
      },
      tabIndex: 0,
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
          title: '委托编号',
          dataIndex: 'consignCode',
          align: 'center',
          width: 100,
        },
        { title: '样品名称', dataIndex: 'sampleName', width: 100 },
        {
          title: '规格型号',
          dataIndex: 'standard',
          width: 100,
        },
        { title: '检测参数', dataIndex: 'params', width: 300 },
        { title: '委托日期', dataIndex: 'consignDate', width: 100 },
        { title: '委托单位', dataIndex: 'consignUnit', width: 100 },
        { title: '工程项目', dataIndex: 'project', width: 200 },
        { title: '检测人', dataIndex: 'testPersons', width: 100 },
        { title: '协助人', dataIndex: 'helper', width: 100 },
        { title: '复核人', dataIndex: 'reviewPersons', width: 100 },
        { title: '审核人', dataIndex: 'auditPersons', width: 100 },
        { title: '批准人', dataIndex: 'approvePersons', width: 100 },
        { title: '报告编写人', dataIndex: 'reportEditor', width: 100 },
        { title: '费用类型', dataIndex: 'feeType', width: 100 },
        { title: '缴费状态', dataIndex: 'feeStatus', width: 100 },
        { title: '应收费用(元)', dataIndex: 'receivableAmount', width: 100 },
        { title: '已收费用(元)', dataIndex: 'paidAmount', width: 100 },
        // {
        //   title: "操作",
        //   dataIndex: "options",
        //   scopedSlots: { customRender: "options" },
        // },
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
            this.actualAmount()
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

          this.actualAmount()
        },
      }
    },
    // amount() {
    //   let p = 0
    //   this.selectedRows.forEach(it => {
    //     p += it.receivableAmount
    //   });
    //   this.statementInfo.settlementAmount = p
    //   return `${this.formatMoney(p, 2)}`
    // },
  },
  watch: {
    tabIndex(val) {
      if (val == 0) {
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
            if (text == 1) {
              return '自取'
            }
            else if (text == 2) {
              return '邮寄'
            }
            else if (text == 3) {
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
    window.confirmCallBack = this.confirmCallBack
  },
  methods: {
    actualAmount() {
      let p = 0
      this.selectedRows.forEach((it) => {
        p += it.receivableAmount
      })
      this.statementInfo.settlementAmount = p
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
    downloadStatement() {
      if (!this.selectedRowKeys.length) {
        message.warning('请选择一条数据')
        return
      }
      let st = ''
      this.selectedRowKeys.forEach((item, index) => {
        if (index >= this.selectedRowKeys.length - 1) {
          st += `consignIds=${item}`
        }
        else {
          st += `consignIds=${item}&`
        }
      })
      const url = `/ilis2/rest/fee/settlement/export/settlement/consign?${st}`
      window.open(url)
    },
    async chackPeriod() {
      if (
        this.statementInfo.settlementPeriod == ''
        || this.statementInfo.settlementPeriod == null
      ) {
        this.pass = true
        return
      }
      const res = await ajax.get(
        `/rest/fee/settlement/${this.contractId}/${this.statementInfo.settlementPeriod}/check-period`,
      )
      if (res.code !== 20000 || !res.data) {
        window.$oAntdMessage.warning(res.message || '结算期别重复!')
        // this.statementInfo.settlementPeriod = null
        this.pass = false
      }
      else {
        this.pass = true
      }
    },
    async confirmCallBack() {
      if (!this.selectedRows.length) {
        message.warning('请选择至少一条数据!')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      const files = []
      this.fileList.forEach((it) => {
        if (it.response.success) {
          files.push({ attachmentId: it.response.obj[0].id })
        }
      })
      const p = {
        ...this.statementInfo,
        attachments: files,
        items: this.selectedRows,
      }
      if (!p.settlementDate) {
        message.warning('请选择时间!')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      else {
        p.settlementDate = dayjs(p.settlementDate).format('YYYY-MM-DD')
      }
      this.chackPeriod()
      if (!this.pass) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }

      const res = await ajax.post(
        '/rest/fee/settlement/contract/settlement',
        JSON.stringify(p),
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )

      return res
    },
    handleFileChange({ fileList }) {
      this.fileList = fileList
      const idArr = []
      fileList.forEach((item) => {
        if (item.status == 'done') {
          if (item.response.success) {
            idArr.push(item.response.obj[0].id)
          }
          else {
            item.status = 'error'
          }
        }
      })
      this.attachmentIds = idArr.join(',')
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
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, queryParams, sortParams } = this
      const params = {
        // page,
        // size,
        // ...queryParams,
        // ...sortParams,
        // issued: this.tabIndex == 1 ? true : false,

        settlementType: 'CONTRACT_BILL',
        consignIds: this.consignIds.split(','),
        contractId: this.contractId,
      }

      // 获取列表
      this.loading = true
      try {
        const res = await createFinalStatement(params)

        this.loading = false

        if (res.code === 20000) {
          // eslint-disable-next-line ts/no-unused-expressions
          res.data.invoiceType ? '' : (res.data.invoiceType = 'VAT')
          this.statementInfo = res.data

          this.selectedRows = res.data.items
          this.selectedRowKeys = res.data.items.map((it) => {
            return it.consignId
          })
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          // this.selectedRowKeys = [];
          // this.selectedRows = [];
        }
        else {
          window.$oAntdConfirm({
            title: '提示',
            content: res.message,
            okText: '确认',
            mask: false,
            cancelText: '取消',
            onOk: () => {
              window.parent.layer.closeAll && window.parent.layer.closeAll()
            },
            onCancel() {
              window.parent.layer.closeAll && window.parent.layer.closeAll()
            },
          })
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
      e.preventDefault()
      this.getData(true)
    },
    reset() {
      this.queryParam = {}
      this.getData(true)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
