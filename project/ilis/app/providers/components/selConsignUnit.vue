<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="委托单位"
      width="80%"
      :loading="spinning"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="flex flex-col gap-2 h-[60vh]">
        <div>
          <a-input
            v-model:value="quickQryParam"
            placeholder="请输入委托单位"
            style="width: 200px;margin-right: 8px;"
          />
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
          <a-button @click="handleReset">
            重置
          </a-button>
        </div>
        <div ref="tableBoxRef" class="flex-1 h-0">
          <a-table
            id="tableBox"
            :columns="columns"
            :pagination="data.length > 0 ? pagination : false"
            :data-source="data"
            :row-class-name="rowClassName"
            bordered
            :custom-row="customRow"
            :row-selection="rowSelection"
            row-key="id"
            :scroll="{ y: tableHeight }"
          >
          </a-table>
        </div>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { useTableHeight } from '~/hooks/useTableHeight'

const columns = [
  {
    title: '委托单位',
    dataIndex: 'name',
  },
]

export default {
  components: {},
  props: ['callback'],
  setup() {
    const { tableBoxRef, tableHeight } = useTableHeight()

    return { tableBoxRef, tableHeight }
  },
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
      this.acceptData = this.acceptData.filter(item => item.id !== id)
    },
    handleOk() {
      this.callback(this.ids, this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    showModal(type, ids, acceptData) {
      this.ids = ids
      this.selectPage = type || 'radio'
      this.acceptData = acceptData || []
      this.getData()
      this.visible = true
    },
    getData() {
      this.selectedRows = []
      this.selectedRowKeys = []
      const { page, size } = this
      const params = {
        page,
        rows: size,
        quickQryParam: this.quickQryParam || '',
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.common.consignUnit,
        params,
      }).then((res) => {
        if (res && res.total > 0) {
          this.selectedRows = JSON.parse(JSON.stringify(this.acceptData))
          this.selectedRowKeys = this.selectedRows.map(item => item.id)
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
