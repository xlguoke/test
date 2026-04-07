<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="invoiceManagement-add">
        <div class="invoiceManagement-add-title">
          基本信息
        </div>
        <a-form ref="formRef" :model="data">
          <a-row :gutter="15">
            <a-col :span="8">
              <a-form-item
                label="发票号"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '发票号为必填项！' }]"
                name="no"
              >
                <a-input
                  v-model:value="data.no"
                  :placeholder="getPlaceholder('请输入发票号')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票日期"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '开票日期为必填项！' }]"
                name="invoicingDate"
              >
                <a-date-picker
                  v-model:value="data.invoicingDate"
                  style="width: 100%"
                  :placeholder="getPlaceholder('请选择')"
                  :disabled="readonly"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="发票抬头"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '发票抬头为必填项！' }]"
                name="subject"
              >
                <a-input
                  v-model:value="data.subject"
                  :placeholder="getPlaceholder('请输入发票抬头')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票金额"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '开票金额为必填项！' }]"
                name="amount"
              >
                <a-input-number
                  v-model:value="data.amount"
                  :style="`width: ${readonly ? '100' : '85'}%`"
                  :formatter="formatMoney"
                  :placeholder="getPlaceholder('请输入开票金额')"
                  :disabled="readonly"
                />
                <a
                  v-if="!readonly"
                  href="javascript:;"
                  style="
                    font-size: 20px;
                    margin-left: 10px;
                    vertical-align: middle;
                  "
                  title="汇总"
                  @click="onSummary"
                >
                  <TransactionOutlined />
                </a>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="纳税人识别号"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
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
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
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
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
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
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
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
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input
                  v-model:value="data.paymentUnit"
                  :placeholder="getPlaceholder('请输入缴费单位')"
                  :disabled="readonly"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税率"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input-number
                  v-model:value="data.taxRate"
                  style="width: 85%"
                  :placeholder="getPlaceholder('请输入税率')"
                  :disabled="readonly"
                />
                <span style="margin-left: 8px; vertical-align: middle">%</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税前金额"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input-number
                  v-model:value="data.preTaxAmount"
                  disabled
                  style="width: 100%"
                  :formatter="formatMoney"
                  :placeholder="getPlaceholder('请输入税前金额')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="税额"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input-number
                  v-model:value="data.taxAmount"
                  :formatter="formatMoney"
                  style="width: 100%"
                  :placeholder="getPlaceholder('请输入税额')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                label="开票人"
                :label-col="{ span: 7 }"
                :wrapper-col="{ span: 17 }"
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
                    :label-col="{ span: 7 }"
                    :wrapper-col="{ span: 17 }"
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
                    :label-col="{ span: 7 }"
                    :wrapper-col="{ span: 17 }"
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
                    :label-col="{ span: 7 }"
                    :wrapper-col="{ span: 17 }"
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
                    :label-col="{ span: 7 }"
                    :wrapper-col="{ span: 17 }"
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
                  <a-form-item>
                    <div style="display: flex">
                      <div
                        style="
                          width: 82px;
                          text-align: right;
                          font-size: 12px;
                          margin-right: 8px;
                          color: rgba(0, 0, 0, 0.85);
                        "
                      >
                        {{ item.columnName }}
                      </div>
                      <a-textarea
                        v-model:value="item.columnValue"
                        :disabled="item.disabled || readonly"
                        style="flex: 1"
                        :rows="4"
                        :placeholder="
                          getPlaceholder(`请输入${item.columnName}`)
                        "
                      />
                    </div>
                  </a-form-item>
                </span>
                <span v-else-if="item.columnType === 'date'">
                  <a-form-item
                    :label="item.columnName"
                    :label-col="{ span: 7 }"
                    :wrapper-col="{ span: 17 }"
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
              <a-form-item>
                <div style="display: flex">
                  <div
                    style="
                      width: 82px;
                      text-align: right;
                      font-size: 12px;
                      margin-right: 8px;
                      color: rgba(0, 0, 0, 0.85);
                    "
                  >
                    备注 :
                  </div>
                  <a-textarea
                    v-model:value="data.remark"
                    style="flex: 1"
                    :rows="4"
                    :placeholder="getPlaceholder('请输入备注')"
                    :disabled="readonly"
                  />
                </div>
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
              <a href="javascript:;" title="移除" @click="onDelete(index)">
                移除
              </a>
            </template>

            <template v-if="column.dataIndex === 'invoicedAmount'">
              <span
                :style="`color: ${
                  record.invoicedAmount + record.curInvoiceAmount
                  > record.totalAmount
                    ? 'red'
                    : ''
                };`"
              >¥
                {{
                  formatMoney(record.invoicedAmount + record.curInvoiceAmount)
                }}</span>
            </template>

            <template v-if="column.dataIndex === 'pendingInvoicingAmount'">
              <span
                v-if="
                  record.totalAmount
                    - (record.invoicedAmount + record.curInvoiceAmount)
                    < 0
                "
                style="color: red"
              >¥ 0</span>
              <span v-else>¥
                {{
                  formatMoney(
                    record.totalAmount
                      - (record.invoicedAmount + record.curInvoiceAmount),
                  )
                }}</span>
            </template>

            <template v-if="column.dataIndex === 'curInvoiceAmount'">
              <a-input-number
                v-if="!readonly"
                v-model:value="record.curInvoiceAmount"
                :min="0"
                :formatter="
                  (value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                style="text-align: right"
                @change="onClac(record)"
              />
              <span v-else>¥ {{ formatMoney(record.curInvoiceAmount) }}</span>
            </template>
          </template>
        </a-table>
        <div v-if="!readonly" class="invoiceManagement-add-btn">
          <a
            href="javascript:;"
            title="选择费用"
            @click="selectExpenseVisible = true"
          >
            <PlusCircleOutlined />
          </a>
          <a
            href="javascript:;"
            class="toolBtn-bar"
            title="自动匹配"
            @click="onAutoMatching"
          >
            <InteractionOutlined />
          </a>
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
  props: ['callback', 'type', 'invoiceId'],
  data() {
    return {
      selectExpenseVisible: false,
      matchingInvoiceVisible: false,
      data: {},
      autoMatchInvoicingAmount: 0,
      customFields: [],
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
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0)}`,
        },
        {
          title: '已缴费用',
          dataIndex: 'paidAmount',
          width: '9%',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0)}`,
        },
        {
          title: '待缴费用',
          dataIndex: 'pendingAmount',
          width: '9%',
          align: 'right',
          customRender: ({ text }) =>
            !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0)}`,
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
    }
  },
  watch: {
    // 监听四个关键字段的变化
    'data.amount': function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculateTaxFields('amount')
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

    await this.getCustomFields()
    // 新增时默认开票人
    if (this.type == 'add') {
      let userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        userInfo = JSON.parse(userInfo)
        this.data = {
          invoicingPerson: userInfo.realName,
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
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 金额格式化为千分位
    formatMoney(num) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /\d{1,3}(?=(\d{3})+$)/g
      return (`${num}`).replace(reg, '$&,')
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
          this.bills = res.data.bills
          this.data = { ...res.data }
          delete this.data.bills

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
      if (!record.curInvoiceAmount) {
        record.curInvoiceAmount = 0
      }
      window.$oForceUpdate()
    },
    // 获取选择的费用
    getExpenseBySelect(rows) {
      // 去重
      // eslint-disable-next-line array-callback-return
      rows.map((row) => {
        if (!this.bills.find(item => item.feeModelId == row.feeModelId)) {
          const {
            totalAmount,
            invoicedAmount,
            pendingInvoicingAmount,
            curInvoiceAmount,
          } = row
          this.bills.push({
            ...row,
            totalAmount: totalAmount || 0,
            invoicedAmount: invoicedAmount || 0,
            pendingInvoicingAmount: pendingInvoicingAmount || 0,
            curInvoiceAmount: curInvoiceAmount || 0,
          })
        }
      })
    },
    // 自动匹配
    onAutoMatching() {
      let feeDetailAmount = 0
      // eslint-disable-next-line array-callback-return
      this.bills.map((item) => {
        feeDetailAmount += item.curInvoiceAmount
      })

      const formData = { ...this.data }
      this.autoMatchInvoicingAmount = formData.amount - feeDetailAmount
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
    },
    // 获取自动匹配的结果
    getMatchingData() {

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
    handleSubmit(callback, errBack) {
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
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (e) {
          if (errBack) {
            errBack()
          }
          this.spinning = false
        }
        this.spinning = false

        if (res.code !== 20010) {
          message.success('操作成功')
          this.data = {}
          if (callback) {
            callback()
          }
        }
        else {
          if (errBack) {
            errBack()
          }
          message.error(res.message || res.msg)
        }
      })
    },
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
    if (this.data.preTaxAmount !== null)
      this.data.preTaxAmount = Number.parseFloat(this.data.preTaxAmount.toFixed(2))
    if (this.data.taxAmount !== null)
      this.data.taxAmount = Number.parseFloat(this.data.taxAmount.toFixed(2))
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-select-disabled .ant-select-selection),
:deep(.ant-input-number-disabled),
:deep(.ant-input[disabled]) {
  background: transparent;
  color: rgba(0, 0, 0, 0.65);
}
:deep(.ant-form-item) {
  margin-bottom: 18px;
}
:deep(.ant-form-explain) {
  font-size: 12px;
  position: absolute;
}
:deep(.ant-form-item-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.ant-form-item .ant-col-17) {
  height: 28px;
}
.invoiceManagement-add {
  padding: 15px;
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
