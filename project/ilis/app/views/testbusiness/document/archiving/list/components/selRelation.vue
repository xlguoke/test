<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="titles || '选择数据'"
      centered
      :force-render="true"
      :mask-closable="false"
      width="80%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div>
            <a-input
              v-model:value="quickQryParam"
              :placeholder="placeholder"
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
              :scroll="{ y: 290 }"
              :pagination="data.length > 0 ? pagination : false"
              :data-source="data"
              bordered
              :custom-row="customRow"
              :row-selection="rowSelection"
              :row-class-name="rowClassName"
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

const consignUnitCol = [
  {
    title: '委托单位',
    dataIndex: 'name',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
]
const projectCol = [
  {
    title: '工程项目',
    dataIndex: 'name',
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      columns: [],
      quickQryParam: '',
      placeholder: '请输入委托单位',
      spinning: false,
      ids: '',
      getId: '',
      page: 1,
      size: 10,
      selectPage: 'radio', // 单选或者多选
      titles: '',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.selectedRows = []
          this.selectedRowKeys = []
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.selectedRows = []
          this.selectedRowKeys = []
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
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
    handleOk() {
      this.callback(this.ids, this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.quickQryParam = ''
      this.selectedRows = []
      this.selectedRowKeys = []
      this.page = 1
      this.columns = []
      this.visible = false
    },
    showModal(type, ids, acceptData, getId) {
      this.ids = ids
      this.selectPage = type || 'radio'
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows.map(item => item.id)
      this.getId = getId
      if (this.ids === 'project') {
        this.columns = projectCol
        this.placeholder = '请输入工程项目'
        this.titles = '关联工程项目'
      }
      else {
        this.columns = consignUnitCol
        this.placeholder = '请输入委托单位'
        this.titles = '关联委托单位'
      }
      this.getData()
      this.visible = true
    },
    getData() {
      const { page, size } = this
      const params = {
        page,
        rows: size,
        quickQryParam: this.quickQryParam || '',
      }
      let checkedDataIds = ''
      if (this.selectedRowKeys.length > 0) {
        checkedDataIds = this.selectedRowKeys.join(',')
      }
      if (this.ids === 'project') {
        params.consignUnitId = this.getId
        params.checkedDataIds = checkedDataIds
      }
      else {
        params.consignProjectId = this.getId
        params.currentUnitId = checkedDataIds
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.common[this.ids],
        params,
      }).then((res) => {
        if (res && res.total > 0) {
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
      this.quickQryParam = ''
      this.handleSearch()
    },
    handleSearch() {
      this.selectedRows = []
      this.selectedRowKeys = []
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
