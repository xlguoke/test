<template>
  <div class="mailListConfig">
    <div class="mailListConfig-search">
      <span class="query_row">
        <span>签发日期：</span>
        <a-range-picker style="width: 250px" @change="onDateChange" />
      </span>
      <span class="query_row">
        <span>上报日期：</span>
        <a-range-picker style="width: 250px" @change="onDateAppearChange" />
      </span>

      <span class="query_row">
        <span>发放状态：</span>
        <a-select
          v-model:value="query.issueStatus"
          style="width: 150px"
          @change="search"
        >
          <a-select-option value=""> 全部 </a-select-option>
          <a-select-option value="1"> 已发放 </a-select-option>
          <a-select-option value="0"> 待发放 </a-select-option>
        </a-select>
      </span>

      <span class="query_row">
        <a-input
          v-model:value="query.quickQry"
          style="width: 300px"
          placeholder="委托单位/委托编号/报告编号/项目名称/检测人员"
          @press-enter="search"
        />
        <a-button type="primary" class="ml-3" @click="search">查询</a-button>
      </span>
    </div>

    <div style="height: 30px">
      <a-button
        v-permission="'correctedReport'"
        @click="reportCorrect"
      >
        报告更正
      </a-button>
      <a-button @click="columnScreen">
        列筛选
      </a-button>
      <a-button
        v-permission="'hyxtPushExport'"
        :loading="exportLoading"
        @click="exportFun"
      >
        导出
      </a-button>

      <a-select
        :key="regulatory.id"
        :default-value="regulatory.name"
        style="width: 150px; float: right; margin-bottom: 10px"
        @change="regulatoryChange"
      >
        <template #suffixIcon>
          <RetweetOutlined />
        </template>
        <a-select-option
          v-for="item in regulatoryList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>

    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :custom-row="customRow"
      :data-source="data"
      :row-class-name="rowClassName"
      bordered
      :loading="loading"
      row-key="id"
      :expanded-row-keys="expandedRowKeys"
      :scroll="{ x: 1200 }"
      @change="onChange"
      @expand="expandedRows"
      @expanded-rows-change="expandedData = []"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              href="javascript:;"
              title="报告详情"
              style="margin-right: 5px"
              @click="reportDet(record)"
            >
              报告详情
            </a>
            <a
              href="javascript:;"
              title="日志"
              style="margin-right: 5px"
              @click.stop="viewLog(record)"
            >
              日志
            </a>
          </span>
        </template>

        <template v-if="column.dataIndex === 'isTemporary'">
          <span>
            {{ record.isTemporary ? '是' : '否' }}
          </span>
        </template>

        <template v-if="column.dataIndex === 'isQualified'">
          <span v-if="record.isQualified === '1'"> 是 </span>
          <span v-else-if="record.isQualified === '0'"> 否 </span>
          <span v-else> 不判定 </span>
        </template>

        <template v-if="column.dataIndex === 'expandedRowRender'">
          <div>
            <a-table
              :columns="columnsChildren"
              :data-source="expandedData"
              :pagination="false"
              row-key="testObjectCode"
            >
            </a-table>
          </div>
        </template>
      </template>
    </a-table>

    <Logs ref="Logs" />
    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
  </div>
</template>

<script>
import { RetweetOutlined } from '@ant-design/icons-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { formatTime } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import ReportAmendModal from '~/views/report/amend/components/AddEditModal.vue'

const columnsChildren = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    key: 'testSampleDisplayName',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    key: 'testObjectCode',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    key: 'standard',
  },
  {
    title: '工程部位/用途',
    dataIndex: 'projectPartAndUse',
    key: 'projectPartAndUse',
  },
  {
    title: '试验参数',
    dataIndex: 'testObjectParams',
    key: 'testObjectParams',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
]

