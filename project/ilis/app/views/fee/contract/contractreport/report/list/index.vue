<template>
  <div>
    <span style="margin-right: 5px"><b>合同编号：</b>{{ contractCode }}</span>
    <span style="margin-right: 5px"><b>合同方：</b>{{ contractUnit }}</span>
    <span style="margin-right: 5px"><b>合同名称：</b>{{ contractName }}</span>
    <a-button type="primary" style="margin-bottom: 10px" @click="openModal">
      选择合同
    </a-button>
    <div>
      <div v-if="allSearch">
        <a-form :model="formState">
          <a-form-item
            label="报告编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 9 }"
          >
            <a-input
              v-model:value="formState.reportCode"
              placeholder="请选择报告编号"
            />
          </a-form-item>
          <a-form-item
            label="委托编号"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 9 }"
          >
            <a-input
              v-model:value="formState.consignCode"
              placeholder="请选择委托编号"
            />
          </a-form-item>
          <a-form-item
            label="样品名称"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 9 }"
          >
            <a-input
              v-model:value="formState.sampleName"
              placeholder="请选择样品名称"
            />
          </a-form-item>
          <a-form-item
            label="检测时间"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 9 }"
          >
            <a-range-picker v-model:value="formState.stamp" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item
            label="是否合格"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 9 }"
          >
            <a-radio-group
              v-model:value="formState.isQualified"
              name="radioGroup"
            >
              <a-radio
                v-for="(item, index) in isQualifieData"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 22, offset: 2 }">
            <a-button type="primary" @click="search">
              查询
            </a-button>
            <a-button
              @click="
                () => {
                  searchType(false)
                }
              "
            >
              切换普通查询
            </a-button>
            <a-button @click="resetForm">
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-space v-else class="mb-2">
        <a-input
          v-model:value="reportCode"
          placeholder="请输入报告编号"
          class="!w-[300px]"
          @press-enter="search"
        />
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <a-button @click="() => { searchType(true) }">
          切换高级查询
        </a-button>
      </a-space>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <span>
              <a @click="() => viewDetail(record)">查看</a>
            </span>
          </div>
        </template>
      </template>
    </a-table>
    <ContractModal ref="ContractModal" :callback="selectContract" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import ContractModal from './components/contractModal.vue'

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: '12%',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
    width: '12%',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '报告编号',
    dataIndex: 'reportCode',
    width: '12%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '数据状态',
    dataIndex: 'processStatus',
    width: '8%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '样品名称',
    dataIndex: 'sampleName',
    width: '12%',
  },
  {
    title: '检测时间',
    dataIndex: 'testTime',
    width: '24%',
  },
  {
    title: '是否合格',
    dataIndex: 'isQualified',
    width: '10%',
    customRender({ text }) {
      text = `${text}`
      if (text === null || text === '2' || text === '') {
        return '不判定'
      }
      else if (text === '0') {
        return '不合格'
      }
      else if (text === '1') {
        return '合格'
      }
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    ContractModal,
  },
  data() {
    return {
      data: [],
      formState: {},
      allSearch: false,
      id: getQueryVariable('id'),
      contractCode: decodeURIComponent(getQueryVariable('contractCode') || ''),
      contractUnit: decodeURIComponent(getQueryVariable('contractUnit') || ''),
      contractName: decodeURIComponent(getQueryVariable('contractName') || ''),
      columns,
      loading: false,
      page: 1,
      size: 10,
      reportCode: '',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.pagination.current = page
          this.size = size
          this.pagination.pageSize = size
          this.getData()
        },
      },
      isQualifieData: [
        { value: '', name: '全部' },
        { value: '1', name: '合格' },
        { value: '0', name: '不合格' },
        { value: '2', name: '不判定' },
      ],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(data) {
      const { page, size, id } = this
      const params = data || {}
      this.loading = true
      window.$oAjax({
        url: `${window.$oApi.contractTestReport.list}/${id}`,
        method: 'GET',
        params: {
          page,
          size,
          ...params,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.loading = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message))
          this.loading = false
        }
      })
    },
    viewDetail(record) {
      const { reportId, reportType } = record
      if (!reportId) {
        return window.$oAntdModal.warning(window.$oMsgTips.info('报告暂未生成'))
      }
      if (`${record.openType}` !== '3') {
        window.open(
          `${rootUrl}/reportController.do?goCommonReportDetail&reportId=${reportId}&reportType=${reportType}&sourceModule=2&detailType=audit`,
          '报告审核详情',
        )
      }
      else {
        window.open(
          `${rootUrl}/reportAuditController.do?goReportAuditDetail&reportId=${reportId}&reportType=${reportType}`,
          '报告审核详情',
        )
      }
    },
    selectContract(data) {
      if (data.length === 0) {
        return
      }
      this.id = data[0].id
      this.contractCode = data[0].code
      this.contractUnit = data[0].unitName
      this.contractName = data[0].contractName
      this.getData()
    },
    openModal() {
      this.$refs.ContractModal.showModal()
    },
    searchType(allSearch) {
      this.allSearch = allSearch
    },
    // 搜索
    search(e) {
      e.preventDefault()
      let data = {}
      if (this.allSearch) {
        data = { ...this.formState }
        if (data.stamp && Array.isArray(data.stamp)) {
          const stamp = data.stamp.map((item) => {
            return dayjs(item).valueOf()
          })
          data.stamp = stamp.toString() || undefined
        }
        else {
          data.stamp = undefined
        }
      }
      else {
        data.reportCode = this.reportCode
      }
      this.page = 1
      this.getData(data)
    },
    resetForm() {
      this.formState = {}
      this.getData()
    },
  },
}
</script>
