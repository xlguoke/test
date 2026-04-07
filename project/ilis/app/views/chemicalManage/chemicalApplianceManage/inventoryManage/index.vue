<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <a-input
            v-model:value="queryForm.quickQry"
            placeholder="请输入化学名称、化学品编号后回车即可"
            style="width: 200px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button @click="handleSearch">
            查询
          </a-button>

          <!-- <a-button @click="advancedOpen">高级查询</a-button> -->
        </div>
        <div style="padding: 10px 0">
          <a-button v-permission="'inventory::manage::export'" @click="onExport">
            导出
          </a-button>
          <a-button v-permission="'inventory::manage::export'" type="primary" @click="handleSearch">
            刷新
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :columns="tableColumns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
          :scroll="{ x: 1300 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a v-permission="'inventory::manage::showrecord'" @click="(e) => viewStorageRecord(e, record)">查看出入库记录</a>
                <a v-permission="'inventory::manage::print-ledger'" @click="onPrint(record)">打印领用台账</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <Details ref="details" />
    <StorageRecord ref="storageRecord" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import storageRecord from '../components/storageRecord.vue'
import Details from './components/details.vue'

export default {
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Details,
    StorageRecord: storageRecord,
  },
  data() {
    return {
      dayjs,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '化学品编号',
          dataIndex: 'sn',
          width: 130,
        },
        {
          title: '品名',
          dataIndex: 'name',
          width: 130,
        },
        {
          title: '化学名称',
          dataIndex: 'categoryName',
          width: 130,
        },
        {
          title: '管理级别',
          dataIndex: 'manageLevel',
          width: 90,
        },
        {
          title: '计量单位',
          dataIndex: 'unit',
          width: 90,
        },
        {
          title: '纯度',
          dataIndex: 'purity',
          width: 50,
        },
        {
          title: '浓度',
          dataIndex: 'concentration',
          width: 50,
        },
        {
          title: '规格型号',
          dataIndex: 'specification',
          width: 90,
        },

        {
          title: '用途',
          dataIndex: 'effect',
          width: 120,
        },

        {
          title: '化学品来源',
          dataIndex: 'sourceFrom',
          width: 90,
        },

        {
          title: '生产（配置）日期',
          dataIndex: 'productionDate',
          width: 120,
        },
        {
          title: '失效日期',
          dataIndex: 'invalidDate',
          width: 90,
        },
        {
          title: '可用余量',
          dataIndex: 'amount',
          width: 70,
        },
        {
          title: '保管人',
          dataIndex: 'keepers',
          width: 100,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 200,
          fixed: 'right',
        },
      ],
      queryForm: {
        quickQry: '',
      },
      spinning: false,
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.initFun()
  },
  methods: {
    onPrint(record) {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint([record.id], 'ChemicalReceiveLedger')
    },
    customOk() {
      this.customVisible = false
    },
    initFun() {
      this.getData()
    },
    openInventory(row) {
      this.$refs.details.showModal(row)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    clearSelRowClass() {
      if (this.selectedRowKeys.length > 0) {
        $(
          `#tableBox tr[data-row-key="${this.selectedRowKeys[0]}"]`,
        ).removeClass('hitek-tableRow-active')
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },
    async onExport() {
      const a = document.createElement('a')
      const params = {
        page: this.page,
        size: this.size,
        quickQry: this.queryForm.quickQry || '',
      }
      let href = `/ilis2/rest/chemical/inventory/export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },
    getData(flag) {
      this.visible = false
      this.spinning = true
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        size,
        ...this.queryForm,
      }
      window.$oAjax
        .get(`/rest/chemical/inventory/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          this.clearSelRowClass()
          this.spinning = false
        })
    },
    handleSearch() {
      this.getData(true)
    },
    viewStorageRecord(e, row) {
      this.$refs.storageRecord.showModal(row)
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
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
