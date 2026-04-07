<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <a-input
            v-model:value="queryForm.quickQry"
            placeholder="请输入化学名称、化学名称编号后回车即可"
            style="width: 200px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button class="ml-2" @click="handleSearch">
            查询
          </a-button>

          <!-- <a-button @click="advancedOpen">高级查询</a-button> -->
        </div>
        <div style="padding: 10px 0">
          <a-button v-permission="'inventory::export'" @click="onExport">
            导出
          </a-button>
          <a-button v-permission="'inventory::refresh'" type="primary" @click="handleSearch">
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
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <a-tooltip v-if="record.amount <= record.warningAmount">
                <template #title>
                  库存不足预警！
                </template>
                <a
                  style="color: red; cursor: pointer"
                  @click="openInventory(record)"
                >{{ record.amount }}</a>
              </a-tooltip>

              <a v-else class="text-blue-500" @click="openInventory(record)">{{ record.amount }}</a>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a @click="(e) => viewLog(e, record)">日志</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <Logs ref="Logs" />
    <Details ref="details" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import Logs from '~/providers/components/logs.vue'
import Details from './components/details.vue'

export default {
  components: {
    Logs,
    // eslint-disable-next-line vue/no-reserved-component-names
    Details,
  },
  data() {
    return {
      dayjs,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '化学名称',
          dataIndex: 'name',
        },
        {
          title: '化学名称编号',
          dataIndex: 'sn',
        },
        {
          title: '所属类别',
          dataIndex: 'chemicalType',
        },
        {
          title: '管理级别',
          dataIndex: 'manageLevel',
        },
        {
          title: '用途',
          dataIndex: 'effect',
        },
        {
          title: '纯度',
          dataIndex: 'purity',
        },
        {
          title: '浓度',
          dataIndex: 'concentration',
        },
        {
          title: '计量单位',
          dataIndex: 'unit',
        },
        {
          title: '可支配库存',
          dataIndex: 'amount',
        },
        {
          title: '预警数量',
          dataIndex: 'warningAmount',
        },
        {
          title: '最近一次更新时间',
          dataIndex: 'lastUpdateTime',
          customRender({ text }) {
            return formatTime(text, 'YYYY-MM-DD')
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 125,
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
      let href = `/ilis2/rest/chemical/inventory/exportByCategory`

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
        .get(`/rest/chemical/inventory/paginationByCategory`, {
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
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '11')
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
