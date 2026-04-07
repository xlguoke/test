<template>
  <div class="testReport">
    <div class="testReport-left">
      <TreeComponent :tree-select="treeSelect" :is-title="true" />
    </div>
    <div class="testReport-right">
      <div class="testReport-search">
        <div v-if="allSearch">
          <a-form :model="formState">
            <a-form-item
              label="报告编号"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.reportCode" />
            </a-form-item>
            <a-form-item
              label="报告状态"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-select v-model:value="formState.status" placeholder="请选择报告状态">
                <a-select-option
                  v-for="(item, index) in reportStatusData"
                  :key="index"
                  :value="item.value"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="工程划分"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.projectName" />
            </a-form-item>
            <a-form-item
              label="检测内容"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.testContent" />
            </a-form-item>
            <a-form-item
              label="试验人员"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.testPerson" />
            </a-form-item>
            <a-form-item
              label="签发人员"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-input v-model:value="formState.signPerson" />
            </a-form-item>
            <a-form-item
              label="报告时间"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-range-picker v-model:value="formState.stamp" value-format="YYYY-MM-DD" />
            </a-form-item>
            <a-form-item
              label="创建时间"
              :label-col="{ span: 2 }"
              :wrapper-col="{ span: 10 }"
            >
              <a-range-picker v-model:value="formState.createTime" value-format="YYYY-MM-DD" />
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 18, offset: 2 }">
              <a-button @click="getData(true)">
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
              <a-button
                @click="
                  () => {
                    formState = {}
                    getData(true)
                  }
                "
              >
                重置
              </a-button>
              <a-button
                v-permission="'create:task'"
                :disabled="isDetail"
                type="primary"

                @click="createReport"
              >
                创建任务
              </a-button>
              <a-button
                v-permission="'create:task'"
                :disabled="isDetail"

                @click="cloneReport"
              >
                复制报告
              </a-button>
              <a-button
                v-permission="'del:report'"
                :disabled="isDetail"

                @click="deleteReport"
              >
                作废报告
              </a-button>
              <a-button
                v-permission="'del:report'"
                :disabled="isDetail"

                @click="setTrimProject"
              >
                调整所属工程划分
              </a-button>
              <a-button v-permission="'projectTest:printTaskTestSheet'" :disabled="isDetail" @click="printTaskDetection">
                打印任务检测单
              </a-button>
              <a-button v-permission="'projectTest:printConsignSheet'" :disabled="isDetail" @click="printConsignSheet">
                打印委托单
              </a-button>
            </a-form-item>
          </a-form>
        </div>
        <div v-else>
          <a-input
            v-model:value="searchText"
            placeholder="请输入报告编号"
            class="testReport-search-all"
          />
          <a-button @click="getData(true)">
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
          <a-button
            v-permission="'create:task'"
            :disabled="isDetail"
            type="primary"

            @click="createReport"
          >
            创建任务
          </a-button>
          <a-button
            v-permission="'create:task'"
            :disabled="isDetail"

            @click="cloneReport"
          >
            复制报告
          </a-button>
          <a-button
            v-permission="'del:report'"
            :disabled="isDetail"

            @click="deleteReport"
          >
            作废报告
          </a-button>
          <a-button
            v-permission="'del:report'"
            :disabled="isDetail"

            @click="setTrimProject"
          >
            调整所属工程划分
          </a-button>
          <a-button v-permission="'projectTest:printTaskTestSheet'" :disabled="isDetail" @click="printTaskDetection">
            打印任务检测单
          </a-button>
          <a-button v-permission="'projectTest:printConsignSheet'" :disabled="isDetail" @click="printConsignSheet">
            打印委托单
          </a-button>
        </div>
      </div>
      <a-table
        :row-selection="rowSelection"
        :custom-row="customRow"
        :scroll="{ x: 1414 }"
        :columns="columns"
        :pagination="pagination"
        :data-source="data"
        :loading="loading"
        bordered
        row-key="testTaskId"
        :row-class-name="rowClassName"
        @change="sorterChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'testTaskCode'">
            <div class="text_ellipsis">
              <a
                v-if="record.consignStatus === '40'
                  || record.consignStatus === '50'
                  || record.consignStatus === '45'"
                @click="goweituoEdit(record)"
              >
                {{ text }}
              </a>
              <a
                v-else-if="detectTaskStatus(record)"
                :href="goTestTaskDetail(record)"
                target="_blank"
              >
                {{ text }}
              </a>
              <span v-else>{{ text }} </span>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'reportCode'">
            <div class="text_ellipsis">
              <a
                v-if="detectTaskStatus(record)"
                :href="goTestTaskDetail(record)"
                target="_blank"
              >{{ text }}</a>
              <span v-else>{{ text }}</span>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'reportStatus'">
            {{ reportStatusDesc(record) }}
          </template>

          <template
            v-else-if="[
              'unitProjectName',
              'testParamNames',
              'testPerson',
              'editPerson',
              'reviewPerson',
              'auditPerson',
              'approvePerson',
            ].includes(column.dataIndex)"
          >
            <div :title="text" class="text_ellipsis">
              {{ text }}
            </div>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <a-button
              v-permission="'see-log'"
              size="small"
              type="link"
              @click="handleTaskLog(record)"
            >
              日志
            </a-button>
          </template>
        </template>
      </a-table>
      <Logs ref="Logs" />
      <ht-modal
        v-model:open="visible"
        title="调整所属工程划分"
        :confirm-loading="confirmLoading"
        width="450px"
        :mask-closable="false"
        class="selTree"
        @ok="handleSubmit"
        @cancel="handleCancel"
      >
        <SelTree ref="SelTree" :callback="getTrimProject" />
      </ht-modal>
    </div>
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import { deleteConsign } from '~/providers/api/synthesisProject'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.js'
import Logs from '../otherAchievement/components/logs.vue'
import SelTree from './components/selTree.vue'
import TreeComponent from './components/tree.vue'

