<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="projectManageList">
    <div class="projectManageList-search">
      <a-input
        v-model:value="queryParam"
        placeholder="输入合同编号/项目名称/项目编号/合同名称后回车即可查询"
        @keyup.enter="search"
      />
      <a-button type="primary" class="ml-2" @click="search">
        查询
      </a-button>
      <a-button @click="tabSearchType()">
        切换高级查询
      </a-button>
    </div>
    <div class="projectManageList-btn">
      <a-button

        v-permission="'project_print'"
        type="primary"
        @click="openPrint"
      >
        打印
      </a-button>
      <a-button
        v-permission="'project_allotted_recall'"

        type="primary"
        @click="taskRollback"
      >
        合同任务回退
      </a-button>
    </div>
    <!-- 主table -->
    <a-table
      v-model:expanded-row-keys="expandedRowKeys"
      :row-selection="rowSelection"
      :columns="tableColumns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="contractId"
      :custom-row="customRow"
      :row-class-name="rowClassName"
      @change="changeSort"
      @expand="expandFun"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'contractType'">
          <span v-if="record.contractType == 1">全包合同</span>
          <span v-else-if="record.contractType == 2">折扣合同</span>
          <span v-else-if="record.contractType == 3">部分包干合同</span>
          <span v-else-if="record.contractType == 4">指定参数价格合同</span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => goContractDetail(e, record)">打开</a>
            <a @click="(e) => goProjectdetail(e, record, 1)">详情</a>
            <a @click="(e) => openLogs(e, record, 1)">日志</a>
          </span>
        </template>
      </template>

      <!-- 展开table -->
      <template #expandedRowRender>
        <a-table
          :columns="innerColumns"
          row-key="projectId"
          :data-source="innerData"
          :pagination="false"
          :bordered="false"
          :loading="expandLoading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'notIssue'">
              <span>{{ record.reportTotalNum - record.issueNum }}</span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span v-if="record.projectId" class="table-handle">
                <a @click="(e) => goProjectdetail(e, record)">项目详情</a>
                <a @click="(e) => openLogs(e, record, 2)">日志</a>
              </span>
            </template>
          </template>
        </a-table>
      </template>
    </a-table>

    <!-- 高级查询弹框 -->
    <ht-modal
      v-model:open="queryVisible"
      title="高级查询"
      width="550px"
      @ok="advancedQueryOk"
    >
      <div
        style="
          height: 400px;
          overflow: auto;
          text-align: center;
          padding-left: 40px;
        "
      >
        <div class="projectManageList-input">
          <label>所属部门：</label>
          <a-tree-select
            v-model:value="advancedQuery.department"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
            placeholder="请选择所属部门"
            allow-clear
            :tree-data="departmentData"
            tree-default-expand-all
            show-search
          />
          <!-- <a-input v-model="advancedQuery.department" placeholder="请输入所属部门"></a-input> -->
        </div>
        <!-- <div class="projectManageList-input">
            <label>委托单位：</label>
            <a-input v-model="advancedQuery.consignUnitName" placeholder="请输入委托单位"></a-input>
          </div> -->
        <div class="projectManageList-input">
          <label>项目名称：</label>
          <a-input
            v-model:value="advancedQuery.projectName"
            placeholder="请输入项目名称"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>项目编号：</label>
          <a-input
            v-model:value="advancedQuery.projectCode"
            placeholder="请输入项目编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>合同名称：</label>
          <a-input
            v-model:value="advancedQuery.contractName"
            placeholder="请输入合同名称"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>合同编号：</label>
          <a-input
            v-model:value="advancedQuery.contractCode"
            placeholder="请输入合同编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>合同金额：</label>
          <a-input-number
            v-model:value="advancedQuery.contractTotalMin"
            style="width: 157px"
          ></a-input-number>
          <span style="margin: 3px 10px 0 10px">-</span>
          <a-input-number
            v-model:value="advancedQuery.contractTotalMax"
            style="width: 158px"
          ></a-input-number>
        </div>
        <div class="projectManageList-input">
          <label>合同类型：</label>
          <a-select
            v-model:value="advancedQuery.contractType"
            allow-clear
            placeholder="请选择合同类型"
          >
            <a-select-option value="">
              全部
            </a-select-option>
            <a-select-option :value="1">
              全包合同
            </a-select-option>
            <a-select-option :value="2">
              折扣合同
            </a-select-option>
            <a-select-option :value="4">
              参数单价合同
            </a-select-option>
          </a-select>
        </div>
      </div>
      <template #footer>
        <div>
          <a-button @click="queryVisible = false">
            取消
          </a-button>
          <a-button @click="reset">
            重置
          </a-button>
          <a-button type="primary" @click="advancedQueryOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>

    <!-- 查看合同 -->
    <ht-modal
      title="合同详情"
      :open="contractDetailsVisible"
      width="85%"
      :mask-closable="false"
      @cancel="contractDetailsVisible = false"
      @ok="contractDetailsVisible = false"
    >
      <iframe
        v-if="contractDetailsVisible"
        id="userModal"
        style="border: 0"
        width="100%"
        height="550px"
        :src="contractDetailsUrl"
      ></iframe>
    </ht-modal>

    <!-- 项目详情 -->
    <ht-modal
      title="项目详情"
      :open="projectDetailsVisible"
      width="85%"
      :mask-closable="false"
      @cancel="projectDetailsVisible = false"
      @ok="projectDetailsVisible = false"
    >
      <iframe
        v-if="projectDetailsVisible"
        id="userModal"
        style="border: 0"
        width="100%"
        height="600px"
        :src="projectDetailsUrl"
      ></iframe>
    </ht-modal>

    <!-- 日志 -->
    <ht-modal
      title="日志"
      :open="logsVisible"
      width="85%"
      :mask-closable="false"
      @cancel="logsVisible = false"
      @ok="logsVisible = false"
    >
      <a-table
        :columns="columnsLogs"
        style="background: #fafafa"
        :data-source="logsData"
        :pagination="false"
        bordered
        row-key="outputId"
      >
      </a-table>
    </ht-modal>

    <!-- 打印 -->
    <ht-modal
      title="打印"
      :open="openPrintVisible"
      width="360px"
      :mask-closable="false"
      @cancel="openPrintVisible = false"
      @ok="printFun"
    >
      <a-radio-group v-model:value="selPrintType">
        <a-radio :style="radioStyle" :value="60">
          部门产值统计
        </a-radio>
        <a-radio :style="radioStyle" :value="70">
          部门人员产值统计表
        </a-radio>
        <!-- <a-radio :style="radioStyle" :value="3">检测类别产值统计表</a-radio> -->
        <a-radio :style="radioStyle" :value="80">
          人员参与项目产值统计表
        </a-radio>
        <a-radio :style="radioStyle" :value="90">
          项目产值统计表
        </a-radio>
      </a-radio-group>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'
