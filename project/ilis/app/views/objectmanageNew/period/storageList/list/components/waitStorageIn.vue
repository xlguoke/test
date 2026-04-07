<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="samplingManage">
    <ht-modal
      ref="EditSample"
      title="待入库"
      :open="visible"
      centered
      class="samplingManage-sample"
      :mask-closable="false"
      width="1000px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <div>
        <a-input
          v-model:value="quickQryParam"
          placeholder="请输入样品编号/样品名称/规格型号后回车即可查询"
          style="width: 420px"
          @press-enter="handleSearch()"
        />
        <a-button type="primary" class="ml-2" @click="handleSearch()">
          查询
        </a-button>
        <a-button @click="handleReset">
          重置
        </a-button>
        <!--        <a-button @click="seniorQueryFun" class="toolBtn-bar">高级查询</a-button> -->
      </div>
      <SeniorShowSpan
        v-if="conditionData.length > 0"
        ref="SeniorShowSpan"
        :show-data="conditionData"
        :callback="closeCondition"
      />

      <a-table
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :row-selection="rowSelection"
        bordered
        row-key="id"
        style="margin-top: 10px"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'consignStatus'">
            <span>
              <span :style="`color:${record.color}`">{{ text }}</span>
            </span>
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
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import SeniorQuery from '~/providers/components/seniorQuery/list.vue'
import SeniorShowSpan from '~/providers/components/seniorQuery/showSpan.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '试样数量',
    dataIndex: 'sampleNum',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectSn',
  },
]

const queryConfig = [
  {
    type: 'input',
    field: 'objectCode',
    title: '样品编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'objectName',
    title: '样品名称',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'input',
    field: 'consignCode',
    title: '委托编号',
    options: [],
    default: '',
    col: '24',
    expend: {},
  },
  {
    type: 'rangePicker',
    field: 'consignTime',
    title: '委托日期',
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
  emits: ['success-ok'],
  data() {
    return {
      dayjs,
      data: [],
      columns: [],
      loading: false,
      visible: false,
      quickQryParam: '',
      queryConfig,
      conditionData: [],
      selectedRowKeys: [],
      selectedRows: [],
      allData: [],
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
  created() {},
  methods: {
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.updateSelectedRows()
    },
    // 高级查询，根据查询数据 回显
    seniorQueryFun() {
      const params = { ...this.queryParams }
      if (params.consignTimeStart) {
        params.consignTime = [
          formatTime(params.consignTimeStart, 'YYYY-MM-DD'),
          formatTime(params.consignTimeEnd, 'YYYY-MM-DD'),
        ]
        delete params.consignTimeStart
        delete params.consignTimeStart
      }
      this.$refs.SeniorQuery.showModal(this.queryConfig, params)
    },
    // 高级查询回调，更改查询数据(显示数据)
    async seniorQueryCall(params, showData) {
      const _params = { ...params }
      if (_params.consignTime && _params.consignTime.length > 0) {
        _params.consignTimeStart
          = `${formatTime(_params.consignTime[0], 'YYYY-MM-DD')} 00:00:00`
        _params.consignTimeEnd
          = `${formatTime(_params.consignTime[1], 'YYYY-MM-DD')} 23:59:59`
      }
      delete _params.consignTime
      this.quickQryParam = ''
      this.queryParams = { ..._params }
      this.isShow = !!showData.length

      this.conditionData = [...showData].map(item => ({ ...item }))

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
      if (field === 'consignTime') {
        delete this.queryParams.consignTimeStart
        delete this.queryParams.consignTimeEnd
      }
      if (field) {
        delete this.queryParams[field]
      }

      if (isShow) {
        this.isShow = false
        this.conditionData = []
      }
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleReset() {
      this.quickQryParam = ''
      this.queryParams = {}
      this.conditionData = []
      this.handleSearch()
    },
    handleSearch() {
      this.getData()
    },
    getData() {
      this.loading = true
      const params = {
        quickQryParam: this.quickQryParam,
        ...this.queryParams,
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

      window.$oAjax
        .get(window.$oApi.storageList.waitStorageIn, { params })
        .then((res) => {
          this.data = res.data.rows.map((item, index) => {
            return {
              ...item,
              ...this.timeShowHtml(item),
              index,
            }
          })

          if (!this.quickQryParam) {
            this.allData = [...res.data.rows]
            this.updateSelectedRows()
          }

          this.columns = columns
          this.loading = false
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
        if (day < 0) {
          obj.consignStatus = '已超期'
          obj.color = '#DA0722'
        }
        else if (day >= 0 && day < 1) {
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
    async handleOk() {
      this.spinning = true
      this.handleCancel()
      $emit(this, 'success-ok', this.selectedRows)
    },
    handleCancel() {
      this.visible = false
      this.quickQryParam = ''
    },
    showModal(keys) {
      const results = []
      keys.forEach((key) => {
        results.push(key.id)
      })
      this.selectedRowKeys = results
      this.visible = true
      this.getData()
    },
    updateSelectedRows() {
      this.selectedRows = this.allData.filter(i =>
        this.selectedRowKeys.includes(i.id),
      )
    },
  },
}
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
