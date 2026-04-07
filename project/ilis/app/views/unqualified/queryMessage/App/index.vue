<!-- eslint-disable vue/eqeqeq -->
<template>
  <IlisContainer app-id="queryMessage">
    <div class="mb-4">
      <a-input
        v-model:value="queryParam"
        placeholder="输入工程项目/委托单位/接收人后回车即可查询"
        style="width: 300px"
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
    <a-table
      :row-selection="rowSelection"
      :columns="participantsColumns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="testTaskId"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a @click="(e) => goTaskdetail(e, record)">详情</a>
          </span>
        </template>

        <template v-if="column.dataIndex === 'node'">
          <span>
            {{ text == 10 ? ' 数据采集后' : '报告提交时' }}
          </span>
        </template>
      </template>
    </a-table>

    <ht-modal
      v-model:open="queryVisible"
      title="高级查询"
      width="550px"
      @ok="advancedQueryOk"
    >
      <div>
        <a-flex align="center">
          <label class="w-[85px] text-right">工程项目：</label>
          <a-input
            v-model:value="advancedQuery.projectName"
            class="flex-1"
            placeholder="请输入工程项目"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">委托单位：</label>
          <a-input
            v-model:value="advancedQuery.consignUnitName"
            class="flex-1"
            placeholder="请输入委托单位"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">接收人：</label>
          <a-input
            v-model:value="advancedQuery.receiveName"
            class="flex-1"
            placeholder="请输入"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">委托编号：</label>
          <a-input
            v-model:value="advancedQuery.consignCode"
            class="flex-1"
            placeholder="请输入"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">样品名称：</label>
          <a-input
            v-model:value="advancedQuery.testObjectName"
            class="flex-1"
            placeholder="请输入"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">报告编号：</label>
          <a-input
            v-model:value="advancedQuery.reportNum"
            class="flex-1"
            placeholder="请输入"
          ></a-input>
        </a-flex>
        <a-flex class="mt-4" align="center">
          <label class="w-[85px] text-right">通知时间：</label>
          <a-range-picker
            v-model:value="advancedQuery.sendDate"
            class="flex-1"
            format="YYYY-MM-DD"
          />
        </a-flex>
      </div>
      <template #footer>
        <div>
          <a-button @click="queryVisible = false">
            取消
          </a-button>
          <a-button type="primary" @click="advancedQueryOk">
            确定
          </a-button>
          <a-button @click="reset">
            重置
          </a-button>
        </div>
      </template>
    </ht-modal>

    <ht-modal
      v-model:value="setLogVisible"
      title="日志"
      width="850px"
      @ok="setLogVisible = false"
    >
      <iframe
        v-if="setLogVisible"
        id="adsVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="`tSLogProcessController.do?goProcessLogListPage&objectType=3&relationQry=true&objectId=${selectedRows[0].reportId}`"
      ></iframe>
    </ht-modal>
  </IlisContainer>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

const participantsColumns = [
  {
    title: '通知时间',
    dataIndex: 'createDate',
    key: 'createDate',
  },
  {
    title: '消息推送节点',
    dataIndex: 'node',
    key: 'node',
    scopedSlots: { customRender: 'node' },
  },
  {
    title: '内容',
    dataIndex: 'message',
    key: 'message',
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnitName',
    key: 'consignUnitName',
  },
  {
    title: '接收人',
    dataIndex: 'receiveName',
    key: 'receiveName',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]

export default {
  components: {},
  data() {
    return {

      queryVisible: false,
      participantsColumns,
      participantsData: [],
      tableData: [],
      tableColumns: [],
      setLogVisible: false,
      advancedQuery: {
        projectName: '',
        consignUnitName: '',
        receiveName: '',
        consignCode: '',
        testObjectName: '',
        reportNum: '',
        sendDate: '',
      },
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      queryParam: '',
      loading: false,
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
    this.getData()
  },
  methods: {
    // 任务文件页面跳转
    goTaskdetail(e, row) {
      if (row.taskId) {
        const arr = row.taskId.split(',')
        arr.forEach((item) => {
          const reportUrl = `${rootUrl}/testTaskController.do?goTestTaskDetail&id=${item}&dataType=1&readType=1`
          window.open(reportUrl, '_blank')
        })
      }
      else {
        window.$oAntdMessage.warning('未找到任务')
      }
    },

    // 高级查询
    advancedQueryOk() {
      this.queryParam = ''
      this.getData()
      this.queryVisible = false
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
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
    reset() {
      this.advancedQuery = {
        projectName: '',
        consignUnitName: '',
        receiveName: '',
        consignCode: '',
        testObjectName: '',
        reportNum: '',
        sendDate: '',
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

      if (params.sendDate) {
        params.sendDateStart = dayjs(params.sendDate[0]).format('YYYY-MM-DD')
        params.sendDateEnd = dayjs(params.sendDate[1]).format('YYYY-MM-DD')
        delete params.sendDate
      }
      window.$oRest.get('rest/unqualifiedMessage/list', { params }).then((res) => {
        if (res && res.data) {
          this.tableData = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
  },
}
</script>
