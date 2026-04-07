<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form :model="formState" layout="inline">
          <a-form-item label="部门科室">
            <a-input-group compact style="display: flex">
              <a-input
                v-model:value="formState.depart"
                placeholder="请选择"
                @click="setOrg()"
              />
              <a-button @click="setOrg()">
                选择
              </a-button>
            </a-input-group>
          </a-form-item>
          <a-form-item label="报告提交时间">
            <a-range-picker
              v-model:value="formState.consignDate"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item label="人员名称">
            <a-input
              v-model:value="formState.quickQry"
              placeholder="请输入"
            ></a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button @click="reset">
              重置
            </a-button>
          </a-form-item>
        </a-form>
        <a-flex class="my-2" justify="space-between" align="center">
          <a-button @click="exportExcel">
            导出
          </a-button>
          <a-checkbox v-model:checked="formState.haveQuestion">
            仅显示有复核审批意见的报告
          </a-checkbox>
        </a-flex>
        <a-table
          :columns="columns"
          :data-source="data"
          bordered
          :pagination="data.length > 0 ? pagination : false"
          row-key="id"
          @change="sorterChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a-button
                  type="link"
                  size="small"
                  @click="viewDetail(record)"
                >
                  查看
                </a-button>
              </span>
            </template>
          </template>
        </a-table>
        <AddOrg ref="AddOrg" :callback="getOrg" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import AddOrg from '~/providers/components/orgList.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const initColumns = [
  {
    title: '报告编号',
    dataIndex: 'reportSn',
    width: '10%',
  },
  {
    title: '报告提交时间',
    dataIndex: 'submitDate',
    sorter: true,
    width: '6%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnit',
    width: '10%',
  },
  {
    title: '工程项目',
    dataIndex: 'consignProject',
    width: '10%',
  },
  {
    title: '检测人/报告创建人',
    dataIndex: 'testerOrCreator',
    width: '7%',
  },
  {
    title: '复核',
    dataIndex: 'reviewer',
    width: '4%',
  },
  {
    title: '审核',
    dataIndex: 'auditor',
    width: '4%',
  },
  {
    title: '批准',
    dataIndex: 'approver',
    width: '4%',
  },
  {
    title: '意见数量',
    dataIndex: 'questionCount',
    width: '5%',
    customRender: ({ text }) => (text || ''),
  },
]
const initQuestionData = [
  {
    title: '严重错误',
    dataIndex: 'companyAddress',
    key: 'companyAddress',
  },
  {
    title: '一般',
    dataIndex: 'companyName',
    key: 'companyName',
  },
]
const initOpr = [
  {
    title: '操作',
    dataIndex: 'operation',
    width: '4%',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    AddOrg,
  },
  data() {
    return {
      formState: {
        consignDate: [],
        haveQuestion: true,
      },
      data: [],
      columns: [],
      types: [],
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      spinning: false,
      questionData: [],
      questionType: {},
      initQuestionData,
      labelCol: { span: 5 },
      wrapperCol: { span: 17 },
      orgData: [{ id: '', name: '' }],
      sortParams: null,
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
  async created() {
    const now = new Date()
    this.startDate = `${now.getFullYear()}-01-01`
    this.formState = {
      consignDate: [this.startDate, dayjs(now).format('YYYY-MM-DD')],
      haveQuestion: true,
    }
    await this.getStatus()
    this.getData()
  },
  methods: {
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '8a8ab0b246dc81120146dc8181cdxx5g',
        }),
      }).then((res) => {
        let typeArr = []
        let reviewArr = []
        let auditArr = []
        let approveAyy = []
        if (res && res.success) {
          res.obj.forEach((item) => {
            // 问题严重程度分类
            this.types.push(item.typename)
            // 错误严重程度
            this.questionType[item.typename] = 0
            typeArr.push({
              title: item.typename,
              dataIndex: item.typename,
              width: '3%',
            })
            // 复核时意见数量
            this.questionType[`review_${item.typename}`] = 0
            reviewArr.push({
              title: item.typename,
              dataIndex: `review_${item.typename}`,
              width: '3%',
            })
            // 审核时意见数量
            this.questionType[`audit_${item.typename}`] = 0
            auditArr.push({
              title: item.typename,
              dataIndex: `audit_${item.typename}`,
              width: '3%',
            })
            // 批准时意见数量
            this.questionType[`approve_${item.typename}`] = 0
            approveAyy.push({
              title: item.typename,
              dataIndex: `approve_${item.typename}`,
              width: '3%',
            })
          })
        }
        else {
          typeArr = reviewArr = auditArr = approveAyy = [...initQuestionData]
        }
        // #27276-复核审批意见统计的完善，增加复核人员、审核人员、批准人员
        const opinions = [
          {
            title: '错误严重程度',
            children: typeArr,
          },
          {
            title: '复核时意见数量',
            children: reviewArr,
          },
          {
            title: '审核时意见数量',
            children: auditArr,
          },
          {
            title: '批准时意见数量',
            children: approveAyy,
          },
        ]

        this.columns = [...initColumns, ...opinions, ...initOpr]
      })
    },
    formatQuery() {
      const { page, size } = this
      const query = { page, size, ...this.formState }

      if (query.consignDate && query.consignDate.length === 2) {
        query.timeBegin = query.consignDate[0]
        query.timeEnd = query.consignDate[1]
      }
      else {
        query.timeBegin = query.timeEnd = ''
      }
      delete query.consignDate
      return query
    },
    getData() {
      this.spinning = true
      const query = this.formatQuery()
      window.$oAjax({
        url: window.$oApi.reportQuestionStat.list,
        method: 'POST',
        params: {
          ...query,
          ...this.sortParams,
        },
      }).then((res) => {
        this.spinning = false
        const severity = {
          1: 'review_',
          2: 'audit_',
          3: 'approve_',
        }
        if (res.code === 20000 && res.data && res.data.count >= 0) {
          // 不能删除 这两行this.data
          this.data = res.data.rows || []
          this.data = this.data.map((item, index) => {
            if (item.questionCount) {
              const defects = [...item.defects]

              // 初始化错误数量
              const def = {}
              // eslint-disable-next-line array-callback-return
              this.types.map((type) => {
                def[type] = 0
              })

              // eslint-disable-next-line array-callback-return
              defects.map((item) => {
                if (
                  def[item.severity] !== undefined
                  && def[item.severity] !== 'undefined'
                  && def[item.severity] !== null
                  && def[item.severity] !== 'null'
                ) {
                  def[item.severity]
                    = Number.parseInt(def[item.severity]) + Number.parseInt(item.questionCount)
                }
                const defect = severity[item.sourceModule] + item.severity
                this.data[index][defect] = item.questionCount
              })

              for (const d in def) {
                this.data[index][d] = def[d]
              }
            }
            return {
              ...this.questionType,
              ...item,
            }
          })
          this.pagination.total = res.data.count
          this.pagination.current = query.page
          this.pagination.pageSize = query.size
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    itemRowsData(item, index) {
      window.$oAjax({
        url: window.$oApi.reportQuestionStat.listItemQuestion,
        method: 'POST',
        params: {
          reportId: item.id,
        },
      }).then((res) => {
        if (res.code === 20000 && Array.isArray(res.data)) {
          // eslint-disable-next-line array-callback-return
          res.data.map((item) => {
            this.data[index][item.severity] = item.questionCount
          })
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    search() {
      this.page = 1
      const consignDate = this.formState.consignDate || []
      if (consignDate.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一个日期'))
        return
      }
      this.getData()
    },
    reset() {
      this.formState = {
        consignDate: [this.startDate, dayjs(new Date()).format('YYYY-MM-DD')],
        haveQuestion: true,
      }
      this.orgData = []
      this.page = 1
      this.getData()
    },
    // 部门
    setOrg() {
      this.$refs.AddOrg.showModal('radio', 'depart', this.orgData)
    },
    getOrg(ids, orgData) {
      this.orgData = orgData
      this.formState.depart = orgData[0].name
      this.formState.departId = orgData[0].id
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        const sorterObj = { ascend: 'ASC', descend: 'DESC' }
        this.sortParams = {
          order: sorterObj[sorter.order],
          orderBy: sorter.field,
        }
        this.getData()
      }
      else {
        this.sortParams = {}
      }
    },
    viewDetail(record) {
      let url = ''
      // const type = record.reportType
      // if (type === 'formal' || type === 'temporary') {
      //   let testTaskArr = record.testTaskId.split(',');
      //   url = '/testTaskController.do?goTestTaskDetail&id=';
      //   testTaskArr.map(item=>{
      //     window.open(`${rootUrl}${url}${item}`);
      //   })
      // } else if (type === 'synthesis' || type === 'synthesis_Temp') {
      //   //标记当前报告为综合报告
      //   url = '/reportCreateController.do?goEditPage&detail=detailPage&reportId=';
      //   window.open(`${rootUrl}${url}${record.id}`);
      // }
      url = '/reportCreateController.do?goEditPage&detail=detailPage&reportId='
      window.open(`${rootUrl}${url}${record.id}`)
    },
    // 导出excel
    exportExcel() {
      const consignDate = this.formState.consignDate || []
      if (consignDate.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一个日期'))
        return
      }

      this.exportData()
    },
    exportData() {
      window.$oAjax({
        url: window.$oApi.reportQuestionStat.export,
        method: 'POST',
        params: {
          ...this.formatQuery(),
          ...this.sortParams,
        },
        responseType: 'blob',
      }).then((res) => {
        if (res) {
          const blob = new Blob([res], { type: 'application/ms-excel' })
          const fileName = '复核审批意见统计.xlsx'
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName)
          }
          else {
            const link = document.createElement('a')
            const event = new Event('click', {
              bubbles: false,
              cancelable: false,
            })
            link.dispatchEvent(event)
            link.href = URL.createObjectURL(blob)
            link.download = fileName
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            window.URL.revokeObjectURL(link.href)
          }
        }
        if (res && res.code && res.code !== 20000) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>
