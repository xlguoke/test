<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="projectManageList">
    <div class="projectManageList-search">
      <a-input
        v-model:value="queryParam"
        placeholder="输入委托单位/工程项目/委托编号/报告编号后候回车即可查询"
        @keyup.enter="search"
      />
      <a-button type="primary" class="ml-2" @click="search">
        查询
      </a-button>
      <!-- <a-button @click="reset">重置</a-button> -->
      <a-button @click="tabSearchType(2)">
        切换高级查询
      </a-button>
    </div>
    <div class="projectManageList-btn">
      <a-button
        v-permission="'material_print'"

        type="primary"
        @click="openPrint"
      >
        打印
      </a-button>
      <a-button
        v-permission="'material_export'"
        type="primary"

        @click="exportList"
      >
        导出
      </a-button>
      <a-button
        v-permission="'material_output_recall'"
        type="primary"

        @click="taskRollback"
      >
        任务回退
      </a-button>
      <a-button @click="columnScreen">
        列筛选
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
      :loading="expandLoading"
      row-key="testTaskId"
      :row-class-name="rowClassName"
      @expand="expandFun"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'feeStatus'">
          <span v-if="record.feeStatus == 0">已作废</span>
          <span v-else-if="record.feeStatus == 1">已收费</span>
          <span v-else-if="record.feeStatus == 2">部分缴费</span>
          <span v-else-if="record.feeStatus == 3">未支付</span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => goTaskdetail(e, record)">查看</a>
            <a @click="(e) => viewLog(e, record)">日志</a>
          </span>
        </template>
      </template>

      <template #expandedRowRender>
        <a-table
          :columns="innerColumns"
          :data-source="innerData"
          :pagination="false"
          :bordered="false"
          :loading="loading"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'userType'">
              <span v-if="record.userType == 0">报告负责人</span>
              <span v-else-if="record.userType == 1">报告创建人</span>
              <span v-else-if="record.userType == 2">报告编写人</span>
              <span v-else-if="record.userType == 3">复核人</span>
              <span v-else-if="record.userType == 4">审核人</span>
              <span v-else-if="record.userType == 5">批准人</span>
              <span v-else-if="record.userType == 6">检测人</span>
              <span v-else-if="record.userType == 7">记录人</span>
              <span v-else-if="record.userType == 8">协助人</span>
              <span v-else-if="record.userType == 9">项目负责人</span>
            </template>
          </template>
        </a-table>
      </template>
    </a-table>

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
        </div>
        <div class="projectManageList-input">
          <label>委托单位：</label>
          <a-input
            v-model:value="advancedQuery.consignUnitName"
            placeholder="请输入委托单位"
          ></a-input>
        </div>
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

        <div class="projectManageList-input">
          <label>样品名称：</label>
          <a-input
            v-model:value="advancedQuery.objectName"
            placeholder="请输入样品名称"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>委托日期：</label>
          <a-range-picker v-model:value="advancedQuery.consignDate" value-format="YYYY-MM-DD" />
        </div>
        <div class="projectManageList-input">
          <label>检测类别：</label>
          <a-select
            v-model:value="advancedQuery.checkTypeId"
            allow-clear
            placeholder="请选择检测类别"
          >
            <a-select-option value="">
              全部
            </a-select-option>
            <a-select-option
              v-for="item in checkTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </div>
        <div class="projectManageList-input">
          <label>委托编号：</label>
          <a-input
            v-model:value="advancedQuery.consignCode"
            placeholder="请输入委托编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>样品编号：</label>
          <a-input
            v-model:value="advancedQuery.testObjectCode"
            placeholder="请输入样品编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>任务编号：</label>
          <a-input
            v-model:value="advancedQuery.testTaskCode"
            placeholder="请输入任务编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>记录编号：</label>
          <a-input
            v-model:value="advancedQuery.testRecordCode"
            placeholder="请输入记录编号"
          ></a-input>
        </div>
        <div class="projectManageList-input">
          <label>报告编号：</label>
          <a-input
            v-model:value="advancedQuery.reportNumber"
            placeholder="请输入报告编号"
          ></a-input>
        </div>

        <div class="projectManageList-input">
          <label>参与人员：</label>
          <a-select
            v-model:value="advancedQuery.userId"
            show-search
            placeholder="请选择参与人员"
            :filter-option="filterOption"
          >
            <a-select-option
              v-for="item in userList"
              :key="item.userId"
              :value="item.userId"
            >
              {{ item.userName }}
            </a-select-option>
          </a-select>
        </div>
        <div v-show="advancedQuery.userId" class="projectManageList-input">
          <label>参与角色：</label>
          <a-radio-group
            v-model:value="advancedQuery.userType"
            name="radioGroup"
          >
            <a-radio value="">
              全部
            </a-radio>
            <a-radio :value="10">
              收样人员
            </a-radio>
            <a-radio :value="6">
              检测人员
            </a-radio>
            <a-radio :value="3">
              复核
            </a-radio>
            <a-radio :value="4">
              审核
            </a-radio>
            <a-radio :value="5">
              批准
            </a-radio>
          </a-radio-group>
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

    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>

    <!-- 打印 -->
    <ht-modal
      title="打印"
      :open="openPrintVisible"
      width="300px"
      :mask-closable="false"
      @cancel="openPrintVisible = false"
      @ok="printFun"
    >
      <a-radio-group v-model:value="selPrintType">
        <a-radio :style="radioStyle" :value="10">
          材料类部门产值统计
        </a-radio>
        <a-radio :style="radioStyle" :value="20">
          材料部门人员产值打印
        </a-radio>
        <a-radio :style="radioStyle" :value="30">
          材料检测类别打印
        </a-radio>
        <a-radio :style="radioStyle" :value="40">
          材料人员参与项目打印
        </a-radio>
        <a-radio :style="radioStyle" :value="50">
          材料项目打印
        </a-radio>
      </a-radio-group>
    </ht-modal>

    <!-- 查看日志 -->
    <CheckLogs ref="checkLogsRef" />
  </div>
