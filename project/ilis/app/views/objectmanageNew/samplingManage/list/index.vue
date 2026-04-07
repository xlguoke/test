<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="samplingManage">
    <a-tabs :active-key="tabIndex" @change="onTab">
      <a-tab-pane :key="3" tab="全部" />
      <a-tab-pane :key="0" tab="待处理" />
      <a-tab-pane :key="2" tab="处理中" />
      <a-tab-pane :key="1" tab="已处理" />
    </a-tabs>

    <a-form layout="inline">
      <a-form-item>
        <a-input
          v-model:value="search"
          placeholder="请输入委托编号/样品名称/取样编号后回车即可查询"
          style="width: 420px"
          @keyup.enter="handleSearch()"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" class="toolBtn-bar" @click="handleSearch()">
          查询
        </a-button>
        <a-button class="toolBtn-bar" @click="handleReset">
          重置
        </a-button>
        <a-button class="toolBtn-bar" @click="seniorQueryFun">
          高级查询
        </a-button>
      </a-form-item>
    </a-form>
    <SeniorShowSpan
      v-if="conditionData.length > 0"
      ref="SeniorShowSpan"
      :show-data="conditionData"
      :callback="closeCondition"
    />
    <div style="margin-top: 15px">
      <a-button type="primary" @click="addSample()">
        新增样品
      </a-button>
      <a-button @click="handleExport">
        导出台账
      </a-button>
      <a-button v-if="printAuth" @click="printFun">
        打印
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      :loading="loading"
      :row-selection="rowSelection"
      bordered
      row-key="testObjectId"
      :row-class-name="rowClassName"
      :scroll="{ x: 2000 }"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'consignStatus'">
          <span>
            <span v-if="text === '待处理'" style="color: #7f7f7f">
              <span
                style="
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #7f7f7f;
                  display: inline-block;
                  vertical-align: middle;
                "
              />
              {{ text }}
            </span>
            <span v-else-if="text === '处理中'" style="color: #f59a23">
              <span
                style="
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #f59a23;
                  display: inline-block;
                  vertical-align: middle;
                "
              />
              {{ text }}
            </span>
            <span v-else-if="text === '已处理'" style="color: #1890ff">
              <span
                style="
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #1890ff;
                  display: inline-block;
                  vertical-align: middle;
                "
              />
              {{ text }}
            </span>
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="table-handle">
            <template v-if="!record.handled">
              <a href="javascript:" @click.stop="editConsign(record)">编辑</a>
              <a href="javascript:" @click.stop="createConsign(record)">新建委托</a>
            </template>
            <a v-else href="javascript:" @click.stop="checkInfo(record)">查看</a>
            <a
              v-if="record.statusStr === '已处理' && record.examUrl"
              href="javascript:"
              @click="openHitekUdrTool(record.examUrl)"
            >查看试验</a>
          </div>
        </template>
      </template>
    </a-table>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      :auto-close="false"
    />

    <Sample ref="Sample" @success-ok="getData" />
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import openHitekUdrTool from '~/providers/libs/openHitekUdrTool'
import { useIndustryStore } from '~/store/industryStore.js'
import Sample from './components/editSample.vue'

const columns = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    width: 150,
  },
  {
    title: '样品类型',
    dataIndex: 'categoryName',
    width: 150,
  },
  {
    title: '取样编号',
    dataIndex: 'extractSampleCode',
    width: 150,
  },
  {
    title: '取样标段',
    dataIndex: 'contractPartName',
    width: 150,
  },
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: 150,
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: 150,
  },
  {
    title: '规格',
    dataIndex: 'standard',
    width: 150,
  },
  {
    title: '检测参数',
    dataIndex: 'paramNames',
  },
  {
    title: '取样人',
    dataIndex: 'createName',
    width: 150,
  },
  {
    title: '取样日期',
    dataIndex: 'extractedDateStr',
    width: 150,
  },
  {
    title: '委托状态',
    dataIndex: 'statusStr',
    width: 150,
    scopedSlots: { customRender: 'consignStatus' },
  },
  {
    title: '操作人',
    dataIndex: 'updateName',
    width: 150,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 150,
    fixed: 'right',
    scopedSlots: { customRender: 'operation' },
  },
]

