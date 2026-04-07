<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="equipmentAuthRecord">
    <div id="serchBox">
      <a-input
        v-model:value="quickQryParam"
        placeholder="请输入设备编号、设备名称、操作用户账号、操作用户名称"
        style="width: 340px; margin-right: 12px"
        @press-enter="handleSearch"
      />
      <a-select
        v-model:value="operation"
        style="width: 120px; margin-right: 12px"
        placeholder="操作类型"
      >
        <a-select-option
          v-for="item in actionType"
          :key="item.label"
          :value="item.label"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-select
        v-model:value="status"
        style="width: 120px; margin-right: 12px"
        placeholder="操作结果"
      >
        <a-select-option
          v-for="item in actionResult"
          :key="item.label"
          :value="item.label"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-range-picker v-model:value="timer" show-time>
      </a-range-picker>
      <a-button type="primary" class="toolBtn-bar ml-2" @click="handleSearch()">
        查询
      </a-button>
      <a-button class="toolBtn-bar" @click="handleReset">
        重置
      </a-button>
    </div>
    <SeniorShowSpan
      v-if="conditionData.length > 0"
      ref="SeniorShowSpan"
      :show-data="conditionData"
      :callback="closeCondition"
    />
    <a-table
      :columns="columns"
      :pagination="data.length > 0 ? pagination : false"
      :data-source="data"
      :loading="loading"
      bordered
      row-key="__index__"
      :row-class-name="rowClassName"
      :scroll="{ y: 350 }"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'status'">
          {{ text }}
          <a-tooltip v-if="text === '失败' && record.result" placement="top">
            <template #title>
              <span>{{ record.result }}</span>
            </template>
            <ExclamationCircleOutlined
              style="color: orange; margin-left: 6px"
            />
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'authTime'">
          <div>
            {{ filterResult(text) }}
          </div>
        </template>
      </template>
    </a-table>
    <SeniorQuery
      ref="SeniorQuery"
      :callback="seniorQueryCall"
      :reset-call="resetCall"
    />

    <SelectPersonnel ref="SelectPersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'

