<template>
  <div>
    <ht-modal
      title="选择化学品"
      centered
      :mask-closable="false"
      :open="visible"
      width="70%"
      :z-index="9999"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div>
          <a-space class="pt-2 pb-4">
            <a-input v-model:value="quickQryParam" class="!w-[400px]" placeholder="请输入化学名称/化学名称编号" />
            <a-button @click="handleSearch">
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>

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
            :scroll="{ x: tableScrollX, y: 320 }"
          >
          </a-table>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      dayjs,
      data: [],
      visible: false,
      columns: [
        {
          title: '化学名称',
          dataIndex: 'name',
          width: 220,
        },
        {
          title: '化学名称编号',
          dataIndex: 'sn',
          width: 180,
        },
        {
          title: '用途',
          dataIndex: 'effect',
          width: 150,
        },
        {
          title: '纯度',
          dataIndex: 'purity',
          width: 120,
        },
        {
          title: '浓度',
          dataIndex: 'concentration',
          width: 120,
        },
        {
          title: '规格型号',
          dataIndex: 'specification',
          width: 150,
        },
        {
          title: '计量单位',
          dataIndex: 'unit',
          width: 120,
        },
        {
          title: '化学品分类',
          dataIndex: 'safetyType',
          width: 150,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 180,
        },
      ],
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
    tableScrollX() {
      return this.columns.reduce((acc, column) => {
        return acc + column.width
      }, 0)
    },
    rowSelection() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const { selectedRowKeys } = this
      return {
        fixed: true,
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
      this.callback(this.selectedRows)
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
      }
      this.spinning = true
      window.$oAjax
        .get(`/rest/chemical/category/pagination`, {
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
