<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择设备"
      centered
      :force-render="true"
      :mask-closable="false"
      width="80%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-space>
            <a-input
              v-model:value="quickQryParam"
              placeholder="请输入设备名称、编号、规格型号后回车即可查询"
              style="width: 300px"
            />
            <a-button type="primary" @click="handleSearch()">
              查询
            </a-button>
            <a-button class="toolBtn-bar" @click="handleReset">
              重置
            </a-button>
            <a-button class="toolBtn-bar" @click="seniorQueryFun">
              高级查询
            </a-button>
          </a-space>
          <SeniorShowSpan
            v-if="conditionData.length > 0"
            :show-data="conditionData"
            :callback="closeCondition"
          />
          <div style="padding: 10px 0"></div>
          <div class="content-table">
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="data.length > 0 ? pagination : false"
              :data-source="data"
              :loading="loading"
              bordered
              :custom-row="customRow"
              :row-selection="rowSelection"
              row-key="id"
              :row-class-name="rowClassName"
            >
            </a-table>
          </div>
        </div>
      </a-spin>
    </ht-modal>

    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import { getIndustryListByUser } from '~/views/unit-config/industryConfig/api'

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '设备类别',
    dataIndex: 'type',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '检测室',
    dataIndex: 'laboratoryName',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
  },
  {
    title: '购置时间',
    dataIndex: 'buyDate',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '数量',
    dataIndex: 'quantity',
  },
  {
    title: '检校类型',
    dataIndex: 'checkType',
  },
  {
    title: '前次检校',
    dataIndex: 'preCheckDate',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '下次检校',
    dataIndex: 'nextCheckDate',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '设备状态',
    dataIndex: 'status',
  },
]

