<!-- eslint-disable vue/attribute-hyphenation -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="sampleScanRecord">
    <a-row :gutter="20">
      <div class="sampleScanRecord-search">
        <a-input
          v-model:value="q"
          placeholder="输入数据委托单位/工程项目/编号/样品名称后回车即可查询"
          style="width: 360px"
          @press-enter="search"
        />
        <a-button type="primary" class="ml-2" @click="search">
          查询
        </a-button>
        <a-button @click="advancedQueryVisible = true">
          高级查询
        </a-button>
      </div>
    </a-row>
    <div>
      <a-button
        v-permission="'export_all'"
        @click="downloadLedger"
      >
        导出全部查询结果
      </a-button>
      <a-button style="margin-left: 5px" @click="settingColumns">
        列筛选
      </a-button>
    </div>

    <div v-if="queryTag.length" class="flex gap-2 mt-2 flex-wrap">
      <a-tag
        v-for="item in queryTag"
        :key="item.key"
        closable
        @close="onCloseTag(item)"
      >
        {{ item.label }}：{{ item.value }}
      </a-tag>
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :scroll="{ x: scrollX, y: 550 }"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
      @change="changeSort"
      @resize-column="onResizeColumn"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'mark'">
          <IlisMarks :marks="initMarks(record)" />
        </template>
        <template v-if="column.dataIndex === 'formatValOrTip'">
          <a-tooltip>
            <template #title>
              <span>{{ text }}</span>
            </template>
            <p class="cell-ellipsis">
              {{ text }}
            </p>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'formatVal'">
          <p
            v-if="text && (`${text}`).includes('（预）')"
            class="cell-ellipsis"
          >
            <span style="color: #999c9e">{{ text }}</span>
          </p>
          <p v-else class="cell-ellipsis">
            {{ text }}
          </p>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a-button
              v-permission="'view_consign'"
              type="link"
              @click.stop="() => consign(record)"
            >
              查看委托
            </a-button>
            <a-button
              v-permission="'view_report'"
              type="link"
              @click.stop="() => report(record)"
            >
              查看报告
            </a-button>
            <a-button
              v-permission="'view_log'"
              type="link"
              @click="(e) => viewLog(record)"
            >
              查看日志
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
    <a-input
      v-model:value="tableKey"
      style="display: none"
      placeholder="用于修改表格宽度后刷新视图"
    ></a-input>
    <AdvancedQuery2
      ref="editModalRef"
      :key="JSON.stringify(defaultTestDate)"
      :visible="advancedQueryVisible"
      :defaultTestDate="defaultTestDate"
      @visible-control="visibleControl"
      @ok="advancedQueryCB"
    />
    <Logs ref="Logs" />

    <CustomColumn ref="CustomColumn" @ok-btn="refreshColumn"></CustomColumn>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import AdvancedQuery2 from './components/advancedQuery.vue'

