<template>
  <a-spin :spinning="loading" :tip="spinTip">
    <a-form layout="inline" class="search-form">
      <a-form-item v-if="showQuery">
        <a-range-picker v-model:value="searchForm.uploadTime" />
      </a-form-item>
      <a-form-item>
        <QueryInput
          v-model:value="searchForm.projectName"
          :api-url="api.common.project"
          q-key="quickQryParam"
          placeholder="请输入项目名称"
          @press-enter="
            (d) => {
              projectId = d.id
              search()
            }
          "
        />
      </a-form-item>
      <a-form-item>
        <QueryInput
          v-model:value="searchForm.unitProjectName"
          :api-url="`/rest/synthesis/contracts?projectId=${projectId}`"
          q-local
          label="contractPartName"
          placeholder="请输入工程划分"
          @press-enter="search"
        />
      </a-form-item>
      <a-form-item v-if="showQuery">
        <a-select
          v-model:value="searchForm.status"
          allow-clear
          placeholder="请选择数据状态"
        >
          <a-select-option v-for="(k, val) in STATUS" :key="val" :value="val">
            {{ k }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="!showQuery">
        <a-select
          v-model:value="searchForm.uploadUserId"
          allow-clear
          placeholder="请选择上传人"
        >
          <a-select-option v-for="(k, v) in uploadUsers" :key="v" :value="v">
            {{ k }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value="searchForm.q"
          allow-clear
          placeholder="请输入任务编号、样品名称或检测参数"
          @press-enter="search"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <a-button @click="resetForm">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <div v-if="showHandles" class="batch-handle">
      <a-button
        v-permission="'offlineDataImportTask'"
        type="primary"

        @click="batchImportTask"
      >
        导入试验任务
      </a-button>
      <a-button
        v-permission="'offlineDataDeleteTask'"

        @click="batchDelTask"
      >
        批量删除
      </a-button>
      <div style="float: right; margin-top: 5px">
        <div

          v-permission="'offlineDataSeeAll'"
        >
          <a-checkbox v-model:checked="seeAll" @change="getData">
            查看全部
          </a-checkbox>
        </div>
      </div>
    </div>
    <a-table
      class="mt-2"
      row-key="id"
      bordered
      :columns="columns"
      :data-source="data"
      :row-class-name="rowClassName"
      :pagination="pagination"
      :row-selection="rowSelection"
      :custom-row="customRow"
      :scroll="{ y: tableHeight }"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'testTaskCode'">
          <div v-if="record.status !== '10'" class="relation-task">
            <a href="#" title="查看任务详情" @click.stop="goTaskDetail(record)">{{
              text
            }}</a>
            <p v-if="record.handbookSn" class="record-sn">
              （{{ record.handbookSn }}）
            </p>
          </div>
          <span v-else>{{ text || record.handbookSn }}</span>
        </template>

        <template v-if="column.dataIndex === 'testRecordCode'">
          {{ text }}
          <p v-if="record.recordSn" class="record-sn">
            （{{ record.recordSn }}）
          </p>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <span :class="`data-status status-${text}`">{{ STATUS[text] }}</span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <a-button
            v-if="record.status === '10'"
            v-permission="'offlineDataCreateTask'"
            type="link"
            @click.stop="createTask(record)"
          >
            创建任务
          </a-button>
          <a-button
            v-if="record.status !== '30'"
            v-permission="'offlineDataImportTask'"
            type="link"
            @click.stop="importTask(record)"
          >
            导入任务
          </a-button>
          <a-button
            v-permission="'offlineDataEditTask'"
            type="link"
            style="color: #333"
            @click.stop="showDetail(record)"
          >
            编辑
          </a-button>
          <a-button
            v-permission="'offlineDataDeleteTask'"
            type="link"
            style="color: red"
            @click.stop="delRow(record.id)"
          >
            删除
          </a-button>
          <a-button
            v-permission="'offlineDataLog'"
            type="link"
            style="color: #333"
            @click.stop="viewLog(record.id)"
          >
            日志
          </a-button>
        </template>
      </template>
    </a-table>

    <!-- 日志 -->
    <Logs ref="Logs" relation-qry>
      <template #logContent="{ scope }">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <span style="flex: 1">{{ scope.text }}</span>
          <a
            href="#"
            style="width: 60px; text-align: right"
            @click="showLogDetail(scope.record)"
          >查看详情</a>
        </div>
      </template>
    </Logs>
    <!-- 单条数据导入 -->
    <ImportDetail ref="importDetail" @finish="impostHandle" />
    <!-- 批量导入 -->
    <BatchImportDetail ref="batchImportDetail" @finish="importFinish" />
    <!-- 检测任务列表 -->
    <TestTaskList ref="testTaskList" @ok="selectTestTask" />
  </a-spin>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import Logs from '~/providers/components/logs.vue'
import QueryInput from '~/providers/components/queryInput/index.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import OpenHitekUdrTool from '~/providers/libs/openHitekUdrTool'
import BatchImportDetail from './components/BatchImportDetail.vue'
import ImportDetail from './components/ImportDetail.vue'
import TestTaskList from './components/TestTaskList.vue'

const STATUS = {
  10: '待创建任务',
  20: '未导入任务',
  30: '已导入任务',
}
const columns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
  },
  {
    title: '工程划分',
    dataIndex: 'unitProjectName',
  },
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
  },
  {
    title: '检测参数',
    dataIndex: 'paramNames',
  },
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
    scopedSlots: { customRender: 'testTaskCode' },
  },
  {
    title: '记录编号',
    dataIndex: 'testRecordCode',
    scopedSlots: { customRender: 'testRecordCode' },
  },
  {
    title: '最新上传时间',
    dataIndex: 'uploadTime',
    sorter: true,
    width: 130,
  },
  {
    title: '上传人',
    width: 110,
    dataIndex: 'uploadUserName',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    QueryInput,
    Logs,
    ImportDetail,
    BatchImportDetail,
    TestTaskList,
  },
  data() {
    return {
      data: [],
      tableHeight: 300,
      pageName: 'offlineDataList',
      showQuery: true,
      showHandles: true,
      seeAll: false,
      searchForm: {},
      sortParams: {},
      projectId: '',
      STATUS,
      columns: [],
      uploadUsers: [],
      loading: false,
      spinTip: '',
      selectedRowKeys: [],
      selectedRows: [],
      importItem: {},
      selType: 'checkbox',
      page: '',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.pagination.current = page
          this.pagination.pageSize = size
          this.getData()
        },
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selType === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
              return
            }
            if (this.selectedRowKeys.includes(record.id)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        type: this.selType,
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
    api() {
      return window.$oApi
    },
  },
  created() {
    const page = getQueryVariable('pageName') || ''
    let _columns = [...columns]
    this.page = page
    if (page === 'testTaskDetail') {
      // 任务详情引用该页面时，初始化视图
      this.selType = 'radio'
      this.showQuery = false
      this.showHandles = false
      this.searchForm.status = 10
      _columns = columns.filter((d) => {
        if (d.dataIndex === 'testTaskCode') {
          delete d.scopedSlots
        }
        return d.dataIndex !== 'operation'
      })
    }
    this.columns = _columns
    this.getData()
    this.getUploadUser()
  },
  mounted() {
    window.getSelections = this.getSelections
    this.initTableHeight()
    window.onresize = () => {
      this.initTableHeight()
    }
  },
  methods: {
    initTableHeight() {
      const formH = document.querySelector('.search-form').clientHeight
      this.tableHeight = document.body.clientHeight - formH - 160
    },
    getUploadUser() {
      const status = this.page === 'testTaskDetail' ? '10' : ''
      window.$oAjax({
        url: window.$oApi.offlineDataManage.uploadUser,
        method: 'GET',
        params: {
          status,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.uploadUsers = res.data || {}
        }
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 排序
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        this.sortParams = {
          orderBy: sorter.field,
          asc: sorter.order === 'ascend',
        }
      }
      else {
        this.sortParams = {}
      }
      this.getData()
    },
    getData() {
      const { current, pageSize } = this.pagination
      const form = { ...this.searchForm, seeAll: this.seeAll }
      if (form.uploadTime && form.uploadTime.length > 0) {
        form.uploadTimeStart = form.uploadTime[0].format('YYYY-MM-DD')
        form.uploadTimeEnd = form.uploadTime[1].format('YYYY-MM-DD')
        delete form.uploadTime
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.offlineDataManage.list,
        method: 'GET',
        params: {
          page: current,
          size: pageSize,
          ...form,
          ...this.sortParams,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.loading = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message))
          this.loading = false
        }
      })
    },
    // 搜索
    search() {
      this.pagination.current = 1
      this.getData()
    },
    resetForm() {
      this.pagination.current = 1
      this.searchForm = {}
      if (this.page === 'testTaskDetail') {
        this.searchForm.status = '10'
      }
      this.getData()
    },
    // 创建任务
    createTask(row) {
      top.addTabs
      && top.addTabs({
        id: row.id,
        title: '创建综合试验',
        close: false,
        url: `consignController.do?goEdit&createTest=1&offlineDataId=${row.id}`,
      })
    },
    importFinish() {
      this.selectedRowKeys = []
      this.getData()
    },
    // 批量导入任务
    async batchImportTask() {
      const keys = this.selectedRowKeys
      if (keys.length === 0) {
        window.$oAntdMessage.info('请选择要导入的任务')
        return
      }
      const importRows = this.data.filter(item => keys.includes(item.id))
      const waitCreate = importRows.filter(item => item.status === '10')
      const importEnd = importRows.filter(item => item.status === '30')
      if (waitCreate.length > 0 || importEnd.length > 0) {
        const taskCode = waitCreate
          .map(d => d.testTaskCode || d.handbookSn)
          .join('、')
        const importCode = importEnd
          .map(d => d.testTaskCode || d.handbookSn)
          .join('、')
        const msg1 = taskCode
          ? `任务编号：${taskCode} 无试验任务的数据，无法批量导入！请点击“创建任务”功能快捷创建或点击“导入任务”选择试验任务。`
          : ''
        const msg2 = importCode
          ? `任务编号：${importCode} 已导入！请重新选择试验任务。`
          : ''
        window.$oAntdModal.error({
          title: '无法批量导入',
          content: `所选离线数据，${msg1}${msg2}`,
          okText: '确定',
        })
        return
      }
      window.$oAntdConfirm({
        title: '提示',
        content:
          '若在线试验任务中的检测参数在离线数据中不存在时，将导入失败；若离线数据中的检测参数在在线试验任务中不存在时，导入成功后，将在在线任务中自动添加该检测参数；离线试验数据导入成功后，将覆盖在线试验任务数据，被覆盖后，将无法恢复，请谨慎导入！',
        onOk: () => {
          this.$refs.batchImportDetail.showModal(importRows)
        },
      })
    },
    // 单条导入任务
    async importTask(row) {
      this.importItem = row
      if (row.status === '10') {
        this.$refs.testTaskList.showModal()
        return
      }
      this.$refs.importDetail.showModal(row.id, row.testTaskId)
    },
    // 选择试验任务，指定数据导入该任务
    selectTestTask(rows) {
      const row = rows[0]
      this.$refs.importDetail.showModal(this.importItem.id, row.testTaskId)
    },
    /**
     * 导入
     * @param {object} data 回调参数
     * @param {string} data.id 离线数据id
     * @param {string} data.testTaskId 离线数据关联的任务id
     */
    async impostHandle(data) {
      this.loading = true
      this.spinTip = `导入中，请稍后...`
      window.$oAjax({
        url: window.$oApi.offlineDataManage.selTaskImport,
        method: 'post',
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          this.loading = false
          this.spinTip = ''
          if (res && res.code === 20000) {
            window.$oAntdMessage.success('导入成功！')
            this.importFinish()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || '导入异常'))
          }
        })
        .catch((err) => {
          this.loading = false
          this.spinTip = ''
          window.$oAntdModal.warning(window.$oMsgTips.info(err.message || '导入异常'))
        })
    },
    // 批量删除
    batchDelTask() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdMessage.info('请选择要删除的任务')
        return
      }
      this.deleteHandle(this.selectedRowKeys)
    },
    // 单条删除
    delRow(id) {
      this.deleteHandle([id])
    },
    // 删除
    deleteHandle(ids) {
      const modal = window.$oAntdConfirm({
        title: '删除提示',
        content: '离线数据删除后，系统将无法恢复。您确认要删除？',
        onOk: async () => {
          modal.destroy()
          let process = 0
          this.spinTip = `删除中，请稍后...， ${process}%`
          this.loading = true
          const delFail = []
          for (let i = 0; i < ids.length; i++) {
            const id = ids[i]
            try {
              await this.deleteFetch(id)
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
            catch (err) {
              delFail.push(id)
            }
            process = Number.parseInt(i + (1 / ids.length) * 100)
            this.spinTip = `删除中，请稍后...， ${process}%`
          }
          this.getData()
          this.spinTip = ''
          this.loading = false
          this.selectedRowKeys = []
          if (delFail.length === 0) {
            window.$oAntdMessage.success('删除成功！')
          }
          else {
            window.$oAntdMessage.error('删除失败！')
          }
        },
      })
    },
    // 发起删除请求
    async deleteFetch(id) {
      const res = await window.$oAjax({
        url: `${window.$oApi.offlineDataManage.delete}/${id}`,
        method: 'DELETE',
      })
      if (res && res.code === 20000)
        return res
      return Promise.reject(res)
    },
    // 日志
    viewLog(id) {
      this.$refs.Logs.showModal(id, '28')
    },
    // 日志详情
    showLogDetail(row) {
      const dataItem = this.data.find(item => item.id === row.objectId)
      this.showDetail(dataItem, 1)
    },
    // 查看任务信息
    goTaskDetail(row) {
      const queryParams = `id=${row.testTaskId}&page=${this.pageName}`

      window.open(
        `/ilis2/testTaskController.do?goTestTaskDetail&${queryParams}`,
        '_blank',
      )
    },
    // 详情
    showDetail(row, readOnly) {
      let url = `${location.origin}${rootUrl}/testTaskController.do?goTestTaskUdrContainer`
      url += `&id=${row.testTaskId || ''}`
      url += `&offlineRecordId=${row.id || ''}`
      url += `&udrReadOnly=${readOnly || ''}`

      // window.open(url, '_blank')  // 浏览器测试
      OpenHitekUdrTool(url, 'max', true)
    },
    // 获取选中数据
    getSelections() {
      return this.selectedRows
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
