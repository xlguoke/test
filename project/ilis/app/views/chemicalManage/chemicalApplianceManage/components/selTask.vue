<template>
  <div>
    <ht-modal
      title="选择关联任务"
      centered
      :mask-closable="false"
      :open="visible"
      width="70%"
      :z-index="9999"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div>
            <a-input
              v-model:value="quickQryParam"
              placeholder="请输入任务编号或者记录编号"
              class="container-search-all"
            />
            <a-button @click="handleSearch">
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </div>
          <div style="padding: 10px 0"></div>
          <div class="content-table">
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="pagination"
              :data-source="data"
              :row-class-name="rowClassName"
              bordered
              :custom-row="customRow"
              :row-selection="rowSelection"
              row-key="id"
            >
            </a-table>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
  },
  {
    title: '记录编号',
    dataIndex: 'testRecordCode',
  },
  {
    title: '工程项目',
    dataIndex: 'projectName',
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
  },
  {
    title: '委托单位',
    dataIndex: 'unitName',
  },
  {
    title: '检测人员',
    dataIndex: 'testPersons',
  },
]

export default {
  components: {},
  props: ['callback'],
  emits: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      columns,
      quickQryParam: '',
      spinning: false,
      ids: '',
      getId: '',
      page: 1,
      size: 10,
      selectPage: 'radio', // 单选或者多选
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
      selectedRowKeys: [],
      selectedRows: [],
      acceptData: [],
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
                this.unSelect(record.id)
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
      // eslint-disable-next-line ts/no-this-alias
      const that = this
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
        onSelect(record, selected) {
          if (!selected) {
            that.unSelect(record.id)
          }
        },
      }
    },
  },
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    unSelect(id) {
      this.acceptData = this.acceptData.filter(item => item.id != id)
    },
    handleOk() {
      // this.callback(this.selectedRows);
      $emit(this, 'callback', this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    showModal(type, acceptData, wipeId) {
      this.selectPage = type || 'checkbox'
      this.acceptData = acceptData || []
      this.getData(wipeId)
      this.visible = true
    },
    getData(wipeId) {
      this.selectedRows = []
      this.selectedRowKeys = []
      const { page, size } = this
      const params = {
        page,
        rows: size,
        testTaskStatus: '20',
        sort: 'experience',
        order: 'desc',
        quickQryParam: this.quickQryParam || '',
      }
      this.spinning = true
      window.$oAjax
        .get(`/reportCreateController.do?getTaskWithUnitAndProject`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.total > 0) {
            this.selectedRows = JSON.parse(JSON.stringify(this.acceptData))
            this.selectedRowKeys = this.selectedRows.map(item => item.id)
            this.data = res.rows.filter((it) => {
              return wipeId != it.id
            })

            this.data = res.rows
            this.pagination.total = res.total || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          this.spinning = false
        })
    },
    handleReset() {
      this.page = 1
      this.quickQryParam = ''
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
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