</template>

<script>
import CheckLogs from '~/components/CheckLogs.vue'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { IlisPrintUdr } from '../../../../../utils/IlisPrintUdr'

const innerColumns = [
  { title: '参与人员', dataIndex: 'outputUser', key: 'outputUser' },
  {
    title: '参与角色',
    dataIndex: 'userType',
    key: 'userType',
    scopedSlots: { customRender: 'userType' },
  },
  { title: '核定费用', dataIndex: 'feeTotal', key: 'feeTotal' },
  { title: '分配权重', dataIndex: 'weights', key: 'weights' },
  { title: '当次任务产值', dataIndex: 'currentOutput', key: 'currentOutput' },
]
const participantsColumns = [
  // {
  //   title: '序号',
  //   dataIndex: 'name',
  //   key: 'name',
  // },
  {
    title: '参与角色',
    dataIndex: 'userType',
    key: 'userType',
    width: 80,
    scopedSlots: { customRender: 'userType' },
  },
  {
    title: '参与人员',
    dataIndex: 'userName',
    key: 'userName',
  },
  // {
  //   title: '职业资格',
  //   dataIndex: 'address',
  //   key: 'address 2',
  // },
  {
    title: '确认权重',
    dataIndex: 'address',
    key: 'address3',
    scopedSlots: { customRender: 'weightInput' },
  },
  {
    title: '当前任务核定费用',
    dataIndex: 'feeTotal',
    key: 'feeTotal',
  },
  {
    title: '当前任务个人产值',
    dataIndex: 'outputValue',
    key: 'outputValue',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    scopedSlots: { customRender: 'remarkInput' },
  },
]

