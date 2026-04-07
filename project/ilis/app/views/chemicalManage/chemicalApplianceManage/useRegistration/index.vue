<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="mb-4">
          <a-input
            v-model:value="queryForm.quickQry"
            placeholder="请输入出库批号/化学品编号/化学品名称/关联任务编号/检测参数后查询"
            style="width: 420px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button class="ml-2" @click="handleSearch">
            查询
          </a-button>

          <!-- <a-button @click="advancedOpen">高级查询</a-button> -->
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
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  v-if="record.type == '检测申领' || record.type == '自配直接使用' "
                  v-permission="'userregister::add'"
                  @click="(e) => addApply(e, record)"
                >新增</a>
                <a
                  v-if="record.type == '配置溶液'"
                  v-permission="'userregister::prepare-solution'"
                  @click="(e) => addLiquor(e, record)"
                >新增</a>
                <a v-permission="'userregister::userecord'" @click="(e) => viewUserRecord(e, record)">使用记录</a>
                <a v-permission="'userregister::stockrecord'" @click="(e) => viewStorageRecord(e, record)">出入库记录</a>
              </span>
            </template>
            <template v-if="column.dataIndex === 'invalidDate'">
              <span v-if="record.invalid >= 0">{{ record.invalidDate }}</span>

              <a-tooltip v-else placement="topLeft" title="已过期">
                <span style="color: red; cursor: pointer">{{
                  record.invalidDate
                }}</span>
              </a-tooltip>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <MovementRecord ref="movementRecord" />
    <UserRecord ref="userRecordRef" />

    <StorageRecord ref="storageRecord" />
    <Add ref="addRef" @callback-fun="getData" />
    <AddLiquor ref="addLiquorRef" @callback-fun="getData" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import storageRecord from '../components/storageRecord.vue'
import Add from './components/add.vue'
import AddLiquor from './components/addLiquor.vue'
import movementRecord from './components/movementRecord.vue'
import UserRecord from './components/userRecord.vue'

export default {
  components: {
    MovementRecord: movementRecord,
    StorageRecord: storageRecord,
    Add,
    AddLiquor,
    UserRecord,
  },
  data() {
    return {
      dayjs,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '状态',
          dataIndex: 'status',
        },
        {
          title: '出库批号',
          dataIndex: 'batchSn',
        },
        {
          title: '出库类型',
          dataIndex: 'type',
        },
        {
          title: '化学品编号',
          dataIndex: 'sn',
        },
        {
          title: '品名',
          dataIndex: 'name',
        },
        {
          title: '化学名称',
          dataIndex: 'chemicalName',
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
          title: '生产（配置）日期',
          dataIndex: 'productionDate',
          customRender({ text }) {
            return formatTime(text, 'YYYY-MM-DD')
          },
        },

        {
          title: '失效日期',
          dataIndex: 'invalidDate',
          scopedSlots: { customRender: 'invalidDate' },
          // customRender: function(time) {
          //   return formatTime(time, "YYYY-MM-DD");
          // },
        },

        {
          title: '领用人',
          dataIndex: 'receivers',
        },
        {
          title: '出库量',
          dataIndex: 'amount',
        },
        {
          title: '本次出库可用余量',
          dataIndex: 'remainingAmount',
        },
        {
          title: '关联检测任务',
          dataIndex: 'testTaskCodes',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 200,
          scopedSlots: { customRender: 'operation' },
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
    addApply(e, row) {
      this.$refs.addRef.openModel(row)
    },
    addLiquor(e, row) {
      this.$refs.addLiquorRef.openModel(row)
    },
    customOk() {
      this.customVisible = false
    },
    initFun() {
      this.getData()
    },
    openInventory(row) {
      this.$refs.movementRecord.showModal(row)
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
        .get(`/rest/chemical/inventoryOutRecord/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows.map((it) => {
              it.invalidDate = formatTime(it.invalidDate, 'YYYY-MM-DD')
              return it
            })
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
      const d = { ...row }
      d.id = d.chemicalId
      this.$refs.storageRecord.showModal(d)
    },
    viewUserRecord(e, row) {
      this.$refs.userRecordRef.showModal(row)
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
