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
      <!-- <a-button @click="reset">重置</a-button> -->
      <a-button @click="tabSearchType()">
        切换高级查询
      </a-button>
    </div>
    <div class="projectManageList-btn">
      <a-button
        v-permission="'project_department_allot'"

        type="primary"
        @click="showDepAllocationModal"
      >
        部门产值分配
      </a-button>
      <a-button
        v-permission="'project_user_allot'"

        type="primary"
        @click="showPerAllocationModal"
      >
        人员产值分配
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
      @expand="expandSetKey"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'contractType'">
          <span v-if="record.contractType == 1">全包合同</span>
          <span v-else-if="record.contractType == 2">折扣合同</span>
          <span v-else-if="record.contractType == 3">部分包干合同</span>
          <span v-else-if="record.contractType == 4">指定参数价格合同</span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => goContractDetail(e, record)">打开</a>
            <a @click="(e) => goProjectdetail(e, record, 20)">详情</a>
            <a
              v-if="record.allotStatus == '10' || record.allotStatus == '20'"
              v-permission="'project_to_allot_recall'"
              @click="(e) => withdraw(e, record)"
            >撤回</a>
          </span>
        </template>

        <template v-if="column.dataIndex === 'allotStatus'">
          <a-tag v-if="text == 10" color="green">
            已分配部门
          </a-tag>
          <a-tag v-else-if="text == 20" color="purple">
            已分配人员
          </a-tag>
          <span v-else></span>
        </template>
      </template>

      <!-- 展开table -->
      <template #expandedRowRender>
        <a-table
          :row-selection="rowSelectionForExpandedRowRender"
          :columns="innerColumns"
          row-key="projectId"
          :data-source="innerData"
          :pagination="false"
          :bordered="false"
          :loading="expandLoading"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'notIssue'">
              <span>{{ record.reportTotalNum - record.issueNum }}</span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  v-if="record.allotStatus == '10' || record.allotStatus == '20'"
                  v-permission="'project_to_allot_recall'"
                  @click="(e) => withdraw(e, record)"
                >撤回</a>
                <a @click="(e) => goProjectdetail(e, record, 30)">详情</a>
              </span>
            </template>

            <template v-if="column.dataIndex === 'projectValue'">
              <a-input-number
                v-model:value="record.projectValue"
                :min="0"
                :max="99999999"
                style="width: 100%"
                :step="10"
                placeholder="请输入合同金额"
                @blur="setProjectPrice(text, record)"
              />
            </template>

            <template v-if="column.dataIndex === 'allotStatus'">
              <a-tag v-if="text == 10" color="green">
                已分配部门
              </a-tag>
              <a-tag v-else-if="text == 20" color="purple">
                已分配人员
              </a-tag>
              <span v-else></span>
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
          <!-- <a-input v-model="advancedQuery.department" placeholder="请输入所属部门"></a-input> -->
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

        <!-- <div class="projectManageList-input">
            <label>分配状态：</label>
            <a-radio-group name="radioGroup" v-model="advancedQuery.allotStatus">
              <a-radio value="">全部</a-radio>
              <a-radio value="00">未分配</a-radio>
              <a-radio value="20">已分配</a-radio>
            </a-radio-group>
          </div> -->
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

    <!-- 部门产值分配弹框 -->
    <ht-modal
      v-model:open="depParticipantsVisible"
      title="部门产值分配"
      width="450px"
      @ok="depConfirmAllocation"
    >
      <div v-if="selectedRows[0]" style="margin-bottom: 10px">
        <p>合同名称：{{ selectedRows[0].projectName }}</p>
        <p>合同编号：{{ selectedRows[0].contractNo }}</p>
        <p>合同金额：{{ selectedRows[0].contractTotalFee }}</p>
      </div>
      <div v-if="selectedChildrenRows[0]" style="margin-bottom: 10px">
        <p>项目名称： {{ selectedChildrenRows[0].projectName }}</p>
        <p>项目编号： {{ selectedChildrenRows[0].projectCode }}</p>
        <p>项目金额： {{ selectedChildrenRows[0].projectValue }}</p>
      </div>
      <a-table
        :columns="[
          {
            title: '部门名称',
            dataIndex: 'departmentName',
            key: 'departmentName',
            width: '180px',
          },
          {
            title: '分配产值',
            dataIndex: 'outputValue',
            key: 'outputValue',
            scopedSlots: { customRender: 'outputValue' },
          },
        ]"
        :data-source="depParticipantsList"
        :pagination="false"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'outputValue'">
            <a-input-number
              v-model:value="record.outputValue"
              :min="0"
              :step="10"
              style="width: 200px"
              placeholder="请输入分配产值"
            />
          </template>
        </template>
      </a-table>
    </ht-modal>

    <!-- 人员产值分配弹框 -->
    <ht-modal
      v-model:open="perParticipantsVisible"
      title="人员产值分配"
      ok-text="确定分配"
      cancel-text="关闭"
      :after-close="getData"
      width="850px"
      @ok="empConfirmAllocation"
    >
      <div v-if="perParticipantsVisible" style="display: flex">
        <div style="margin-right: 20px; width: 300px">
          <p style="margin-bottom: 10px">
            部门列表：
          </p>
          <a-table
            :columns="[
              {
                title: '部门名称',
                dataIndex: 'departmentName',
                key: 'departmentName',
              },
              {
                title: '分配产值',
                dataIndex: 'departmentOutputValue',
                key: 'departmentOutputValue',
              },
            ]"
            style="background: #fafafa"
            :data-source="depData"
            :pagination="false"
            bordered
            row-key="departmentId"
            :custom-row="depCustomRow"
            :row-selection="rowSelectionForPerParticipants"
          >
          </a-table>
        </div>
        <div style="width: 500px">
          <p style="margin-bottom: 10px">
            <span>人员分配：</span>
            <a-button
              type="link"
              style="float: right"
              @click="goProjectdetail('', selPublicRows[0], allotType)"
            >
              项目列表
            </a-button>
          </p>
          <a-table
            :columns="depPersonsColumns"
            rowkey="userId"
            :data-source="depPersonsData"
            :pagination="false"
            :scroll="{ y: 350 }"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'weightInput'">
                <a-input-number
                  v-model:value="record.weights"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  placeholder="请输入权重比"
                  @blur="computeOutputValue(record)"
                />
              </template>

              <template v-if="column.dataIndex === 'outputValue'">
                <a-input-number
                  v-model:value="record.outputValue"
                  :min="0"
                  :max="999999999"
                  placeholder="请输入分配产值"
                />
              </template>
            </template>
          </a-table>
        </div>
      </div>
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
        style="border: 0"
        width="100%"
        height="550px"
        :src="contractDetailsUrl"
      ></iframe>
    </ht-modal>

    <!-- 项目详情 -->
    <ht-modal
      title="详情"
      :open="projectDetailsVisible"
      width="85%"
      :mask-closable="false"
      @cancel="projectDetailsVisible = false"
      @ok="projectDetailsVisible = false"
    >
      <iframe
        v-if="projectDetailsVisible"
        style="border: 0"
        width="100%"
        height="520px"
        :src="projectDetailsUrl"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'

