<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="allDataBox">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="projectManageList">
          <div class="dataCollection-search">
            <a-space>
              <a-input
                v-model:value="queryCode"
                placeholder="输入数据委托单位/工程项目/编号/样品名称后回车即可查询"
                class="dataCollection-search-all"
                @press-enter="searchFun"
              />
              <a-button @click="searchFun">
                查询
              </a-button>
              <a-button @click="switchSearch">
                高级查询
              </a-button>
            </a-space>
          </div>

          <div class="flex gap-2 flex-wrap mb-4">
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
            :columns="columns"
            :data-source="data"
            bordered
            table-layout="fixed"
            :scroll="{ x: 3500 }"
            :pagination="data.length > 0 ? pagination : false"
            :row-class-name="rowClassName"
            row-key="index"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'processStatus'">
                <div class="editable-row-operations">
                  {{ status_filter(text, record) }}
                </div>
              </template>
              <template v-if="column.dataIndex === 'signType'">
                <div class="editable-row-operations">
                  {{ signStatusFilter_filter(text, record) }}
                </div>
              </template>
              <template v-if="column.dataIndex === 'mergeAuditSignature'">
                <div class="editable-row-operations">
                  {{ mergeAuditSignature_filter(text, record) }}
                </div>
              </template>
              <template v-if="column.dataIndex === 'consignCode'">
                <div class="editable-row-operations">
                  <a title="委托" @click.stop="() => consign(record)">{{
                    text
                  }}</a>
                </div>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <a @click.stop="() => reportLog(record)">
                    日志
                  </a>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>
    <ht-modal
      width="45%"
      :open="advancedQueryVisible"
      title="高级查询"
      :closable="false"
      :mask-closable="false"
    >
      <AdvancedQuery2
        ref="advancedQuery"
        :key="JSON.stringify(defaultTestDate)"
        :show-customer-sample-code="showCustomerSampleCode"
        :defaultTestDate="defaultTestDate"
      />
      <template #footer>
        <div class="modal-footer">
          <a-button type="primary" @click="advancedQueryOk">
            确定
          </a-button>
          <a-button type="default" @click="advancedQueryRefresh">
            重置
          </a-button>
          <a-button type="default" @click="advancedQueryCancel">
            取消
          </a-button>
        </div>
      </template>
    </ht-modal>

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import CheckLogs from '~/components/CheckLogs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { useIndustryStore } from '~/store/industryStore'
import AdvancedQuery2 from '../components/AdvancedQuery.vue'