export default {
  components: {
    Logs,
    CustomColumn,
    RetweetOutlined,
  },
  emits: ['on-change'],
  data() {
    return {
      exportLoading: false,
      expandedData: [],
      expandedRowKeys: [],
      data: [],
      columns: [],
      columnsChildren,
      name: '',
      pagination: {
        current: 1,
        total: 0,
        pageSize: 5, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      loading: false,
      query: {
        quickQry: '',
        order: '',
        orderBy: '',
        issueStatus: '', // 发放状态
        signDateStart: '', // 签发时间
        signDateEnd: '',
        pushDateStart: '', // 上报时间
        pushDateEnd: '',
        regulatoryId: '', // 监管机构ID
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage == '1' || this._selectPage == '1') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
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
            }
            $emit(this, 'on-change', this.selectedRows)
          },
        }
      },
      regulatoryList: [], // 监管系统列表
      regulatory: {}, // 当前监管系统
      regulatoryConfig: {}, // 监管系统配置
    }
  },
  computed: {
    rowSelection() {
      return {
        type: this.selectPage == '1' ? 'radio' : 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          if (this.selectPage == '1' || this._selectPage == 1) {
            this.selectedRows = selectedRows.filter(
              item => !this.selectedRowKeys.includes(item.id),
            )
            this.selectedRowKeys = selectedRowKeys.filter(
              item => !this.selectedRowKeys.includes(item),
            )
            $emit(this, 'on-change', this.selectedRows)
          }
          else {
            this.selectedRowKeys = selectedRowKeys
            this.selectedRows = selectedRows
          }
        },
      }
    },
  },
  async created() {
    this.getRegulatoryList()
  },
  methods: {
    initFun() {
      this.getRegulatoryConfig()
      this.getData()
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'report-push-regulatory',
        '自定义列配置',
        false,
      )
    },
    async getColumns() {
      const apiUrl = `${window.$oApi.customColumn.getSelectColumns}?type=report-push-regulatory`
      try {
        const res = await window.$oAjax.get(apiUrl)
        if (res.code !== 20000 || res.data.length === 0) {
          window.$oAntdMessage.warning(res.message || res.msg || '获取自定义列失败')
          return
        }
        const list = []
        for (let i = 0; i < res.data.length; i++) {
          const item = res.data[i]
          if (list.find(d => d.key === item.columnKey))
            continue
          item.title = item.columnName
          item.key = item.columnKey
          item.dataIndex = item.columnKey
          item.width = 150
          if (
            [
              'signDate',
              'reviewDate',
              'auditDate',
              'consignDate',
              'hyxtPushDate',
            ].includes(item.columnKey)
          ) {
            item.customRender = ({ text }) =>
              text ? formatTime(text, 'YYYY-MM-DD') : ''
          }
          else if (item.columnKey === 'hyxtPushDate') {
            item.customRender = ({ text }) =>
              text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : ''
          }
          else if (item.columnKey === 'issueStatus') {
            // 发放状态
            item.width = 80
            item.customRender = ({ text }) => (text === '1' ? '已发放' : '未发放')
          }
          else if (item.columnKey === 'hyxtPushStatus') {
            // 上报状态
            item.width = 80
            item.customRender = ({ text }) => {
              if (text === 1) {
                return '上报成功'
              }
              else if (text === 2) {
                return '上报失败'
              }
              else if (text === 3) {
                return '上报中'
              }
              else {
                return '待上报'
              }
            }
          }
          else if (item.columnKey === 'stampStatus') {
            // 签章状态
            item.width = 80
            item.customRender = ({ text }) => {
              if (text === '10') {
                return '未签章'
              }
              else if (text === '15' || text === '20' || text === '70' || text === '80') {
                return '已签章'
              }
            }
          }
          else if (item.columnKey === 'printStatus') {
            // 打印状态
            item.width = 80
            item.customRender = ({ text }) => {
              if (text === '10') {
                return '待打印'
              }
              else if (text === '15') {
                return '打印中'
              }
              else if (text === '20') {
                return '已打印'
              }
            }
          }
          else if (item.columnKey === 'qrCode') {
            item.scopedSlots = { customRender: 'qrCodeRender' }
          }
          else if (item.columnKey === 'feedback') {
            item.scopedSlots = { customRender: 'feedback' }
          }
          else if (item.columnKey === 'isTemporary') {
            item.scopedSlots = { customRender: 'isTemporary' }
          }
          else if (item.columnKey === 'isQualified') {
            item.scopedSlots = { customRender: 'isQualified' }
          }
          else if (item.columnKey === 'reportNumber') {
            item.sorter = true
          }
          list.push(item)
        }
        list.push({
          title: '操作',
          dataIndex: 'operation',
          width: '120px',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        })
        this.columns = list
      }
      catch (err) {
        window.$oAntdMessage.warning(err.message || err.msg || '获取自定义列异常')
      }
    },
    reportDet(record) {
      const consignId = record.consignId
      const sampleId = record.objectId
      const reportId = record.id
      const testTaskId = record.taskId
      const reportType = record.reportType
      const isSynthesis = false

      if (!reportId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('该条记录没有生成报告！!'))
        return false
      }
      const reportUrl = `${rootUrl}/reportPrintController.do?goReportPrintDetail&reportId=${reportId}&reportType=${reportType}&isSynthesis=${isSynthesis}&consignIds=${consignId}&testTaskIds=${testTaskId}&sampleId=${sampleId}&moduleName=reportStampList`
      window.open(reportUrl, '报告详情')
    },
    viewLog(data) {
      this.$refs.Logs.showModal(data.id, 3)
    },
    async expandedRows(v, r) {
      if (v) {
        this.loading = true
        this.expandedRowKeys = [r.id]
        const res = await window.$oAjax.get(`rest/object/detail?reportId=${r.id}`)
        this.expandedData = res.data
        this.loading = false
      }
      else {
        this.expandedData = []
        this.expandedRowKeys = []
      }
    },

    onDateChange(v, fv) {
      if (fv[0] && fv[1]) {
        this.query.signDateStart = `${fv[0]} 00:00:00`
        this.query.signDateEnd = `${fv[1]} 23:59:59`
      }
      else {
        this.query.signDateStart = ''
        this.query.signDateEnd = ''
      }
      this.search()
    },
    onDateAppearChange(v, fv) {
      if (fv[0] && fv[1]) {
        this.query.pushDateStart = `${fv[0]} 00:00:00`
        this.query.pushDateEnd = `${fv[1]} 23:59:59`
      }
      else {
        this.query.pushDateStart = ''
        this.query.pushDateEnd = ''
      }
      this.search()
    },

    onChange(v, x, srotVal) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize

      this.query.order = srotVal.order === 'ascend' ? 'ASC' : 'DESC'
      this.query.orderBy = srotVal.field

      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    initColumn() {
      if (this.regulatoryConfig.securityCode !== true) {
        this.delColumns('qrCode')
      }
      else {
        const _hasQrCode = this.columns.find(it => it.dataIndex === 'qrCode')
        if (!_hasQrCode) {
          const qrCode = {
            title: '防伪码',
            dataIndex: 'qrCode',
            key: 'qrCode',
            width: '80px',
          }
          for (let i = this.columns.length - 1; i >= 0; i--) {
            if ('issueStatus'.includes(this.columns[i].dataIndex)) {
              this.columns.splice(i + 1, 0, qrCode)
            }
          }
        }
      }
      if (this.regulatoryConfig.captcha !== true) {
        this.delColumns('queryCode')
      }
      else {
        const _hasQueryCode = this.columns.find(
          it => it.dataIndex === 'queryCode',
        )
        if (!_hasQueryCode) {
          const queryCode = {
            title: '验证码',
            dataIndex: 'queryCode',
            key: 'queryCode',
            width: '80px',
          }
          const _hasQrCode = this.columns.find(it => it.dataIndex === 'qrCode')
          if (_hasQrCode) {
            for (let i = this.columns.length - 1; i >= 0; i--) {
              if ('qrCode'.includes(this.columns[i].dataIndex)) {
                this.columns.splice(i + 1, 0, queryCode)
              }
            }
          }
          else {
            for (let i = this.columns.length - 1; i >= 0; i--) {
              if ('issueStatus'.includes(this.columns[i].dataIndex)) {
                this.columns.splice(i, 0, queryCode)
              }
            }
          }
        }
      }
    },
    delColumns(d) {
      for (let i = this.columns.length - 1; i >= 0; i--) {
        if (d.includes(this.columns[i].dataIndex)) {
          this.columns.splice(i, 1)
        }
      }
    },

    getRegulatoryList() {
      this.loading = true
      window.$oRest.get('/rest/regulatory').then((res) => {
        if (res) {
          if (res.data.length < 1) {
            window.$oAntdModal.warning(window.$oMsgTips.info('没有获取到监管平台信息!'))
          }
          this.regulatoryList = res.data
          this.regulatory = res.data[0]
          this.query.regulatoryId = this.regulatory.id
          this.getRegulatoryConfig()
          this.getData()
        }
      })
    },
    async reportCorrect() {
      if (this.selectedRows.length !== 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据进行变更'))
        return
      }
      if (this.selectedRows[0].reviseRid) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(
            `报告${this.selectedRows[0].reportNumber}已发起报告更正！`,
          ),
        )
        return
      }
      try {
        const d = this.selectedRows[0]
        const res = await window.$oRest.get(`rest/report/amend/application/selectable/reports/${d.id}`)
        if (res.code !== 20000) {
          throw new Error(res)
        }
        AnyDialogHelper.showModel(ReportAmendModal, {
          type: 'edit',
          hideSaveBtn: true,
          reportInfo: res.data,
        })
      }
      catch (err) {
        console.error(err)
      }
    },
    getRegulatoryConfig() {
      this.loading = true
      window.$oRest
        .get(`/rest/regulatory/config/${this.regulatory.id}`)
        .then((res) => {
          if (res) {
            if (res.data.length < 1) {
              window.$oAntdModal.warning(window.$oMsgTips.info('没有获取到监管平台配置信息!'))
            }
            this.regulatoryConfig = res.data
            this.getColumns()
          }
        })
    },

    getData() {
      this.loading = true
      window.$oRest
        .get('rest/report/hyxt/pushed', {
          params: {
            ...this.query,
            page: this.pagination.current,
            size: this.pagination.pageSize,
          },
        })
        .then((res) => {
          if (res) {
            this.data = res.rows
            this.pagination.total = res.count
            this.selectedRowKeys = []
            this.selectedRows = []
          }
          this.loading = false
        })
    },

    search() {
      // this.query = this.name;
      this.pagination.current = 1
      this.getData()
    },

    /**
     *  行业管理系统切换
     *
     *  切换行业管理系统，相应的列表，配置都应该跟着切换
     * @param key
     */
    regulatoryChange(key) {
      const _regulatory = this.regulatoryList.find(it => it.id === key)
      if (_regulatory) {
        this.regulatory = _regulatory
        this.query.regulatoryId = this.regulatory.id
        this.getRegulatoryConfig()
        this.getData()
      }
    },
    // 导出
    exportFun() {
      let par = ''
      for (const k in this.query) {
        if (!this.query[k])
          continue
        par += `${par ? '&' : ''}${k}=${this.query[k]}`
      }
      this.exportLoading = true
      const url = `/ilis2/rest/report/hyxt/exportPushed?${par}`
      window.open(url, '_blank')
      setTimeout(() => {
        this.exportLoading = false
      }, 2000)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
