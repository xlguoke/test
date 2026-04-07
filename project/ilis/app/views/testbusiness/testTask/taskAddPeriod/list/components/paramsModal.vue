<template>
  <div>
    <ht-modal
      title="选择制件参数"
      :open="visible"
      :mask="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-table
        :row-selection="rowSelection"
        :pagination="false"
        :scroll="{ y: 180 }"
        :columns="columns"
        :row-class-name="rowClassName"
        :data-source="data"
        bordered
        :loading="loading"
        row-key="id"
        :custom-row="customRow"
      >
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
const columns = [
  {
    title: '问题分类',
    dataIndex: 'bigType',
    width: '30%',
  },
  {
    title: '问题类型',
    dataIndex: 'type',
    width: '40%',
  },
  {
    title: '错误严重程度',
    dataIndex: 'severity',
    width: '30%',
  },
]

export default {
  props: ['callback', 'testTaskId', 'data'],
  data() {
    return {
      visible: false,
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      loading: false,
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.quickQry = ''
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleOk() {
      this.callback(this.selectedRows)
      this.handleCancel()
    },
  },
}
</script>
