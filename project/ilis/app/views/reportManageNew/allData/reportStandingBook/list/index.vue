<template>
  <div class="disqualification">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="disqualification-search">
          <div>
            <a-input
              v-model:value="queryCode"
              placeholder="输入委托单位/工程项目/样品名称后回车即可查询"
              class="disqualification-search-all"
              @press-enter="search"
            />
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button @click="switchSearch">
              高级查询
            </a-button>
          </div>
          <div style="padding-top: 10px">
            <a-button @click="viewDetail">
              查看检测详情
            </a-button>
            <a-button @click="filterTable">
              列筛选
            </a-button>
            <a-button :loading="exportLoading" @click="exportFile">
              导出
            </a-button>
            <a-button @click="print">
              打印
            </a-button>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap mb-4">
          <a-tag
            v-for="item in queryTag"
            :key="item.key"
            closable
            @close="onCloseTag(item)"
          >
            {{ item.label }}：{{ item.value }}
          </a-tag>
        </div>

        <a-table
          :row-selection="rowSelection"
          :custom-row="customRow"
          :columns="columns"
          :data-source="data"
          bordered
          :scroll="scroll"
          :pagination="data.length > 0 ? pagination : false"
          row-key="index"
          @change="sorterChange"
        >
          <template #bodyCell="{ column, text }">
            <template
              v-if="[
                'departName',
                'verdict',
                'projectName',
                'paramNames',
                'disqualificationParam',
              ].includes(column.dataIndex)"
            >
              <div
                :title="text"
                style="
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                line-clamp: 2;
                box-orient: vertical;
              "
              >
                {{ text }}
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <ht-modal v-model:open="visible" title="选择展示的列" @ok="changeRow">
      <a-row>
        <a-col v-for="item in fields" :key="item.field" span="12">
          <a-checkbox v-model:checked="item.value">
            {{ item.name }}
          </a-checkbox>
        </a-col>
      </a-row>
    </ht-modal>
    <ht-modal
      width="45%"
      :open="advancedQueryVisible"
      title="高级查询"
      :closable="false"
      :mask-closable="false"
      @ok="advancedQueryOk"
      @cancel="advancedQueryCancel"
    >
      <AdvancedQuery2 ref="advancedQuery" :default-test-date="defaultTestDate" />
      <template #footer>
        <div class="modal-footer">
          <a-button type="primary" @click="advancedQueryOk">
            确定
          </a-button>
          <a-button type="default" @click="advancedQueryRefresh">
            刷新
          </a-button>
          <a-button type="default" @click="advancedQueryCancel">
            取消
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import AdvancedQuery2 from './components/AdvancedQuery.vue'

