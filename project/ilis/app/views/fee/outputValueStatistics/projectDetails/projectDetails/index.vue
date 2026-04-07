<template>
  <div class="equipmentAuthRecord">
    <div>
      <a-input
        v-model:value="quickQryParam.reportNumber"
        placeholder="请输入报告编号"
        style="width: 300px"
      />
      <a-button type="primary" class="ml-2" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="handleReset">
        重置
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      :loading="loading"
      bordered
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => viewLog(e, record)">日志</a>
          </span>
        </template>
      </template>
    </a-table>

    <Logs ref="Logs" />
  </div>
</template>

<script>
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import Logs from './components/logs.vue'

const statusObj = {
  15: '复核通过',
  20: '审核通过',
  30: '批准通过',
}

const columns = [
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
  },
  {
    title: '报告编号',
    dataIndex: 'reportCode',
  },
  {
    title: '工程划分',
    dataIndex: 'unitProjectName',
  },
  {
    title: '检测内容',
    dataIndex: 'testParamNames',
  },
  {
    title: '报告状态',
    dataIndex: 'reportStatus',
    customRender: ({ text }) => {
      return statusObj[text] || text
    },
  },
  {
    title: '试验人员',
    dataIndex: 'testPerson',
  },
  {
    title: '报告编制',
    dataIndex: 'editPerson',
  },
  {
    title: '复核',
    dataIndex: 'reviewPerson',
  },
  {
    title: '签发/批准',
    dataIndex: 'approvePerson',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    customRender: ({ text }) =>
      text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]

export default {
  components: {
    Logs,
  },
  data() {
    return {
      setLogVisible: false,
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
      quickQryParam: {
        reportNumber: '',
      },
      conditionData: [],
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
      personData: [],
    }
  },
  created() {
    this.getData()
    // eslint-disable-next-line unused-imports/no-unused-vars, array-callback-return
    ;['eqType', 'eqStatus', 'manageType'].map((item) => {})
  },
  methods: {
    // 日志查看
    viewLog(v, row) {
      this.$refs.Logs.showModal(row.testTaskId, '2')
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleReset() {
      this.page = 1
      this.quickQryParam.reportNumber = ''
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size } = this
      this.loading = true
      const projectId = getQueryVariable('projectId')
      const contractId = getQueryVariable('contractId')
      const params = {
        page,
        size,
        reportNumber: this.quickQryParam.reportNumber,
        projectId,
        contractId,
      }
      delete params.buyDate
      delete params.checkDate
      delete params.nextCheckDate

      window.$oAjax
        .get('rest/output/contract/task/list', { params })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