export default {
  components: {
    CustomColumn,
    CheckLogs,
  },
  data() {
    return {
      selPrintType: '10',
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      departmentData: [],
      openPrintVisible: false,
      getColumnUrl: 'rest/common/chosen-columns?type=material_allotted',
      expandedRowKeys: [], // 展开行数据
      queryVisible: false,
      participantsVisible: false,
      innerColumns,
      innerData: [],
      checkTypeList: [],
      userList: [],
      participantsColumns,
      participantsData: [],
      tableData: [],
      tableColumns: [],
      advancedQuery: {
        department: '',
        consignUnitName: '',
        projectName: '',
        projectCode: '',
        contractName: '',
        contractCode: '',
        contractTotalMin: '',
        contractTotalMax: '',
        contractType: '',
        consignDate: '',
        objectName: '',
        checkTypeId: '',
        consignCode: '',
        testObjectCode: '',
        testTaskCode: '',
        testRecordCode: '',
        reportNumber: '',
        userId: '',
        userType: '',
        testObjectCode: '',
      },
      selectedRowKeys: [],
      selectedRows: [],
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
  created() {
    this.getCheckType()
    this.getUserList()
    this.initFun()
  },
  methods: {
    initFun() {
      this.getColumn().then(() => {
        this.getData()
        this.getLaboratoryData()
      })
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'material_allotted',
        '自定义列配置',
        false,
      )
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

    // 任务回退
    taskRollback() {
      if (this.selectedRows.length) {
        const ids = this.selectedRows.map((item) => {
          return item.outputId
        })
        // eslint-disable-next-line ts/no-this-alias
        const _that = this
        window.$oAntdConfirm({
          title: '提示',
          content: '当前任务回退至"待分配权重状态？"',
          onOk() {
            window.$oAjax({
              url: `rest/output/recall?outputIds=${ids.join(',')}`,
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
              })
          },
        })
      }
      else {
        window.$oAntdMessage.warning('请选择一条数据')
      }
    },
    openPrint() {
      this.openPrintVisible = true
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
    // 展开回调
    expandFun(v, row) {
      //
      //
      this.expandedRowKeys = []
      if (v) {
        this.innerData = []
        this.expandLoading = true
        this.expandedRowKeys = [row.testTaskId]
        window.$oAjax
          .get('rest/userOutput/list', {
            params: {
              outputId: row.outputId,
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

    // 获取筛选列
    getColumn() {
      return new Promise((r, j) => {
        window.$oAjax.get(this.getColumnUrl).then((res) => {
          if (res.code === 20000 && res.data.length > 0) {
            const list = res.data.map((item) => {
              item.title = item.columnName
              item.key = item.columnKey
              item.dataIndex = item.key
              // eslint-disable-next-line eqeqeq
              if (item.columnKey == 'feeStatus') {
                item.scopedSlots = { customRender: 'feeStatus' }
              }
              return item
            })
            list.push({
              title: '操作',
              key: 'operation',
              dataIndex: 'operation',
              width: 85,
            })

            this.tableColumns = list
            r(list)
          }
          else {
            j(res)
            window.$oAntdMessage.warning(res.message || res.msg || '请求错误')
          }
        })
      })
    },
    // 高级查询
    advancedQueryOk() {
      this.queryParam = ''
      this.getData()
      this.queryVisible = false
    },

    // 获取所有用户
    getUserList() {
      window.$oRest.get('rest/user/list').then((res) => {
        if (res.code === 20000) {
          res.data.unshift({
            userId: '',
            userName: '无',
          })
          this.userList = res.data
        }
      })
    },
    // 获取检测类型
    getCheckType() {
      window.$oAjax
        .post(
          'checkTypeController.do?getAll',
          // qs.stringify({ id: this.selectedRowKeys[0] })
        )
        .then((res) => {
          if (res && res.length) {
            this.checkTypeList = res
          }
        })
    },
    // 人员选择过滤
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .includes(input.toLowerCase())
      )
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
      this.reset()
      this.getData()
    },
    // 日志查看
    viewLog(v, row) {
      this.$refs.checkLogsRef.open({
        objectType: '3',
        objectId: row.reportId,
        relationQry: true,
      })
    },
    // 任务文件页面跳转
    goTaskdetail(e, row) {
      const reportUrl = `${rootUrl}/testTaskController.do?goTestTaskDetail&id=${row.testTaskId}&dataType=1&readType=1`
      window.open(reportUrl, '任务文件页')
    },
    reset() {
      this.advancedQuery = {
        department: '',
        consignUnitName: '',
        projectName: '',
        projectCode: '',
        contractName: '',
        contractCode: '',
        contractTotalMin: '',
        contractTotalMax: '',
        contractType: '',
        consignDate: '',
        objectName: '',
        checkTypeId: '',
        consignCode: '',
        testObjectCode: '',
        testTaskCode: '',
        testRecordCode: '',
        reportNumber: '',
        userId: '',
        userType: '',
        testObjectCode: '',
      }
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size, queryParam, advancedQuery } = this
      this.loading = true

      const params = {
        allotStatus: '20',
        page,
        size,
        queryParam,
        ...advancedQuery,
      }
      if (params.consignDate) {
        params.consignDateStart = params.consignDate[0]
        params.consignDateEnd = params.consignDate[1]
        delete params.consignDate
      }
      window.$oRest.get('rest/material/allot/list', { params }).then((res) => {
        if (res && res.data) {
          this.tableData = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },

    exportList() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, queryParam, advancedQuery } = this
      const a = document.createElement('a')
      const params = {
        allotStatus: '20',
        queryParam,
        ...advancedQuery,
      }
      let href = `/ilis2/rest/material/export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )
      a.href = href
      a.click()
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