const queryConfig = [
  {
    type: 'select',
    field: 'categoryId',
    title: '样品类型',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'person',
    title: '取样人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'stamp',
    title: '登记时间',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    Sample,
    SeniorShowSpan,
    SeniorQuery,
  },
  data() {
    return {
      industryStore: useIndustryStore(),
      printAuth: false,
      openHitekUdrTool,
      tabIndex: 3,
      data: [],
      columns,
      page: 1,
      size: 10,
      loading: false,
      search: '',
      queryConfig,
      conditionData: [],
      selectedRowKeys: [],
      queryHistory: {}, // 查询历史-最后一次搜索生效的条件
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
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  created() {
    this.getData()
    this.getCategory()
    this.getUserFunction()
  },
  mounted() {
    window.getData = this.getData
  },
  methods: {
    getUserFunction() {
      window.$oAjax({
        url: 'rest/functionController.do?getUserFunctionByCode',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        data: qs.stringify({
          functionCode: 'printSamlping',
        }),
      }).then((res) => {
        const st = res.obj.map((it) => {
          return it.functioncode
        })
        this.printAuth = st.includes('printSamlping')
      })
    },

    handleExport() {
      if (this.pagination.total === 0) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const selectedRowIds = this.data
        .filter(it => this.selectedRowKeys.includes(it.testObjectId))
        .map(item => item.id)
      const params = {
        ...this.queryHistory,
        ...(selectedRowIds && selectedRowIds.length
          ? { ids: selectedRowIds.join(',') }
          : {}),
      }

      let href = `/ilis2/rest/extract/export`
      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )
      window.open(href)
    },
    // 打印
    printFun() {
      if (this.selectedRowKeys.length !== 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
        return
      }

      if (top.UdrPrint) {
        const udrPrint = new top.UdrPrint()
        udrPrint.commonPrint(this.selectedRowKeys, 'TripartiteSampleWitness')
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('未找到UdrPrint'))
      }
    },
    // 获取样品类型
    getCategory() {
      window.$oAjax({
        method: 'get',
        url: window.$oApi.samplingManage.getSamplingCategory,
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          const list = res.data || []
          this.queryConfig[0].options = list.map(item => ({
            id: item.id,
            name: item.name,
          }))
        }
      })
    },
    editConsign(record) {
      this.$refs.Sample.showModal(2, record)
    },
    createConsign(record) {
      let url = 'consignController.do?goEdit'
      url += `&extractSampleId=${record.id}`
      url += `&industryId=${this.industryStore.industryId}`

      top.addTabs && top.addTabs({
        id: record.id,
        title: '新增委托',
        close: false,
        url,
      })
    },
    checkInfo(record) {
      this.$refs.Sample.showModal(3, record)
    },
    onTab(index) {
      this.tabIndex = index
      this.page = 1
      this.selectedRowKeys = []
      this.getData()
    },
    addSample() {
      this.$refs.Sample.showModal(1)
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      const _params = { ...params }
      if (_params.stamp && _params.stamp.length > 0) {
        _params.stampBegin = formatTime(_params.stamp[0], 'YYYY-MM-DD')
        _params.stampEnd = formatTime(_params.stamp[1], 'YYYY-MM-DD')
      }

      // this.search = ''
      this.queryParams = { ..._params }
      if (showData.length) {
        this.isShow = true
      }
      else {
        this.isShow = false
      }

      this.conditionData = [...showData].map(item => ({ ...item }))
      this.page = 1

      this.getData()
      this.$refs.SeniorQuery.handleCancel()
    },
    // 高级查询 重置
    resetCall() {
      this.queryParams = {}
      this.conditionData = []
      this.$refs.SeniorQuery.handleCancel()
      this.getData()
    },
    // 删除高级查询,删除查询数据
    async closeCondition(field, isShow) {
      if (field) {
        delete this.queryParams[field]
      }
      if (field === 'stamp') {
        delete this.queryParams.stampBegin
        delete this.queryParams.stampEnd
      }

      if (field) {
        delete this.queryParams[field]
      }

      if (isShow) {
        this.isShow = false
        this.conditionData = []
      }
      this.page = 1
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleReset() {
      this.page = 1
      this.search = ''
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

      const params = {
        page,
        size,
        search: this.search,
        ...this.queryParams,
        handled: this.tabIndex === 3 ? undefined : this.tabIndex,
      }

      let stamp
      if (params.stamp && params.stamp.length > 0) {
        const startDate = new Date(params.stamp[0])
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(params.stamp[1])
        endDate.setHours(23, 59, 59, 999)

        stamp = `${startDate.getTime()},${endDate.getTime()}`
        params.stamp = stamp
      }
      else {
        params.stamp = undefined
      }
      window.$oAjax.get(window.$oApi.samplingManage.getSampleList, { params }).then((res) => {
        if (res.code === 20000) {
          this.queryHistory = params
          this.data = res.data.rows.map((item) => {
            const extractedDateStr = item.extractedDate
              ? formatTime(new Date(item.extractedDate), 'YYYY-MM-DD')
              : ''

            let statusStr = '待处理'
            if (item.handled === true) {
              statusStr = '处理中'

              if (!!item.consignCode || !!item.examUrl) {
                statusStr = '已处理'
              }
            }

            let contractPartName = ''
            try {
              const consignMeta = JSON.parse(item.consignMeta)
              if (consignMeta.perjectInfo) {
                contractPartName = consignMeta.perjectInfo.consignProjectName
              }
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
            catch (e) {}

            return {
              ...item,
              extractedDateStr,
              statusStr,
              contractPartName,
            }
          })

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

<style lang="less" scoped>
@import './index.less';
</style>
