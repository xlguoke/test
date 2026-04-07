<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="mailListConfig">
    <a-spin :spinning="spinning" tip="正在生成Excel表格，请稍后......">
      <div class="mailListConfig-search">
        <span class="query_row">
          <span>签发日期：</span>
          <a-range-picker style="width: 250px" @change="onDateChange" />
        </span>

        <span class="query_row">
          <span>打印状态：</span>
          <a-select
            v-model:value="query.printStatus"
            style="width: 150px"
            @change="search"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">已打印</a-select-option>
            <a-select-option value="0">待打印</a-select-option>
          </a-select>
        </span>
        <span class="query_row">
          <span>发放状态：</span>
          <a-select
            v-model:value="query.issueStatus"
            style="width: 150px"
            @change="search"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">已发放</a-select-option>
            <a-select-option value="0">待发放</a-select-option>
          </a-select>
        </span>

        <span v-show="regulatoryConfig.stamp === true" class="query_row">
          <span>签章状态：</span>
          <a-select
            v-model:value="query.stampStatus"
            style="width: 150px"
            @change="search"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">未签章</a-select-option>
            <a-select-option value="1">已签章</a-select-option>
          </a-select>
        </span>

        <span
          v-show="regulatoryConfig.reportFileType === 'INTERVENED'"
          class="query_row"
        >
          <span>报告文件：</span>
          <a-select
            v-model:value="query.fileUploadStatus"
            style="width: 150px"
            @change="search"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">未上传</a-select-option>
            <a-select-option value="1">已上传</a-select-option>
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
      <div style="padding-bottom: 10px">
        <a-button
          v-permission="'reportedSupervisorySystem'"
          :disabled="loadingBtn"
          type="primary"
          @click="uploadSystem"
        >
          上报监管系统
        </a-button>
        <a-button
          v-permission="'oneClickReport'"
          :disabled="loadingBtn"

          @click="uploadSystemAll"
        >
          一键上报
        </a-button>
        <template
          v-if="
            regulatoryConfig.securityCode === 'ALL'
              || regulatoryConfig.securityCode === 'INTERVENED'
          "
        >
          <a-button
            v-permission="'rerecordSecurityCode'"
            @click="affixSecurityCode"
          >
            补录防伪码
          </a-button>
          <a-button
            v-permission="'cancelRerecordSecurityCode'"
            @click="revokeAffixSecurityCode"
          >
            取消补录防伪码
          </a-button>
          <a-button
            v-permission="'batchSettingSecurityCode'"
            @click="handleClickSeting"
          >
            批量设置防伪码
          </a-button>
        </template>
        <a-button
          v-if="isopenConfigPerson"
          v-permission="'setReportedPersonnel'"
          @click="personnelReport"
        >
          设置上报人员
        </a-button>
        <a-button @click="columnScreen">
          列筛选
        </a-button>
        <a-button
          v-permission="'hyxtPushExport'"
          :loading="loadingExport"
          @click="exportFun"
        >
          导出
        </a-button>
        <span style="float: right">
          <a-select
            :key="regulatory.id"
            :default-value="regulatory.name"
            style="width: 150px"
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
        </span>
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
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'qrCode'">
            <span>
              {{ text }}
              <span v-if="record.additional" style="color: red">(补)</span>
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

          <template v-if="column.dataIndex === 'feedback'">
            <a-tooltip>
              <template #title>
                {{ text }}
              </template>
              <a>
                <p
                  style="
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    width: 100%;
                  "
                  @click="openErrorModel(record)"
                >
                  {{ text }}
                </p>
              </a>
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a
                href="javascript:"
                title="报告详情"
                style="margin-right: 5px"
                @click.stop="reportDet(record)"
              >
                报告详情
              </a>
              <a
                href="javascript:"
                title="日志"
                style="margin-right: 5px"
                @click.stop="viewLog(record)"
              >
                日志
              </a>
              <div @click.stop="">
                <a-upload
                  name="file"
                  :multiple="false"
                  :action="uploadUrl"
                  :show-upload-list="false"
                  accept=".pdf"
                  @change="handleUplaodChange"
                  @click.stop=""
                >
                  <a
                    v-if="regulatoryConfig.reportFileType === 'INTERVENED'"
                    href="javascript:"
                    title="上传"
                    @click="handleRow = record"
                  >
                    {{ record.hyxtFileUrl ? '重新上传' : '上传文件' }}
                  </a>
                </a-upload>
              </div>
            </span>
          </template>

          <template v-if="column.dataIndex === 'expandedRowRender'">
            <div>
              <a-table
                :columns="columnsChildren"
                :data-source="expandedData"
                :pagination="false"
                row-key="testObjectCode"
              ></a-table>
            </div>
          </template>
        </template>
      </a-table>
    </a-spin>
    <Logs ref="Logs" />
    <Position ref="position" @callback="getData" />
    <SetReportPerson ref="setReportPersonRef" @callback="getData" />
    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
    <AllPosition ref="AllPosition" @on-save="getData"></AllPosition>
    <ht-modal v-model:open="visibleError" title="提示">
      <div style="display: flex">
        <div style="padding-top: 10px">
          <ExclamationCircleOutlined
            style="
              font-size: 19px;
              color: #ff8400;
              vertical-align: text-bottom;
              margin-right: 7px;
            "
          />
        </div>

        <div style="padding-left: 10px; font-size: 14px">
          <p style="margin-top: 10px">
            {{ errorObj.title }}
          </p>
          <p v-for="item in errorObj.tipArr" style="margin-top: 10px">
            {{ item }}
          </p>
        </div>
      </div>
      <template #footer>
        <div style="height: 30px">
          <a-button
            type="primary"
            :loading="loading"
            @click="visibleError = false"
          >
            我知道了
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { ExclamationCircleOutlined, RetweetOutlined } from '@ant-design/icons-vue'
import sseRequestProgress from '~/components/sseRequestProgress'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import AllPosition from '../components/AllPosition.vue'
import Position from '../components/position.vue'
import SetReportPerson from '../components/setReportPerson.vue'

