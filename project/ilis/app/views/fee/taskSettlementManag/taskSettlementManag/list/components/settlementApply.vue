<template>
  <div>
    <ht-modal
      v-model:open="settlementApplyVisible"
      title="结算申请"
      :mask-closable="false"
      :centered="true"
      width="80%"
      height="900px"
      @ok="confirmCallBack"
    >
      <div class="settlementApply" style="padding: 10px">
        <div class="from_wrap">
          <div class="input_box">
            <span class="lable">结算单编号：</span>
            <span class="value">{{ statementInfo.settlementCode }}</span>
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
                value-format="YYYY-MM-DD"
                style="width: 200px"
              /></span>
          </div>
          <!-- <div class="input_box">
              <span class="lable">结算期别：</span>
              <span class="value">
                <a-input-number placeholder="请输入期别" type="" v-model="statementInfo.settlementPeriod" @blur="chackPeriod"
                  style="width: 200px" />
              </span>
            </div> -->
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
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'options'">
              <a
                v-if="tabIndex == 1"
                href="javascript:;"
                title="查看发放发票详情"
                class="toolBtn-bar"
                @click.stop="onIssuanceCheckInfo(record)"
              >
                <FileTextOutlined />
              </a>
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

        <div></div>
        <div class="tip_box">
          <span>
            本次结算金额合计:
            <span>{{ statementInfo.settlementAmount }}</span>
          </span>
          <span style="margin: 0 30px">
            提交人：{{ statementInfo.submitter }}
          </span>
          <span> 提交时间：{{ statementInfo.submitTime }} </span>
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
          <a-button type="primary" @click="downloadStatement">
            下载结算单
          </a-button>
        </div>

        <!-- <a-button @click="confirmCallBack">提交结算</a-button> -->
      </div>
      <template #footer>
        <a-button @click="settlementApplyVisible = false">
          取消
        </a-button>
        <a-button type="primary" @click="confirmCallBack">
          确定
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { FileTextOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
// import { getUrlParams, formatMoney } from "~/providers/common/utils"
import ajax from '~/providers/common/ajax'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { createFinalStatement } from '../../api/index'

export default {
  components: {
    FileTextOutlined,
  },
  emits: ['onClose', 'getData'],
  data() {
    return {
      settlementApplyVisible: false,
      value: true,
      isDetail: false,
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      // contractId: localStorage.getItem("contractId"),
      // consignIds: localStorage.getItem("consignIds"),
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
  },
  watch: {},
  created() {},
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
    onClose() {
      $emit(this, 'onClose', false)
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
    async confirmCallBack() {
      if (!this.selectedRows.length) {
        message.warning('请选择至少一条数据!')
        return
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
      const res = await ajax.post(
        '/rest/fee/settlement/sporadic/settlement',
        JSON.stringify(p),
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
      if (res.code === 20000) {
        window.$oAntdMessage.success('操作成功')
        this.settlementApplyVisible = false
        $emit(this, 'getData')
      }
      else {
        window.$oAntdMessage.error(res.message)
      }
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
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      }

      this.getData(true)
    },
    async getData(ids) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, queryParams, sortParams } = this
      const params = {
        settlementType: 'SPORADIC',
        consignIds: ids,
        // "contractId": this.contractId
      }

      this.settlementApplyVisible = true
      // 获取列表
      this.loading = true
      try {
        const res = await createFinalStatement(params)
        if (res.code === 20000) {
          // eslint-disable-next-line ts/no-unused-expressions
          res.data.invoiceType ? '' : (res.data.invoiceType = 'VAT')
          this.statementInfo = res.data
          this.fileList = []

          this.selectedRows = res.data.items
          this.selectedRowKeys = res.data.items.map((it) => {
            return it.consignId
          })
          this.loading = false
          // this.pagination.total = res.data.count;
          // this.pagination.current = page;
          // this.pagination.pageSize = size;
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
              this.onClose(false)
            },
            onCancel() {
              this.onClose(false)
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
    // 发放发票
    onAdd() {
      if (this.selectedRowKeys.length == 0) {
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

    // 导出
    async onExport() {
      message.info('正在导出，请稍等...')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryParams,
        ...this.sortParams,
        issued: this.tabIndex == 1,
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
  },
}
</script>

<style lang="less" scoped>
.from_wrap {
  display: flex;
  flex-flow: wrap;
  .input_box {
    margin: 5px;

    .lable {
      display: inline-block;
      width: 100px;
      text-align: right;
      vertical-align: sub;
    }

    .value {
      display: inline-block;
      width: 300px;
      vertical-align: top;
    }
  }
}
.tle {
  padding-bottom: 10px;
  padding-top: 10px;
  margin-top: 10px;
  border-top: solid 1px #e2e2e2;
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
}
.tip_box {
  margin: 10px 0;
  padding: 10px;
  background: rgb(230 247 255);
  border: 1px solid #8cd1f2;
}
</style>
