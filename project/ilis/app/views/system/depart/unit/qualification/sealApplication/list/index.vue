<template>
  <div class="sealApplication">
    <a-tabs v-model:active-key="tabValue" @change="tabValueChange">
      <a-tab-pane key="10" tab="待提交"></a-tab-pane>
      <a-tab-pane key="20" tab="审核中"></a-tab-pane>
      <a-tab-pane key="40" tab="已通过"></a-tab-pane>
    </a-tabs>

    <a-form layout="inline" style="margin-bottom: 6px">
      <a-form-item v-if="TAB_1">
        <a-select
          v-model:value="query.stampAuditStatus"
          placeholder="请选择状态"
          style="width: 150px"
        >
          <a-select-option value="10,30">
            全部
          </a-select-option>
          <a-select-option value="10">
            待提交
          </a-select-option>
          <a-select-option value="30">
            未通过
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value.trim="query.queryCondition"
          placeholder="请输入报告编号/样品编号后回车即可查询"
          style="width: 350px"
          @keypress.enter="searchFun"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="searchFun">
          查询
        </a-button>
        <a-button @click="resetForm">
          重置
        </a-button>
        <a-button @click="advancedQueryVisible = true">
          高级查询
        </a-button>
      </a-form-item>
    </a-form>

    <!-- 高级查询 -->
    <AdvancedQuery2
      ref="AdvancedQuery"
      v-model:value="advancedQueryVisible"
      @submit="onAdvancedQuery"
      @reset="resetForm"
    />

    <div class="mt-4 mb-4">
      <template v-if="TAB_1">
        <a-button

          key="stamp_audit_submit"
          v-permission="'stamp_audit_submit'"

          @click="onSealApply()"
        >
          提交申请
        </a-button>
        <a-button

          key="assign_stamp_user"
          v-permission="'assign_stamp_user'"

          @click="onAssignSealUser"
        >
          指派签章人员
        </a-button>
        <a-button

          key="change_report_seal"
          v-permission="'change_report_seal'"

          @click="onSettingReportSeal"
        >
          设置/更换印章
        </a-button>
        <a-button

          key="report_back"
          v-permission="'report_back'"

          @click="onFlowReturn"
        >
          退回
        </a-button>
        <a-button

          key="notice_edit_consign"
          v-permission="'notice_edit_consign'"

          @click="onConsignModifyNotice"
        >
          通知修改委托
        </a-button>
        <a-button

          key="auto_match_stamp"
          v-permission="'auto_match_stamp'"

          :loading="autoSetLoading"
          @click="onAutoSet"
        >
          自动匹配印章
        </a-button>
      </template>

      <template v-if="TAB_2">
        <a-button

          key="stamp_audit_recall"
          v-permission="'stamp_audit_recall'"

          @click="onWithdrawApply()"
        >
          撤回申请
        </a-button>
        <a-button

          key="set_file_stamp"
          v-permission="'set_file_stamp'"

          @click="onSettingStampPage"
        >
          设置签章页码
        </a-button>
        <a-button

          key="assign_stamp_user"
          v-permission="'assign_stamp_user'"

          @click="onAssignSealUser"
        >
          指派签章人员
        </a-button>
      </template>

      <template v-if="TAB_3">
        <a-button

          key="set_file_stamp"
          v-permission="'set_file_stamp'"

          @click="onSettingStampPage"
        >
          设置签章页码
        </a-button>
        <a-button

          key="change_report_seal"
          v-permission="'change_report_seal'"

          @click="onSettingReportSeal"
        >
          设置/更换印章
        </a-button>
        <a-button

          key="report_back"
          v-permission="'report_back'"

          @click="onFlowReturn"
        >
          退回
        </a-button>
        <a-button

          key="notice_edit_consign"
          v-permission="'notice_edit_consign'"

          @click="onConsignModifyNotice"
        >
          通知修改委托
        </a-button>
      </template>

      <a-button

        v-permission="'set_cross_page_stamp'"

        @click="onSettingPageSeal"
      >
        设置骑缝章
      </a-button>
      <a-button @click="onCustomColumn">
        列筛选
      </a-button>
    </div>

    <a-table
      id="tableBox"
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      bordered
      row-key="reportId"
      :scroll="{ y: tableHeight, x: scrollX }"
      :loading="loading"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'eleStampAuditStatus'">
          <a-tooltip
            placement="top"
            destroy-tooltip-on-hide
            @visible-change="
              (visible) => {
                visibleChange(visible, record)
              }
            "
          >
            <template #title>
              <span v-if="record.auditDetail">{{ record.auditDetail }}</span>
              <LoadingOutlined v-else />
            </template>

            <a-tag v-if="text == 10" color="#70b603">
              待提交
            </a-tag>
            <a-tag v-if="text == 20" color="#FF9800">
              审核中
            </a-tag>
            <a-tag v-if="text == 30" color="#d9001b">
              未通过
            </a-tag>
            <a-tag v-if="text == 40" color="#2196F3">
              审核完成
            </a-tag>
            <a-tag v-if="text == '00'" color="#9E9E9E">
              无需审核
            </a-tag>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'Action'">
          <div class="table-handle">
            <a
              v-if="TAB_1"
              v-permission="'stamp_audit_submit'"
              @click.stop="onSealApply(record.reportId)"
            >
              提交
            </a>
            <a
              v-if="TAB_2"
              v-permission="'stamp_audit_recall'"
              style="color: var(--colorError)"
              @click.stop="onWithdrawApply([record.reportId])"
            >
              撤回
            </a>
            <a @click.stop="checkReport(record)">详情</a>
            <a @click.stop="checkLog(record)">日志</a>
            <a @click.stop="checkFile(record)">附件</a>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 日志 -->
    <Logs ref="Logs" :relation-qry="true" />

    <!-- 附件 -->
    <ReportFile ref="ReportFile" />

    <!-- 提交申请 -->
    <SealApply
      v-model:value="sealApplyVisible"
      :report-ids="selectedRowKeys"
      :tab-value="tabValue"
      @on-success="onRefresh"
    />

    <!-- 指派签章人员 -->
    <AssignSealUser
      v-model:value="assignSealUserVisible"
      :report-ids="selectedRowKeys"
      @on-success="searchFun"
    />

    <!-- 流程退回 -->
    <FlowReturn
      v-model:value="flowReturnVisible"
      :report-ids="selectedRowKeys"
      @on-success="onRefresh"
    />

    <!-- 通知修改委托 -->
    <ConsignModifyNotice
      v-model:value="consignModifyNoticeVisible"
      :report-ids="selectedRowKeys"
      @on-success="searchFun"
    />

    <!-- 设置骑缝章 -->
    <SettingPageSeal
      v-model:value="settingPageSealVisible"
      :report-ids="selectedRowKeys"
      @on-success="searchFun"
    />

    <!-- 设置签章页码 -->
    <SettingStampPage
      v-model:value="settingStampPageVisible"
      :report-ids="selectedRowKeys"
      @on-success="searchFun"
    />

    <!-- 设置/更换印章 -->
    <SettingReportSeal
      v-model:value="settingReportSealVisible"
      :report-ids="selectedRowKeys"
      :reports="selectedRows"
      :api-type="2"
      :tab-value="tabValue"
      @on-success="searchFun"
      @on-submit="onAutoSubmit"
    />

    <!-- 列筛选 -->
    <CustomColumn ref="CustomColumn" @ok-btn="initColumns"></CustomColumn>
  </div>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { LoadingOutlined } from '@ant-design/icons-vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import Logs from '~/providers/components/logs.vue'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import AdvancedQuery2 from '../components/AdvancedQuery.vue'