const innerColumns = [
  {
    title: '状态',
    dataIndex: 'allotStatus',
    key: 'allotStatus',
  },
  { title: '工程项目', dataIndex: 'projectName', key: 'projectName' },
  {
    title: '项目合同金额',
    dataIndex: 'projectValue',
    key: 'projectValue',
    scopedSlots: { customRender: 'projectValue' },
    width: 150,
  },
  { title: '所属部门', dataIndex: 'departNames', key: 'departNames' },
  {
    title: '任务总数',
    dataIndex: 'reportTotalNum',
    key: 'reportTotalNum',
    sorter: (a, b) => a.reportTotalNum - b.reportTotalNum,
  },
  {
    title: '已签发',
    dataIndex: 'issueNum',
    key: 'issueNum',
    sorter: (a, b) => a.issueNum - b.issueNum,
  },
  {
    title: '未签发',
    dataIndex: 'notIssue',
    key: 'notIssue',
    scopedSlots: { customRender: 'notIssue' },
    sorter: (a, b) =>
      a.reportTotalNum - a.issueNum - (b.reportTotalNum - b.issueNum),
  },
  { title: '参与人员', dataIndex: 'participantName', key: 'participantName' },
  { title: '负责人', dataIndex: 'chargePersonName', key: 'chargePersonName' },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

const tableColumns = [
  {
    title: '状态',
    dataIndex: 'allotStatus',
    key: 'allotStatus',
    width: 50,
  },
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
    dataIndex: 'departNames',
    key: 'departNames',
    width: 80,
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
      openColumnUrl:
        '/ilis2/consignController.do?goCustomColumn&queryType=material_allotted',
      getColumnUrl: 'rest/common/default-columns?type=material_allotted',
      selPublicRows: [],
      allotType: 0, // 20 选择合同，30，选择项目
      expandedRowKeys: [], // 展开行数据
      expandedRowRow: [], // 展开行数据
      queryVisible: false,
      perParticipantsVisible: false,
      depParticipantsVisible: false,
      contractDetailsVisible: false,
      projectDetailsVisible: false,
      innerColumns,
      innerData: [],
      depParticipantsList: [],
      depData: [],
      depPersonsData: [],

      contractDetailsUrl: '',
      projectDetailsUrl: '',
      depPersonsColumns,

      tableData: [],
      tableColumns,
      advancedQuery: {
        allotStatus: '00',
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
        return {

        }
      },

      depCustomRow: (record) => {
        return {
          on: {
            click: () => {
              if (!record.edit) {
                return
              }
              this.selectedDepRowKeys = [record.departmentId]
              this.selectedDepRows = [record]

              this.getDepPorsonList()
            },
          },
        }
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
          this.selectedChildrenRowKeys = []
          this.selectedChildrenRows = []

          // 公共选中数据
          this.selPublicRows = selectedRows
          this.allotType = 20
        },
      }
    },
    rowSelectionForPerParticipants() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedDepRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedDepRowKeys = selectedRowKeys
          this.selectedDepRows = selectedRows
          this.getDepPorsonList()
        },
        getCheckboxProps: record => ({
          // eslint-disable-next-line eqeqeq
          disabled: record.edit == false, // Column configuration not to be checked
        }),
      }
    },
    rowSelectionForExpandedRowRender() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedChildrenRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedChildrenRowKeys = selectedRowKeys
          this.selectedChildrenRows = selectedRows
          this.selectedRowKeys = []
          this.selectedRows = []

          // 公共选中数据
          this.selPublicRows = selectedRows
          this.allotType = 30
        },
      }
    },
  },
  created() {
    // this.getColumn().then(r => {
    //   this.getData();
    // });
    this.getData()
    this.getLaboratoryData()
    // this.getCheckType();
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
    handleCancel() {},

    // 设置项目价格
    setProjectPrice(v, row) {
      if (v === 0) {
        return
      }
      window.$oAjax({
        method: 'post',
        url: `rest/output/project`,
        data: {
          contractId: row.contractId,
          projectId: row.projectId,
          outputValue: v,
          id: row.outputId || null,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.getData()
          window.$oAntdMessage.success('编辑成功')
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
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
              url: 'rest/output/recall',
              method: 'PUT',
              data: {
                outputIds: ids.join(','),
              },
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
    expandSetKey(v, row) {
      if (v) {
        this.expandedRowKeys = [row.contractId]
        this.expandedRowRow = [row]

        this.getExpansionData()
      }
      else {
        this.expandedRowKeys = []
        this.expandedRowRow = []
      }
    },
    // 展开回调
    getExpansionData() {
      if (this.expandedRowKeys.length) {
        this.innerData = []
        this.expandLoading = true
        window.$oAjax
          .get('rest/output/project/list', {
            params: {
              contractId: this.expandedRowRow[0].contractId,
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
    // 计算产值
    computeOutputValue(v) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /^(-?\d+)(\.\d{1,2})?$/
      if (reg.test(v.weights)) {
        // v.outputValue = v.weights * this.selectedDepRows[0].departmentOutputValue
        window.$oAjax
          .post(
            'rest/output/calculate',
            qs.stringify({
              feeTotal: this.selectedDepRows[0].departmentOutputValue,
              weights: v.weights,
            }),
          )
          .then((res) => {
            // eslint-disable-next-line eqeqeq
            if (res.code == '20000') {
              v.outputValue = res.data
            }
          })
      }
      else {
        v.weights = 0.0
        v.outputValue = 0
        window.$oAntdMessage.warning('权重比最多输入2位小数')
      }
    },
    // 确认部门产值分配
    depConfirmAllocation() {
      let sum = 0
      const totalFee = this.selectedRows[0]
        ? this.selectedRows[0].contractTotalFee
        : this.selectedChildrenRows[0].projectValue
      const depList = []
      this.depParticipantsList.forEach((item) => {
        // eslint-disable-next-line eqeqeq
        if (item.outputValue && item.outputValue != 0) {
          sum += item.outputValue
          depList.push(item)
        }
      })
      // eslint-disable-next-line eqeqeq
      if (totalFee != sum) {
        window.$oAntdMessage.warning('分配产值不等于当前总金额，请检查')
        return
      }
      this.depParticipantsVisible = false
      window.$oAjax({
        method: 'post',
        url: `rest/departmentOutput/contract/allot`,
        data: {
          contractId: this.selPublicRows[0].contractId,
          projectId:
            // eslint-disable-next-line eqeqeq
            (this.allotType == '30' && this.selPublicRows[0].projectId) || null,
          allotType: this.allotType,
          departmentOutput: depList,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('分配成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    // 确定人员分配
    empConfirmAllocation() {
      if (!this.depData.length) {
        window.$oAntdMessage.warning('没有部门可分配')
      }

      let isOver = true // 是否全部分配完毕
      this.depData.forEach((item) => {
        if (item.edit) {
          isOver = false
        }
      })
      if (isOver) {
        window.$oAntdMessage.warning('部门已全部分配完毕')
        return
      }
      else if (!this.selectedDepRows.length) {
        window.$oAntdMessage.warning('请选择一个部门进行分配')
        return
      }
      let num = 0
      const personsData = []
      this.depPersonsData.forEach((item) => {
        // eslint-disable-next-line eqeqeq
        if (item.outputValue && item.outputValue != 0) {
          num += Number.parseFloat(item.outputValue)
          personsData.push(item)
        }
      })
      // eslint-disable-next-line eqeqeq
      if (num != this.selectedDepRows[0].departmentOutputValue) {
        window.$oAntdMessage.warning('分配产值不等于当前部门产值，请检查')
        return false
      }

      window.$oAjax({
        method: 'post',
        url: `rest/userOutput/contract/allot`,
        data: {
          contractId: this.selPublicRows[0].contractId,
          projectId:
            // eslint-disable-next-line eqeqeq
            (this.allotType == '30' && this.selPublicRows[0].projectId) || null,
          allotType: this.allotType,
          userOutput: personsData,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('分配成功')
          this.getDepAllocation()
          this.depPersonsData = []
          this.selectedDepRowKeys = []
          this.selectedDepRows = []
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },

    // },
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
    // 项目详情跳转
    goProjectdetail(e, row, type) {
      // eslint-disable-next-line eqeqeq
      if (type == 20) {
        // 20合同类型 30：项目类型
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
            this.getExpansionData()

            this.selectEmpty()
          }
        })
    },
    // 部门产值分配
    showDepAllocationModal() {
      // eslint-disable-next-line eqeqeq
      if (this.selPublicRows.length != 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条合同或者项目数据'))
        return false
      }
      // eslint-disable-next-line eqeqeq
      else if (this.allotType == 30 && !this.selPublicRows[0].projectValue) {
        window.$oAntdModal.warning(window.$oMsgTips.info('当前项目没有设置金额！'))
      }
      // eslint-disable-next-line eqeqeq
      else if (this.selPublicRows[0].autoAllotPerson == 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info(' 当前任务可直接进行人员产值分配'))
      }
      else if (
        // eslint-disable-next-line eqeqeq
        this.allotType == 30
        // eslint-disable-next-line eqeqeq
        && this.selPublicRows[0].outputAllotType == '20'
      ) {
        // 如果当前选中的是项目，且 当前的合同已经分配则提示
        window.$oAntdModal.warning(window.$oMsgTips.info(`该合同已经进行部门产值分配`))
      }
      else {
        this.getDepartmentList()
        this.depParticipantsVisible = true
      }
    },
    // 选中数据置空
    selectEmpty() {
      this.selectedRowKeys = []
      this.selectedRows = []
      this.selectedChildrenRowKeys = []
      this.selectedChildrenRows = []
      // 公共选中数据
      this.selPublicRows = []
    },
    // 人员分配
    showPerAllocationModal() {
      // eslint-disable-next-line eqeqeq
      if (this.selPublicRows.length != 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条合同或者项目数据'))
        return false
      }
      else if (
        // eslint-disable-next-line eqeqeq
        this.allotType == 30
        // eslint-disable-next-line eqeqeq
        && this.selPublicRows[0].outputAllotType == '20'
      ) {
        // 如果当前选中的是项目，且 当前的合同已经分配则提示
        window.$oAntdModal.warning(window.$oMsgTips.info(`该合同已经进行部门产值分配`))
        return
      }

      this.getDepAllocation()
      this.depPersonsData = []
      this.depData = []
      this.selectedDepRowKeys = []
      this.selectedDepRows = []
      this.perParticipantsVisible = true
    },
    // 获取部门列表
    getDepartmentList() {
      // eslint-disable-next-line ts/no-this-alias
      const _that = this
      let params = {}

      this.allotType == 20
        ? (params = { contractId: this.selPublicRows[0].contractId })
        : (params = { projectId: this.selPublicRows[0].projectId })
      window.$oAjax
        .get('rest/output/department/list', {
          params,
        })
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data.map((item) => {
              item.outputValue = 0
              return item
            })
            _that.depParticipantsList = list
          }
        })
    },
    // 获取人员产值分配部门列表
    getDepAllocation() {
      // eslint-disable-next-line ts/no-this-alias
      const _that = this
      const params = {
        allotType: this.allotType,
        projectId: this.selPublicRows[0].projectId,
        contractId: this.selPublicRows[0].contractId,
      }
      // this.allotType == 30 ? "":params.contractId = this.selPublicRows[0].contractId
      window.$oAjax
        .get('rest/departmentOutput/contract/list', {
          params,
        })
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data.map((item) => {
              item.outputValue = 0
              return item
            })
            _that.depData = list
          }
          else {
            _that.depData = []
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },

    // 获取部门人员
    getDepPorsonList() {
      window.$oAjax
        .get('rest/userController/department/users', {
          params: {
            departmentId: this.selectedDepRows[0].departmentId,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data.map((item) => {
              item.outputValue = 0
              item.weights = 0
              item.departmentId = this.selectedDepRows[0].departmentId
              return item
            })
            this.depPersonsData = list
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
