<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-tabs :active-key="tabIndex" @change="onTab">
      <a-tab-pane :key="1" tab="入库记录"></a-tab-pane>
      <a-tab-pane :key="2" tab="出库记录"></a-tab-pane>
      <!-- <a-tab-pane :key="2" tab="处理中"></a-tab-pane> -->
      <!-- <a-tab-pane :key="1" tab="已处理"></a-tab-pane> -->
    </a-tabs>

    <div>
      <a-input
        v-model:value="quickQry"
        :placeholder="`请输入试件编号/样品编号/制件人/${
          tabIndex === 1 ? '入库人' : '领件人'
        }后回车即可查询`"
        style="width: 420px"
        @keyup.enter="handleSearch()"
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
    <div class="my-2">
      <a-button type="primary" @click="addInOut('QRcode')">
        {{ tabIndex === 1 ? '入库' : '出库' }}登记
      </a-button>
      <!-- <a-button class="toolBtn-bar" @click="addInOut('ByRFIDs')" >扫描RFID{{tabIndex===1?'入库':'出库'}}</a-button> -->
      <a-button class="toolBtn-bar" @click="exportBill">
        导出台账
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      :loading="loading"
      bordered
      row-key="index"
      :row-class-name="rowClassName"
      @change="tableChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'consignStatus'">
          <span>
            <span :style="`color:${record.color}`">{{ text }}</span>
          </span>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a-button
            type="link"
            primary
            @click="handleEdit(record)"
          >
            编辑
          </a-button>
        </template>
      </template>
    </a-table>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
      :auto-close="false"
      widths="760px"
    />

    <StorageIn ref="StorageIn" @success-ok="getData" />
    <StorageOut ref="StorageOut" @success-ok="getData" />
    <Edit ref="Edit" @success-ok="getData" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'

import Edit from './components/edit.vue'
import StorageIn from './components/storageIn.vue'
import StorageOut from './components/storageOut.vue'

const columnsInt = [
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
    width: '10%',
  },
  {
    title: '龄期(天)',
    dataIndex: 'periodDays',
    width: '8%',
  },
  {
    title: '制样日期',
    dataIndex: 'formingDate',
    width: '10%',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: '到期日期',
    dataIndex: 'planTestTime',
    width: '10%',
    sorter: true,
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: '入库日期',
    dataIndex: 'operationDate',
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '制件人',
    dataIndex: 'producer',
    width: '8%',
  },
  {
    title: '入库人',
    dataIndex: 'operator',
    width: '8%',
  },
  {
    title: '存放地点',
    dataIndex: 'saveSite',
    width: '8%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: '8%',
  },
  // {
  //   title: "标养室",
  //   dataIndex: "byLab",
  //   width: "8%",
  // }
]
const columnsOut = [
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
    width: '10%',
  },
  // {
  //   title: "规格型号",
  //   dataIndex: "standard",
  //   width: "10%",
  // },
  {
    title: '龄期（天）',
    dataIndex: 'periodDays',
    width: '10%',
  },
  {
    title: '制样日期',
    dataIndex: 'formingDate',
    width: '10%',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  // {
  //   title: "试样数量",
  //   dataIndex: "sampleNum",
  //   width: "10%",
  // },
  {
    title: '预计试验时间',
    dataIndex: 'planTestTime',
    sorter: true,
    width: '10%',
    customRender: ({ text: time }) =>
      time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: '出库时间',
    dataIndex: 'operationDate',
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '出库龄期状态',
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
    title: '领件人',
    dataIndex: 'operator',
    width: '10%',
  },
]

const queryConfig = [
  {
    type: 'rangePicker',
    field: 'formingDate',
    title: '制样时间',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'operationDate',
    title: '入库时间',
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
    expend: {},
  },
]

export default {
  components: {
    SeniorShowSpan,
    SeniorQuery,
    StorageIn,
    StorageOut,
    Edit,
  },
  data() {
    return {
      dayjs,
      tabIndex: 1,
      data: [],
      columns: [],
      page: 1,
      size: 10,
      loading: false,
      quickQry: '',
      queryConfig,
      sorterConfig: {}, // 排序配置{sort: '', order: ''}
      conditionData: [],
      saveSiteData: [
        {
          type: 'autoComplete',
          field: 'saveSite',
          title: '存放位置',
          options: [],
          default: '',
          col: '24',
          expend: { hide: '' },
        },
        {
          type: 'rangePicker',
          field: 'planTestTime',
          title: '到期时间',
          options: [],
          default: '',
          col: '24',
          expend: {},
        },
      ],
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
  created() {
    this.getData()
    // this.getCategory();
    this.getCategory()
  },
  methods: {
    // 编辑入库信息
    handleEdit(record) {
      this.$refs.Edit.showModal(record)
    },
    exportBill() {
      const { page, size } = this
      this.loading = true
      const params = {
        page,
        size,
        quickQry: this.quickQry,
        ...this.queryParams,
        inOut: this.tabIndex,
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

      const a = document.createElement('a')
      let href
        = this.tabIndex === 1
          ? `/ilis2/rest/periodStorage/exportInExcel`
          : `/ilis2/rest/periodStorage/exportOutExcel`
      // eslint-disable-next-line array-callback-return
      Object.keys(params).map((item, index) => {
        if (params[item]) {
          if (index == 0) {
            href += `?${item}=${params[item]}`
          }
          else {
            href += `&${item}=${params[item]}`
          }
        }
      })

      a.href = href
      a.click()
      this.loading = false
    },
    // 获取样品名称
    getCategory() {
      window.$oAjax
        .post(
          'systemController.do?typeGrid&typegroupid=99064352841138377&field=id,typename,typecode,sourceFrom',
        )
        .then((res) => {
          if (res.rows && Array.isArray(res.rows)) {
            this.saveSiteData[0].options = res.rows.map(
              item => item.typename,
            )
          }
        })
    },
    onTab(index) {
      this.quickQry = ''
      this.conditionData = []
      this.queryParams = {}
      this.tabIndex = index
      this.page = 1
      this.getData()
    },
    addInOut(type) {
      this.tabIndex === 1
        ? this.$refs.StorageIn.showModal(type)
        : this.$refs.StorageOut.showModal(type)
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const indexDate = this.queryConfig.findIndex(
        item => item.field === 'operationDate',
      )
      if (this.tabIndex === 1) {
        this.queryConfig = [...queryConfig, ...this.saveSiteData]
      }
      else {
        this.queryConfig = [...queryConfig]
      }
      this.queryConfig[indexDate].title
        = this.tabIndex === 1 ? '入库时间' : '出库时间'
      const params = { ...this.queryParams }

      if (params.formingDateStart) {
        params.formingDate = [
          formatTime(params.formingDateStart, 'YYYY-MM-DD'),
          formatTime(params.formingDateEnd, 'YYYY-MM-DD'),
        ]
        delete params.formingDateStart
        delete params.formingDateStart
      }
      if (params.operationDateStart) {
        params.operationDate = [
          formatTime(params.operationDateStart, 'YYYY-MM-DD'),
          formatTime(params.operationDateEnd, 'YYYY-MM-DD'),
        ]
        delete params.operationDateStart
        delete params.operationDateEnd
      }
      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      const _params = { ...params }
      if (_params.formingDate && _params.formingDate.length > 0) {
        _params.formingDateStart
          = `${formatTime(_params.formingDate[0], 'YYYY-MM-DD')} 00:00:00`
        _params.formingDateEnd
          = `${formatTime(_params.formingDate[1], 'YYYY-MM-DD')} 23:59:59`
      }

      if (_params.operationDate && _params.operationDate.length > 0) {
        _params.operationDateStart
          = `${formatTime(_params.operationDate[0], 'YYYY-MM-DD')} 00:00:00`
        _params.operationDateEnd
          = `${formatTime(_params.operationDate[1], 'YYYY-MM-DD')} 23:59:59`
      }

      if (_params.planTestTime && _params.planTestTime.length > 0) {
        _params.planTestDateStart
          = `${formatTime(_params.planTestTime[0], 'YYYY-MM-DD')} 00:00:00`
        _params.planTestDateEnd
          = `${formatTime(_params.planTestTime[1], 'YYYY-MM-DD')} 23:59:59`
      }

      delete _params.formingDate
      delete _params.operationDate
      delete _params.planTestTime
      // this.quickQry = ''
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
      if (field === 'formingDate') {
        delete this.queryParams.formingDateStart
        delete this.queryParams.formingDateEnd
      }

      if (field === 'operationDate') {
        delete this.queryParams.operationDateStart
        delete this.queryParams.operationDateEnd
      }

      if (field === 'planTestTime') {
        delete this.queryParams.planTestDateStart
        delete this.queryParams.planTestDateEnd
      }

      if (field) {
        delete this.queryParams[field]
      }

      if (isShow) {
        this.isShow = false
        this.conditionData = []
      }
      else {
        this.conditionData = this.conditionData.filter(i => i.field !== field)
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
      this.getData()
    },
    tableChange(pagination, filters, sorter) {
      if (sorter.field) {
        if (sorter.order) {
          this.sorterConfig = {
            orderBy: sorter.field,
            order: sorter.order === 'descend' ? 'desc' : 'asc',
          }
        }
        else {
          this.sorterConfig = {}
        }
        this.getData()
      }
    },
    getData() {
      const { page, size } = this
      this.loading = true
      const params = {
        page,
        size,
        quickQry: this.quickQry,
        ...this.queryParams,
        ...this.sorterConfig,
        inOut: this.tabIndex,
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

      window.$oAjax.get(window.$oApi.storageList.list, { params }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data.rows.map((item, index) => {
            return {
              ...item,
              ...this.timeShowHtml(item),
              index,
            }
          })

          if (this.tabIndex === 1) {
            this.columns = columnsInt
          }
          else {
            this.columns = columnsOut
          }
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
    timeShowHtml(record) {
      const isTested = record.isTested
      const obj = {
        consignStatus: '已完成',
        color: '#ACACAC',
      }
      // 0 1-3 3 3+ 已完成

      if (isTested === '1') {
        obj.consignStatus = '已完成'
      }
      else {
        const end = record.planTestTime
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
        else if (day >= 0 && day <= 1) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#1890FF'
        }
        else if (day > 1 && day <= 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#F59D29'
        }
        else if (day > 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#74B80A'
        }
      }
      return obj
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