export default {
  components: {
    AdvancedQuery2,
    CheckLogs,
  },
  setup() {
    const { industryId, term, getField } = useIndustryStore()

    let columns = [
      {
        title: '数据状态',
        dataIndex: 'processStatus',
        width: 100,
      },
      {
        title: '费用状态',
        dataIndex: 'feeStatus',
        width: 80,
      },
      {
        title: '签名状态',
        dataIndex: 'signType',
        width: 80,
      },
      {
        title: '待签名人员',
        dataIndex: 'pendingPersonnel',
        width: 80,
      },
      {
        title: '电子签名模式',
        dataIndex: 'mergeAuditSignature',
        width: 90,
      },
      {
        title: '委托单位',
        dataIndex: 'consignUnitName',
        width: 250,
      },
      {
        title: '工程项目',
        dataIndex: 'projectTenderName',
        width: 250,
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
      },
      {
        title: '委托编号',
        dataIndex: 'consignCode',
      },
      {
        title: term('样品编号'),
        dataIndex: 'testObjectCode',
      },
      {
        title: term('来样编号'),
        dataIndex: 'provideToCustomerSampleCode',
      },
      {
        title: term('样品名称'),
        dataIndex: 'sampleDisplayName',
      },
      {
        title: '规格型号',
        dataIndex: 'objectStandard',
      },
      {
        title: '工程部位/用途',
        dataIndex: 'projectPartAndUse',
      },
      {
        title: '任务编号',
        dataIndex: 'taskCode',
      },
      {
        title: '记录编号',
        dataIndex: 'recordCode',
      },

      {
        title: '报告编号',
        dataIndex: 'reportNumber',
      },
      {
        title: '要求报告时间',
        dataIndex: 'requireReportDate',
        width: 120,
      },
      {
        title: '检测时间',
        dataIndex: 'testDate',
        width: 150,
      },
      {
        title: '报告提交时间',
        dataIndex: 'submitDate',
        width: 120,
      },
      {
        title: '人员',
        dataIndex: 'personAll',
        width: 400,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        fixed: 'right',
        width: 80,
      },
    ]

    if (!getField('project')?.selected) {
      columns = columns.filter(col => !['projectCode', 'projectTenderName', 'projectPartAndUse'].includes(col.dataIndex))
    }

    return {
      industryId,
      term,
      getField,
      columns,
    }
  },
  data() {
    return {
      showCustomerSampleCode: false,
      data: [],
      allSearch: false,
      advancedQueryVisible: false,
      spinning: false,
      labelCol: { span: 2 },
      wrapperCol: { span: 10 },
      queryCode: '',
      page: 1,
      size: 10,
      queryParam: {},
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
      defaultTestDate: [],
      queryTag: [],
    }
  },
  computed: {},
  created() {
    this.getSystemParam()
    this.initTestDate()
    this.getData()
  },
  methods: {
    onCloseTag(item) {
      this.queryTag = this.queryTag.filter(i => i.key !== item.key)
      delete this.queryParam[item.key]
      if (this.$refs.advancedQuery) {
        this.$refs.advancedQuery.formState[item.key] = ''
      }

      if (item.key === 'consignDateStart') {
        this.defaultTestDate = []
        delete this.queryParam.consignDateStart
        delete this.queryParam.consignDateEnd

        if (this.$refs.advancedQuery) {
          this.$refs.advancedQuery.formState.consignDate = []
        }
      }

      if (item.key === 'requireReportDateStart') {
        delete this.queryParam.requireReportDateStart
        delete this.queryParam.requireReportDateEnd

        if (this.$refs.advancedQuery) {
          this.$refs.advancedQuery.formState.requireReportDate = []
        }
      }

      this.getData()
    },
    initTestDate() {
      this.defaultTestDate = [dayjs().subtract(6, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      this.queryParam.consignDateStart = this.defaultTestDate[0]
      this.queryParam.consignDateEnd = this.defaultTestDate[1]

      this.queryTag = [
        { label: '委托时间段', key: 'consignDateStart', value: `${this.queryParam.consignDateStart} ~ ${this.queryParam.consignDateEnd}` },
      ]
    },
    mergeAuditSignature_filter(text, record) {
      if (record.reportId) {
        return text
      }
      return ''
    },
    signStatusFilter_filter(text, record) {
      if (text === '已完成' && record.processStatus !== '报告已批准') {
        return ''
      }
      return text
    },
    status_filter(text, record) {
      if (record.outsourcing === 1) {
        return '已分包'
      }
      return text
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    searchFun() {
      this.queryParam = { ...this.queryParam, queryCode: this.queryCode }
      this.page = 1
      this.getData()
    },
    /**
     * 切换高级查询
     */
    switchSearch() {
      this.advancedQueryVisible = true
    },
    /**
     * 高级查询确定按键
     */
    advancedQueryOk() {
      const formState = this.$refs.advancedQuery.formState
      this.queryCode = ''

      const data = {
        ...formState,
      }
      const rangeValue = data.requireReportDate
      const consignDate = data.consignDate

      if (rangeValue && rangeValue.length > 0) {
        data.requireReportDateStart = dayjs(rangeValue[0]).format('YYYY-MM-DD')
        data.requireReportDateEnd = dayjs(rangeValue[1]).format('YYYY-MM-DD')
      }
      if (consignDate && consignDate.length > 0) {
        data.consignDateStart = dayjs(consignDate[0]).format('YYYY-MM-DD')
        data.consignDateEnd = dayjs(consignDate[1]).format('YYYY-MM-DD')
      }

      delete data.requireReportDate
      delete data.consignDate
      this.queryParam = data
      this.queryTag = this.createQueryTag(data)
      this.page = 1
      this.getData()
      this.advancedQueryVisible = false
    },
    createQueryTag(data) {
      const key2Names = {
        consignUnitName: '委托单位',
        projectTenderName: '工程项目',
        projectCode: '项目编号',
        consignCode: '委托编号',
        testObjectCode: '样品编号',
        provideToCustomerSampleCode: '来样编号',
        sampleDisplayName: '样品名称',
        projectPartAndUse: '工程部位/用途',
        objectStandard: '规格型号',
        taskCode: '任务编号',
        recordCode: '记录编号',
        batchNum: '批号',
        reportNumber: '报告编号',
        requireReportDateStart: '要求报告时间',
        consignDateStart: '委托时间段',
      }
      const tags = []

      for (const key in data) {
        let val = data[key]
        const label = key2Names[key]

        if (
          val === null
          || val === undefined
          || val === ''
          || (Array.isArray(val) && !val.length)
        ) {
          continue
        }

        if (['consignDateEnd', 'requireReportDateEnd'].includes(key)) {
          continue
        }

        if (['consignDateStart'].includes(key)) {
          val = `${data.consignDateStart} ~ ${data.consignDateEnd}`
        }

        if (['requireReportDateStart'].includes(key)) {
          val = `${data.requireReportDateStart} ~ ${data.requireReportDateEnd}`
        }

        tags.push({
          key,
          label,
          value: val,
        })
      }

      return tags
    },
    /**
     * 高级查询取消
     */
    advancedQueryCancel() {
      this.advancedQueryVisible = false
    },
    /**
     *  高级查询刷新
     */
    advancedQueryRefresh() {
      this.$refs.advancedQuery.formState = {}
      this.queryParam = {}
      this.queryTag = []
      this.getData(true)
    },
    // 获取系统控制参数 - 来样编号
    async getSystemParam() {
      const res = await window.$oAjax.get(window.$oApi.getBusinessParam, {
        params: { key: 'ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE' },
      })
      if (res.success && res.obj === 'Y') {
        this.showCustomerSampleCode = true
      }
      else {
        this.showCustomerSampleCode = false
        const ind = this.columns.findIndex(
          d => d.dataIndex == 'provideToCustomerSampleCode',
        )
        this.columns.splice(ind, 1)
      }
    },
    getData() {
      const { page, size } = this
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: '/rest/allDataController/list',
        params: {
          page,
          size,
          ...this.queryParam,
        },
        headers: {
          paramsIsTrim: true,
        },
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
          this.data = []
        }
        this.spinning = false
      })
    },
    reportLog(record) {
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

      this.$refs.checkLogsRef.open({
        objectType: type,
        objectId,
        relationQry: true,
      })
    },
    consign(record) {
      const consignId = record.consignId

      // const url = `testTaskController.do?goConsignEdit&isTaskRedirect=false&id=${consignId}&detail=detailPage&sampleId=${sampleId}`;
      const url = `consignController.do?goEdit&id=${consignId}&detail=detailPage&notConsignPage=1&industryId=${this.industryId}`
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
      if (!(res.code == '20000' && res.data)) {
        top.layer.msg('当前任务暂未生成PDF报告文件，无法查看')
        return false
      }

      const reportUrl = `${rootUrl}/reportPrintController.do?goReportPrintDetail&reportId=${reportId}&reportType=${reportType}&isSynthesis=${isSynthesis}&consignIds=${consignId}&testTaskIds=${testTaskId}&sampleId=${sampleId}`
      window.open(reportUrl, '报告详情')
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
