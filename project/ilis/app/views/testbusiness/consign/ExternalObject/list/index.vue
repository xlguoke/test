<template>
  <div class="sampleScanRecord">
    <a-row :gutter="20">
      <a-col span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            样品编号
          </div>
          <div class="hitek-form-layout-con">
            <a-input
              v-model:value="query.testObjectCode"
              placeholder="请输入"
            />
          </div>
        </div>
      </a-col>
      <a-col v-if="showCustomerSampleCode" span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            来样编号
          </div>
          <div class="hitek-form-layout-con">
            <a-input
              v-model:value="query.provideToCustomerSampleCode"
              placeholder="请输入"
            />
          </div>
        </div>
      </a-col>
      <a-col span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            样品名称
          </div>
          <div class="hitek-form-layout-con">
            <a-input
              v-model:value="query.testSampleDisplayName"
              placeholder="请输入"
            />
          </div>
        </div>
      </a-col>
      <a-col span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            规格型号
          </div>
          <div class="hitek-form-layout-con">
            <a-input v-model:value="query.standard" placeholder="请输入" />
          </div>
        </div>
      </a-col>
      <a-col span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            外部委托编号
          </div>
          <div class="hitek-form-layout-con">
            <a-row :gutter="15" type="flex">
              <a-col style="flex: 1">
                <a-input
                  v-model:value="query.externalConsignCode"
                  placeholder="请输入或点击扫描查询"
                />
              </a-col>
            </a-row>
          </div>
        </div>
      </a-col>
      <a-col span="6">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            本机构内委托编号
          </div>
          <div class="hitek-form-layout-con">
            <a-input v-model:value="query.consignCode" placeholder="请输入" />
          </div>
        </div>
      </a-col>
      <div class="sampleScanRecord-search">
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <a-button class="toolBtn-bar" @click="reset">
          重置
        </a-button>
      </div>
    </a-row>
    <p class="tip" style="text-align: right; color: #007df1">
      注：外部委托编号为该外来样品在其他机构委托时的委托编号，本机构内委托编号为本机构录入该外来样品的委托编号
    </p>
    <a-table
      class="mt-4"
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    />
    <!-- <Scan ref="Scan" :callback="search" @scan-sucesss="getScanResult" /> -->
  </div>
</template>

<script>
import Scan from './components/scan.vue'

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
    title: '样品编号',
    dataIndex: 'testObjectCode',
  },
  {
    title: '来样编号',
    dataIndex: 'provideToCustomerSampleCode',
  },
  {
    title: '生产厂家',
    dataIndex: 'manufacturer',
  },
  {
    title: '生产产地',
    dataIndex: 'manufactureLocation',
  },
  {
    title: '生产日期',
    dataIndex: 'manufactureDate',
  },
  {
    title: '出厂日期',
    dataIndex: 'ccrq',
  },
  {
    title: '批号',
    dataIndex: 'batchNumber',
  },
  {
    title: '外部委托编号',
    dataIndex: 'externalConsignCode',
  },
  {
    title: '本机构内委托编号',
    dataIndex: 'consignCode',
  },
]

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    Scan,
  },
  data() {
    return {
      selectedRowKeys: [],
      data: [],
      query: {},
      columns,
      showCustomerSampleCode: false,
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
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
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
        onSelection: this.onSelection,
      }
    },
  },
  created() {
    this.getSystemControlParam()
    this.getData()
    window.returnSel = this.returnSel
  },
  methods: {
    // 获取系统控制参数 - 来样编号
    async getSystemControlParam() {
      const res = await window.$oAjax.get(window.$oApi.getBusinessParam, {
        params: { key: 'ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE' },
      })
      if (res.success && res.obj === 'Y') {
        this.showCustomerSampleCode = true
      }
      else {
        this.showCustomerSampleCode = false
        this.columns = columns.filter(
          d => d.dataIndex !== 'provideToCustomerSampleCode',
        )
      }
    },
    onSelectChange(selectedRowKeys, row) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = row
    },
    getScanResult(result) {
      this.query.scode = result
    },
    scanSearch() {
      this.$refs.Scan.showModal()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.getData()
    },
    reset() {
      this.query = {}
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size } = this
      this.loading = true

      const params = {
        page,
        size,
        ...this.query,
      }

      window.$oAjax
        .get(`/rest/object/externals`, { params })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
        })
    },
    returnSel() {
      return this.selectedRows
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
