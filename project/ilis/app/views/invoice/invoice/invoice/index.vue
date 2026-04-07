<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="invoiceManagement-add">
        <div class="invoiceManagement-add-title">
          基本信息
        </div>
        <a-form
          ref="formRef"
          class="invoiceManagement-form"
          :model="data"
          :label-col="{ style: { width: '120px' } }"
          :wrapper-col="{ style: { flex: 1 } }"
        >
          <a-row :gutter="15">
            <a-col :span="8">
              <a-form-item
                label="发票号"
                :rules="[{ required: true, message: '发票号为必填项！' }]"
                name="no"
                class="w-full"
              >
                <a-input
                  v-model:value="data.no"
                  :placeholder="getPlaceholder('请输入发票号')"
                  :disabled="readonly"
                  @blur="
                    () => {
                      type !== 'edit' ? onCheckNo() : ''
                    }
                  "
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票日期"
                :rules="[{ required: true, message: '开票日期为必填项！' }]"
                name="invoicingDate"
              >
                <a-date-picker
                  v-model:value="data.invoicingDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :placeholder="getPlaceholder('请选择')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="发票抬头"
                :rules="[{ required: true, message: '发票抬头为必填项！' }]"
                name="subject"
              >
                <a-auto-complete
                  v-model:value="data.subject"
                  filter-option
                  :data-source="invoiceHeaderOptions"
                  :placeholder="getPlaceholder('请输入发票抬头')"
                  style="width: 100%"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票金额"
                :rules="[{ required: true, message: '开票金额为必填项！' }]"
                name="amount"
              >
                <div style="display: flex; align-items: center">
                  <div :style="`width: ${readonly ? '100' : '85'}%`">
                    <a-input-number
                      v-model:value="data.amount"
                      style="width: 100%"
                      :formatter="
                        (value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :precision="2"
                      :placeholder="getPlaceholder('请输入开票金额')"
                      :disabled="readonly"
                    />
                  </div>
                  <div style="flex: 1; height: 28px">
                    <a
                      v-if="!readonly"
                      href="javascript:;"
                      style="font-size: 20px; margin-left: 10px"
                      title="汇总"
                      @click="onSummary"
                    >
                      <TransactionOutlined />
                    </a>
                  </div>
                </div>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="纳税人识别号"
              >
                <a-input
                  v-model:value="data.taxpayerIdentificationNo"
                  :placeholder="getPlaceholder('请输入纳税人识别号')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="地址"
              >
                <a-input
                  v-model:value="data.address"
                  :placeholder="getPlaceholder('请输入地址')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="电话"
              >
                <a-input
                  v-model:value="data.phone"
                  :placeholder="getPlaceholder('请输入电话')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开户行及账号"
              >
                <a-input
                  v-model:value="data.account"
                  :placeholder="getPlaceholder('请输入开户行及账号')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="缴费单位"
              >
                <a-auto-complete
                  v-model:value="data.paymentUnit"
                  filter-option
                  :data-source="paymentUnitOptions"
                  :placeholder="getPlaceholder('请输入缴费单位')"
                  style="width: 100%"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税率"
              >
                <a-input-number
                  v-model:value="data.taxRate"
                  style="width: 85%"
                  :min="0"
                  :precision="2"
                  :placeholder="getPlaceholder('请输入税率')"
                  :disabled="readonly"
                />
                <span style="margin-left: 8px">%</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税前金额"
              >
                <a-input-number
                  v-model:value="data.preTaxAmount"
                  disabled
                  style="width: 100%"
                  :formatter="
                    (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  "
                  :min="0"
                  :precision="2"
                  :placeholder="getPlaceholder('请输入税前金额')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税额"
              >
                <a-input-number
                  v-model:value="data.taxAmount"
                  disabled
                  :formatter="
                    (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  "
                  style="width: 100%"
                  :min="0"
                  :precision="2"
                  :placeholder="getPlaceholder('请输入税额')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票人"
              >
                <a-input
                  v-model:value="data.invoicingPerson"
                  :placeholder="getPlaceholder('请输入开票人')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <template v-if="customFields.length > 0">
              <a-col
                v-for="item in customFields"
                :key="item.id"
                :span="item.columnType === 'textArea' ? 24 : 8"
              >
                <span v-if="item.columnType === 'inputNumber'">
                  <a-form-item
                    :label="item.columnName"
                  >
                    <a-input-number
                      v-model:value="item.columnValue"
                      style="width: 100%"
                      :disabled="item.disabled || readonly"
                      :placeholder="getPlaceholder(`请输入${item.columnName}`)"
                    />
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'input'">
                  <a-form-item
                    :label="item.columnName"
                  >
                    <a-input
                      v-model:value="item.columnValue"
                      style="width: 100%"
                      :disabled="item.disabled || readonly"
                      :placeholder="getPlaceholder(`请输入${item.columnName}`)"
                    />
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'radio'">
                  <a-form-item
                    :label="item.columnName"
                  >
                    <a-radio-group
                      v-model:value="item.columnValue"
                      :disabled="item.disabled || readonly"
                      name="radioGroup"
                    >
                      <a-radio value="是">是</a-radio>
                      <a-radio value="否">否</a-radio>
                    </a-radio-group>
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'select'">
                  <a-form-item
                    :label="item.columnName"
                    :disabled="readonly"
                  >
                    <a-select
                      v-model:value="item.columnValue"
                      :disabled="item.disabled || readonly"
                      :placeholder="getPlaceholder(`请输入${item.columnName}`)"
                      style="width: 100%"
                    >
                      <a-select-option
                        v-for="(v, index) in item._columnValue
                          ? item._columnValue.split(',')
                          : []"
                        :key="index"
                        :value="v"
                      >
                        {{ v }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'textArea'">
                  <a-form-item
                    :label="item.columnName"
                  >
                    <a-textarea
                      v-model:value="item.columnValue"
                      :disabled="item.disabled || readonly"
                      style="flex: 1"
                      :rows="4"
                      :placeholder="getPlaceholder(`请输入${item.columnName}`)"
                    />
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'date'">
                  <a-form-item
                    :label="item.columnName"
                  >
                    <a-date-picker
                      v-model:value="item.columnValue"
                      :disabled="item.disabled || readonly"
                      :placeholder="getPlaceholder(`请输入${item.columnName}`)"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </span>
              </a-col>
            </template>
            <a-col :span="24">
              <a-form-item
                label="备注"
              >
                <a-textarea
                  v-model:value="data.remark"
                  style="flex: 1"
                  :rows="4"
                  :max-length="300"
                  :placeholder="getPlaceholder('请输入备注，限制300个字符')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <div class="invoiceManagement-add-title">
          发票明细
        </div>
        <a-table
          :columns="columns"
          :data-source="bills"
          bordered
          row-key="feeModelId"
          :pagination="false"
          :row-class-name="rowClassName"
          :locale="{
            emptyText: '暂无发票明细',
          }"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'options'">
              <a href="javascript:;" class="text-blue-500" title="移除" @click="onDelete(index)">
                移除
              </a>
            </template>

            <template v-if="column.dataIndex === 'invoicedAmount'">
              <span
                :style="`color: ${
                  record.invoicedAmount > record.totalAmount ? 'red' : ''
                }`"
              >
                ¥ {{ formatMoney(record.invoicedAmount, 2) }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'pendingInvoicingAmount'">
              <span v-if="record.pendingInvoicingAmount < 0" style="color: red">¥ 0.00</span>
              <span v-else>¥ {{ formatMoney(record.pendingInvoicingAmount, 2) }}</span>
            </template>

            <template v-if="column.dataIndex === 'curInvoiceAmount'">
              <a-input-number
                v-if="!readonly"
                v-model:value="record.curInvoiceAmount"
                :precision="2"
                :formatter="
                  (value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                style="text-align: right; width: 100%"
                @change="onClac(record)"
              />
              <span v-else>¥ {{ formatMoney(record.curInvoiceAmount, 2) }}</span>
            </template>
          </template>
        </a-table>
        <div v-if="!readonly" class="invoiceManagement-add-btn">
          <a
            href="javascript:;"
            title="选择费用"
            class="mr-2 text-blue-500"
            @click="selectExpenseVisible = true"
          >
            <PlusCircleOutlined />
          </a>
          <a
            href="javascript:;"
            class="toolBtn-bar text-blue-500"
            title="自动匹配"
            @click="onAutoMatching"
          >
            <InteractionOutlined />
          </a>
        </div>

        <div v-if="!readonly" class="invoiceManagement-save">
          <a-button type="primary" size="large" @click="handleSubmit">
            保存
          </a-button>
        </div>
      </div>
    </a-spin>
    <SelectExpense
      v-model:value="selectExpenseVisible"
      @on-change="getExpenseBySelect"
    />

    <InvoiceMatching
      v-model:value="matchingInvoiceVisible"
      :invoicing-amount="autoMatchInvoicingAmount"
      @on-success="getMatchingData"
    />
  </div>
</template>

<script>
import { InteractionOutlined, PlusCircleOutlined, TransactionOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import {
  addInvoice,
  editInvoice,
  getInvoiceDetail,
  replaceInvoice,
} from '../api'
import InvoiceMatching from './invoiceMatching.vue'
import SelectExpense from './selectExpense.vue'

export default {
  components: {
    SelectExpense,
    InvoiceMatching,
    InteractionOutlined,
    PlusCircleOutlined,
    TransactionOutlined,
  },
  data() {
    return {
      type: getQueryVariable('type'),
      invoiceId: getQueryVariable('id'),
      fromPage: getQueryVariable('fromPage'),
      selectExpenseVisible: false,
      matchingInvoiceVisible: false,
      data: {},
      autoMatchInvoicingAmount: 0,
      customFields: [],
      paymentUnitList: [],
      feeType: [
        { name: '委托费用', id: 'FeeConsign' },
        { name: '合同费用', id: 'FeeContract' },
        { name: '综合报告费用', id: 'FeeReport' },
        { name: '报告重打费用', id: 'FeeReType' },
        { name: '报告修改费用', id: 'FeeUpdateReport' },
        { name: '其他费用', id: 'FeeOther' },
      ],
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
          width: '9%',
        },
        { title: '委托/报告/合同编号', dataIndex: 'code', width: '9%' },
        { title: '委托单位', dataIndex: 'consignUnit', width: '9%' },
        { title: '工程项目', dataIndex: 'project', width: '9%' },
        {
          title: '应缴费用',
          dataIndex: 'totalAmount',
          width: '9%',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0, 2)}`,
        },
        {
          title: '已缴费用',
          dataIndex: 'paidAmount',
          width: '9%',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0, 2)}`,
        },
        {
          title: '待缴费用',
          dataIndex: 'pendingAmount',
          width: '9%',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0, 2)}`,
        },
        {
          title: '已开票金额',
          dataIndex: 'invoicedAmount',
          align: 'right',
          width: '9%',
          scopedSlots: { customRender: 'invoicedAmount' },
        },
        {
          title: '未开票金额',
          dataIndex: 'pendingInvoicingAmount',
          align: 'right',
          width: '9%',
          scopedSlots: { customRender: 'pendingInvoicingAmount' },
        },
        {
          title: '本次开票金额',
          dataIndex: 'curInvoiceAmount',
          align: 'right',
          width: '12%',
          scopedSlots: { customRender: 'curInvoiceAmount' },
        },
        {
          title: '操作',
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
          align: 'center',
          width: '6%',
        },
      ],
      bills: [],
      spinning: false,
      readonly: false,
      noLoading: false,
      isIncludePreconsign: false,
      headerHistoryList: [],
      paymentHistoryList: [],
    }
  },
  computed: {
    // 备注
    // 费用处收费时，若存在预委托，会请求单独的接口获取发票抬头与缴费单位的下拉数据
    // 此处不影响之前预委托的逻辑，若不存在预委托数据时，才取系统的历史下拉数据
    // 注：不能简单的用paymentUnitList的长度来判断，因为预委托那边接口也可能获取到空数组
    invoiceHeaderOptions() {
      if (this.isIncludePreconsign) {
        return this.paymentUnitList
      }

      return this.headerHistoryList
    },
    paymentUnitOptions() {
      if (this.isIncludePreconsign) {
        return this.paymentUnitList
      }

      return this.paymentHistoryList
    },
  },
  watch: {
    // 监听关键字段的变化
    'data.amount': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculateTaxFields()
      }
    },
    'data.taxRate': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculateTaxFields()
      }
    },
  },
  async created() {
    this.readonly = this.type === 'detail'
    if (this.readonly) {
      this.columns.pop()
    }
    else {
      this.getHeaderHistory()
      this.getPaymentHistory()
    }

    await this.getCustomFields()
    if (this.type === 'add') {
      // 新增时默认开票人
      // 默认开票日期为当天
      let userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        userInfo = JSON.parse(userInfo)
        this.data = {
          invoicingPerson: userInfo.realName,
          invoicingDate: dayjs(new Date()).format(EDateFormatType.YYYY_MM_DD),
        }
      }

      if (this.fromPage === 'fee') {
        let invoiceBills = sessionStorage.getItem('invoiceBills')
        if (invoiceBills) {
          const paymentUnit = []

          invoiceBills = JSON.parse(invoiceBills)
          // 预委托单，获取委托单位开票信息
          this.getUnitBillinfo(invoiceBills)

          this.bills = invoiceBills.map((item) => {
            if (item.paymentCompany && !paymentUnit.includes(item.paymentCompany)) {
              paymentUnit.push(item.paymentCompany)
            }

            return {
              feeModelId: item.id,
              objectType: item.objectType, // 费用类型
              code: item.code, // 委托/报告/合同编号
              consignUnit: item.consignUnitName, // 委托单位
              project: item.projectName, // 工程项目
              totalAmount: item.feeTotal, // 应缴费用
              paidAmount: item.feePaid, // 已缴费用
              pendingAmount: item.needPay, // 待缴费用
              invoicedAmount: item.invoicedAmount, // 已开票金额
              _invoicedAmount: item.invoicedAmount,
              pendingInvoicingAmount: item.pendingInvoicingAmount, // 未开票金额
              curInvoiceAmount: 0, // 本次开票金额
            }
          })

          if (paymentUnit.length === 1) {
            this.data.paymentUnit = paymentUnit[0]
          }
        }
      }
    }
    else if (
      this.type == 'detail'
      || this.type == 'edit'
      || this.type == 'replace'
    ) {
      await this.getDetailData()
    }

    window.handleSubmit = this.handleSubmit
  },
  methods: {
    // 获取发票抬头历史下拉数据
    async getHeaderHistory() {
      const res = await window.$oAjax('rest/invoice-header/history')
      this.headerHistoryList = res.data
    },
    // 获取缴费单位历史下拉数据
    async getPaymentHistory() {
      const res = await window.$oAjax('rest/invoice/payment-company/history')
      this.paymentHistoryList = res.data
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取委托单位开票信息（预委托）
    async getUnitBillinfo(rows) {
      if (!rows || rows.length === 0)
        return
      const one = rows[0]
      const isSamePre = rows.every(
        d => d.isPreconsign == 1 && d.consignUnitName === one.consignUnitName,
      )
      if (!isSamePre)
        return
      const preInfo = await window.$oAjax.get('/rest/pre/consign/deploy')
      if (preInfo.code !== 20000) {
        return
      }

      this.isIncludePreconsign = true
      window.$oAjax
        .get(`${preInfo.data.url}api/services/app/ILISIntegration/GetInvoice`, {
          params: {
            ID: one.preConsignId,
            AuthCode: preInfo.data.code,
          },
        })
        .then((res) => {
          if (!res.result)
            return
          const obj = res.result
          const account = `${obj.bank}${
            obj.bank && obj.bankAccount ? '：' : ''
          }${obj.bankAccount}`

          this.data.subject = obj.companyName
          this.data.taxpayerIdentificationNo = obj.tin
          this.data.address = obj.addr
          this.data.phone = obj.tel
          this.data.account = account
          this.initPaymentUnitList(rows, obj.companyName)
        })
        .catch((err) => {
          console.error(err)
          this.initPaymentUnitList(rows)
        })
    },
    initPaymentUnitList(invoiceBills, companyName) {
      // 缴费单位取选择的费用中所有待缴单位和委托单位数据
      const paymentUnitList = [companyName]
      // eslint-disable-next-line array-callback-return
      invoiceBills.map((item) => {
        if (!paymentUnitList.includes(item.paymentCompany)) {
          paymentUnitList.push(item.paymentCompany)
        }

        if (!paymentUnitList.includes(item.consignUnitName)) {
          paymentUnitList.push(item.consignUnitName)
        }
      })
      this.paymentUnitList = paymentUnitList
      this.data.paymentUnit = paymentUnitList[0] || ''
      this.data.subject = paymentUnitList[0] || ''
    },
    // 检查发票号
    async onCheckNo() {
      const no = this.data.no
      this.noLoading = true
      let res = {}
      try {
        res = await window.$oAjax.get('/rest/invoice/snd', {
          params: { no },
        })

        if (res.code === 20000) {
          if (res.data === true) {
            if (res.data) {
              window.$oAntdModal.warning(window.$oMsgTips.info(`注意：发票编号：${no} 重复，请重新输入`))
            }
          }
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求异常，请稍后再试'),
          )
        }
      }
      catch (e) {
        console.error(e)
      }

      this.noLoading = false

      return res.data
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
    // 控制placeholder显示
    getPlaceholder(val) {
      if (this.readonly) {
        return ''
      }
      else {
        return val
      }
    },
    // 格式化moment时间
    formatMomentDate(val) {
      if (val) {
        return dayjs(val)
      }
      else {
        return null
      }
    },
    // 获取登记的发票详情
    async getDetailData() {
      this.spinning = true
      try {
        const res = await getInvoiceDetail(this.invoiceId)
        this.spinning = false
        if (res.code !== 20010) {
          this.bills = res.data.bills.map(bill => ({
            ...bill,
            _invoicedAmount: bill.invoicedAmount - bill.curInvoiceAmount,
          }))
          this.data = { ...res.data }
          delete this.data.bills
          delete this.data.createBy
          delete this.data.createDate
          delete this.data.createName
          delete this.data.unitCode
          delete this.data.updateBy
          delete this.data.updateDate
          delete this.data.updateName
          delete this.data.issued
          delete this.data.deleted
          delete this.data.sysCompanyCode

          // 已作废的发票，发票明细不显示 "已开票金额"和"未开票金额"
          if (this.data.deprecated === true) {
            this.columns = this.columns.filter(
              column =>
                column.dataIndex !== 'invoicedAmount'
                && column.dataIndex !== 'pendingInvoicingAmount',
            )
          }

          const customValues = res.data.customValues
          if (customValues && customValues.length > 0) {
            // 自定义属性赋值
            this.customFields = this.customFields.map((item) => {
              const obj = { ...item }
              const customObj = customValues.find(
                custom => custom.columnId === item.id,
              )
              if (customObj) {
                obj.columnValue = customObj.columnValue
              }
              return obj
            })
          }
        }
      }
      catch (e) {
        console.error(e)
        this.spinning = false
      }
    },
    // 删除发票明细
    onDelete(index) {
      Modal.confirm({
        title: '移除发票明细',
        content: `确认移除该明细吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.bills.splice(index, 1)
        },
      })
    },
    // 计算
    onClac(record) {
      let { curInvoiceAmount, _invoicedAmount, totalAmount } = record

      if (!curInvoiceAmount || typeof curInvoiceAmount !== 'number') {
        curInvoiceAmount = 0
      }

      // 已开票金额=该项费用之前已开具的发票的开票金额+录入的本次开票金额
      record.invoicedAmount = Number.parseFloat(
        (Number.parseFloat(_invoicedAmount) || 0) + curInvoiceAmount,
      ).toFixed(2)
      // 未开票金额=应缴费用-已开票金额，当值为负数时，显示0
      record.pendingInvoicingAmount = Number.parseFloat(
        (totalAmount || 0) - record.invoicedAmount,
      ).toFixed(2)

      window.$oForceUpdate()
    },
    // 获取选择的费用
    getExpenseBySelect(rows) {
      // 去重
      // eslint-disable-next-line array-callback-return
      rows.map((row) => {
        if (!this.bills.find(item => item.feeModelId == row.feeModelId)) {
          const { totalAmount, invoicedAmount, pendingInvoicingAmount } = row

          let curInvoiceAmount = (totalAmount || 0) - (invoicedAmount || 0)
          if (curInvoiceAmount < 0) {
            curInvoiceAmount = 0
          }

          this.bills.push({
            ...row,
            totalAmount: totalAmount || 0,
            invoicedAmount: invoicedAmount || 0,
            pendingInvoicingAmount: pendingInvoicingAmount || 0,
            curInvoiceAmount,
            _invoicedAmount: invoicedAmount,
          })
        }
      })

      if (!this.data.paymentUnit) {
        const paymentUnits = Array.from(new Set(this.bills.map(item => item.paymentUnitName)))
        if (paymentUnits.length === 1 && paymentUnits[0]) {
          this.data.paymentUnit = paymentUnits[0]
        }
      }
    },
    // 获取自动匹配的结果
    getMatchingData(rows) {
      // 自动匹配计算逻辑
      // 过滤掉费用明细中已存在的feeModalId
      // 将开票金额减去当前发票明细中所有本次开票金额的和，来分别填充（依据未开票金额）到自动匹配出来的费用明细中，之前已选择的发票明细不做修改
      // 直到用完为止，如不够则提示"自动匹配发票明细完成，发票明细开票金额总和小于本次发票开票金额，请确认"

      // 开票金额（需要减去当前明细开票金额总和，此处可直接用自动匹配时计算过的值）
      let amount = this.autoMatchInvoicingAmount
      // eslint-disable-next-line array-callback-return
      rows.map((row) => {
        // 去重
        if (!this.bills.find(item => item.feeModelId == row.feeModelId)) {
          let { totalAmount, invoicedAmount, pendingInvoicingAmount } = row
          pendingInvoicingAmount = pendingInvoicingAmount || 0

          let curInvoiceAmount = 0
          if (amount > 0) {
            // 开票金额大于该条数据的未开票金额，则直接赋值"本次开票金额"并将开票金额减去此部分
            if (amount > pendingInvoicingAmount) {
              curInvoiceAmount = pendingInvoicingAmount
              amount -= pendingInvoicingAmount
            }
            else {
              // 开票金额小于该条数据的未开票金额时，直接开票金额赋值到该条费用明细的"本次开票金额"
              curInvoiceAmount = amount
              amount = 0
            }
          }
          else {
            // 开票金额已被分配完时，后续的"本次开票金额"都为0
            curInvoiceAmount = 0
          }

          this.bills.push({
            ...row,
            totalAmount: totalAmount || 0,
            invoicedAmount: invoicedAmount || 0,
            pendingInvoicingAmount,
            curInvoiceAmount,
            _invoicedAmount: invoicedAmount,
          })
        }
      })

      if (amount > 0) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(
            '自动匹配发票明细完成，发票明细开票金额总和小于本次发票开票金额，请确认',
          ),
        )
      }
    },
    // 自动匹配
    onAutoMatching() {
      let feeDetailAmount = 0
      // eslint-disable-next-line array-callback-return
      this.bills.map((item) => {
        feeDetailAmount += item.curInvoiceAmount
      })

      const formData = { ...this.data }
      this.autoMatchInvoicingAmount = (formData.amount || 0) - feeDetailAmount
      if (this.autoMatchInvoicingAmount && this.autoMatchInvoicingAmount < 0) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(
            '当前发票的开票金额在发票明细中已分配完毕，无法自动匹配，请修改开票金额或发票明细',
          ),
        )
      }
      else {
        this.matchingInvoiceVisible = true
      }
      this.matchingInvoiceVisible = true
    },
    // 汇总
    onSummary() {
      let amount = 0
      if (this.bills && this.bills.length > 0) {
        // eslint-disable-next-line array-callback-return
        this.bills.map((item) => {
          amount += item.curInvoiceAmount || 0
        })
      }
      this.data.amount = amount
    },
    // 获取自定义属性
    getCustomFields() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'invoice',
          },
        })
        .then((res) => {
          this.customFields = (res.data || []).map((item) => {
            // 由于传给后端的key和自定义属性渲染下拉的key一样，此处修改下名称
            const obj = { ...item, _columnValue: item.columnValue }
            obj.columnValue = null
            return obj
          })
        })
    },
    // 提交
    async handleSubmit(callback, errBack) {
      if (this.type != 'edit') {
        // 发票号正在校验重复时，取消提交操作
        if (this.noLoading === true) {
          return
        }
        // 校验发票号是否重复
        if ((await this.onCheckNo()) === true) {
          return
        }
      }

      this.$refs.formRef.validateFields().then(async () => {
        const formData = { ...this.data }
        formData.bills = this.bills
        formData.customValues = this.customFields.map((custom) => {
          const obj = { ...custom }
          obj.columnId = obj.id

          // 格式化时间日期
          if (obj.columnType == 'date' && obj.columnValue) {
            obj.columnValue = dayjs(obj.columnValue).format('YYYY-MM-DD')
          }
          delete obj.id
          return obj
        })

        // 格式化时间日期
        if (formData.invoicingDate) {
          formData.invoicingDate = dayjs(formData.invoicingDate).format(
            'YYYY-MM-DD',
          )
        }

        this.spinning = true
        let res = {}
        try {
          if (this.type === 'add') {
            res = await addInvoice(formData)
          }
          else if (this.type === 'edit') {
            formData.id = this.invoiceId
            res = await editInvoice(formData)
          }
          else if (this.type === 'replace') {
            formData.id = this.invoiceId
            res = await replaceInvoice(formData)
          }
          else {
            res = await addInvoice(formData)
          }
        }
        catch (e) {
          console.error(e)

          errBack && errBack()
          this.spinning = false
        }
        this.spinning = false

        if (res.code !== 20010) {
          if (callback && typeof callback == 'function') {
            callback()
          }
          else {
            try {
              this.reloadList()

              top.layerSuccess && top.layerSuccess('操作成功')
              if (this.type === 'add') {
                top
                  .$('.J_menuTab[data-id=\'invoice.do?goInvoice&type=add\']')
                  .find('.fa-times')
                  .click()

                top
                  .$(
                    '.J_menuTab[data-id=\'invoice.do?goInvoice&type=add&fromPage=fee\']',
                  )
                  .find('.fa-times')
                  .click()
              }
              else {
                top
                  .$(
                    `.J_menuTab[data-id='invoice.do?goInvoice&type=${this.type}&id=${this.invoiceId}']`,
                  )
                  .find('.fa-times')
                  .click()
              }
            }
            catch (e) {
              console.error(e)
            }
          }
        }
        else {
          errBack && errBack()
          message.error(res.message || res.msg)
        }
      }).catch(() => {
        document.body.scrollTop = document.documentElement.scrollTop = 0
      })
    },
    // 刷新列表页
    reloadList() {
      try {
        const ele = top.$('iframe[src=\'invoice.do?goInvoiceManagement\']')
        const window = ele[0].contentWindow

        window.getData && window.getData()
      }
      catch (e) {
        console.error(e)
      }
    },
    // 计算税务相关字段
    calculateTaxFields() {
      // 确保至少有两个字段有值才能计算
      const filledFields = [
        this.data.amount !== undefined && this.data.amount !== null ? 'amount' : null,
        this.data.taxRate !== undefined && this.data.taxRate !== null ? 'taxRate' : null,
      ].filter(Boolean)

      if (filledFields.length < 2)
        return

      if (this.data.amount !== null && this.data.taxRate !== null) {
        this.data.preTaxAmount = this.data.amount / (1 + this.data.taxRate / 100)
        this.data.taxAmount = this.data.amount - this.data.preTaxAmount
      }

      // 确保数值精度
      if (this.data.taxAmount !== null)
        this.data.taxAmount = Number.parseFloat(this.data.taxAmount.toFixed(2))
      if (this.data.preTaxAmount !== null)
        this.data.preTaxAmount = Number.parseFloat(this.data.preTaxAmount.toFixed(2))
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-select-auto-complete::after) {
  content: '>';
  right: 9px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  z-index: 5;
  position: absolute;
  color: #d9d9d9;
  font-size: 18px;
  pointer-events: none;
}
:deep(.ant-select-auto-complete.ant-select .ant-input) {
  height: 28px;
  font-size: 12px;
}
:deep(.ant-select-auto-complete.ant-select .ant-input[disabled]),
:deep(.ant-select-disabled .ant-select-selection),
:deep(.ant-input-number-disabled),
:deep(.ant-input[disabled]) {
  background: transparent;
  color: rgba(0, 0, 0, 0.65);
}
:deep(.ant-form-explain) {
  font-size: 12px;
  position: absolute;
}
:deep(.ant-input-number) {
  vertical-align: initial;
}

.invoiceManagement-add {
  padding: 15px;
  padding-bottom: 80px;
  .invoiceManagement-save {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    margin-top: 15px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-top: solid 1px #e2e2e2;
    text-align: center;
    background: #fff;
    z-index: 1000;

    .ant-btn {
      font-size: 14px;
      height: 32px;
      padding: 0 12px;
    }
  }

  .invoiceManagement-add-title {
    border-bottom: solid 1px #e2e2e2;
    font-size: 14px;
    padding-bottom: 8px;
    margin-bottom: 16px;
    font-weight: bold;
  }

  .invoiceManagement-add-btn {
    padding-top: 8px;
    font-size: 20px;
  }
}
</style>
