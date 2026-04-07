<template>
  <div>
    <ht-modal
      title="出入库记录"
      centered
      :mask-closable="false"
      :open="visible"
      :z-index="9999"
      width="70%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <!-- <div>
              <a-input
                v-model="quickQryParam"
                placeholder="请输入"
                class="container-search-all"
              />
              <a-button @click="handleSearch">查询</a-button>
              <a-button @click="handleReset">重置</a-button>
            </div> -->
          <div class="content-table">
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="false"
              :data-source="data"
              :row-class-name="rowClassName"
              bordered
              :custom-row="customRow"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'type'">
                  <span>
                    {{ record.type + record.inOrOut }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '化学品编号',
    dataIndex: 'sn',
  },
  {
    title: '品名',
    dataIndex: 'name',
  },
  {
    title: '关联任务',
    dataIndex: 'testTaskCodes',
  },
  {
    title: '检测参数',
    dataIndex: 'testParams',
  },
  {
    title: '出入库类型',
    dataIndex: 'type',
  },
  {
    title: '出入库批号',
    dataIndex: 'batchSn',
  },
  {
    title: '变动时间',
    dataIndex: 'completeOperationDate',
    customRender: ({ text }) => {
      return formatDateCommon(text, 'yyyy-MM-dd HH:mm:ss')
    },
  },
  // {
  //   title: "申领数量",
  //   dataIndex: "outAmount",
  // },
  {
    title: '出库数量',
    dataIndex: 'outAmount',
  },

  {
    title: '入库数量',
    dataIndex: 'inAmount',
  },

  {
    title: '当次可用余量',
    dataIndex: 'afterAmount',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
]

function formatDateCommon(v, format) {
  if (!v) {
    return ''
  }
  const dateV = new Date(v)
  const year = dateV.getFullYear()
  let month = dateV.getMonth() + 1
  month = month < 10 ? `0${month}` : month
  let date = dateV.getDate()
  date = date < 10 ? `0${date}` : date
  let hour = dateV.getHours()
  hour = hour < 10 ? `0${hour}` : hour
  let minute = dateV.getMinutes()
  minute = minute < 10 ? `0${minute}` : minute
  let second = dateV.getSeconds()
  second = second < 10 ? `0${second}` : second
  const str1 = `${year}-${month}-${date}`
  const str2 = `${hour}:${minute}:${second}`
  let str
  if (format == 'yyyy-MM-dd') {
    str = str1
  }
  else {
    str = `${str1} ${str2}`
  }
  return str
}

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      queryData: {},
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
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    showModal(data) {
      // this.ids = ids;
      // this.selectPage = type ? type : "checkbox";
      // this.acceptData = acceptData || [];
      this.queryData = data
      this.getData()
      this.visible = true
      this.quickQryParam = ''
    },
    getData() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.spinning = true
      window.$oAjax
        .get(`/rest/chemical/inventory/${this.queryData.id}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000 && res.data) {
            this.selectedRows = JSON.parse(JSON.stringify(this.acceptData))
            this.selectedRowKeys = this.selectedRows.map(item => item.id)
            this.data = res.data
          }
          else {
            this.data = []
          }
          this.spinning = false
        })
    },
    handleReset() {
      this.page = 1
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