const columns = [
  {
    title: '更新时间',
    dataIndex: 'authTime',
  },
  {
    title: '操作用户账号',
    dataIndex: 'authUserAccount',
  },
  {
    title: '操作用户名称',
    dataIndex: 'authUser',
  },
  {
    title: '操作类型',
    dataIndex: 'operation',
  },
  {
    title: '操作结果',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
  },
  {
    title: '检测室',
    dataIndex: 'laboratoryName',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
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
// eslint-disable-next-line unused-imports/no-unused-vars
const serchDom = null
const ant_input_suffix = null
const ant_calendar_picker_icon = null
export default {
  components: {
    SeniorShowSpan,
    SeniorQuery,
    SelectPersonnel,
    ExclamationCircleOutlined,
  },
  data() {
    return {
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
      quickQryParam: '',
      operation: undefined,
      status: undefined,
      timer: [],
      actionType: [
        {
          value: 'SMJQ',
          label: '扫码鉴权',
        },
        {
          value: 'YCKQ',
          label: '远程开启',
        },
        {
          value: 'YCGB',
          label: '远程关闭',
        },
      ],
      actionResult: [
        {
          value: 'SUCCESS',
          label: '成功',
        },
        {
          value: 'FAIL',
          label: '失败',
        },
      ],
      queryConfig,
      conditionData: [],
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
      personData: [],
    }
  },
  created() {
    this.getData();
    // eslint-disable-next-line array-callback-return
    ['eqType', 'eqStatus', 'manageType'].map((item) => {
      this.getSelectData(item)
    })
    this.getOrginData()
  },
  // mounted () {
  //   serchDom = document.getElementById('serchBox')
  //   if (serchDom) {
  //     ant_input_suffix = serchDom.getElementsByClassName('ant-input-suffix')
  //     ant_calendar_picker_icon = serchDom.getElementsByClassName('ant-calendar-picker-icon')
  //     if (ant_input_suffix && ant_input_suffix.length) {
  //       for (let i = 0; i < ant_input_suffix.length; i++) {
  //         ant_input_suffix[i].addEventListener('click', this.handleSearch, false)
  //       }
  //     }
  //     if (ant_calendar_picker_icon && ant_calendar_picker_icon.length) {
  //       for (let i = 0; i < ant_calendar_picker_icon.length; i++) {
  //         ant_calendar_picker_icon[i].addEventListener('click', this.handleTime, false)
  //       }
  //     }
  //   }
  // },
  unmounted() {
    if (ant_input_suffix && ant_input_suffix.length) {
      for (let i = 0; i < ant_input_suffix.length; i++) {
        ant_input_suffix[i].removeEventListener(
          'click',
          this.handleSubmit,
          false,
        )
      }
    }
    if (ant_calendar_picker_icon && ant_calendar_picker_icon.length) {
      for (let i = 0; i < ant_input_suffix.length; i++) {
        ant_calendar_picker_icon[i].removeEventListener(
          'click',
          this.handleTime,
          false,
        )
      }
    }
  },
  methods: {
    selectPerson() {
      this.$refs.SelectPersonnel.showModal(
        undefined,
        '',
        this.personData,
        '授权操作人员',
      )
    },
    getPerson(idsPerson, data) {
      this.personData = data
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
        _params.buyDateBegin = formatTime(_params.buyDate[0], 'YYYY-MM-DD')
        _params.buyDateEnd = formatTime(_params.buyDate[1], 'YYYY-MM-DD')
      }

      if (_params.checkDate && _params.checkDate.length > 0) {
        _params.checkDateBegin = formatTime(_params.checkDate[0], 'YYYY-MM-DD')
        _params.checkDateEnd = formatTime(_params.checkDate[1], 'YYYY-MM-DD')
      }

      if (_params.nextCheckDate && _params.nextCheckDate.length > 0) {
        _params.nextCheckDateBegin = formatTime(
          _params.nextCheckDate[0],
          'YYYY-MM-DD',
        )
        _params.nextCheckDateEnd = formatTime(
          _params.nextCheckDate[1],
          'YYYY-MM-DD',
        )
      }

      this.quickQryParam = ''
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
      this.conditionData = []
      this.$refs.SeniorQuery.handleCancel()
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
    handleReset() {
      this.page = 1
      this.quickQryParam = ''
      this.operation = undefined
      this.status = undefined
      this.timer = []
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
    },
    // 时间处理函数
    handleTime() {
      this.page = 1
      this.timer = []
      this.getData()
    },
    getData() {
      const { page, size } = this
      this.loading = true
      const params = {
        page,
        rows: size,
        quickQryParam: this.quickQryParam,
        operation: this.operation,
        status: this.status,
        ...this.queryParams,
      }
      // 判断时间处理
      if (this.timer && this.timer.length && this.timer[0]) {
        params.commonDateBegin = dayjs(this.timer[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        params.commonDateEnd = dayjs(this.timer[1]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
      }
      delete params.buyDate
      delete params.checkDate
      delete params.nextCheckDate
      window.$oAjax
        .get(window.$oApi.equipmentAuthRecord.list, { params })
        .then((res) => {
          if (res.code === 20000) {
            const templateData = res.data.rows || []
            templateData.forEach((item, index) => (item.__index__ = index + 1))
            // this.data = res.data.rows;
            this.data = templateData
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch((e) => {
          this.loading = false
          window.$oAntdMessage.error(e.response.statusText || '请求失败')
        })
    },
    // 过滤数据
    filterResult(status) {
      if (!status) {
        return ''
      }
      return dayjs(status).format('YYYY-MM-DD HH:mm:ss')
    },
    openChange(boolean) {
      if (!boolean) {
        this.getData()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
