<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="equipmentAuthManage">
    <div>
      <a-input
        v-model:value="quickQryParam"
        placeholder="请输入设备名称、编号、规格型号后回车即可查询"
        style="width: 300px"
        class="mr-2"
      />
      <a-button type="primary" class="toolBtn-bar" @click="handleSearch()">
        查询
      </a-button>
      <a-button class="toolBtn-bar" @click="handleReset">
        重置
      </a-button>
      <a-button class="toolBtn-bar" @click="seniorQueryFun">
        高级查询
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
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'person'">
          <a
            href="javascript:;"
            class="text-blue-500"
            style="text-decoration: underline"
            @click="selectPerson(record.id)"
          >{{ record.iotAuthUserCount ? record.iotAuthUserCount : '0' }}</a>
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
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'

const columns = [
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    width: '16%',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    width: '16%',
  },
  {
    title: '设备类别',
    dataIndex: 'type',
    width: '14%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '14%',
  },
  {
    title: '检测室',
    dataIndex: 'laboratoryName',
    width: '16%',
  },
  {
    title: '所属部门',
    dataIndex: 'departName',
    width: '14%',
  },
  {
    title: '授权操作人员',
    dataIndex: 'person',
    width: '10%',
    align: 'center',
    scopedSlots: { customRender: 'person' },
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

export default {
  components: {
    SeniorShowSpan,
    SeniorQuery,
    SelectPersonnel,
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
  methods: {
    selectPerson(equipmentId) {
      window.$oAjax({
        url: window.$oApi.equipmentAuthManage.authUserUrl,
        method: 'POST',
        params: { equipmentId },
      }).then((res) => {
        let data = []
        if (res.code === 20000) {
          data = res.data
        }
        this.personData = data.map(item => ({ id: item, name: '' }))
        this.$refs.SelectPersonnel.showModal(
          undefined,
          equipmentId,
          this.personData,
          '授权操作人员',
        )
      })
    },
    getPerson(idsPerson, data) {
      const userId = data.map(item => item.id)
      window.$oAjax({
        url: window.$oApi.equipmentAuthManage.saveAuthUrl,
        method: 'POST',
        data: window.$oQs.stringify({
          equipmentId: idsPerson,
          userIds: userId.toString(),
        }),
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('更新人员成功')
          this.getData()
        }
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
      this.quickQryParam = ''
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
        quickQryParam: this.quickQryParam,
        ...this.queryParams,
        onlyIotEquipment: true,
      }

      delete params.buyDate
      delete params.checkDate
      delete params.nextCheckDate

      window.$oAjax.get(window.$oApi.equipmentAuthManage.list, { params }).then((res) => {
        if (res) {
          this.data = res.rows
          this.pagination.total = res.total
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
        // eslint-disable-next-line ts/no-unused-expressions
        res.success === false
          ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          : ''
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