const columnsChildren = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    key: 'testSampleDisplayName',
    width: 150,
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    key: 'testObjectCode',
    width: 120,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    key: 'standard',
    width: 120,
  },
  {
    title: '工程部位/用途',
    dataIndex: 'projectPartAndUse',
    key: 'projectPartAndUse',
    width: 150,
  },
  {
    title: '试验参数',
    dataIndex: 'testObjectParams',
    key: 'testObjectParams',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 150,
  },
]

const columns = [
  {
    title: '委托单位',
    dataIndex: 'consignUnitName',
    key: 'consignUnitName',
    width: 150,
  },
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    key: 'consignCode',
    sorter: true,
    width: 150,
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
    key: 'reportNumber',
    sorter: true,
    width: 150,
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 150,
  },
  {
    title: '签发日期',
    dataIndex: 'signDate',
    key: 'signDate',
    width: 100,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
    customRender: ({ text }) => (text ? formatTime(text, 'YYYY-MM-DD') : ''),
  },
  {
    title: '发放状态',
    dataIndex: 'issueStatus',
    key: 'issueStatus',
    width: 80,
    customRender: ({ text: v }) => (v === '1' ? '已发放' : '未发放'),
  },
  {
    title: '上报状态',
    dataIndex: 'hyxtPushStatus',
    key: 'hyxtPushStatus',
    width: 80,
    customRender: ({ text: v }) => {
      if (v === 1) {
        return '上报成功'
      }
      else if (v === 2) {
        return '上报失败'
      }
      else if (v === 3) {
        return '上报中'
      }
      else {
        return '待上报'
      }
    },
  },
  {
    title: '签章状态',
    dataIndex: 'stampStatus',
    key: 'stampStatus',
    width: 80,
    customRender: ({ text: v }) => {
      if (v === '10') {
        return '未签章'
      }
      else if (v === '15' || v === '20' || v === '70' || v === '80') {
        return '已签章'
      }
    },
  },
  {
    title: '打印状态',
    dataIndex: 'printStatus',
    key: 'printStatus',
    width: 80,
    customRender: ({ text: v }) => {
      if (v === '10') {
        return '待打印'
      }
      else if (v === '15') {
        return '打印中'
      }
      else if (v === '20') {
        return '已打印'
      }
    },
  },
  {
    title: '防伪码',
    dataIndex: 'qrCode',
    key: 'qrCode',
    width: 120,
    scopedSlots: { customRender: 'qrCodeRender' },
  },
  {
    title: '推送反馈',
    dataIndex: 'feedback',
    key: 'feedback',
    width: 150,
    scopedSlots: { customRender: 'feedback' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 180,
    key: 'operation',
    fixed: 'right',
    scopedSlots: { customRender: 'operation' },
  },
]

/**
 * 创建js
 * @param jsname
 */
