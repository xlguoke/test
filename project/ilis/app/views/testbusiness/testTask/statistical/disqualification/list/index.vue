<!-- eslint-disable vue/no-unused-refs -->
<!-- eslint-disable vue/valid-v-for -->
<template>
  <div class="disqualification">
    <div class="disqualification-search">
      <div v-if="allSearch">
        <a-form ref="formRef" :model="formState">
          <a-form-item
            label="委托单位"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.consignUnit"
              placeholder="请输入委托单位"
            />
          </a-form-item>
          <a-form-item
            label="工程项目"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.consignProject"
              placeholder="请输入工程项目"
            />
          </a-form-item>
          <a-form-item
            label="委托编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.consignCode"
              placeholder="请输入委托编号"
            />
          </a-form-item>
          <a-form-item
            label="样品编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.testObjectCode"
              placeholder="请输入样品编号"
            />
          </a-form-item>

          <a-form-item
            v-if="showCustomerSampleCode"
            label="来样编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.provideToCustomerSampleCode"
              placeholder="请输入来样编号"
            />
          </a-form-item>

          <a-form-item
            label="记录编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.testRecordCode"
              placeholder="请输入记录编号"
            />
          </a-form-item>
          <a-form-item
            label="报告编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.reportCode"
              placeholder="请输入报告编号"
            />
          </a-form-item>
          <a-form-item
            label="检测日期"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-range-picker
              v-model:value="formState.testDate"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="报告日期"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-range-picker v-model:value="formState.reportDate" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item
            label="样品名称"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.sampleName"
              placeholder="请输入样品名称"
            />
          </a-form-item>
          <a-form-item
            label="规格型号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.sampleStandard"
              placeholder="请输入规格型号"
            />
          </a-form-item>
          <a-form-item
            label="检测科室"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.testDepartment"
              placeholder="请输入检测科室"
            />
          </a-form-item>
          <a-form-item
            label="检测人员"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.testPerson"
              placeholder="请输入检测人员"
            />
          </a-form-item>
          <a-form-item
            label="审批状态"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-radio-group
              v-model:value="formState.auditStatus"
            >
              <!-- all:全部, approved:批准通过的, waitAudit:待审批 -->
              <a-radio value="all">
                全部
              </a-radio>
              <a-radio value="approved">
                批准通过
              </a-radio>
              <a-radio value="waitAudit">
                待审批
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 22, offset: 2 }">
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button

              @click="
                () => {
                  searchType(false)
                }
              "
            >
              切换普通查询
            </a-button>
            <a-button @click="reset">
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div v-else>
        <a-space>
          <!-- 单选框分组 -->
          <a-radio-group
            v-model:value="queryQualified"
            size="default"
            @change="search"
          >
            <a-radio-button value="BY_TEST">
              不合格试验
            </a-radio-button>
            <a-radio-button value="BY_PARAM">
              不合格指标
            </a-radio-button>
          </a-radio-group>
          <a-input
            v-model:value="quickQuery"
            placeholder="输入委托单位/工程项目/样品名称/规格型号/生产厂家后回车即可查询"
            class="disqualification-search-all"
            @press-enter="search"
          />
          <a-button type="primary" @click="search">
            查询
          </a-button>
          <a-button

            @click="
              () => {
                searchType(true)
              }
            "
          >
            切换高级查询
          </a-button>
        </a-space>
      </div>
      <a-space class="mt-4">
        <a-button @click="viewDetail">
          查看检测详情
        </a-button>
        <a-button @click="filterTable">
          列筛选
        </a-button>
        <a-button @click="exportFile">
          导出
        </a-button>
        <a-button @click="print">
          打印
        </a-button>
      </a-space>
    </div>
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :row-class-name="rowClassName"
      bordered
      :scroll="scroll"
      :pagination="pagination"
      row-key="taskId"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'paramTestResult'">
          <div v-html="text"></div>
        </template>
      </template>
    </a-table>

    <ht-modal v-model:open="visible" title="选择展示的列" @ok="changeRow">
      <a-row>
        <template v-for="item in fields">
          <a-col v-if="item.isShow || item.isShow === undefined" span="12">
            <a-checkbox v-model:checked="item.value">
              {{ item.name }}
            </a-checkbox>
          </a-col>
        </template>
      </a-row>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  data() {
    return {
      rootUrl,
      data: [],
      defaultTestDate: [],
      dateFormat: 'YYYY-MM-DD',
      quickQuery: '',
      queryQualified: 'BY_TEST',
      formState: {
        testDate: [],
        reportDate: [],
        auditStatus: 'all',
      },
      showCustomerSampleCode: false,
      allSearch: false,
      loading: false,
      visible: false,
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
      query: {
        queryQualified: 'BY_TEST',
      },
      fields: [
        { name: '委托单位', value: true, field: 'consignUnit' },
        { name: '工程项目', value: true, field: 'consignProject' },
        { name: '委托编号', value: true, field: 'consignCode' },
        { name: '样品编号', value: true, field: 'testObjectCode' },
        {
          name: '来样编号',
          value: true,
          field: 'provideToCustomerSampleCode',
          isShow: false,
        },
        { name: '任务编号', value: true, field: 'testTaskCode' },
        { name: '记录编号', value: true, field: 'testRecordCode' },
        { name: '报告编号', value: true, field: 'reportCode' },
        { name: '委托日期', value: true, field: 'consignDate' },
        { name: '检测日期', value: true, field: 'testDate' },
        { name: '报告日期', value: true, field: 'reportDate' },
        { name: '样品名称', value: true, field: 'sampleName' },
        { name: '规格型号', value: true, field: 'sampleStandard' },
        { name: '生产厂家', value: true, field: 'sampleManufactures' },
        { name: '检测科室', value: true, field: 'testDepartment' },
        { name: '检测人员', value: true, field: 'testPerson' },
        { name: '工程部位/用途', value: true, field: 'projectPartAndUse' },
        { name: '检测参数', value: true, field: 'testParam' },
        { name: '技术指标', value: true, field: 'technicalIndicator' },
        { name: '实测结果', value: true, field: 'paramTestResult' },
        { name: '试验结果', value: true, field: 'qualified' },
        { name: '检验结论', value: true, field: 'conclusion' },
      ],
      columns: [],
      scroll: { x: 4000, y: document.body.clientHeight - 220 },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.taskId]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowClassName(record, index) {
      let className = () => 'light-row'
      if (index % 2 === 1)
        className = () => 'dark-row'
      return className
    },
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.initTestDate()
    this.getSystemParam()
    this.getData()
  },
  methods: {
    initTestDate() {
      this.defaultTestDate = [dayjs().subtract(6, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      this.query.testDateStart = this.defaultTestDate[0]
      this.query.testDateEnd = this.defaultTestDate[1]
      this.formState.testDate = [...this.defaultTestDate]
    },
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.disqualification.getData, {
          params: {
            page,
            size,
            ...query,
          },
        })
        .then((res) => {
          const columns = this.fields.filter(
            item => item.value && (item.isShow || item.isShow === undefined),
          )
          const width = `${100 / columns.length}%`
          this.columns = columns.map(item => ({
            title: item.name,
            dataIndex: item.field,
            scopedSlots: { customRender: 'paramTestResult' },
            width,
          }))

          this.scroll.x = columns.length * 200

          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.selectedRows = []
          this.loading = false
        })
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
      }
      const index = this.fields.findIndex(
        item => item.field === 'provideToCustomerSampleCode',
      )
      if (index !== -1) {
        this.fields[index].isShow = this.showCustomerSampleCode
      }
    },
    // 搜索
    search(e) {
      e.preventDefault()
      this.parseQueries()
      this.getData(true)
    },
    parseQueries() {
      let data = {}
      if (this.allSearch) {
        data = { ...this.formState }
        if (data.reportDate) {
          data.reportDate = data.reportDate
            .map(item => dayjs(item).format('YYYY-MM-DD'))
            .join(',')
        }
        if (data.testDate) {
          data.testDate = data.testDate
            .map(item => dayjs(item).format('YYYY-MM-DD'))
            .join(',')
        }
      }
      else {
        data.quickQuery = this.quickQuery.trim()
      }
      data.queryQualified = this.queryQualified
      this.query = data
    },
    // 切换搜索类型
    searchType(bool) {
      this.allSearch = bool
    },
    reset() {
      this.formState = {
        testDate: [],
        auditStatus: 'all',
      }
      this.defaultTestDate = []
      this.query = {}
      this.getData(true)
    },
    exportFile() {
      this.parseQueries()
      const a = document.createElement('a')
      const params = {
        ...this.query,
        page: this.page,
        size: this.size,
        pager: false,
      }
      let href = `${rootUrl}${window.$oApi.disqualification.export}`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },
    changeRow() {
      this.getData()
      this.visible = false
    },
    filterTable() {
      this.visible = true
    },
    viewDetail() {
      if (this.selectedRowKeys.length === 0) {
        message.warn('请先选择一条数据')
        return
      }
      const url = '/testTaskController.do?goTestTaskDetail&id='
      window.open(`${rootUrl}${url}${this.selectedRowKeys[0]}`)
    },
    print() {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('DisqualificationTest', this.query)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.ant-radio-button-wrapper {
  height: 28px !important;
  line-height: 28px !important;
}
</style>