import SealApply from '../components/SealApply.vue'
import AssignSealUser from '../components/AssignSealUser.vue'
import FlowReturn from '../components/FlowReturn.vue'
import ConsignModifyNotice from '../components/ConsignModifyNotice.vue'
import SettingPageSeal from '../components/SettingPageSeal.vue'
import ReportFile from '../components/ReportFile.vue'
import SettingStampPage from '../components/SettingStampPage.vue'
import SettingReportSeal from '../components/SettingReportSeal.vue'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import { CommonBodyReportService } from '~/providers/providers/services/common-body-report'
import { StampAuditService } from '~/providers/providers/services/stamp-audit'
import { ReportFileControllerService } from '~/providers/providers/services/reportFileController'
import { CommonService } from '~/providers/providers/services/common'

const commonBodyReportService = new CommonBodyReportService()
const stampAuditService = new StampAuditService()
const commonService = new CommonService()
const reportFileControllerService = new ReportFileControllerService()
const customColumnType = 'stamp_audit'

export default {
  components: {
    Logs,
    AdvancedQuery2,
    SealApply,
    AssignSealUser,
    FlowReturn,
    ConsignModifyNotice,
    CustomColumn,
    SettingPageSeal,
    ReportFile,
    SettingStampPage,
    SettingReportSeal,
    LoadingOutlined
  },
  data() {
    return {
      selectedRowKeys: [],
      selectedRows: [],
      tabValue: '10',
      tableHeight: 300,
      data: [],
      columns: [],
      loading: false,
      autoSetLoading: false,
      withdrawApplyLoading: false,
      settingReportSealVisible: false,
      settingStampPageVisible: false,
      settingPageSealVisible: false,
      consignModifyNoticeVisible: false,
      flowReturnVisible: false,
      assignSealUserVisible: false,
      sealApplyVisible: false,
      advancedQueryVisible: false,
      advancedQuery: {},
      query: {
        stampAuditStatus: '10,30',
        queryCondition: '',
      },
      page: 1,
      rows: 10,
      scrollX: false,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, rows) => {
          this.rows = rows
          this.page = 1
          this.getData()
        },
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        fixed: !!this.scrollX,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (keys, rows) => {
          this.selectedRowKeys = keys
          this.selectedRows = rows
        },
      }
    },
    TAB_1() {
      return this.tabValue == '10'
    },
    TAB_2() {
      return this.tabValue == '20'
    },
    TAB_3() {
      return this.tabValue == '40'
    },
  },
  async created() {
    this.tableHeight = (window.innerHeight || window.body.clientHeight) - 360
    await this.initColumns()
    this.getData()
  },
  methods: {
    tabValueChange() {
      this.initColumns()
      this.onRefresh()
    },
    onRefresh() {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.searchFun()
    },
    async initColumns() {
      const res = await commonService.chosenColumns(customColumnType)
      const columns = res.data.map((item, index) => {
        item.title = item.columnName
        item.key = item.columnKey
        item.dataIndex = item.key
        item.width = 120

        if (['signDate', 'sealDate'].includes(item.columnKey)) {
          item.customRender = function ({ text }) {
            return text ? formatTime(text, 'YYYY-MM-DD') : ''
          }
        }

        return item
      })

      if (!this.TAB_3) {
        columns.push({
          title: '状态',
          dataIndex: 'eleStampAuditStatus',
          width: 120,
          scopedSlots: { customRender: 'eleStampAuditStatus' },
        })
      }

      if (columns.length * 120 > document.body.clientWidth - 200) {
        this.scrollX = columns.length * 120
      } else {
        this.scrollX = false
      }

      columns.push({
        title: '操作',
        dataIndex: 'Action',
        width: 130,
        fixed: this.scrollX ? 'right' : false,
        scopedSlots: { customRender: 'Action' },
      })

      this.columns = columns
    },
    async visibleChange(visible, record) {
      if (visible) {
        if (record.auditDetail) {
          return
        }

        if (record.eleStampAuditStatus == '10') {
          record.auditDetail = `待${record.signUserName || ''}提交用印申请`
          return
        }

        if (record.eleStampAuditStatus == '20') {
          const res = await stampAuditService.auditNext(record.reportId, true)
          if (res.code === 20000) {
            record.auditDetail = `待${res.data || ''}审核`
          } else {
            record.auditDetail = res.message
          }
          return
        }

        if (record.eleStampAuditStatus == '30') {
          const res = await stampAuditService.auditDetail(record.reportId, true)
          if (res.code === 20000) {
            const data = res.data
            let auditDetail = data.userRealName
            data.pass
              ? (auditDetail += '审核通过')
              : (auditDetail += '审核不通过')
            data.comment && (auditDetail += `：${data.comment}`)
            record.auditDetail = auditDetail
          } else {
            record.auditDetail = res.message
          }
          return
        }

        record.auditDetail = '无需审核'
      }
    },
    onAdvancedQuery(advancedQuery) {
      this.query.queryCondition = ''
      this.advancedQuery = advancedQuery
      this.searchFun()
    },
    onSealApply(reportId) {
      if (reportId) {
        this.selectedRowKeys = [reportId]
      }

      this.checkSelectRowKeys() && (this.sealApplyVisible = true)
    },
    onAssignSealUser() {
      this.checkSelectRowKeys() && (this.assignSealUserVisible = true)
    },
    onFlowReturn() {
      this.checkSelectRowKeys() && (this.flowReturnVisible = true)
    },
    onConsignModifyNotice() {
      this.checkSelectRowKeys() && (this.consignModifyNoticeVisible = true)
    },
    onSettingPageSeal() {
      this.checkSelectRowKeys() && (this.settingPageSealVisible = true)
    },
    onSettingStampPage() {
      this.checkSelectRowKeys() && (this.settingStampPageVisible = true)
    },
    onSettingReportSeal() {
      this.checkSelectRowKeys() && (this.settingReportSealVisible = true)
    },
    async onAutoSubmit(submitList) {
      const selectedRowKeys = submitList.map((i) => i.reportId)
      selectedRowKeys.map(async (reportId) => {
        await stampAuditService.recall([reportId])
      })
      this.page = 1
      await this.getData()
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = submitList
      this.onSealApply()
    },
    async onAutoSet() {
      if (this.checkSelectRowKeys()) {
        this.onVerifyAutoSet(async (reportIds) => {
          this.autoSetLoading = true
          const res = await commonBodyReportService
            .autoSet(reportIds)
            .finally(() => {
              this.autoSetLoading = false
            })

          window.$oAntdMessage.success('操作成功！')
          this.searchFun()
        })
      }
    },
    async onVerifyAutoSet(cb) {
      const { selectedRowKeys, selectedRows } = this
      const content = []
      const convertPdfList = []
      const saveIds = []

      this.autoSetLoading = true
      const res = await stampAuditService
        .autoSetVerify(selectedRowKeys.join(','))
        .finally(() => {
          this.autoSetLoading = false
        })

      if (res.code !== 20010) {
        const data = res.data

        for (let i = 0; i < selectedRows.length; i++) {
          const item = selectedRows[i]
          const {
            picStampChange,
            extraStatementChange,
            sealChange,
            qualificationStatementChange,
          } = data[item.reportId]

          if (!sealChange) {
            if (qualificationStatementChange) {
              content.push(
                `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新资质声明；`
              )
              saveIds.push(item.reportId)
              convertPdfList.push(item)
            }
          } else {
            saveIds.push(item.reportId)

            if (extraStatementChange) {
              content.push(
                `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新报告附加声明；`
              )
            }

            if (picStampChange) {
              content.push(
                `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新图片签章；`
              )
            }

            if (qualificationStatementChange) {
              content.push(
                `报告[${item.reportNumber}]已生成PDF文件，需重新转换文件以更新资质声明；`
              )
            }

            if (
              extraStatementChange ||
              picStampChange ||
              qualificationStatementChange
            ) {
              convertPdfList.push(item)
            }
          }
        }

        if (saveIds.length == 0) {
          window.$oAntdMessage.success('操作成功！')
          return
        }

        if (content.length == 0) {
          cb(saveIds)
          return
        }

        window.$oAntdConfirm({
          title: '确定要修改印章信息吗？',
          content: () =>
            h(
              'div',
              content.map((c) => h('div', c))
            ),
          onOk: async () => {
            this.autoSetLoading = true
            convertPdfList.map(async (item) => {
              await reportFileControllerService.reconvertReport(item.reportId)
            })
            this.autoSetLoading = false

            setTimeout(() => {
              cb(saveIds)
            }, 300)
          },
        })
      }
    },
    onCustomColumn() {
      this.$refs.CustomColumn.showModal(customColumnType, '自定义列配置', false)
    },
    checkSelectRowKeys() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warn('请勾选数据后操作！')
        return false
      }

      return true
    },
    checkLog(row) {
      this.$refs.Logs.showModal(row.reportId, 3)
    },
    checkFile(row) {
      this.$refs.ReportFile.open(row.reportId)
    },
    checkReport(row) {
      const { reportId, consignId, taskId, reportType } = row

      let isSynthesis = false
      if ('synthesis' === reportType || 'synthesis_Temp' === reportType) {
        isSynthesis = true
      }

      let url =
        rootUrl +
        '/reportPrintController.do?goReportPrintDetail&reportId=' +
        reportId
      url += '&consignIds=' + consignId
      url += '&testTaskIds=' + taskId
      url += '&reportType=' + reportType
      url += '&isSynthesis=' + isSynthesis
      url += '&moduleName=pdfStampSignPage'

      window.open(url, '报告打印详情')
    },
    onWithdrawApply(ids) {
      const { selectedRowKeys } = this

      if (this.withdrawApplyLoading) {
        return
      }

      if (!ids && selectedRowKeys.length == 0) {
        window.$oAntdMessage.warn('请勾选数据后操作！')
        return
      }

      window.$oAntdConfirm({
        title: '确定要撤回用印申请吗？',
        content: '撤回用印申请后，将终止审核流程，请前往“待提交”查看！',
        onOk: async () => {
          this.withdrawApplyLoading = window.$oAntdMessage.loading('数据处理中...', 0)

          if (ids) {
            await stampAuditService.recall(ids[0])
          } else {
            for (let i = 0; i < selectedRowKeys.length; i++) {
              await stampAuditService.recall(selectedRowKeys[i])
            }
          }

          this.withdrawApplyLoading()
          this.withdrawApplyLoading = null
          window.$oAntdMessage.success('操作成功！')
          this.onRefresh()
        },
      })
    },
    async getData() {
      const { page, rows, tabValue, query, advancedQuery, TAB_1 } = this

      this.selectedRowKeys = []
      this.selectedRows = []

      this.loading = true
      const res = await stampAuditService
        .list({
          page,
          rows,
          ...query,
          stampAuditStatus: TAB_1 ? query.stampAuditStatus : tabValue,
          ...advancedQuery,
        })
        .finally(() => {
          this.loading = false
        })

      this.data = res.data.rows.map((item) => ({
        ...item,
        auditDetail: null,
      }))
      this.pagination.total = res.data.total
      this.pagination.current = page
      this.pagination.pageSize = rows
    },
    searchFun() {
      this.page = 1
      this.getData()
    },
    resetForm() {
      this.query = {
        stampAuditStatus: '10,30',
        queryCondition: '',
      }
      this.advancedQuery = {}
      this.$refs.AdvancedQuery.clearValue()
      this.searchFun()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
