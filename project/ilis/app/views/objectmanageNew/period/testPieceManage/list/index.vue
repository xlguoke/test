<!-- eslint-disable vue/no-unused-vars -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="testPieceManage">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <a-input
            v-model:value="quickQry"
            placeholder="请输入样品编号/试件编号后回车即可查询"
            style="width: 420px"
            @press-enter="handleSearch"
          />
          <a-button type="primary" class="ml-2" @click="handleSearch()">
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
          <a-button @click="seniorQueryFun">
            高级查询
          </a-button>
        </div>
        <SeniorShowSpan
          v-if="conditionData.length > 0"
          ref="SeniorShowSpan"
          :show-data="conditionData"
          :callback="closeCondition"
        />
        <div class="mt-2">
          <a-tag :color="activeKey === 0 ? 'blue' : ''" @click="tabDate(0)">
            今日到期
          </a-tag>
          <a-tag :color="activeKey === 1 ? 'blue' : ''" @click="tabDate(1)">
            3日内到期
          </a-tag>
          <a-tag :color="activeKey === 4 ? 'blue' : ''" @click="tabDate(4)">
            龄期超期
          </a-tag>
          <a-tag :color="activeKey === 3 ? 'blue' : ''" @click="tabDate(3)">
            全部
          </a-tag>
        </div>

        <div class="mt-2">
          <a-button @click="exportLedger">
            导出台账
          </a-button>
        </div>

        <a-table
          class="mt-2"
          :columns="columns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          row-key="id"
          :row-class-name="rowClassName"
          @change="sorterChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'testObjectCode'">
              <a
                href="javascript:;"
                style="color: gray; text-decoration: underline"
                @click.stop="checkSample(record)"
              >{{ text }}</a>
            </template>

            <template v-if="column.dataIndex === 'consignStatus'">
              <span>
                <span :style="`color:${record.color}`">{{ text }}</span>
              </span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a href="javascript:;" @click.stop="checkSample(record)">样品信息</a>
                <a
                  v-if="record.testTaskId"
                  href="javascript:;"
                  @click.stop="checkTest(record)"
                >查看试验</a>
              </span>
            </template>
          </template>
        </a-table>
        <ht-modal
          v-model:open="eqVisible"
          title="查看样品详情"
          width="90%"
          fixed-height
          hide-confirm
          @cancel="cancelModal"
        >
          <iframe
            id="eqVisible"
            style="border: 0"
            width="100%"
            height="100%"
            :src="eqVisibleUrl"
          ></iframe>
        </ht-modal>

        <SeniorQuery
          ref="SeniorQuery"
          :callback="seniorQueryCall"
          :reset-call="resetCall"
          :auto-close="false"
        >
          <template #range="item">
            <a-row>
              <a-col span="11">
                <a-input
                  v-model:value="consignCodeRange.consignCodeRangeStart"
                  placeholder="填写完整的开始编号"
                ></a-input>
              </a-col>
              <a-col span="2" align="center">
                ~
              </a-col>
              <a-col span="11">
                <a-input
                  v-model:value="consignCodeRange.consignCodeRangeEnd"
                  placeholder="填写完整的结束编号"
                ></a-input>
              </a-col>
            </a-row>
          </template>
          <template #range2="item">
            <a-row>
              <a-col span="11">
                <a-input
                  v-model:value="partCodeRange.partCodeRangeStart"
                  placeholder="填写完整的开始编号"
                ></a-input>
              </a-col>
              <a-col span="2" align="center">
                ~
              </a-col>
              <a-col span="11">
                <a-input
                  v-model:value="partCodeRange.partCodeRangeEnd"
                  placeholder="填写完整的结束编号"
                ></a-input>
              </a-col>
            </a-row>
          </template>
        </SeniorQuery>
      </div>
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '试件编号',
    dataIndex: 'periodCode',
    width: '10%',
  },
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    width: '10%',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    sorter: true,
    width: '10%',
    scopedSlots: { customRender: 'testObjectCode' },
  },
  {
    title: '龄期(天)',
    dataIndex: 'periodDays',
    width: '10%',
  },
  {
    title: '制件时间',
    dataIndex: 'formingDate',
    sorter: true,
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '预计试验时间',
    dataIndex: 'planTestTime',
    sorter: true,
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '龄期状态',
    dataIndex: 'consignStatus',
    width: '10%',
    scopedSlots: { customRender: 'consignStatus' },
  },
  {
    title: '制件人',
    dataIndex: 'producer',
    width: '10%',
  },
  {
    title: '是否已检测',
    dataIndex: 'isTested',
    width: '10%',
    customRender: ({ text: time }) => (`${time}` === '1' ? '是' : '否'),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

const queryConfig = [
  {
    type: 'input',
    field: 'sampleName',
    title: '样品名称',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'tested',
    title: '检测状态',
    options: [
      { id: '1', name: '是' },
      { id: '0', name: '否' },
    ],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'producer',
    title: '制件人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'formingDate',
    title: '制件时间',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'planTestDate',
    title: '预计试验时间',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'inputInit',
    field: 'periodDays',
    title: '龄期(天)',
    options: [],
    default: '',
    col: '24',
    expend: { min: 0 },
  },
  {
    type: 'input',
    field: 'sampleSn',
    title: '样品编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'periodCode',
    title: '试件编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
]

export default {
  components: {
    SeniorShowSpan,
    SeniorQuery,
  },
  data() {
    return {
      data: [],
      dayjs,
      columns,
      activeKey: null,
      page: 1,
      size: 10,
      spinning: false,
      quickQry: '',
      queryConfig,
      conditionData: [],
      queryParams: {},
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
      consignCodeRange: {
        consignCodeRangeStart: '',
        consignCodeRangeEnd: '',
      },
      partCodeRange: {
        partCodeRangeStart: '',
        partCodeRangeEnd: '',
      },
      importUrl: `${rootUrl}${window.$oApi.test}`,
      eqVisible: false,
      oldeqVisibleUrl: `${rootUrl}/consignController.do?goEdit&status=20&detail=detailPage&model=testPieceManage&id=`,
      eqVisibleUrl: '',
      periodDays: '',
    }
  },
  created() {
    const t = getQueryVariable('initSearchType')

    if (!t.length) {
      this.getData()
    }

    switch (t) {
      case '1': // 龄期超期
        this.tabDate(4)
        break
      case '2': // 龄期到期
        this.tabDate(0)
        break
      case '3': // 龄期即将到期
        this.tabDate(1)
        break
    }
  },
  methods: {
    // 导出台账
    exportLedger() {
      if (!this.data.length) {
        window.$oAntdModal.warning(window.$oMsgTips.info('当前无可导出台账'))
        return
      }
      const params = {
        quickQry: this.quickQry,
        ...this.queryParams,
      }
      delete params.formingDate
      delete params.planTestDate
      window.location.href = `/ilis2/rest/periodController/export?${qs.stringify(
        params,
      )}`
    },
    cancelModal() {
      this.eqVisible = false
    },
    // 样品信息
    checkSample(record) {
      if (!record.consignInfoId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('委托尚未创建, 不能查看样品信息'))
        return
      }
      this.eqVisibleUrl = this.oldeqVisibleUrl + record.consignInfoId
      this.eqVisible = true
    },
    // 查看试验
    checkTest(record) {
      // alert("查看试验");

      const url = `/testTaskController.do?goTestTaskDetail&id=${record.testTaskId}`
      // let url = "/testTaskController.do?goTestTaskDetail&id=";
      window.open(`${rootUrl}${url}`)
    },
    timeShowHtml(record) {
      const isTested = record.isTested

      const obj = {
        consignStatus: '',
        color: '',
      }
      // 0 1-3 3 3+ 已完成

      if (isTested === '1') {
        obj.consignStatus = '已完成'
        obj.color = '#ACACAC'
      }
      else {
        const end = dayjs(record.planTestTime).hour(23).minute(59).second(59).valueOf()
        const start = new Date().getTime()
        const utc = end - start
        const day = Math.floor(utc / (24 * 60 * 60 * 1000)) // 天
        const H = Math.floor(utc / (60 * 60 * 1000) - 24 * day) // 小时
        // eslint-disable-next-line unused-imports/no-unused-vars
        const M = utc / (60 * 1000) // 分

        if (day < 0) {
          obj.consignStatus = '已超期'
          obj.color = '#DA0722'
        }
        else if (day >= 0 && day < 1) {
          obj.consignStatus = `${day === 0 ? '' : `${d}天`}${H}小时后过期`
          obj.color = '#1890FF'
        }
        else if (day >= 1 && day < 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#F59D29'
        }
        else if (day >= 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#74B80A'
        }
      }
      return obj
    },
    tabDate(index) {
      this.spinning = true
      this.activeKey = index
      this.page = 1
      let planTestDateStart = ''
      let planTestDateEnd = ''
      this.queryParams.overdue = null

      if (this.activeKey === 0) {
        planTestDateStart
          = `${dayjs(new Date()).format('YYYY-MM-DD')} 00:00:00`
        planTestDateEnd = `${dayjs(new Date()).format('YYYY-MM-DD')} 23:59:59`
      }
      else if (this.activeKey === 1) {
        const time = new Date().getTime()
        const resultTimeStr = time + 1000 * 60 * 60 * 24 * 3
        planTestDateStart
          = `${dayjs(new Date()).format('YYYY-MM-DD')} 00:00:00`
        planTestDateEnd
          = `${dayjs(resultTimeStr).format('YYYY-MM-DD')} 23:59:59`
      }
      else if (this.activeKey === 4) {
        this.queryParams.overdue = 1
        planTestDateStart = ''
        planTestDateEnd = ''
      }
      else {
        planTestDateStart = ''
        planTestDateEnd = ''
      }
      this.queryParams.planTestDateStart = planTestDateStart
      this.queryParams.planTestDateEnd = planTestDateEnd
      this.getData()
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }

      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      this.activeKey = 3
      const _params = { ...params }
      if (_params.formingDate && _params.formingDate.length > 0) {
        _params.formingDateStart = formatTime(
          _params.formingDate[0],
          'YYYY-MM-DD',
        )
        _params.formingDateEnd = formatTime(
          _params.formingDate[1],
          'YYYY-MM-DD',
        )
      }

      if (_params.planTestDate && _params.planTestDate.length > 0) {
        _params.planTestDateStart = formatTime(
          _params.planTestDate[0],
          'YYYY-MM-DD',
        )
        _params.planTestDateEnd = formatTime(
          _params.planTestDate[1],
          'YYYY-MM-DD',
        )
      }

      let consignCodeRange
      const { consignCodeRangeStart, consignCodeRangeEnd } = this.consignCodeRange
      if (consignCodeRangeStart && consignCodeRangeEnd) {
        consignCodeRange = `${consignCodeRangeStart},${consignCodeRangeEnd}`
      }
      else if (
        (consignCodeRangeStart && !consignCodeRangeEnd)
        || (!consignCodeRangeStart && consignCodeRangeEnd)
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请填写完整的起始编号'))
        return
      }

      let partCodeRange
      const { partCodeRangeStart, partCodeRangeEnd } = this.partCodeRange
      if (partCodeRangeStart && partCodeRangeEnd) {
        partCodeRange = `${partCodeRangeStart},${partCodeRangeEnd}`
      }
      else if (
        (partCodeRangeStart && !partCodeRangeEnd)
        || (!partCodeRangeStart && partCodeRangeEnd)
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请填写完整的起始编号'))
        return
      }

      this.quickQry = ''
      this.queryParams = { ..._params, consignCodeRange, partCodeRange }
      if (showData.length) {
        this.isShow = true
      }
      else {
        this.isShow = false
      }

      this.conditionData = [...showData].map(item => ({ ...item }))
      if (consignCodeRange) {
        this.conditionData.push({
          field: 'consignCodeRange',
          name: '样品编号范围',
          value: consignCodeRange,
        })
      }

      if (partCodeRange) {
        this.conditionData.push({
          field: 'partCodeRange',
          name: '试件编号范围',
          value: partCodeRange,
        })
      }

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
      if (field === 'formingDate') {
        delete this.queryParams.formingDateStart
        delete this.queryParams.formingDateEnd
      }

      if (field === 'planTestDate') {
        delete this.queryParams.planTestDateStart
        delete this.queryParams.planTestDateEnd
      }

      if (field === 'consignCodeRange') {
        this.consignCodeRange = {
          consignCodeRangeStart: '',
          consignCodeRangeEnd: '',
        }
      }

      if (field === 'partCodeRange') {
        this.partCodeRange = {
          partCodeRangeStart: '',
          partCodeRangeEnd: '',
        }
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
      this.quickQry = ''
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      // this.activeKey = null;
      this.getData()
    },
    getData() {
      const { page, size } = this
      this.spinning = true

      const params = {
        page,
        size,
        quickQry: this.quickQry,
        ...this.queryParams,
      }

      delete params.formingDate
      delete params.planTestDate

      window.$oAjax({
        url: window.$oApi.testPieceManage.list,
        method: 'post',
        params,
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data.rows.map(item => ({
            ...item,
            ...this.timeShowHtml(item),
          }))
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.spinning = false
        }
      })
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        // this.queryParams = {
        //   orderBy: sorter.field,
        //   asc: sorter.order == "ascend" ? true : false,
        // };
        this.queryParams.orderBy = sorter.field
        this.queryParams.order = sorter.order == 'ascend' ? 'asc' : 'desc'
      }
      else {
        // this.queryParams = {};
        this.queryParams.orderBy = undefined
        this.queryParams.order = undefined
      }
      this.getData()
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
:deep(.ant-modal-body) {
  padding: 0;
  height: calc(100% - 90px);
}
:deep(.ant-modal-content) {
  height: 100%;
}
.eqVisibleBox {
  .ant-modal-body {
    padding: 0;
  }
}
</style>