export default {
  components: {
    AdvancedQuery2,
  },
  data() {
    return {
      rootUrl,
      advancedQueryVisible: false,
      data: [],
      queryCode: '',
      defaultTestDate: [],
      dateFormat: 'YYYY-MM-DD',

      labelCol: { span: 3 },
      wrapperCol: { span: 10 },
      spinning: false,
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
      query: {},
      fields: localStorage.getItem('reportStandingBook')
        ? JSON.parse(localStorage.getItem('reportStandingBook'))
        : [
            { name: '委托单位', value: true, field: 'unitName' },
            {
              name: '工程项目',
              value: true,
              field: 'projectName',
              scopedSlots: { customRender: 'projectName' },
            },
            { name: '检测类别', value: true, field: 'checkTypeName' },
            { name: '编号类别', value: true, field: 'snName' },
            { name: '数据来源', value: true, field: 'consignType' },
            { name: '报告类型', value: true, field: 'reportType' },
            {
              name: '委托编号',
              value: true,
              field: 'consignCode',
            },
            {
              name: '样品编号',
              value: true,
              field: 'testObjectCode',
            },
            {
              name: '记录编号',
              value: true,
              field: 'recordCode',
            },
            { name: '报告编号', value: true, field: 'reportNum' },
            {
              name: '委托日期',
              value: true,
              field: 'consignDate',
            },
            { name: '检测日期', value: true, field: 'testDate' },
            { name: '报告日期', value: true, field: 'signDate' },
            { name: '生产厂家', value: true, field: 'sampleManufactures' },
            { name: '样品名称', value: true, field: 'objectName' },
            { name: '规格型号', value: true, field: 'standard' },
            { name: '工程部位/用途', value: true, field: 'partAndUse' },
            {
              name: '检测参数',
              value: true,
              field: 'paramNames',
              scopedSlots: { customRender: 'paramNames' },
            },
            {
              name: '检测科室',
              value: true,
              field: 'departName',
              scopedSlots: { customRender: 'departName' },
            },
            {
              name: '设备名称/编号',
              value: true,
              field: 'equipmentNameAndCode',
            },
            { name: '报告负责人', value: true, field: 'dutyNames' },
            { name: '检测人员', value: true, field: 'testNames' },
            { name: '复核人员', value: true, field: 'recheckNames' },
            { name: '审核人员', value: true, field: 'auditNames' },
            { name: '批准人员', value: true, field: 'approveNames' },
            { name: '点数/次数', value: true, field: 'paramsPoint' },
            { name: '样品组数', value: true, field: 'sampleAmount' },
            {
              name: '检测结果',
              value: true,
              field: 'disqualificationParam',
              scopedSlots: { customRender: 'disqualificationParam' },
            },
            {
              name: '检验结论',
              value: true,
              field: 'verdict',
              scopedSlots: { customRender: 'verdict' },
            },
            { name: '备注', value: true, field: 'verdictRemark' },
          ],
      columns: [],
      scroll: { x: 4000, y: document.body.clientHeight - 220 },
      selectedRowKeys: [],
      selectedRows: [],
      sortParams: null,
      exportLoading: false,
      queryTag: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.index]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
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
    this.getData()
  },
  methods: {
    initTestDate() {
      this.defaultTestDate = [dayjs().subtract(3, 'month').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
      this.query.signDateStart = this.defaultTestDate[0]
      this.query.signDateEnd = this.defaultTestDate[1]

      this.queryTag = [
        { label: '报告日期', key: 'signDateStart', value: `${this.query.signDateStart} ~ ${this.query.signDateEnd}` },
      ]
    },
    async getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.spinning = true
      try {
        const res = await window.$oAjax.get(window.$oApi.reportStandingBook.list, {
          methed: 'GET',
          timeout: 30 * 1000,
          params: {
            page,
            size,
            ...query,
            ...this.sortParams,
          },
          headers: {
            paramsIsTrim: true,
          },
        })
        if (res.code === 20000) {
          const columns = this.fields.filter(item => item.value)
          const width = `${100 / columns.length}%`
          this.columns = columns.map((item, ind) => ({
            fixed: ind === 0 ? 'left' : undefined,
            title: item.name,
            dataIndex: item.field,
            sorter: item.sorter,
            scopedSlots: item.scopedSlots,
            width: ind === 0 ? 180 : width,
          }))

          const clientWidth = document.body.clientWidth
          if (clientWidth - 50 - columns.length * 200 > 0) {
            this.scroll.x = undefined
            if (this.columns[0]) {
              this.columns[0].fixed = undefined
              this.columns[0].width = undefined
            }
          }
          else {
            this.scroll.x = columns.length * 200
          }

          this.data = res.data.rows.map((item, index) => ({
            ...item,
            index,
          }))
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.selectedRows = []
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
      this.spinning = false
    },
    // 排序
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        const sorterObj = { ascend: 'asc', descend: 'desc' }
        this.sortParams = {
          order: sorterObj[sorter.order],
          sort: sorter.field,
        }
      }
      else {
        this.sortParams = {}
      }
      this.getData()
    },
    // 搜索
    search(e) {
      e.preventDefault()
      this.query = { queryCode: this.queryCode.trim() }
      this.getData(true)
    },

    /**
     * 切换高级查询
     */
    switchSearch() {
      this.advancedQueryVisible = true
    },

    /**
     * 高级查询确定按键
     */
    advancedQueryOk() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.queryCode = ''
      const value = _this.$refs.advancedQuery.getFormState()

      const data = { ...value }

      if (data.consignDate && data.consignDate.length > 0) {
        const consignDate = data.consignDate
        data.consignDateStart = consignDate[0]
        data.consignDateEnd = consignDate[1]
        delete data.consignDate
      }
      if (data.testDate && data.testDate.length) {
        const testDate = data.testDate
        data.testDateStart = testDate[0]
        data.testDateEnd = testDate[1]
        delete data.testDate
      }
      if (data.signDate && data.signDate.length > 0) {
        const signDate = data.signDate
        data.signDateStart = signDate[0]
        data.signDateEnd = signDate[1]
        delete data.signDate
      }
      _this.query = data
      _this.queryTag = _this.createQueryTag(data)
      _this.getData(true)
      _this.advancedQueryVisible = false
    },
    onCloseTag(item) {
      this.queryTag = this.queryTag.filter(i => i.key !== item.key)
      delete this.query[item.key]
      if (this.$refs.advancedQuery) {
        delete this.$refs.advancedQuery.formState[item.key]
      }

      if (item.key === 'consignDateStart') {
        delete this.query.consignDateStart
        delete this.query.consignDateEnd

        if (this.$refs.advancedQuery) {
          delete this.$refs.advancedQuery.formState.consignDate
        }
      }

      if (item.key === 'testDateStart') {
        delete this.query.testDateStart
        delete this.query.testDateEnd

        if (this.$refs.advancedQuery) {
          delete this.$refs.advancedQuery.formState.testDate
        }
      }

      if (item.key === 'signDateStart') {
        delete this.query.signDateStart
        delete this.query.signDateEnd

        if (this.$refs.advancedQuery) {
          delete this.$refs.advancedQuery.formState.signDate
        }
      }

      this.getData()
    },
    createQueryTag(data) {
      const key2Names = {
        consignSn: '委托编号',
        objectSn: '样品编号',
        taskSn: '任务编号',
        recordSn: '记录编号',
        reportSn: '报告编号',
        unitName: '委托单位',
        projectName: '工程项目',
        checkTypeName: '检测类别',
        snName: '编号类别',
        consignType: '数据来源',
        reportType: '报告类型',
        consignDateStart: '委托日期',
        testDateStart: '检测日期',
        signDateStart: '报告日期',
        objectName: '样品名称',
        departName: '检测科室',
        dutyNames: '报告负责人',
        testNames: '检测人员',
      }

      const tags = []

      for (const key in data) {
        let val = data[key]
        const label = key2Names[key]

        if (
          val === null
          || val === undefined
          || val === ''
          || (Array.isArray(val) && !val.length)
        ) {
          continue
        }

        if (['testDateEnd', 'consignDateEnd', 'signDateEnd'].includes(key)) {
          continue
        }

        if (['testDateStart'].includes(key)) {
          val = `${data.testDateStart} ~ ${data.testDateEnd}`
        }

        if (['consignDateStart'].includes(key)) {
          val = `${data.consignDateStart} ~ ${data.consignDateEnd}`
        }

        if (['signDateStart'].includes(key)) {
          val = `${data.signDateStart} ~ ${data.signDateEnd}`
        }

        tags.push({
          key,
          label,
          value: val,
        })
      }

      return tags
    },
    /**
     * 高级查询取消
     */
    advancedQueryCancel() {
      this.advancedQueryVisible = false
    },
    /**
     *  高级查询刷新
     */
    advancedQueryRefresh() {
      this.defaultTestDate = []
      this.$refs.advancedQuery.resetFormState()
      this.query = {}
      this.queryTag = []
      this.getData(true)
    },
    // 导出
    async exportFile() {
      const exportColumn = {}
      const column = this.fields.filter(item => item.value)
      column.forEach((item) => {
        exportColumn[item.field] = item.name
      })

      this.exportLoading = true
      const res = await window.$oAjax(window.$oApi.reportStandingBook.export, {
        method: 'get',
        responseType: 'blob',
        params: {
          ...this.query,
          page: this.page,
          size: this.size,
          pager: false,
          exportColumn: JSON.stringify(exportColumn),
        },
      })
      this.exportLoading = false
      const blob = new Blob([res])
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = function (e) {
        const a = document.createElement('a')
        a.download = '检测报告台账列表.xlsx'
        a.href = e.target.result
        a.click()
      }
    },
    changeRow() {
      localStorage.setItem('reportStandingBook', JSON.stringify(this.fields))
      this.page = 1
      this.getData()
      this.visible = false
    },
    // 列筛选
    filterTable() {
      this.visible = true
    },
    // 查看检测详情
    viewDetail() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }
      // 【数据来源】
      // 创建委托，创建综合任务，创建报告；前2个为委托的数据来源，最后一个为编制报告；
      let url = '/testTaskController.do?goTestTaskDetail&id='
      let ids = this.selectedRows[0].taskId
      if (!ids) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('当前报告没有检测任务，无法查看检测详情'),
        )
        return
      }
      if (this.selectedRows[0].consignType === '创建报告') {
        url
          = '//reportCreateController.do?goEditPage&detail=detailPage&reportId='
        ids = this.selectedRows[0].reportId
      }
      window.open(`${rootUrl}${url}${ids}`)
    },
    // 打印
    print() {
      let query = this.query
      if (!this.allSearch) {
        query = { queryCode: this.queryCode.trim() }
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('ReportStandingBook', query)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.disqualification {
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 6px 8px;
  }
}
</style>