import { IlisPrintUdr } from '../../../../../utils/IlisPrintUdr'

const innerColumns = [
  { title: '工程项目', dataIndex: 'projectName', key: 'projectName' },
  { title: '项目合同金额', dataIndex: 'outputValue', key: 'outputValue' },
  { title: '所属部门', dataIndex: 'departName', key: 'departName' },
  { title: '部门产值分配人', dataIndex: 'createName', key: 'createName' },
  { title: '部门产值分配时间', dataIndex: 'createDate', key: 'createDate' },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]
const columnsLogs = [
  {
    title: '内容',
    dataIndex: 'content',
    width: '30%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '处理意见',
    dataIndex: 'opinion',
    width: '20%',
  },
  {
    title: '对象编号',
    dataIndex: 'objectSn',
    width: '20%',
  },
  {
    title: '处理人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm:ss'),
  },
]

const tableColumns = [
  {
    title: '合同编号',
    dataIndex: 'contractNo',
    key: 'contractNo',
    width: 80,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '合同名称',
    dataIndex: 'contractName',
    key: 'contractName',
    width: 80,
  },
  {
    title: '合同方',
    dataIndex: 'contractUnitName',
    key: 'contractUnitName',
    width: 80,
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 200,
  },
  {
    title: '合同金额',
    dataIndex: 'contractTotalFee',
    key: 'contractTotalFee',
    width: 80,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    key: 'contractType',
    width: 80,
    scopedSlots: { customRender: 'contractType' },
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
    key: 'projectCode',
    width: 80,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '所属部门',
    dataIndex: 'department',
    key: 'department',
    width: 80,
    scopedSlots: { customRender: 'userType' },
  },
  {
    title: '登记日期',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 80,
  },
  {
    title: '生效日期',
    dataIndex: 'availabilityDate',
    key: 'availabilityDate',
    width: 80,
  },
  {
    title: '失效日期',
    dataIndex: 'expiryDate',
    key: 'expiryDate',
    width: 80,
  },
  {
    title: '负责人',
    dataIndex: 'chargePersonName',
    key: 'chargePersonName',
    width: 80,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 80,
    scopedSlots: { customRender: 'operation' },
  },
]
const depPersonsColumns = [
  {
    title: '参与人员',
    dataIndex: 'userName',
    key: 'userName',
  },

  {
    title: '确认权重',
    dataIndex: 'address',
    key: 'address3',
    scopedSlots: { customRender: 'weightInput' },
  },
  {
    title: '当前任务个人产值',
    dataIndex: 'outputValue',
    key: 'outputValue',
    scopedSlots: { customRender: 'outputValue' },
  },
]