const columns = [
  {
    title: '数据状态',
    dataIndex: 'process',
    width: 120,
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
    width: 120,
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
    width: 120,
  },
  {
    title: '工程部位/用途',
    dataIndex: 'projectPart',
    width: 120,
  },
  {
    title: '编号类别',
    dataIndex: 'codeType',
    width: 120,
  },
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: 120,
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: 120,
  },
  {
    title: '任务编号',
    dataIndex: 'taskCode',
    width: 120,
  },
  {
    title: '记录编号',
    dataIndex: 'recordCode',
    width: 120,
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
    width: 120,
  },
  {
    title: '来样编号',
    dataIndex: 'provideToCustomerSampleCode',
    width: 120,
  },
  {
    title: '样品名称',
    dataIndex: 'sampleName',
    width: 120,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: 120,
  },
  {
    title: '样品批号',
    dataIndex: 'sampleBatchNumber',
    width: 120,
  },
  {
    title: '样品生产厂家',
    dataIndex: 'sampleManufacture',
    width: 120,
  },
  {
    title: '资质类型',
    dataIndex: 'qualificationType',
    width: 120,
  },
  {
    title: '报告印章',
    dataIndex: 'reportSeals',
    width: 120,
  },
  {
    title: '检测形式',
    dataIndex: 'testType',
    width: 120,
  },
  {
    title: '委托类别',
    dataIndex: 'consignType',
    width: 120,
  },
  {
    title: '检测类别',
    dataIndex: 'checkType',
    width: 120,
  },
  {
    title: '数据来源',
    dataIndex: 'dataFrom',
    width: 120,
  },
  {
    title: '项目性质',
    dataIndex: 'projectNature',
    width: 120,
  },
  {
    title: '协作单位',
    dataIndex: 'cooperativeUnit',
    width: 120,
  },
  {
    title: '合同名称',
    dataIndex: 'contractName',
    width: 120,
  },
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    width: 120,
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    width: 120,
  },
  {
    title: '是否分包',
    dataIndex: 'subpackage',
    width: 120,
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
    width: 120,
  },
  {
    title: '建设项目',
    dataIndex: 'buildProjectName',
    width: 120,
  },
  {
    title: '检测参数（试验参数）',
    dataIndex: 'testParams',
    width: 500,
  },
  {
    title: '检测结果',
    dataIndex: 'testResults',
    width: 120,
  },
  {
    title: '检测结论',
    dataIndex: 'testVerdict',
    width: 350,
  },
  {
    title: '费用状态',
    dataIndex: 'feeStatus',
    width: 120,
  },
  {
    title: '缴费单位',
    dataIndex: 'paymentCompany',
    width: 120,
  },
  {
    title: '收费日期',
    dataIndex: 'chargeDate',
    width: 120,
  },
  {
    title: '所属部门',
    dataIndex: 'department',
    width: 250,
  },
  {
    title: '委托人',
    dataIndex: 'sampleSender',
    width: 120,
  },
  {
    title: '收样人',
    dataIndex: 'sampleAcceptor',
    width: 120,
  },
  {
    title: '取样人',
    dataIndex: 'samplingPerson',
    width: 120,
  },
  {
    title: '任务分配人',
    dataIndex: 'assigner',
    width: 120,
  },
  {
    title: '检测人员',
    dataIndex: 'testPersons',
    width: 120,
  },
  {
    title: '复核人',
    dataIndex: 'reviewPersons',
    width: 120,
  },
  {
    title: '审核人',
    dataIndex: 'auditPersons',
    width: 120,
  },
  {
    title: '批准人',
    dataIndex: 'approvePersons',
    width: 120,
  },
  {
    title: '报告编写人',
    dataIndex: 'reportEditor',
    width: 120,
  },
  {
    title: '项目负责人',
    dataIndex: 'projectPrincipal',
    width: 120,
  },
  {
    title: '项目创建人',
    dataIndex: 'projectCreator',
    width: 120,
  },
  {
    title: '要求报告日期(用户)',
    dataIndex: 'determineRequiredExternalDate',
    width: 120,
  },
  {
    title: '要求报告日期(内部)',
    dataIndex: 'determineRequiredInternalDate',
    width: 120,
  },
  {
    title: '委托日期',
    dataIndex: 'consignDate',
    width: 120,
  },
  {
    title: '分配日期',
    dataIndex: 'allocDate',
    width: 120,
  },
  {
    title: '检测日期（检测时间）',
    dataIndex: 'testTime',
    width: 120,
  },
  {
    title: '报告提交时间',
    dataIndex: 'submitReportTime',
    width: 120,
  },
  {
    title: '报告资质',
    dataIndex: 'reportQualifications',
    width: 250,
  },
  {
    title: '发放方式',
    dataIndex: 'issueWay',
    width: 120,
  },
  {
    title: '发放日期',
    dataIndex: 'issueDate',
    width: 120,
  },
  {
    title: '签发时间',
    dataIndex: 'signDate',
    width: 120,
  },
  {
    title: '批准日期',
    dataIndex: 'approveDate',
    width: 120,
  },
  {
    title: '操作',
    width: 230,
    fixed: 'right',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000 // 每天的毫秒数
  const firstTime = date1.getTime()
  const secondTime = date2.getTime()
  if (date1 >= date2) {
    return -1
  }
  return Math.ceil(Math.abs((firstTime - secondTime) / oneDay))
}

