<!-- eslint-disable vue/eqeqeq -->
<template>
  <ht-modal
    v-model:open="detailsVisible"
    title="详情"
    width="90%"
    @ok="detailsVisible = false"
    @cancel="detailsVisible = false"
  >
    <div class="settlementApply" style="padding: 10px">
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
              :disabled="isDetail"
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
              :disabled="isDetail"
              value-format="'YYYY-MM-DD'"
              style="width: 200px"
            /></span>
        </div>
        <div class="input_box">
          <span class="lable">结算期别：</span>
          <span class="value">
            <a-input-number
              v-model:value="statementInfo.settlementPeriod"
              placeholder="请输入期别"
              type=""
              :disabled="isDetail"
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
              :disabled="isDetail"
            />
          </span>
        </div>
      </div>

      <div class="tle" style="">
        <!-- <h3>结算明细</h3>
          <span style="color: #29a915;">注：若需在当前结算单中取消某费用项的结算，取消勾选该项费用即可</span> -->
      </div>

      <a-table
        :custom-row="customRow"
        :columns="columns"
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
          <span>{{ statementInfo.settlementAmount }}</span>
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
          <a-button>选择文件</a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
        </a-upload>
      </div>

      <div style="text-align: right">
        <!-- <a-button type="primary" @click="confirmCallBack">提交结算</a-button> -->
        <!-- <a-button type="primary" @click="downloadStatement">下载结算单</a-button> -->
      </div>
    </div>
  </ht-modal>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
// import { createFinalStatement, exportStandingBook, revokeIssuance } from "../api";
import ajax from '~/providers/common/ajax'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    SeniorQuery,
  },
  data() {
    return {
      detailsVisible: false,
      isDetail: true,
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      contractId: localStorage.getItem('contractId'),
      consignIds: localStorage.getItem('consignIds'),
      fileList: [],
      issuanceVisible: false,
      data: [],
      statementInfo: {
        settlementAmount: 0,
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
      size: 10,

      columns: [
        {
          title: '编号',
          dataIndex: 'consignCode',
          align: 'center',
        },
        { title: '样品名称', dataIndex: 'sampleName' },
        {
          title: '规格型号',
          dataIndex: 'standard',
        },
        { title: '检测参数', dataIndex: 'params' },
        { title: '委托日期', dataIndex: 'consignDate' },
        { title: '委托单位', dataIndex: 'consignUnit' },
        { title: '工程项目', dataIndex: 'project' },
        { title: '检测人', dataIndex: 'testPersons' },
        { title: '协助人', dataIndex: 'helper' },
        { title: '复核人', dataIndex: 'reviewPersons' },
        { title: '审核人', dataIndex: 'auditPersons' },
        { title: '批准人', dataIndex: 'approvePersons' },
        { title: '报告编写人', dataIndex: 'reportEditor' },
        { title: '费用类型', dataIndex: 'feeType' },
        { title: '缴费状态', dataIndex: 'feeStatus' },
        { title: '应收费用(元)', dataIndex: 'receivableAmount' },
        { title: '已收费用(元)', dataIndex: 'paidAmount' },
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
  watch: {},
  created() {
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
        return
      }
      const res = await ajax.get(
        `/rest/fee/settlement/${this.contractId}/${this.statementInfo.settlementPeriod}/check-period`,
      )
      if (res.code !== 20000 || !res.data) {
        window.$oAntdMessage.warning(res.message || '结算期别重复!')
        this.statementInfo.settlementPeriod = null
      }
    },
    async confirmCallBack() {},
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
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      }
    },
    async getData(id) {
      this.loading = true
      this.detailsVisible = true
      try {
        const res = await ajax.get(`/rest/fee/settlement/${id}`)
        this.loading = false

        if (res.code === 20000) {
          // eslint-disable-next-line ts/no-unused-expressions
          res.data.invoiceType ? '' : (res.data.invoiceType = 'VAT')
          this.statementInfo = res.data
          this.fileList = res.data.attachments.map((it) => {
            return {
              status: 'done',
              name: it.attachmentName,
              url: it.attachmentPath,
              uid: it.attachmentId,
            }
          })
          this.selectedRows = res.data.items
          this.selectedRowKeys = res.data.items.map((it) => {
            return it.consignId
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
  },
}
</script>

<style lang="less">
/*// @import "./index.less";
*/
</style>
