<template>
  <div class="sampleScanRecord">
    <a-row :gutter="20">
      <!-- <a-col span="6">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">样品名称</div>
            <div class="hitek-form-layout-con">
              <a-input v-model="query.testSampleDisplayName" placeholder="请输入" />
            </div>
          </div>
        </a-col>
        <a-col span="6" v-if="showCustomerSampleCode">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">来样编号</div>
            <div class="hitek-form-layout-con">
              <a-input v-model="query.provideToCustomerSampleCode" placeholder="请输入" />
            </div>
          </div>
        </a-col>
        <a-col span="6">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">样品编号</div>
            <div class="hitek-form-layout-con">
              <a-input v-model="query.testObjectCode" placeholder="请输入" />
            </div>
          </div>
        </a-col>
        <a-col span="6">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">规格型号</div>
            <div class="hitek-form-layout-con">
              <a-input v-model="query.standard" placeholder="请输入" />
            </div>
          </div>
        </a-col>
        <a-col span="6">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">外部委托编号</div>
            <div class="hitek-form-layout-con">
              <a-row :gutter="15" type="flex">
                <a-col style="flex: 1"><a-input v-model="query.externalConsignCode" placeholder="请输入或点击扫描查询" /></a-col>
              </a-row>
            </div>
          </div>
        </a-col>
        <a-col span="6">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">机构内委托编号</div>
            <div class="hitek-form-layout-con">
              <a-input v-model="query.consignCode" placeholder="请输入" />
            </div>
          </div>
        </a-col>
        -->

      <div class="sampleScanRecord-search">
        <a-input
          v-model:value="query.q"
          placeholder="请输入样品编号/样品名称/生产厂家/委托编号"
          style="width: 320px"
        />
        <a-button type="primary" class="ml-2" @click="search">
          查询
        </a-button>
        <a-button @click="reset">
          重置
        </a-button>
      </div>
    </a-row>
    <div style="">
      <a-button type="primary" @click="addExternalSample">
        新增
      </a-button>
      <a-button @click="downloadLedger">
        导出
      </a-button>
      <!-- <a-button>打印样品标签</a-button> -->
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
      @change="sorterChange"
    >
      <!-- <Scan ref="Scan" :callback="search" @scan-sucesss="getScanResult" /> -->

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a @click="() => editData(record)">编辑</a>
            <a @click="() => details(record)">查看</a>
            <a @click="() => deleteData(record)">删除</a>
          </div>
        </template>
      </template>
    </a-table>
    <EditModal :id="editId" ref="editModalRef" :callback="getData" />
  </div>
</template>

<script>
import editModal from './components/editModal.vue'

const columns = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    sorter: true,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    sorter: true,
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
    sorter: true,
  },
  {
    title: '出厂日期',
    dataIndex: 'ccrq',
    sorter: true,
  },
  {
    title: '批号',
    dataIndex: 'batchNumber',
  },
  {
    title: '外部委托编号',
    dataIndex: 'externalConsignCode',
    sorter: true,
  },
  {
    title: '本机构内委托编号',
    dataIndex: 'consignCode',
    sorter: true,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    EditModal: editModal,
  },
  data() {
    return {
      editId: '',
      selectedRowKeys: [],
      data: [],
      query: {
        q: '',
      },
      sortParams: null,
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
      }
    },
  },
  created() {
    this.getSystemControlParam()
    this.getData()
    window.returnSel = this.returnSel
  },
  methods: {
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
    deleteData(row) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除?`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: async () => {
          const res = await window.$oAjax.delete(`rest/object/external/${row.id}`)

          // 要删除的外来样品委托id
          if (res.code === 20000) {
            if (res.data) {
              const delConsignIds = res.data
              window.$oAntdConfirm({
                title: '删除外来样品引用',
                content: `你未完成委托中存在此外来样品引用,确认一起删除委托中的外来样品引用吗?`,
                okText: '确认',
                mask: false,
                cancelText: '取消',
                onOk: async () => {
                  const response = await window.$oAjax.delete(
                    `rest/object/external/deleteExternalObjectInCosignMetaData?consignIds=${delConsignIds.join(
                      ',',
                    )}&id=${row.id}`,
                  )
                  if (response.code != 20000) {
                    window.$oAntdMessage.warning(`${res.message}`)
                  }
                  window.$oAntdMessage.success('删除成功！')
                  this.getData()
                },
              })
            }
            else {
              window.$oAntdMessage.success('删除成功！')
              this.getData()
            }
          }
          else {
            window.$oAntdMessage.warning(`${res.message}`)
          }
        },
      })
    },
    async details(row) {
      this.loading = true
      const res = await window.$oAjax.get(`rest/object/external/${row.id}`)
      this.loading = false
      this.$refs.editModalRef.isDisabled = true
      this.$refs.editModalRef.showModal(res.data)
    },
    async editData(row) {
      this.loading = true
      const res = await window.$oAjax.get(`rest/object/external/${row.id}`)
      this.loading = false
      this.$refs.editModalRef.isDisabled = false
      this.$refs.editModalRef.showModal(res.data)
    },
    downloadLedger() {
      window.open(`/ilis2/rest/object/外来样品台账.xlsx`)
    },
    addExternalSample() {
      this.$refs.editModalRef.isDisabled = false
      this.$refs.editModalRef.showModal()
    },
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
        ...this.sortParams,
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