function createScript(jsname) {
  const baseUrl = import.meta.env.VITE_ILIS_DRIVERS

  return new Promise((resolve) => {
    const _id = jsname.replace('.', '')
    if (document.getElementById(_id))
      return resolve()
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `${baseUrl}/pdfjs/${jsname}`
    script.id = _id
    document.body.appendChild(script)
    script.onload = () => {
      resolve()
    }
  })
}

export default {
  components: {
    Logs,
    Position,
    SetReportPerson,
    CustomColumn,
    AllPosition,
    ExclamationCircleOutlined,
    RetweetOutlined,
  },
  emits: ['on-change'],
  data() {
    return {
      // progressData: {
      //   current: 0,
      //   total: 0,
      // },
      visibleError: false,
      // visibleBatchProgres: false,
      // visibleBatchProgres2: false,
      loadingExport: false,
      spinning: false,
      errorObj: {
        title: '',
        tipArr: [],
      },
      isopenConfigPerson: false,
      personRepotVisible: false,
      loadingBtn: false,
      handleRow: {},
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      expandedData: [],
      expandedRowKeys: [],
      selectPage: getQueryVariable('selectPage'),
      data: [],
      columns,
      columnsChildren,
      name: '',
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      loading: false,
      query: {
        quickQry: '',
        order: '',
        orderBy: '',
        printStatus: '', // 打印状态
        issueStatus: '', // 发放状态
        stampStatus: '', // 签章状态
        fileUploadStatus: '', // 文件上传状态
        signDateStart: '', // 签发时间
        signDateEnd: '',
        regulatoryId: '', // 监管机构ID
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === '1' || this._selectPage === '1') {
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
        type: this.selectPage === '1' ? 'radio' : 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          if (this.selectPage === '1' || this._selectPage === 1) {
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
    this.getBusinessParam()
    this.initPDFjs()
  },
  methods: {
    /** 加载pdfjs */
    initPDFjs() {
      createScript('pdf.js')
      createScript('pdf.worker.js')
    },
    switchProgresType() {
      if (this.visibleBatchProgres) {
        this.visibleBatchProgres2 = true
        this.visibleBatchProgres = false
      }
      else {
        this.visibleBatchProgres2 = false
        this.visibleBatchProgres = true
      }
    },
    async handleClickSeting() {
      const { selectedRows, selectedRowKeys, regulatoryConfig } = this
      const textObj = {}

      // eslint-disable-next-line array-callback-return
      selectedRows.map((i) => {
        // eslint-disable-next-line ts/no-unused-expressions
        textObj[i.id]
      })

      if (!selectedRowKeys.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
        return
      }

      window.$oAjax
        .post(
          `/rest/report/security-code-affix/quantity`,
          JSON.stringify(selectedRowKeys),
          {
            headers: { 'content-type': 'application/json' },
          },
        )
        .then((res) => {
          if (res.code === 21000) {
            const data = res.data
            const checkFileNumber = data.filter(i => i.fileNumber > 1)
            const checkPageNumber = data.filter(i => i.pageNumber - 0 === 0)

            if (checkFileNumber.length > 0) {
              let tip = '报告'
              tip += checkFileNumber.map(i => i.reportNumber).join('、')
              tip += '含有多个报告文件，请单独设置处理！'
              window.$oAntdModal.error({
                title: '操作失败',
                content: tip,
                okText: '确定',
              })
              return
            }

            if (checkPageNumber.length > 0) {
              let tip = '报告'
              tip += checkPageNumber.map(i => i.reportNumber).join('、')
              tip += '未转换完成，请转换成功后再次尝试！'
              window.$oAntdModal.error({
                title: '操作失败',
                content: tip,
                okText: '确定',
              })
              return
            }

            this.$refs.AllPosition.showModel(data || [], regulatoryConfig)
          }
          else {
            window.$oAntdModal.error({
              title: '操作失败',
              content: res.message,
              okText: '确定',
            })
          }
        })
    },
    //  获取系统控制参数 - 是否开启设置上报人员
    async getBusinessParam() {
      await window.$oAjax({
        url: 'tSBusinessParamController.do?getBusinessParam&key=REPORT_MANAGE_HYXT_PERSON_SET',
        method: 'get',
      }).then((res) => {
        this.isopenConfigPerson = Boolean(res.obj === 'Y')
      })
    },
    initFun() {
      this.getRegulatoryConfig()
      this.getData()
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'report-push-regulatory-wait',
        '自定义列配置',
        false,
      )
    },
    async getColumns() {
      const apiUrl = `${window.$oApi.customColumn.getSelectColumns}?type=report-push-regulatory-wait`
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
          if (item.columnKey === 'reportNumber') {
            item.sorter = true
          }
          else if (
            ['signDate', 'reviewDate', 'auditDate', 'consignDate'].includes(
              item.columnKey,
            )
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
          list.push(item)
        }
        list.push({
          title: '操作',
          dataIndex: 'operation',
          width: '120px',
          fixed: 'right',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        })
        this.columns = list
      }
      catch (err) {
        window.$oAntdMessage.warning(err.message || err.msg || '获取自定义列异常')
      }
    },
    initColumn() {
      if (this.regulatoryConfig.stamp !== true) {
        this.delColumns('stampStatus')
      }
      else {
        const _hasStampStatus = this.columns.find(
          it => it.dataIndex === 'stampStatus',
        )
        if (!_hasStampStatus) {
          const stamp = {
            title: '签章状态',
            dataIndex: 'stampStatus',
            key: 'stampStatus',
            width: '80px',
            customRender: ({ text: v }) => {
              if (v === '10') {
                return '未签章'
              }
              else if (v === '15' || v === '20') {
                return '已签章'
              }
            },
          }
          for (let i = this.columns.length - 1; i >= 0; i--) {
            if ('hyxtPushStatus'.includes(this.columns[i].dataIndex)) {
              this.columns.splice(i + 1, 0, stamp)
            }
          }
        }
      }
      if (this.regulatoryConfig.securityCode === 'NONE') {
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
            scopedSlots: { customRender: 'qrCodeRender' },
          }
          for (let i = this.columns.length - 1; i >= 0; i--) {
            if ('printStatus'.includes(this.columns[i].dataIndex)) {
              this.columns.splice(i + 1, 0, qrCode)
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
    handleUplaodChange(v) {
      this.loading = true
      if (v.file.status === 'done') {
        const file = v.fileList[v.fileList.length - 1].response.obj[0]
        // 文件上传成功后调取接口
        window.$oAjax
          .post(
            `rest/report/hyxt/saveHyxtFile`,
            {
              reportId: this.handleRow.id,
              attachmentId: file.id,
              name: file.attachmenttitle,
              url: file.realpath,
            },
            {
              headers: { 'content-type': 'application/json' },
            },
          )
          .then((res) => {
            if (res.code === 20000) {
              this.loading = false
              this.getData(true)
            }
          })
      }
    },
    onChange(v, x, srotVal) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.query.order = srotVal.order === 'ascend' ? 'ASC' : 'DESC'
      this.query.orderBy = srotVal.field
      this.getData(false)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    getRegulatoryList() {
      this.loading = true
      window.$oRest.get('/rest/regulatory').then((res) => {
        if (res) {
          if (res.data.length < 1) {
            window.$oAntdModal.warning(window.$oMsgTips.info('没有获取到监管平台信息！!'))
          }
          this.regulatoryList = res.data
          this.regulatory = res.data[0]
          this.query.regulatoryId = this.regulatory.id
          this.getRegulatoryConfig()
          this.getData(false)
        }
      })
    },

    getRegulatoryConfig() {
      this.loading = true
      window.$oRest
        .get(`/rest/regulatory/config/${this.regulatory.id}`)
        .then((res) => {
          if (res) {
            if (res.data.length < 1) {
              window.$oAntdModal.warning(window.$oMsgTips.info('没有获取到监管平台配置信息！!'))
            }
            this.regulatoryConfig = res.data
            this.getColumns()
          }
        })
    },

    getData(refresh) {
      this.loading = true
      window.$oRest
        .get('/rest/report/hyxt/pushWaiting', {
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
            if (!refresh) {
              this.selectedRowKeys = []
              this.selectedRows = []
            }
            else {
              this.selectedRows = res.rows.filter(
                it => this.selectedRowKeys.includes(it.id),
              )
            }
          }
          this.loading = false
        })
    },

    search() {
      // this.query = this.name;
      this.pagination.current = 1
      this.getData(false)
    },

    // 上传监管系统
    uploadSystem() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
        return
      }

      let isSubmit = true
      this.selectedRows.forEach((item) => {
        if (this.regulatoryConfig.stamp === true && item.stampStatus === '10') {
          window.$oAntdMessage.warning(
            `选择中包含未签章报告：${item.reportNumber},无法进行上报,请重新选择!`,
          )
          isSubmit = false
        }
        else if (
          this.regulatoryConfig.reportFileType === 'INTERVENED'
          && !item.hyxtFileUrl
        ) {
          window.$oAntdMessage.warning(
            `选择中包含未上传文件的报告：${item.reportNumber},无法进行上报,请重新选择!`,
          )
          isSubmit = false
        }
        else if (
          this.regulatoryConfig.securityCode !== 'NONE'
          && !item.qrCode
        ) {
          window.$oAntdMessage.warning(
            `选择中包含未设置防伪码的报告：${item.reportNumber},无法进行上报,请重新选择!`,
          )
          isSubmit = false
        }
      })

      if (!isSubmit) {
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '提示',
        content: `报告上报成功后将不允许退回，报告文件内容有误时，请发起更正；报告信息有误时，请前往${this.regulatory.name}编辑修改`,
        okText: '确认',
        cancelText: '取消',
        onOk() {
          if (_this.selectedRowKeys.length === 1) {
            _this.loading = true
            _this.loadingBtn = true
            window.$oAjax
              .post(
                `rest/report/hyxt/push/${_this.selectedRowKeys[0]}/${_this.regulatory.id}`,
                _this.selectedRowKeys,
              )
              .then((res) => {
                _this.loadingBtn = false
                if (res.code === 20000) {
                  _this.loading = false
                  window.$oAntdMessage.success('上传成功!')
                  _this.getData(false)
                }
                else {
                  _this.loading = false
                  // window.$oAntdMessage.error(res.msg);
                  _this.getData(true)

                  _this.visibleError = true
                  _this.errorObj.title = res.msg
                  _this.errorObj.tipArr = JSON.parse(res.tips)
                }
              })
              .catch(() => {
                _this.loading = false
                _this.loadingBtn = false
              })
          }
          else {
            sseRequestProgress.show({
              api: `rest/report/hyxt/pushBatch/${_this.regulatory.id}`,
              method: 'post',
              data: _this.selectedRowKeys,
              onComplete: () => {
                window.$oAntdMessage.success('上报成功!')
                _this.getData(false)
              },
            })
            // window.$oAjax
            //   .post(
            //     `rest/report/hyxt/pushBatch/${_this.regulatory.id}`,
            //     _this.selectedRowKeys,
            //     {
            //       headers: { 'content-type': 'application/json' },
            //     },
            //   )
            //   .then((res) => {
            //     _this.loadingBtn = false
            //     if (res.code === 20000) {
            //       _this.loading = false
            //       // window.$oAntdMessage.info("批量上传中,请稍后刷新数据查看是否上报成功···")
            //       _this.pollProgress(res.data)
            //       _this.getData(false)
            //       _this.visibleBatchProgres = true
            //     }
            //     else {
            //       _this.loading = false
            //       window.$oAntdMessage.error(res.msg)
            //       _this.getData(true)
            //     }
            //   })
            //   .catch(() => {
            //     _this.loadingBtn = false
            //   })
          }
        },
      })
    },

    async* getProgress(id) {
      yield await window.$oAjax.get(`rest/progressMsg/progress`, {
        params: {
          businessKey: id,
          type: 'HYXT_REPORT_PUSH_',
        },
      })
      // .then((res) => {
      //   if (res.code === 20000) {
      //     this.progressData.total = res.total
      //     this.progressData.current = res.current
      //   } else {
      //     window.$oAntdMessage.error(res.msg)
      //   }
      // })
    },
    pollProgress(id) {
      this.getProgress(id)
        .next()
        .then((val) => {
          const res = val.value
          // eslint-disable-next-line ts/no-this-alias
          const _this = this
          if (res.code === 20000) {
            this.progressData.total = res.data.total
            this.progressData.current = res.data.current
            if (res.data.current < res.data.total) {
              setTimeout(() => {
                _this.pollProgress(id) // 继续轮询
              }, 1000)
            }
            else {
              window.$oAntdMessage.success('操作成功，请在待上报列表中确认上报状态!')
              setTimeout(() => {
                _this.visibleBatchProgres = false
                _this.visibleBatchProgres2 = false
                _this.progressData.total = 0
                _this.progressData.current = 0
                _this.getData()
              }, 1000)
            }
          }
          else {
            _this.visibleBatchProgres = false
            _this.visibleBatchProgres2 = false
            this.progressData.total = 0
            this.progressData.current = 0
            window.$oAntdMessage.error(res.msg)
          }
        })
    },

    personnelReport() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
        return
      }
      this.$refs.setReportPersonRef.showModal(this.selectedRows)
    },
    uploadSystemAll() {
      if (!this.data.length) {
        window.$oAntdMessage.warning(`没有报告进行提交!`)
        return
      }
      window.$oAntdConfirm({
        title: '提示',
        content: h(
          'div',
          {},
          [
            h('div', [
              '您正在使用一键上报功能，将上报',
              h('span', { style: 'color: #f5222d; font-weight: bold; font-size: 15px' }, this.pagination.total),
              '份报告到',
              h('span', { style: 'color: #f5222d; font-weight: bold;' }, this.regulatory.name),
              '，请注意：',
            ]),
            h('ul', {}, [
              h('li', '1、报告上报成功后，系统内将不允许退回；'),
              h('li', '2、报告上报成功后，若发现报告文件（PDF）内容有误，请发起报告更正；'),
              h('li', '3、当上报报告数量较多时，可能上报时间较长，请您耐心等待；'),
              h('li', '4、上报失败的报告，请在待上报列表中，查看推送反馈；'),
            ]),
            h('div', '您确定要上报吗？'),
          ],
        ),
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          sseRequestProgress.show({
            api: `rest/report/hyxt/pushAll/${this.regulatory.id}`,
            data: {
              ...this.query,
              page: this.pagination.current,
              size: this.pagination.pageSize,
            },
            onComplete: () => {
              window.$oAntdMessage.success('上传成功!')
              this.getData(true)
            },
          })
          // this.loading = true
          // this.loadingBtn = true
          // window.$oAjax
          //   .get(`rest/report/hyxt/pushAll/${this.regulatory.id}`, {
          //     params: {
          //       ...this.query,
          //       page: this.pagination.current,
          //       size: this.pagination.pageSize,
          //     },
          //   })
          //   .then((res) => {
          //     this.loadingBtn = false
          //     if (res.code === 20000) {
          //       // window.$oAntdMessage.info("批量上传中,请稍后刷新数据查看是否上报成功···")
          //       this.loading = false
          //       this.getData(true)
          //       this.pollProgress(res.data)
          //       this.visibleBatchProgres = true
          //     }
          //     else {
          //       this.loading = false
          //       window.$oAntdMessage.error(res.msg)
          //     }
          //   })
          //   .catch(() => {
          //     this.loading = false
          //     this.loadingBtn = false
          //   })
        },
      })
    },

    openErrorModel(row) {
      this.visibleError = true
      this.errorObj.title = row.feedback
      this.errorObj.tipArr = JSON.parse(row.tips)
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

    /**
     * 补录防伪码
     */
    affixSecurityCode() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
        return
      }
      if (this.selectedRowKeys.length > 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据!'))
        return
      }
      this.$refs.position.show(this.regulatoryConfig, this.selectedRowKeys[0])
    },

    /**
     * 取消补录防伪码
     */
    revokeAffixSecurityCode() {
      this.loading = true
      if (!this.selectedRowKeys.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
        this.loading = false
        return
      }
      let url = 'rest/report/security-code-affix/revoke?'
      for (const selectedRowKey of this.selectedRowKeys) {
        url += `reportIds=${selectedRowKey}&`
      }

      window.$oAjax.delete(url).then((res) => {
        if (res.code === 23000) {
          window.$oAntdMessage.success('取消补录防伪码成功!')
          this.getData(true)
          this.loading = false
        }
        else {
          this.loading = false
          try {
            const messageList = res.msg.split('</br>')
            window.$oAntdModal.warning({
              title: '提示',
              content: h(
                'p',
                {},
                messageList.map(m => h('p', m)),
              ),
            })
          }
          catch (e) {
            console.error(e)
            window.$oAntdMessage.error('取消补录防伪码失败，请联系管理员进行处理!')
          }
        }
      })
    },
    exportFun() {
      this.spinning = true
      // window.open(`/ilis2/rest/report/hyxt/exportPushWaiting?regulatoryId=${this.query.regulatoryId}`, "_blank")
      // 导出excel文件
      let par = ''
      for (const k in this.query) {
        if (!this.query[k])
          continue
        par += `${par ? '&' : ''}${k}=${this.query[k]}`
      }
      const url = `/ilis2/rest/report/hyxt/exportPushWaiting?${par}`
      window.open(url, '_blank')
      setTimeout(() => {
        this.spinning = false
      }, 2000)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