export default {
  components: {},
  data() {
    return {
      departmentData: [],
      selPrintType: 60,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },

      columnsLogs,
      logsData: [],
      logsVisible: false,
      openPrintVisible: false,
      openColumnUrl:
        '/ilis2/consignController.do?goCustomColumn&queryType=material_allotted',
      getColumnUrl: 'rest/common/default-columns?type=material_allotted',
      selPublicRows: [],
      allotType: 0, // 20 选择合同，30，选择项目
      expandedRowKeys: [], // 展开行数据
      queryVisible: false,
      perParticipantsVisible: false,
      depParticipantsVisible: false,
      contractDetailsVisible: false,
      projectDetailsVisible: false,
      contractDetailsUrl: '',
      projectDetailsUrl: '',
      innerColumns,
      innerData: [],
      userList: [],
      depParticipantsList: [],
      participantsData: [],
      depData: [],
      depPersonsData: [],

      depPersonsColumns,

      tableData: [],
      tableColumns,
      advancedQuery: {
        allotStatus: '20',
        department: '',
        // consignUnitName: "",
        projectName: '',
        projectCode: '',
        contractName: '',
        contractCode: '',
        contractTotalMin: '',
        contractTotalMax: '',
        contractType: '',
      },
      selectedRowKeys: [],
      selectedRows: [],

      selectedChildrenRowKeys: [],
      selectedChildrenRows: [],

      selectedDepRowKeys: [],
      selectedDepRows: [],
      page: 1,
      size: 10,
      queryParam: '',
      loading: false,
      expandLoading: false,
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
      customRow: () => {
      },

      // depCustomRow: (record) => {
      //   return {
      //     on: {
      //       click: () => {
      //         if (!record.edit) { return }
      //         this.selectedDepRowKeys = [record.departmentOutputId];
      //         this.selectedDepRows = [record];

      //         this.getDepPorsonList()
      //       },
      //     },
      //   };
      // },
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
          this.selectedChildrenRowKeys = []
          this.selectedChildrenRows = []

          // 公共选中数据
          this.selPublicRows = selectedRows
          this.allotType = 20
        },
      }
    },
  },
  created() {
    this.getData()
    this.getLaboratoryData()
  },
  methods: {
    changeSort(c, x, srotVal) {
      this.advancedQuery.order = srotVal.order === 'ascend' ? 'asc' : 'desc'
      this.advancedQuery.orderCode = srotVal.columnKey
      this.getData()
    },
    getLaboratoryData() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax.get('/orgController.do?getOrgComboTree').then((res) => {
        if (res && res.length > 0) {
          this.departmentData = that.formatDepartmentData(res)
        }
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    printFun() {
      this.openPrintVisible = false
      const { queryParam, advancedQuery } = this
      const params = {
        queryParam,
        ...advancedQuery,
        printType: this.selPrintType,
      }

      const ilisPrintUdr = new IlisPrintUdr()
      ilisPrintUdr.printByJsonParam1('Output', params)
    },
    // 撤回
    withdraw(v, row) {
      // eslint-disable-next-line ts/no-this-alias
      const _that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定撤回？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          window.$oAjax({
            url: `rest/output/recall?outputIds=${row.outputId}`,
            method: 'PUT',
          })
            .then((res) => {
              if (res.code === 20000) {
                _that.getData()
                window.$oAntdMessage.success('撤回成功')
              }
            })
        },
        onCancel() {},
      })
    },
    openPrint() {
      this.openPrintVisible = true
    },

    // 任务回退
    taskRollback() {
      if (this.selectedRows.length) {
        const ids = this.selectedRows.map((item) => {
          return item.contractId
        })
        // eslint-disable-next-line ts/no-this-alias
        const _that = this
        window.$oAntdConfirm({
          title: '提示',
          content:
            '回退合同产值分配，则合同下的所有子项目均要回退至待分配项目，是否继续？"',
          onOk() {
            window.$oAjax({
              url: `rest/output/contract/recall?contractIds=${ids.join(',')}`,
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            })
              .then((res) => {
                // eslint-disable-next-line eqeqeq
                if (res.code == '20000') {
                  window.$oAntdMessage.success('回退成功')
                  _that.getData()
                }
                else {
                  window.$oAntdMessage.error(res.message)
                }
              })
          },
        })
      }
      else {
        window.$oAntdMessage.warning('请选择一条数据')
      }
    },
    // 展开回调
    expandFun(v, row) {
      //
      //
      this.expandedRowKeys = []
      if (v) {
        this.innerData = []
        this.expandLoading = true
        this.expandedRowKeys = [row.contractId]
        window.$oAjax
          .get('rest/output/project/allot/details', {
            params: {
              contractId: row.contractId,
            },
          })
          .then((res) => {
            if (res.code === 20000) {
              this.innerData = res.data
              this.expandLoading = false
            }
            else {
              window.$oAntdMessage.error(res.message)
            }
          })
      }
    },
    handleOk() {},

    // 高级查询
    advancedQueryOk() {
      this.queryVisible = false
      this.getData()
    },

    rowClassName() {
      // let className = "light-row";
      // if (index % 2 === 1) className = "dark-row";
      // return className;
    },

    tabSearchType() {
      this.queryVisible = true
    },

    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.getData()
    },
    // // 任务文件页面跳转
    // goTaskdetail: function (e, row) {
    //
    //   const reportUrl = `${rootUrl}/testTaskController.do?goTestTaskDetail&id=${row.testTaskId}&dataType=1&readType=1`;
    //   window.open(reportUrl, '任务文件页')
    // },
    // 项目详情跳转
    goProjectdetail(e, row, type) {
      // eslint-disable-next-line eqeqeq
      if (type == 1) {
        // 1合同类型 2：项目类型
        this.projectDetailsUrl = `/ilis2/output.do?projectDetails&contractId=${row.contractId}`
      }
      else {
        this.projectDetailsUrl = `/ilis2/output.do?projectDetails&projectId=${row.projectId}&contractId=${row.contractId}`
      }

      this.projectDetailsVisible = true
    },
    goContractDetail(v, row) {
      this.contractDetailsUrl
        = `/ilis2/contractController.do?goContractEdit&contractId=${
          row.contractId
        }&detail=detailPage`
      this.contractDetailsVisible = true
    },
    reset() {
      this.queryParam = ''
      this.advancedQuery = {
        department: '',
        allotStatus: '20',
        // consignUnitName: "",
        projectName: '',
        projectCode: '',
        contractName: '',
        contractCode: '',
        contractTotalMin: '',
        contractTotalMax: '',
        contractType: '',
      }
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size, queryParam, advancedQuery } = this
      this.loading = true

      const params = {
        page,
        size,
        queryParam,
        ...advancedQuery,
      }
      window.$oRest
        .get('rest/output/contract/allot/list', { params })
        .then((res) => {
          if (res && res.data) {
            this.tableData = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },
    openLogs(v, row, type) {
      this.logsData = []
      this.logsVisible = true
      const params = {
        contractId: row.contractId,
      }
      // eslint-disable-next-line eqeqeq
      if (type == 2) {
        params.projectId = row.projectId
      }
      window.$oRest
        .get('rest/output/project/log', {
          params,
        })
        .then((res) => {
          if (res.code === 20000) {
            this.logsData = res.data
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>

<style lang="less" scoped>
tr.ant-table-expanded-row td > .ant-table-wrapper {
  margin: 0px;
}

.projectManageList-input label {
  display: inline !important;
}

.projectManageList-input {
  display: flex;
  margin-bottom: 8px;

  label {
    text-align: right;
    display: block;
    padding-right: 8px;
    line-height: 28px;
  }

  .ant-calendar-picker,
  .ant-select,
  .ant-input {
    width: 340px;
  }
}
</style>