const statusData = {
  10: '复核中',
  15: '审核中',
  20: '签发中',
  30: '已签发',
}

export default {
  components: {
    TreeComponent,
    SelTree,
    Logs,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      name: getQueryVariable('name'),
      isDetail: getQueryVariable('status') === '1',
      data: [],
      rootUrl,
      columns: [
        {
          title: '任务编号',
          dataIndex: 'testTaskCode',
          width: 150,
          scopedSlots: { customRender: 'testTaskCode' },
          fixed: 'left',
        },
        {
          title: '报告编号',
          dataIndex: 'reportCode',
          scopedSlots: { customRender: 'reportCode' },
          width: 250,
          fixed: 'left',
        },
        {
          title: '工程划分',
          width: 210,
          dataIndex: 'unitProjectName',
          scopedSlots: { customRender: 'unitProjectName' },
        },
        {
          dataIndex: 'testParamNames',
          title: '检测内容',
          sorter: true,
          scopedSlots: { customRender: 'testParamNames' },
          width: 210,
        },
        {
          title: '报告状态',
          width: 120,
          dataIndex: 'reportStatus',
        },
        {
          title: '试验人员',
          width: 80,
          dataIndex: 'testPerson',
          scopedSlots: { customRender: 'testPerson' },
        },
        {
          title: '报告编制',
          width: 80,
          dataIndex: 'editPerson',
          scopedSlots: { customRender: 'editPerson' },
        },
        {
          title: '复核',
          width: 80,
          dataIndex: 'reviewPerson',
          scopedSlots: { customRender: 'reviewPerson' },
        },
        {
          title: '审核',
          width: 80,
          dataIndex: 'auditPerson',
          scopedSlots: { customRender: 'auditPerson' },
        },
        {
          title: '签发/批准',
          width: 80,
          dataIndex: 'approvePerson',
          scopedSlots: { customRender: 'approvePerson' },
        },
        {
          dataIndex: 'createDate',
          title: '创建时间',
          width: 90,
          sorter: true,
          customRender: ({ text }) => (text ? formatTime(text, 'YYYY-MM-DD') : ''),
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 70,
          align: 'center',
          key: 'action',
          fixed: 'right',
        },
      ],
      searchText: '',
      formLayout: 'horizontal',
      formState: {},
      allSearch: false,
      loading: false,
      page: 1,
      size: 10,
      reportStatusData: [
        { value: '999', name: '检测中' },
        { value: '10', name: '复核中' },
        { value: '15', name: '审核中' },
        { value: '20', name: '签发中' },
        { value: '30', name: '已签发' },
      ],
      selectedRowKeys: [],
      selectedRows: [],
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
      goweituoEdit(row) {
        top.addTabs && top.addTabs({
          id: row.consignId,
          title: '修改委托',
          close: false,
          url: `consignController.do?goEdit&id=${row.consignId}&status=${row.consignStatus}`,
        })
      },
      customRow: (record) => {
        return {
          onClick: () => {
            // this.selectedRowKeys = [record.testTaskId]
            // this.selectedRows = [record]
            if (this.selectedRowKeys.includes(record.testTaskId)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.testTaskId),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.testTaskId !== record.testTaskId,
              )
            }
            else {
              this.selectedRowKeys.push(record.testTaskId)
              this.selectedRows.push(record)
            }
          },
        }
      },
      treeParams: {},
      createDate: 2,
      testParamNames: 0,
      visible: false,
      confirmLoading: false,
      selData: {},
      /**
       * ## 创建任务时，检测方案成果没有审核通过的，采取何种交互
       * NOT_NOTICE - 不提示
       * NOTICE_NOT_BLOCK - 提示不阻断
       * NOTICE_BLOCK - 提示并阻断
       */
      createTaskCheck: '',
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        columnWidth: 40,
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    this.getData()
    try {
      const res = await getBusinessParamValue('VERIFY_SCHEME_AUDIT_STATUS')
      this.createTaskCheck = res
    }
    catch (err) {
      console.error(err)
    }
  },
  methods: {
    /** 验证检测方案成果是否存在审核通过的 */
    async checkOtherAchievementAudit() {
      return await window.$oAjax({
        url: `rest/synthesis/project/have-approved-test-plan/${this.id}`,
      }).then((res) => {
        if (res.code === 20000) {
          return res.data
        }
        throw res
      }).catch((err) => {
        console.error(err)
        return false
      })
    },
    reportStatusDesc(record) {
      let state = statusData[record.reportStatus]
      if (record.consignStatus === '50') {
        state = '通知修改委托中'
      }
      else if (record.workflowStatus === '2') {
        if (record.taskStatus === '10') {
          state = '退回修改中'
        }
        else {
          state = '检测中'
        }
      }
      else if (!state) {
        state = '检测中'
      }
      return state
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 打印
    printTaskDetection() {
      if (this.selectedRows.length === 0) {
        window.$oAntdMessage.warning('请至少选择一条数据')
        return
      }

      const ids = this.selectedRows.map((item) => {
        return item.testTaskId
      })

      const udrPrint = new IlisPrintUdr()
      udrPrint.commonPrint(ids, 'TestingTaskList')
    },
    printConsignSheet() {
      if (this.selectedRows.length === 0) {
        window.$oAntdMessage.warning('请至少选择一条数据')
        return
      }

      const udrPrint = new IlisPrintUdr()
      udrPrint.commonPrint(this.selectedRows.map(i => i.consignId), PrintUdrTempleteType['委托单打印'])
    },
    // 打印前的接口方式传参
    parameterType() {
      let ids = this.selectedRows.map((item) => {
        return item.testTaskId
      })
      ids = ids.join('@@')
      return new Promise((resolve) => {
        window.$oAjax({
          method: 'post',
          data: JSON.stringify({ data: { ids } }),
          url: 'rest/dictionaryController/putDataInServer',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        }).then((res) => {
          if (res.code === 20000) {
            resolve(res)
          }
          else {
            window.$oAntdMessage.error(res.msg)
          }
        })
      })
    },

    // 获取令牌
    getTempLoginToken() {
      return new Promise((resolve) => {
        window.$oAjax({
          method: 'post',
          url: 'loginController.do?getTempToken',
        }).then((res) => {
          if (res.success) {
            resolve(res)
          }
          else {
            window.$oAntdMessage.error(res.msg)
          }
        })
      })
    },

    getData(flag) {
      if (flag) {
        this.page = 1
      }

      let data = {}
      if (this.allSearch) {
        let stamp = []
        let createTime = []
        const values = { ...this.formState }
        if (values.stamp && Array.isArray(values.stamp)) {
          stamp = values.stamp.map((item) => {
            return new Date(item).getTime()
          })
        }
        if (values.createTime && Array.isArray(values.createTime)) {
          createTime = values.createTime.map((item) => {
            return new Date(item).getTime()
          })
        }
        data = {
          ...values,
          stamp: stamp.toString() || null,
          createTime: createTime.toString() || null,
        }
      }
      else {
        data.reportCode = this.searchText
      }

      const { page, size, treeParams, createDate, testParamNames } = this
      const params = {
        page,
        size,
        ...data,
        ...treeParams,
        createDate,
        testParamNames,
      }

      this.loading = true
      window.$oRest
        .get(`${window.$oApi.testItem.reportList}/${this.id}`, {
          params,
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    searchType(bool) {
      this.allSearch = bool
    },
    treeSelect(keys, data) {
      const { type, oid } = data.node.dataRef
      this.selData = data.node.dataRef
      if (data.selected) {
        if (`${type}` === '-2') {
          this.treeParams = {}
        }
        else {
          this.treeParams = { belongsId: oid }
        }
      }
      else {
        this.treeParams = {}
      }

      this.getData(true)
    },
    async beforeCreateReport() {
      const isAudit = await this.checkOtherAchievementAudit()
      return new Promise((resolve) => {
        // 存在审核通过的文件
        if (isAudit)
          return resolve(true)

        // 不提示
        if (!this.createTaskCheck || this.createTaskCheck === 'NOT_NOTICE')
          return resolve(true)
        if (this.createTaskCheck === 'NOTICE_BLOCK') {
          Modal.info({
            title: '提示',
            content: `当前综合检测工程项目暂无审核通过的综合检测方案，请及时上传并审核通过后再次尝试！`,
            okText: '确定',
            centered: true,
          })
          // 提示并阻断
          resolve(false)
        }
        else {
          // 提示不阻断
          Modal.confirm({
            title: '提示',
            content: `当前综合检测工程项目暂无审核通过的综合检测方案，是否继续？`,
            okText: '确定',
            cancelText: '取消',
            centered: true,
            onOk: () => {
              resolve(true)
            },
            onCancel: () => {
              resolve(false)
            },
          })
        }
      })
    },
    async createReport() {
      if (!await this.beforeCreateReport()) {
        return
      }
      sessionStorage.setItem(
        `testReport${this.id}`,
        JSON.stringify([this.selData]),
      )

      top.addTabs && top.addTabs({
        id: this.id,
        title: '创建综合试验',
        close: false,
        url: `consignController.do?goEdit&createTest=1&projectId=${this.id}&projectName=${this.name}&testProject=1`,
      })
    },
    cloneReport() {
      if (this.selectedRows.length !== 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据进行复制'))
        return
      }
      sessionStorage.setItem(
        `testReport${this.id}`,
        JSON.stringify([this.selData]),
      )
      const url = `consignController.do?goEdit&createTest=1&cloneReport=1&projectId=${this.id}&projectName=${this.name}&id=${this.selectedRows[0].consignId}&testTaskId=${this.selectedRows[0].testTaskId}`

      top.addTabs && top.addTabs({
        id: this.id,
        title: '创建综合试验',
        close: false,
        url,
      })
    },
    deleteReport() {
      if (this.selectedRows.length !== 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据进行作废'))
        return
      }
      const row = this.selectedRows[0]
      Modal.confirm({
        title: '作废报告',
        content: `您确定要作废任务编号为： ${row.testTaskCode} 的报告吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const id = row.consignId
          deleteConsign(id, '综合试验项目，作废报告').then((res) => {
            if (res.success) {
              window.$oAntdMessage.success('作废报告成功')
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
    setTrimProject() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }
      this.visible = true
      const idArr = this.selectedRows.map(item => item.consignId)
      window.$oNextTick(() => {
        this.$refs.SelTree.showModal(idArr)
      })
    },
    getTrimProject() {
      this.visible = false
      this.getData()
    },
    handleCancel() {
      this.visible = false
      this.$refs.SelTree.handleCancel()
    },
    handleSubmit() {
      this.$refs.SelTree.handleSubmit()
    },
    tSort(status) {
      // this.testParamNames = (this.testParamNames == status) ? 0 : status;
      this.testParamNames = status || 0
      this.getData()
    },
    sorterChange(pagination, filters, sorter) {
      const sorterObj = { ascend: '1', descend: '2' }
      if (sorter.field === 'createDate') {
        this.cSort(sorterObj[sorter.order])
      }
      else {
        this.tSort(sorterObj[sorter.order])
      }
    },
    cSort(status) {
      // this.createDate = (this.createDate == status) ? 0 : status;
      this.createDate = status || 0
      this.getData()
    },
    handleTaskLog(record) {
      this.$refs.Logs.showModal(record.testTaskId, '2')
    },
    detectTaskStatus(record) {
      // workflowStatus
      const taskProcess = record.workflowStatus
      const taskStatus = record.taskStatus
      if (taskProcess === '2') {
        return taskStatus !== '10'
      }
      return true
    },
    goTestTaskDetail(record) {
      let url = `${rootUrl}/testTaskController.do?goTestTaskDetail&id=${record.testTaskId}&createTest=1&printEmptyTable=1&consignId=${record.consignId}`
      url += `&rid=${record.reportId}`
      let stateName
      const state = statusData[record.reportStatus]
      if (record.workflowStatus === '2') {
        if (record.taskStatus === '10') {
          stateName = '退回中'
        }
        else {
          stateName = '检测中'
        }
      }
      else if (!state) {
        stateName = '检测中'
      }
      else {
        stateName = state
      }

      if (stateName === '检测中') {
        url += '&isTesting=isTesting'
      }
      else {
        url += '&readType=2'
      }
      return url
    },
  },
}
</script>

<style lang="less">
.text_ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
}
.selTree :deep(.ant-modal-body) {
  height: 450px;
  overflow: hidden;
  overflow-y: auto;
}
@import './index.less';
</style>