const queryConfig = [
  {
    type: 'select',
    field: 'eqType',
    title: '设备类别',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'manageType',
    title: '管理类别',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'industryId',
    title: '使用行业',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'select',
    field: 'eqStatus',
    title: '设备状态',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'eqName',
    title: '设备名称',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'equipmentSn',
    title: '设备编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'eqStandard',
    title: '规格型号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'eqLaboratoryName',
    title: '检测室',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'eqUnitName',
    title: '所属单位',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'treeSelect',
    field: 'eqDepartId',
    title: '所属部门',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'keeperName',
    title: '保管人',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'buyDate',
    title: '购置日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'checkDate',
    title: '检校日期',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'nextCheckDate',
    title: '下次检校日期',
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
  props: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      columns,
      quickQryParam: '',
      queryParams: {},
      spinning: false,
      onlyAuthorized: false,
      page: 1,
      rows: 10,
      treeType: '', // 系统控制参数控制筛选设备
      selectPage: 'radio', // 单选或者多选
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, rows) => {
          this.page = 1
          this.rows = rows
          this.getData()
        },
      },
      queryConfig,
      selectedRowKeys: [],
      selectedRows: [],
      conditionData: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
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
                if (!record.children) {
                  this.selectedRowKeys.push(record.id)
                  this.selectedRows.push(record)
                }
              }
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
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.getData();
    // eslint-disable-next-line array-callback-return
    ['eqType', 'eqStatus', 'manageType'].map((item) => {
      this.getSelectData(item)
    })
    this.getIndustryData()
    this.getOrginData()
    this.getBusinessParam()
  },
  methods: {
    async getBusinessParam() { // 获取系统控制参数eq_show_main
      await window.$oAjax({
        url: 'tSBusinessParamController.do?getBusinessParam&key=eq_show_main',
        method: 'get',
      }).then((res) => {
        this.treeType = res.obj === 'Y' ? '1' : '0'
      })
    },
    // 获取下拉数据
    getSelectData(type) {
      const obj = {
        eqType: '402882206b72e01e016b72f8bfd80001',
        eqStatus: '402882cd5f998a58015f9998ff71001b',
        manageType: '402882cd5f998a58015f9991d359000d',
      }

      window.$oAjax
        .post(
          window.$oApi.common.getDictionaryData,
          qs.stringify({
            dictGroupId: obj[type],
          }),
        )
        .then((res) => {
          if (res.success) {
            const index = this.queryConfig.findIndex(
              item => item.field === type,
            )
            this.queryConfig[index].options = res.obj.map(item => ({
              id: item.typename,
              name: item.typename,
            }))
          }
        })
    },
    // 获取领域下拉
    async getIndustryData() {
      const { data } = await getIndustryListByUser()
      const industryList = (data || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
      const index = this.queryConfig.findIndex(
        item => item.field === 'industryId',
      )
      this.queryConfig[index].options = industryList.map(item => ({
        id: item.id,
        name: item.name,
      }))
    },
    // 获取组织机构下拉
    getOrginData() {
      window.$oAjax.post(window.$oApi.common.getDepartmentTree).then((res) => {
        const index = this.queryConfig.findIndex(
          item => item.field === 'eqDepartId',
        )
        this.queryConfig[index].options = this.formatTreeData(res)
      })
    },
    formatTreeData(data) {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          data[i].title = data[i].text
          data[i].value = data[i].id
          data[i].key = data[i].id
          if (data[i].children && data[i].children.length > 0) {
            data[i].children = this.formatTreeData(data[i].children)
          }
        }
      }

      return data
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      const _params = { ...params }
      if (_params.buyDate && _params.buyDate.length > 0) {
        _params.buyDateBegin = dayjs(_params.buyDate[0]).format('YYYY-MM-DD')
        _params.buyDateEnd = dayjs(_params.buyDate[1]).format('YYYY-MM-DD')
      }

      if (_params.checkDate && _params.checkDate.length > 0) {
        _params.checkDateBegin = dayjs(_params.checkDate[0]).format(
          'YYYY-MM-DD',
        )
        _params.checkDateEnd = dayjs(_params.checkDate[1]).format('YYYY-MM-DD')
      }

      if (_params.nextCheckDate && _params.nextCheckDate.length > 0) {
        _params.nextCheckDateBegin = dayjs(_params.nextCheckDate[0]).format(
          'YYYY-MM-DD',
        )
        _params.nextCheckDateEnd = dayjs(_params.nextCheckDate[1]).format(
          'YYYY-MM-DD',
        )
      }

      this.quickQry = ''
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
    },
    // 高级查询 重置
    resetCall() {
      this.queryParams = {}
      this.getData()
    },
    // 删除高级查询,删除查询数据
    async closeCondition(field, isShow) {
      if (field) {
        delete this.queryParams[field]
      }
      if (field === 'buyDate') {
        delete this.queryParams.buyDateBegin
        delete this.queryParams.buyDateEnd
      }
      if (field === 'checkDate') {
        delete this.queryParams.checkDateBegin
        delete this.queryParams.checkDateEnd
      }
      if (field === 'nextCheckDate') {
        delete this.queryParams.nextCheckDateBegin
        delete this.queryParams.nextCheckDateEnd
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
    handleOk() {
      this.callback(this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.clearRows()
      this.visible = false
    },
    showModal(type, acceptData, onlyAuthorized) {
      this.selectPage = type || 'radio'
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows.map(item => item.id)
      this.onlyAuthorized = onlyAuthorized
      this.getData()
      this.visible = true
    },
    getData() {
      const { page, rows, treeType } = this
      const params = {
        page,
        rows,
        treeType, // 新增查询参数
        quickQryParam: this.quickQryParam || '',
        ...this.queryParams,
      }

      delete params.buyDate
      delete params.checkDate
      delete params.nextCheckDate

      // eslint-disable-next-line ts/no-unused-expressions
      this.onlyAuthorized ? (params.onlyAuthorized = true) : ''
      this.loading = true
      window.$oAjax({
        url: window.$oApi.equipCommon.equipList,
        params,
      }).then((res) => {
        if (res && res.total > 0) {
          // 当前使用的序号实际上是设备的排序号，本应该展示的是从1开始的序号
          let index = (this.page - 1) * this.rows + 1
          this.data = res.rows.map((item) => {
            return {
              ...item,
              index: index++,
            }
          })
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = rows
        }
        else {
          this.data = []
        }
        this.loading = false
      })
    },
    clearRows() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
    },
    handleReset() {
      this.page = 1
      this.quickQryParam = ''
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
      this.clearRows()
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.content-table {
  height: 400px;
  overflow-y: auto;
}
</style>
