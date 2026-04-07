<template>
  <div class="sampleScanRecord">
    <div style="">
      <a-button type="primary" @click="batchQualification">
        设置报告印章
      </a-button>
      <a-button type="primary" @click="batchFlowPerson">
        设置流程人员
      </a-button>
      <a-button type="primary" @click="batchRemoveData">
        移除
      </a-button>
      <span style="color: red; float: right" class="text-sm">
        <!-- <span style="font-size: 14px;margin-right: 10px;">检测参数类别:</span> -->
        <!-- <a-checkbox-group @change="checkboxChange" v-model="checkedList" :options="testParamCategory" /> -->
        *使用批量提交报告时，只能提交正式报告
      </span>
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="taskId"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a-button type="link" :disabled="isOfflineReportVal" @click="selReportFile(record)">
              设置报告文件
            </a-button>
            <a-button type="link" style="color: red" @click="removeData([record])">
              删除
            </a-button>
          </div>
        </template>

        <template v-if="column.dataIndex === 'attachments'">
          <template v-if="record.attachments && !isOfflineReportVal">
            <span
              v-for="item in record.attachments"
              :key="item.taskAttachmentId"
              style="margin-right: 10px"
            >
              <span
                v-if="item.attachmentName.length > 6"
                style="cursor: pointer"
                :title="item.attachmentName"
              >{{ item.attachmentName.substring(0, 6) }}...</span>
              <span v-else style="cursor: pointer" :title="item.attachmentName">{{
                item.attachmentName
              }}</span>
            </span>
          </template>
          <template v-else>
            <span style="margin-right: 10px">
              线下出具报告
            </span>
          </template>
        </template>

        <template v-if="column.dataIndex === 'reportSeals'">
          {{ displayReportSeal(record.reportSeals, 'sealName') }}
        </template>

        <template v-if="column.dataIndex === 'qualificationTypeName'">
          {{ displayReportSeal(record.reportSeals, 'qualificationName') }}
        </template>
      </template>
    </a-table>

    <div class="mt-4">
      <a-space>
        <div class="w-[85px] text-right">
          试验环境条件：
        </div>
        <a-input
          v-model:value="formData.testConditions"
          style="width: 180px"
          placeholder="试验环境条件"
        />
        <span class="label" style="color: red">填写后所有未填写过的试验记录环境条件会统一设置为填入的值（只支持有模板的试验）！</span>
      </a-space>
    </div>
    <div v-if="reviewVisibl" class="mt-4">
      <a-space>
        <div class="w-[85px] text-right">
          复核日期：
        </div>
        <a-date-picker
          v-model:value="formData.reviewDate"
          style="width: 195px"
          value-format="YYYY-MM-DD"
        />
      </a-space>
    </div>
    <div v-if="auditVisibl" class="mt-4">
      <a-space>
        <div class="w-[85px] text-right">
          审核日期：
        </div>
        <a-date-picker
          v-model:value="formData.auditDate"
          style="width: 195px"
          value-format="YYYY-MM-DD"
        />
      </a-space>
    </div>
    <div v-if="approvalVisibl" class="mt-4">
      <a-space>
        <div class="w-[85px] text-right">
          批准日期：
        </div>
        <a-date-picker
          v-model:value="formData.signDate"
          style="width: 195px"
          value-format="YYYY-MM-DD"
        />
      </a-space>
    </div>
    <a-flex class="mt-4">
      <div class="w-[85px] text-right mr-2">
        提交意见：
      </div>
      <a-textarea
        v-model:value="formData.reportOpinion"
        class="flex-1"
        placeholder="请输入提交意见"
      />
    </a-flex>

    <ht-modal
      v-model:open="qualificationVisible"
      title="选择资质"
      width="550px"
      @ok="handleOkReportSeals"
    >
      <iframe
        v-if="qualificationVisible"
        id="qualificationIframe"
        style="border: 0"
        width="100%"
        height="300px"
        :src="qualificationPageUrl"
      ></iframe>
    </ht-modal>

    <ht-modal
      v-model:open="flowPersonnelVisible"
      title="设置流程人员"
      width="700px"
      @ok="handleOkPerson"
    >
      <iframe
        v-if="flowPersonnelVisible"
        id="flowPersonnelIframe"
        style="border: 0"
        width="100%"
        height="350px"
        :src="flowPersonnelUrl"
      ></iframe>
    </ht-modal>

    <ht-modal
      v-model:open="reportFileVisible"
      title="选择文件"
      width="80%"
      @ok="handleOkFile"
    >
      <iframe
        v-if="reportFileVisible"
        id="reportFileIframe"
        style="border: 0"
        width="100%"
        height="400px"
        :src="reportFileUrl"
      ></iframe>
    </ht-modal>

    <EditModal :id="editId" ref="editModalRef" :callback="getPersonConfig" />
    <!-- <a-button @click="okSubmit()">
       提交
     </a-button> -->

    <!-- <a-button @click="saveAllocationData">确定</a-button> -->
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import editModal from './components/editModal.vue'

