<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <ht-modal
      title="选择溶液"
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
              placeholder="请输入溶液编号或配置溶液名称"
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
              :pagination="false"
              :data-source="data"
              :row-class-name="rowClassName"
              bordered
              :custom-row="customRow"
              :row-selection="rowSelection"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'solutionBlendedVOs'">
                  <span v-for="it in record.solutionBlendedVOs">
                    {{ `${it.name},` }}
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
import { formatTime } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '溶液编号',
    dataIndex: 'sn',
  },
  {
    title: '配置溶液名称',
    dataIndex: 'name',
  },
  {
    title: '品类名称',
    dataIndex: 'categoryName',
  },
  {
    title: '溶液浓度',
    dataIndex: 'concentration',
  },
  {
    title: '配置数量',
    dataIndex: 'confectAmount',
  },
  {
    title: '配置依据',
    dataIndex: 'confectAccordance',
  },
  {
    title: '介质',
    dataIndex: 'confectMedium',
  },
  {
    title: '配置用化学品',
    dataIndex: 'solutionBlendedVOs',
    scopedSlots: { customRender: 'solutionBlendedVOs' },
  },
  {
    title: '配置日期',
    dataIndex: 'confectDate',
    customRender({ text }) {
      return formatTime(text, 'YYYY-MM-DD')
    },
  },
  {
    title: '失效日期',
    dataIndex: 'overdueDate',
    customRender({ text }) {
      return formatTime(text, 'YYYY-MM-DD')
    },
  },
  {
    title: '配置人',
    dataIndex: 'personNames',
  },
  {
    title: '备注',
    dataIndex: 'remark',
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
      size: 9999999,
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
      $emit(this, 'callback', this.selectedRows)
      // this.callback(this.selectedRows);
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
        size,
        quickQry: this.quickQryParam || '',
        status: '已领取',
      }
      this.spinning = true
      window.$oAjax
        .get(`/rest/chemical/solution/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000 && res.data.count > 0) {
            this.selectedRows = JSON.parse(JSON.stringify(this.acceptData))
            this.selectedRowKeys = this.selectedRows.map(item => item.id)
            this.data = res.data.rows.filter((it) => {
              return wipeId != it.id
            })
            this.pagination.total = res.data.count || 0
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