export default {
  components: {
    CustomColumn,
    AdvancedQuery2,
    Logs,
  },
  data() {
    return {
      scrollX: 5000,
      hiddenCell: [
        'testObjectCode',
        'contractName',
        'projectName',
        'projectPart',
        'consignUnit',
        'testParams',
        'testVerdict',
        'department',
      ],
      exportParams: {},
      advancedQueryVisible: false,
      editId: '',
      selectedRowKeys: [],
      data: [],
      q: '',
      query: {},
      sortParams: null,
      columns,
      showCustomerSampleCode: false,
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
      tableKey: 1,
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
      widthField: {
        testParams: 300,
        testVerdict: 240,
        department: 240,
        reportQualifications: 240,
        subpackage: 80,
      },
      exceedsDay: 0,
      markerConfigDatas: [],
      defaultTestDate: [],
      queryTag: [],
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
  async created() {
    try {
      this.exceedsDay = await getBusinessParamValue('TEST_DETECTION_38') || 0
    }
    catch (err) {
      cosnole.error(err)
    }
    this.initTestDate()
    await this.getMarkerConfigDatas()
    this.getColumn()
    this.getData()
  },
  methods: {
    onCloseTag(item) {
      this.queryTag = this.queryTag.filter(i => i.key !== item.key)
      delete this.query[item.key]
      this.$refs.editModalRef.queryForm[item.key] = ''

      this.getData()
    },
    initTestDate() {
      this.defaultTestDate = [dayjs().subtract(6, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      this.query.consignDateStart = this.defaultTestDate[0]
      this.query.consignDateEnd = this.defaultTestDate[1]

      this.queryTag = [
        { label: '开始委托日期', key: 'consignDateStart', value: this.query.consignDateStart },
        { label: '结束委托日期', key: 'consignDateEnd', value: this.query.consignDateEnd },
      ]
    },
    initMarks(row) {
      const marks = []
      if (row.consignStatus === '30') {
        marks.push({ mark: '废', description: '委托已作废', color: 'grey' })
      }
      else if (row.consignStatus === '40') {
        marks.push({ mark: '退', description: '任务退回（委托）', color: 'red' })
      }
      else if (row.consignStatus === '45') {
        marks.push({ mark: '退', description: '有样品退回', color: 'red' })
      }
      else if (row.consignStatus === '50') {
        marks.push({ mark: '通', description: '通知修改委托', color: 'green' })
      }
      else if (row.isPreconsign === '1') {
        marks.push({ mark: '预', description: '来源于预委托', color: '#07acc9' })
      }
      if (row.taskSource === '2') {
        marks.push({ mark: '综', description: '综合任务', color: 'blue' })
      }
      if (row.urgentStatus === '10') {
        marks.push({ mark: '急', description: '委托下有样品需要加急检测', color: 'green' })
      }

      if (row.agePeriod) {
        const agePeriodArr = row.agePeriod.split(',')
        const one = agePeriodArr.filter(d => d === '1').length
        const two = agePeriodArr.filter(d => d === '2').length
        const three = agePeriodArr.filter(d => d === '3').length
        // 龄期标记
        if (one > 0) {
          // 龄期即将到期，提醒
          marks.push({ mark: '龄', description: `即将到期${one > 1 ? ` × ${one}` : ''}`, color: 'blue' })
        }
        if (two > 0) {
          // 已超期
          marks.push({ mark: '龄', description: `已过期${two > 1 ? ` × ${two}` : ''}`, color: 'red' })
        }
        if (three > 0) {
          // 已到期，今天就是龄期试验的日期
          marks.push({ mark: '龄', description: `已到期${three > 1 ? ` × ${three}` : ''}`, color: 'green' })
        }
      }

      let msg = ''
      let diffDate = ''
      if (row.requireReportDate) {
        diffDate = row.requireReportDate
        msg = '已超过要求报告日期（用户）'
      }
      else if (row.internalReportDate) {
        diffDate = row.internalReportDate
        msg = '已超过要求报告日期（内部）'
      }
      else if (row.normFinishTime) {
        diffDate = row.normFinishTime
        msg = '已超过参数检测用时最大值'
      }
      if (diffDate && daysBetween(new Date(diffDate), new Date()) > this.exceedsDay) {
        marks.push({ mark: '超', description: msg, color: 'red' })
      }
      if (row.reportBpmStatus) {
        const reportBpmArr = row.reportBpmStatus.split(',')
        for (let i = 0; i < reportBpmArr.length; i++) {
          if (reportBpmArr[i] === '0') {
            marks.push({ mark: '退', description: '有报告退回来', color: 'red' })
            break
          }
        }
      }
      if (row.currentUserSign === '1') {
        marks.push({ mark: '待签', description: '待当前流程人员签字', color: '#2a9cdf', border: false, bg: '#e4edeb' })
      }
      if (row.autoIsQualified === '0') {
        marks.push({ mark: '不合格', description: '不合格', color: 'red', border: false, bg: '#ffebeb' })
      }
      else if ((row.autoIsQualified === 0 && row.isQualified && row.isQualified === '1') || row.autoIsQualified === '3') {
        marks.push({ mark: '指标不合格', description: '有指标不合格', color: '#f1891a', border: false, bg: '#ffe3c1' })
      }
      /** 报告更正状态: 默认(初始状态) */
      /** 报告更正状态: 更正中 */
      /** 报告更正状态: 更正完成(生成改状态时, 全部更正报告均已提交) */
      /** 报告更正状态: 更正报告退回 */
      if (row.reportReviseStatus === '10') {
        marks.push({ mark: '更', description: '报告更正中', color: 'red' })
      }
      else if (row.reportReviseStatus === '30') {
        marks.push({ mark: '更', description: '更正报告被退回', color: 'red' })
      }
      if (row.resNum >= 1) {
        // 已预约
        marks.push({ mark: '已预约', description: '已预约功能室', color: 'green', border: false })
      }
      else if (row.humitureRes === '1') {
        // 未预约
        marks.push({ mark: '未预约', description: '未预约功能室', color: 'red', border: false })
      }
      // 修改中
      if (row.beenModified === '1') {
        marks.push({ mark: '改', description: '本报告需修改', color: 'green' })
      }
      // 退回
      if (row.bpmStatus === '0' || row.reportStatus === '1') {
        marks.push({ mark: '退', description: '报告退回', color: 'red' })
      }
      if (row.backFrom === '15' || row.backFrom === '20') {
        // 这个退回 重新提交到当前节点
        marks.push({ mark: '退', description: '该报告从当前步骤退回又重新提交到当前步骤', color: 'green' })
      }
      // 显示报告最大状态签字 > 审核通过 > 代办
      if (row.signatureStatus === '70' || row.currentUserSign > 0) {
        marks.push({ mark: '待签', description: '待当前流程人员签字', color: '#df3226', border: false, bg: '#e9ed14' })
      }
      if (row.currentUserAuditTimes > 0) {
        marks.push({ mark: '审', description: '我已审核通过', color: 'green' })
      }
      // 其他人已处理,待我处理
      if (row.waitMeReview > 0) {
        marks.push({ mark: '待办', description: '其他人已处理，待我处理', color: '2a9cdf', border: false, bg: '#e4edeb' })
      }
      if (row.reportType === 'synthesis') {
        marks.push({ mark: '综', description: '综合报告', color: '#f75d00' })
      }
      // 已批: 待批准报告
      if (row.reportStatus === '20' && row.currentUserApproveTimes > 0) {
        marks.push({ mark: '批', description: '我已批准通过', color: 'green' })
      }
      if (row.tempReportFlag === '1') {
        marks.push({ mark: '临', description: '临时报告', color: 'green' })
      }
      if (row.noticedReceive === '1') {
        marks.push({ mark: '通', description: '已通知领取', color: 'blue' })
      }

      // 自定义标记
      if (row.markObjectColorTextIds) {
        this.initCustomMark(row.markObjectColorTextIds, marks)
      }

      return marks
    },
    initCustomMark(markIds, marks) {
      const configs = this.markerConfigDatas.filter(d => markIds.includes(d.id))
      if (configs.length > 0) {
        configs.forEach((d) => {
          marks.push({ mark: d.text, description: d.explainText, color: '#fff', border: false, bg: d.markColor })
        })
      }
    },
    /** 获取自定义标记配置 */
    async getMarkerConfigDatas() {
      try {
        const res = await window.$oAjax.get('markObjectColorTextController.do?listAllEnable')
        this.markerConfigDatas = res.obj || []
      }
      catch (err) {
        console.error(err)
      }
    },
    settingColumns() {
      this.$refs.CustomColumn.showModal('integration', '自定义列配置', false)
    },
    refreshColumn() {
      this.getColumn()
      this.getData()
    },
    onResizeColumn(width, col) {
      col.width = width
    },
    changeSort(c, x, sort) {
      if (sort.order) {
        this.query.order = sort.order === 'ascend' ? 'asc' : 'desc'
        this.query.sort = sort.column.columnKey || sort.field // sort.columnKey为undefined
      }
      else {
        delete this.query.order
        delete this.query.sort
      }
      this.getData()
    },
    getColumn() {
      const url = `${window.$oApi.customColumn.getSelectColumns}?type=integration`
      window.$oAjax.get(url).then((res) => {
        let allW = 0
        if (res.code === 20000 && res.data.length > 0) {
          const columns = res.data.map((d) => {
            const isTip = this.hiddenCell.includes(d.columnKey)
            const width = this.widthField[d.columnKey] || 120
            allW += width
            const sortColumn = [
              'consignCode',
              'consignDate',
              'testTime',
              'signDate',
              'reportNumber',
              'provideToCustomerSampleCode',
              'recordCode',
            ]
            if (sortColumn.includes(d.columnKey)) {
              return {
                width,
                resizable: true,
                title: d.columnName,
                dataIndex: d.columnKey,
                sorter: true,
                sortDirections: ['ascend', 'descend'],
                scopedSlots: {
                  customRender: isTip ? 'formatValOrTip' : 'formatVal',
                },
              }
            }
            else {
              return {
                width,
                resizable: true,
                title: d.columnName,
                dataIndex: d.columnKey,
                scopedSlots: {
                  customRender: isTip ? 'formatValOrTip' : 'formatVal',
                },
              }
            }
          })
          if (allW > window.innerWidth - 400 || columns.length > 9) {
            this.scrollX = Math.max(window.innerWidth, Number.parseInt(allW))
          }
          else {
            columns.forEach((d) => {
              delete d.width
            })
            this.scrollX = null
          }
          if (columns[0].dataIndex === 'mark') {
            columns[0].fixed = 'left'
          }
          columns.push({
            title: '操作',
            width: 230,
            fixed: 'right',
            dataIndex: 'operation',
            scopedSlots: { customRender: 'operation' },
          })

          this.columns = columns
        }
      })
    },
    async report(record) {
      const consignId = record.consignId
      const sampleId = record.objectId
      const reportId = record.reportId
      const testTaskId = record.taskId
      const reportType = record.reportType
      const isSynthesis = false

      if (!reportId) {
        top.layer.msg('该条记录没有生成报告！')
        return false
      }

      const res = await window.$oAjax.get(
        `/rest/reportAuditController/reportFileConvertInfo?reportId=${reportId}`,
      )
      // eslint-disable-next-line eqeqeq
      if (!(res.code == '20000' && res.data)) {
        top.layer.msg('当前任务暂未生成PDF报告文件，无法查看')
        return false
      }

      const reportUrl = `${rootUrl}/reportPrintController.do?goReportPrintDetail&reportId=${reportId}&reportType=${reportType}&isSynthesis=${isSynthesis}&consignIds=${consignId}&testTaskIds=${testTaskId}&sampleId=${sampleId}`
      window.open(reportUrl, '报告详情')
    },

    preset(text) {
      if (text.includes('（预）')) {
        return `<span style="color: #999c9e">${text}</span>`
      }
      else {
        return text
      }
    },

    consign(record) {
      const consignId = record.consignId
      if (!consignId) {
        top.layer.msg('该条记录没有委托信息！')
        return false
      }
      const url = `consignController.do?goEdit&id=${consignId}&detail=detailPage&notConsignPage=1`
      window.parent.topLayerOpenFun(
        top.layer,
        url,
        '委托信息',
        ['90%', '90%'],
        ['确定', '取消'],
        (indexs, rowObj) => {
          if (rowObj.success) {
            top.layer.close(indexs)
          }
        },
        (indexs) => {
          top.layer.close(indexs)
        },
      )
    },

    // viewLog(e, data) {
    //   this.$refs.Logs.showModal(data.id, '3');
    // },
    viewLog(record) {
      let type = 3
      let objectId = ''
      if (record.reportId != null) {
        objectId = record.reportId
      }
      else if (record.taskId != null) {
        type = 2
        objectId = record.taskId
      }
      else {
        type = 0
        objectId = record.consignId
      }

      const url
        = `tSLogProcessController.do?goProcessLogListPage&objectType=${
          type
        }&objectId=${
          objectId
        }&relationQry=${
          true}`
      window.parent.topLayerOpenFun(
        top.layer,
        url,
        '日志信息',
        ['80%', '90%'],
        ['确定', '取消'],
        (indexs, rowObj) => {
          if (rowObj.success) {
            top.layer.close(indexs)
          }
        },
        (indexs) => {
          top.layer.close(indexs)
        },
      )
    },

    advancedQueryCB(data, queryTag) {
      delete this.query.q
      this.query = { ...this.query, ...data }
      this.q = ''
      this.page = 1
      this.queryTag = queryTag

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
      if (this.pagination.total < 1) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const p = qs.stringify(this.exportParams)
      window.open(`/ilis2/rest/integration/export?${p}`)
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
      const order = this.query.order
      const sort = this.query.sort
      this.query = { ...this.query, q: this.q }
      this.query.order = order
      this.query.sort = sort
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
      }
      this.exportParams = params // 导出ex

      window.$oAjax.get(`/rest/integration`, { params }).then((res) => {
        if (res && res.data) {
          if (res.data.rows && res.data.rows.length) {
            res.data.rows.forEach((d, i) => {
              d.id = d.consignId + i
            })
          }
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