const columns = [
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
  },
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
  },
  {
    title: '检测参数',
    dataIndex: 'testParamDisplayName',
    width: 300,
  },
  {
    title: '检验结果',
    dataIndex: 'isQualified',
  },
  {
    title: '资质类型',
    dataIndex: 'qualificationTypeName',
    scopedSlots: { customRender: 'qualificationTypeName' },
  },
  {
    title: '报告印章',
    dataIndex: 'reportSeals',
    scopedSlots: { customRender: 'reportSeals' },
  },
  {
    title: '报告文件',
    dataIndex: 'attachments',
    scopedSlots: { customRender: 'attachments' },
  },
  {
    title: '复核人员',
    dataIndex: 'reviewers',
  },
  {
    title: '审核人员',
    dataIndex: 'auditors',
  },
  {
    title: '批准人员',
    dataIndex: 'approver',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 150,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    EditModal: editModal,
  },
  data() {
    return {
      formData: {
        testConditions: '温度： ℃，相对湿度： %',
        reportOpinion: '',
        reviewDate: '',
        auditDate: '',
        signDate: '',
      },
      conditionsVisibl: true,
      auditVisibl: false,
      approvalVisibl: false,
      reviewVisibl: false,
      activeRowData: null,
      reportFileUrl: ``,
      qualificationPageUrl: '',
      flowPersonnelUrl: '',
      rootUrl,
      flowPersonnelVisible: false,
      qualificationVisible: false,
      reportFileVisible: false,
      testTaskId: decodeURIComponent(getQueryVariable('testTaskId')) || '',
      testParamCategory: [],
      checkedList: [],
      editId: '',
      selectedRowKeys: [],
      data: [],
      query: {
        q: '',
      },
      sortParams: null,
      columns,
      showCustomerSampleCode: false,
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
      isOfflineReportVal: false,
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
      }
    },
  },
  created() {
    this.getTestParamCategory()
    this.getData()
    this.isOfflineReportFun()
    window.saveAllocationData = this.saveAllocationData

    this.getSystemControlParameter('REPORT_MANAGE_26').then((res) => {
      // eslint-disable-next-line eqeqeq
      res.obj == 'Y'
        ? (this.approvalVisibl = true)
        : (this.approvalVisibl = false)
    })
    this.getSystemControlParameter('REPORT_MANAGE_REVIEW_DATE').then((res) => {
      // eslint-disable-next-line eqeqeq
      res.obj == 'Y' ? (this.reviewVisibl = true) : (this.reviewVisibl = false)
    })
    this.getSystemControlParameter('REPORT_MANAGE_AUDIT_DATE').then((res) => {
      // eslint-disable-next-line eqeqeq
      res.obj == 'Y' ? (this.auditVisibl = true) : (this.auditVisibl = false)
    })

    top.BatchSubmitReport = this.okSubmit
  },
  methods: {
    async isOfflineReportFun() {
      const testTaskId = (this.testTaskId.includes(',')) ? this.testTaskId.split(',')[0] : this.testTaskId
      await window.$oAjax.get(
        `/rest/testTaskController/getTestObject.do?testTaskId=${testTaskId}`,
      ).then((res) => {
        if (res[0].testObjectParams && res[0].testObjectParams.length > 0) {
          const params = res[0].testObjectParams
          for (let i = 0; i < params.length; i++) {
            if (params[i].isOfflineReport === '1') {
              this.isOfflineReportVal = true
              break
            }
          }
        }
      })
    },
    displayReportSeal(reportSeals, key) {
      const result = []

      reportSeals.forEach((i) => {
        if (!result.includes(i[key])) {
          result.push(i[key])
        }
      })

      return result.join(',')
    },
    batchRemoveData() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warning('请选择至少一条数据')
        return
      }
      this.removeData(this.selectedRows)
    },
    removeData(rows) {
      window.$oAntdConfirm({
        title: '确定移除选中的数据吗?',
        content: '当您点击确定按钮后，数据将会被移除',
        centered: true,
        onOk: () => {
          for (let i = this.data.length - 1; i >= 0; i--) {
            const id = this.data[i].taskId
            rows.forEach((row) => {
              // eslint-disable-next-line eqeqeq
              if (id == row.taskId) {
                this.data.splice(i, 1)
              }
            })
          }

          this.selectedRows = []
          this.selectedRowKeys = []
        },
      })
    },

    okSubmit(cb) {
      this.loading = true

      // eslint-disable-next-line prefer-regex-literals
      const reg = new RegExp(/^温度：\s*℃，相对湿度：\s*%$/)
      if (reg.test(this.formData.testConditions)) {
        this.formData.testConditions = ''
      }
      else {
        // eslint-disable-next-line prefer-regex-literals
        const reg1 = new RegExp(/^(温度：\s*\S+\s*℃)，相对湿度：\s*%/)
        // eslint-disable-next-line prefer-regex-literals
        const reg2 = new RegExp(/^温度：\s*℃，(相对湿度：\s*\S+\s*%)$/)
        const regArr1 = reg1.exec(this.formData.testConditions)
        const regArr2 = reg2.exec(this.formData.testConditions)
        if (regArr1) {
          this.formData.testConditions = regArr1[1]
        }
        else if (regArr2) {
          this.formData.testConditions = regArr2[1]
        }
      }
      const params = this.data.map((it) => {
        const newItem = { ...it }
        newItem.testTaskId = newItem.taskId
        if (this.isOfflineReportVal) {
          newItem.regulatoryId = '' // 线下出具报告，不上报监管系统
        }
        return {
          ...newItem,
          ...this.formData,
        }
      })

      window.$oAjax
        .post(`/rest/testTaskReportController/submit/batch`, params, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this.loading = false

          if (res && res.code === 20000) {
            this.loading = false
          }
          else {
            const arr = res.msg.split('<br>')
            Modal.error({
              title: '提示',
              content: h(
                'div',
                {},
                arr.map((it) => {
                  return h('p', it)
                }),
              ),
            })
          }

          cb && cb(res)
        })
    },
    getPersonConfig(v) {
      this.selectedRowKeys.forEach((key) => {
        this.data.forEach((it) => {
          // eslint-disable-next-line eqeqeq
          if (key == it.taskId) {
            it.actualTesters = JSON.parse(JSON.stringify(v))
          }
        })
      })
    },
    checkboxChange(v) {
      this.getData(v.join(','))
    },

    async getSystemControlParameter(type) {
      return await window.$oAjax.get(
        `/rest/tSBusinessParamController.do?getBusinessParam&key=${type}`,
      )
    },

    getTestParamCategory() {
      window.$oAjax.get(`/rest/testParamCategory/all`).then((res) => {
        if (res && res.code === 20000) {
          this.testParamCategory = res.data.map((it) => {
            return {
              label: it.name,
              value: it.id,
            }
          })

          // this.pagination.total = res.data.count;
          // this.pagination.current = page;
          // this.pagination.pageSize = size;
        }
      })
    },
    async saveData(row) {
      row.isEdit = false
    },
    register(row) {
      this.selectedRowKeys = [row.taskId]
      this.selectedRows = [row]
      this.batchRegister()
    },

    batchQualification() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warning('请选择至少一条数据')
        return
      }

      this.qualificationPageUrl = `${rootUrl}/qualificationController.do?goSelectSealPage`
      this.qualificationVisible = true
    },

    batchFlowPerson() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warning('请选择至少一条数据')
        return
      }
      const paramIds = []
      const testTaskIds = []
      this.selectedRows.forEach((it) => {
        paramIds.push(it.testParamIds)
        testTaskIds.push(it.taskId)
      })
      this.flowPersonnelUrl = `${rootUrl}/view.do?page=batchAllocation&type=batchReport&testTaskIds=${testTaskIds.join(
        ',',
      )}&paramIds=${paramIds.join(',')}`
      this.flowPersonnelVisible = true
    },

    handleOkReportSeals() {
      const winObj = document.getElementById(
        'qualificationIframe',
      ).contentWindow

      winObj.getSelection
      && winObj.getSelection((rows) => {
        this.selectedRows.forEach((it) => {
          this.data.forEach((item) => {
            // eslint-disable-next-line eqeqeq
            if (it.taskId == item.taskId) {
              item.reportSeals = rows
            }
          })
        })
        this.qualificationVisible = false
      })
    },

    handleOkPerson() {
      document
        .getElementById('flowPersonnelIframe')
        .contentWindow
        .resetAssignee(() => {
          this.flowPersonnelVisible = false
          // this.getData();
          this.loading = true
          const params = {
            testTaskIds: this.testTaskId.split(',') || [],
            page: 1,
            size: 99999,
          }
          window.$oAjax
            .post(
              `/rest/testTaskReportController/submit/batch/query`,
              params,
              {
                headers: {
                  'content-type': 'application/json',
                },
              },
            )
            .then((res) => {
              if (res && res.code === 20000) {
                this.data.forEach((it) => {
                  res.data.rows.forEach((item) => {
                    // eslint-disable-next-line eqeqeq
                    if (it.taskId == item.taskId) {
                      it.reviewers = item.reviewers
                      it.auditors = item.auditors
                      it.approver = item.approver
                    }
                  })
                })
                this.loading = false
              }
            })
        })
      // if (data.length == 0) {
      //   window.$oAntdModal.warning(window.$oMsgTips.info("请选择数据"));
      //   return
      // }
    },
    handleOkFile() {
      document
        .getElementById('reportFileIframe')
        .contentWindow
        .commitChoose((res) => {
          if (!res || !res.length) {
            window.$oAntdMessage.warning('请选择文件至少一个文件')
          }
          else {
            this.data.forEach((it, i) => {
              // eslint-disable-next-line eqeqeq
              if (it.taskId == this.activeRowData.taskId) {
                this.data[i].attachments = res.map((its) => {
                  return {
                    attachmentName: its.name,
                    taskAttachmentId: its.id,
                  }
                })
              }
            })
            this.reportFileVisible = false
          }
        })
    },

    selReportFile(row) {
      this.activeRowData = row
      const attachmentIds = row.attachments
        .map((it) => {
          return it.taskAttachmentId
        })
        .join(',')

      this.reportFileVisible = true
      this.reportFileUrl = `${rootUrl}/testTaskReportController.do?goAttachmentChoosePage&reChoose=reChoose&testTaskId=${row.taskId}&attachmentIds=${attachmentIds}`
    },

    batchRegister() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warning('请选择至少一条数据')
        return
      }
      if (
        this.selectedRows.length === 1
        && this.selectedRows[0].actualTesters
        && this.selectedRows[0].actualTesters.length
      ) {
        // 如果是单个参数登记且已经分配过权重
        this.$refs.editModalRef.checkedKeys
          = this.selectedRows[0].actualTesters.map((it) => {
            return it.userId
          })
        this.$refs.editModalRef.selectedNode
          = this.selectedRows[0].actualTesters
      }
      else {
        // 如果是多个参数登记
        this.$refs.editModalRef.testTaskId = this.testTaskId
        const personIdArr = this.selectedRows[0].assignedTesterIds.split(',')
        const nameArr = this.selectedRows[0].assignedTesters.split(',')
        this.$refs.editModalRef.checkedKeys = personIdArr
        this.$refs.editModalRef.selectedNode = personIdArr.map((it, i) => {
          return {
            ratio: 0,
            userName: nameArr[i],
            userId: personIdArr[i],
          }
        })
      }
      this.$refs.editModalRef.showModal()
    },

    onSelectChange(selectedRowKeys, row) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = row
    },
    getScanResult(result) {
      this.query.scode = result
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    async getData() {
      this.loading = true
      const params = {
        testTaskIds: this.testTaskId.split(',') || [],
        page: 1,
        size: 99999,
      }
      window.$oAjax
        .post(
          `/rest/testTaskReportController/submit/batch/query`,
          params,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        .then((res) => {
          if (res && res.code === 20000) {
            this.data = res.data.rows

            this.loading = false
          }
        })
    },
    saveAllocationData() {
      return this.data
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
