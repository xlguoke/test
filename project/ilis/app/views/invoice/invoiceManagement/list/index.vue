<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="invoiceManagement">
    <div v-if="sourceType != 1">
      <a-space>
        <a-input
          v-model:value.trim="queryParams.query"
          placeholder="输入发票号码/发票抬头/或与发票关联的委托/报告/合同编号后回车即可查询"
          style="width: 450px"
          @press-enter="search"
        />
        <a-button class="toolBtn-bar" @click="search">
          查询
        </a-button>
        <a-button class="toolBtn-bar" @click="seniorQueryFun">
          切换到高级查询
        </a-button>
      </a-space>
    </div>
    <div
      v-if="sourceType != 1"
      style="
        padding-bottom: 10px;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px #e2e2e2;
      "
    >
      <a-button
        v-permission="'invoice:add'"
        type="primary"
        @click="onAddInvoice"
      >
        添加发票
      </a-button>
      <a-button
        v-permission="'invoice:deprecate'"
        class="toolBtn-bar"
        @click="onCancelInvoice"
      >
        作废发票
      </a-button>
      <a-button
        v-permission="'invoice:del'"
        class="toolBtn-bar"
        @click="onDeleteInvoice"
      >
        删除发票
      </a-button>
      <a-button
        v-permission="'invoice:export'"
        class="toolBtn-bar"
        @click="onExport"
      >
        导出
      </a-button>
      <a-button class="toolBtn-bar" @click="onPrint">
        打印
      </a-button>
      <a-button
        v-permission="'invoice:custom'"
        class="toolBtn-bar"
        @click="() => (propertyProfileVisible = true)"
      >
        自定义项配置
      </a-button>
      <a-button class="toolBtn-bar" @click="columnScreen">
        列筛选
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
      row-key="id"
      :row-class-name="rowClassName"
      :locale="{
        emptyText: '未查询到发票数据',
      }"
      :scroll="scroll"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'options'">
          <div class="table-handle">
            <a
              href="javascript:;"
              title="查看发票详情"
              @click.stop="onCheckInfo(record)"
            >
              查看
            </a>
            <a
              v-if="!record.deprecated && sourceType != 1"
              v-permission="'invoice:edit'"
              href="javascript:;"
              title="编辑发票"

              class="toolBtn-bar"
              @click.stop="onEdit(record)"
            >
              编辑
            </a>
            <a
              v-if="!record.deprecated && sourceType != 1"
              v-permission="'invoice:replace'"
              href="javascript:;"

              title="更换发票"
              class="toolBtn-bar"
              @click.stop="onReplace(record)"
            >
              更换
            </a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'mark'">
          <span
            v-if="record.deprecated"
            class="invoiceManagement-deprecated"
            title="已作废"
          >废</span>
        </template>
      </template>
    </a-table>

    <InvoiceModal ref="InvoiceModal" :callback="getData" />

    <ht-modal
      v-model:open="propertyProfileVisible"
      title="自定义字段配置"
      :mask-closable="false"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="invoice" />
    </ht-modal>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      class="invoiceManagement-query"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 17 }"
    >
      <template #amounts>
        <a-space>
          <a-input-number
            v-model:value="amounts[0]"
            style="width: 318px"
            placeholder="请输入开票金额"
            :formatter="
              (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            "
            :min="0"
            :precision="2"
          ></a-input-number>
          <span style="font-size: 12px">至</span>
          <a-input-number
            v-model:value="amounts[1]"
            style="width: 318px"
            placeholder="请输入开票金额"
            :formatter="
              (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            "
            :min="0"
            :precision="2"
          ></a-input-number>
        </a-space>
      </template>
      <template #invoicingDate>
        <a-range-picker
          v-model:value="invoicingDate"
          style="width: 100%"
          format="YYYY-MM-DD"
        />
      </template>
    </SeniorQuery>
    <CustomColumn ref="CustomColumn" @ok-btn="getCustomColumn">
    </CustomColumn>
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { printIds } from '~/providers/api/common'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import openHitekUdrTool from '~/providers/libs/openHitekUdrTool'
import {
  abandonInvoice,
  deleteInvoice,
  exportStandingBook,
  getInvoiceList,
} from '../api'
import InvoiceModal from './components/invoiceModal.vue'

const queryDataC = [
  {
    type: 'input',
    field: 'no',
    title: '发票号码',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'custom',
    field: 'invoicingDate',
    title: '开票日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'subject',
    title: '发票抬头',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'taxpayerIdentificationNo',
    title: '纳税人识别号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'paymentUnit',
    title: '缴费单位',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'invoicingPerson',
    title: '开票人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'custom',
    field: 'amounts',
    title: '开票金额',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'radio',
    field: 'deprecated',
    title: '发票是否作废',
    options: [
      { name: '正常发票', id: '0' },
      { name: '已作废发票', id: '1' },
      { name: '全部', id: '2' },
    ],
    default: '2',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'ambiguous',
    title: '按发票明细中委托/报告/合同编号查询',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    InvoiceModal,
    CustomProperty,
    SeniorQuery,
    CustomColumn,
  },
  data() {
    return {
      // 1 - 费用管理 - 查看发票
      sourceType: getQueryVariable('sourceType'),
      // 费用管理 - 查看发票 页面传过来的费用编号
      ambiguous: getQueryVariable('ambiguous'),
      rootUrl,
      data: [],
      searchType: 'invoiceManagement',
      queryData: queryDataC,
      queryParams: {
        query: '',
      },
      sortParams: {},
      scroll: {},
      amounts: [],
      invoicingDate: [],
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
      fields: [],
      baseFields: [
        { title: '标记', dataIndex: 'mark' },
        { title: '发票号码', dataIndex: 'no' },
      ],
      columns: [],
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
      propertyProfileVisible: false,
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
  async created() {
    await this.getCustomColumn()

    window.getData = this.getData
  },
  methods: {
    getCustomColumn() {
      window.$oAjax({
        url: window.$oApi.customColumn.getSelectColumns,
        method: 'GET',
        params: {
          type: this.searchType,
        },
      }).then((res) => {
        if (res && res.code === 20000) {
          const columns = res.data.map((it) => {
            return { title: it.columnName, dataIndex: it.columnKey }
          })
          this.fields = this.baseFields.concat(columns)
          this.getData(true)
        }
      })
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        this.searchType,
        '发票管理自定义列配置',
        false,
      )
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
        query: '', // #28508-青山说的高级查询中的重置应该重置掉普通查询中的条件
      }
      this.invoicingDate = []
      this.amounts = []

      this.getData(true)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params) {
      this.queryParams = {
        ...this.queryParams,
        ...params,
      }

      await this.getData(true)
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
      this.loading = true
      const params = {
        page,
        size,
        ...queryParams,
        ...sortParams,
        ambiguous: this.ambiguous || undefined,
      }

      // 格式化数据为后端需要的格式
      if (this.invoicingDate && this.invoicingDate.length == 2) {
        params.invoicingDate = [
          formatTime(this.invoicingDate[0], 'YYYY-MM-DD'),
          formatTime(this.invoicingDate[1], 'YYYY-MM-DD'),
        ].join(',')
      }
      else {
        params.invoicingDate = undefined
      }

      if (params.deprecated == 0) {
        params.deprecated = false
      }
      else if (params.deprecated == 1) {
        params.deprecated = true
      }
      else {
        params.deprecated = undefined
      }

      if (this.amounts && (this.amounts[0] || this.amounts[1])) {
        params.amounts = [this.amounts[0], this.amounts[1]].join(',')
      }
      else {
        params.amounts = undefined
      }

      // 获取列表
      const res = await getInvoiceList(params)
      this.loading = false

      if (res.code === 20000) {
        this.columns = this.fields.map((item) => {
          // 格式化table数据
          if (
            item.dataIndex === 'amount'
            || item.dataIndex === 'preTaxAmount'
            || item.dataIndex === 'taxAmount'
          ) {
            return {
              title: item.title,
              dataIndex: item.dataIndex,
              align: 'right',
              customRender: ({ text }) =>
                !text && text != 0 ? '' : `¥ ${this.formatMoney(text || 0, 2)}`,
            }
          }
          else if (item.dataIndex == 'taxRate') {
            return {
              title: item.title,
              dataIndex: item.dataIndex,
              align: 'right',
              customRender: ({ text }) => (!text && text !== 0 ? '' : `${text} %`),
            }
          }
          else if (
            item.dataIndex == 'no'
            || item.dataIndex == 'invoicingDate'
          ) {
            return {
              title: item.title,
              dataIndex: item.dataIndex,
              sorter: true,
            }
          }
          else if (item.dataIndex == 'mark') {
            return {
              title: item.title,
              align: 'center',
              dataIndex: item.dataIndex,
              scopedSlots: { customRender: item.dataIndex },
            }
          }
          else {
            return {
              title: item.title,
              dataIndex: item.dataIndex,
            }
          }
        })

        const width = `${100 / this.columns.length}%`
        this.columns = this.columns.map(item => ({
          ...item,
          width: item.dataIndex === 'mark' ? 80 : width,
        }))

        // 加入操作列
        this.columns.push({
          title: '操作',
          dataIndex: 'options',
          scopedSlots: { customRender: 'options' },
          width: 120,
          fixed: this.columns.length > 10 ? 'right' : undefined,
        })

        if (this.columns.length > 11) {
          this.scroll = { x: (this.columns.length + 1) * 120 }
        }
        else {
          this.scroll = {}
        }

        // 处理数据，将自定义属性数据赋值到外层
        this.data = res.data.rows.map((item) => {
          const customObj = {}
          // eslint-disable-next-line array-callback-return
          ;(item.customValues || []).map((custom) => {
            customObj[custom.columnId] = custom.columnValue
          })

          const obj = {
            ...item,
            ...customObj,
          }
          return obj
        })

        this.pagination.total = res.data.count
        this.pagination.current = page
        this.pagination.pageSize = size
        this.selectedRowKeys = []
        this.selectedRows = []
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
    // 登记发票
    onAddInvoice() {
      // this.$refs.InvoiceModal.showModal("add");

      top.addTabs
      && top.addTabs({
        id: 'onAddInvoice',
        title: '登记发票',
        close: false,
        url: `invoice.do?goInvoice&type=add`,
      })
    },
    // 查看发票详情
    onCheckInfo(row) {
      // this.$refs.InvoiceModal.showModal("detail", row.id);

      top.addTabs
      && top.addTabs({
        id: row.id,
        title: '发票详情',
        close: false,
        url: `invoice.do?goInvoice&type=detail&id=${row.id}`,
      })
    },
    // 编辑
    onEdit(row) {
      // this.$refs.InvoiceModal.showModal("edit", row.id);

      top.addTabs
      && top.addTabs({
        id: row.id,
        title: '编辑发票',
        close: false,
        url: `invoice.do?goInvoice&type=edit&id=${row.id}`,
      })
    },
    // 更换
    onReplace(row) {
      // this.$refs.InvoiceModal.showModal("replace", row.id);

      top.addTabs
      && top.addTabs({
        id: row.id,
        title: '更换发票',
        close: false,
        url: `invoice.do?goInvoice&type=replace&id=${row.id}`,
      })
    },
    // 作废发票
    onCancelInvoice() {
      if (this.selectedRows.length == 0) {
        message.warn('请选择要作废的数据！')
        return
      }

      Modal.confirm({
        title: '作废发票',
        content: `作废后的发票，将无法恢复。请谨慎操作，是否继续？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          for (let i = 0; i < this.selectedRows.length; i++) {
            await abandonInvoice(this.selectedRows[i].id)
          }
          message.success('操作成功')
          this.getData()
        },
      })
    },
    settingInfo() {
      this.$refs.ConfigModal.showModal()
    },
    // 导出
    async onExport() {
      message.info('正在导出，请稍等...')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryParams,
        ...this.sortParams,
      }
      delete params.page
      delete params.size
      exportStandingBook(params)
    },
    // 打印
    async onPrint() {
      if (this.selectedRowKeys.length == 0) {
        message.warn('请勾选要打印的发票！')
        return
      }

      const ids = {
        ids: this.selectedRowKeys.join('@@'),
        templateType: 'InvoiceLedger',
      }
      const result = await printIds(ids)
      if (result.code !== 20000) {
        return message.warn(
          result.msg || result.message || '服务异常，请稍后重新',
        )
      }
      this.openUdrOnClientIE(result.data)
    },
    // 获取token
    getTempLoginToken() {},
    // 打开浏览器
    openUdrOnClientIE(objectId) {
      const url
        = `${window.location.origin
        }/ilis2/fee/print/expenses.do?paramId=${
          objectId}`
      openHitekUdrTool(url, 'hide', true)
      // 以隐藏的方式打开
    },
    // 删除发票
    onDeleteInvoice() {
      if (this.selectedRows.length == 0) {
        message.warn('请选择要删除的数据！')
        return
      }

      Modal.confirm({
        title: '删除发票',
        content: `删除后的发票，将无法恢复。请谨慎操作，是否继续？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          for (let i = 0; i < this.selectedRows.length; i++) {
            await deleteInvoice(this.selectedRows[i].id)
          }
          message.success('删除成功')
          this.getData()
        },
      })
    },
    async handleProfile() {
      this.propertyProfileVisible = false
      await this.getData()
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        this.sortParams = {
          sort: sorter.field,
          order: sorter.order == 'ascend' ? 'asc' : 'desc',
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

<style lang="less" scoped>
@import './index.less';
:deep(.senior-modal .ant-modal-mask) {
  background: red;
}
</style>
