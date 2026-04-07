<template>
  <div>
    <ht-modal
      title="选择委托单位"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="80%"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-table
        :row-selection="rowSelection"
        :columns="columns"
        :pagination="dataSource.length > 0 ? pagination : false"
        :data-source="dataSource"
        :loading="loading"
        bordered
        :custom-row="customRow"
        row-key="id"
        :row-class-name="rowClassName"
      >
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
  },
]

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      dayjs,
      visible: false,
      dataSource: [],
      columns,
      loading: false,
      queryParam: null,
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
      selectedRows: [],
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
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
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
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size } = this
      const params = {
        ...this.queryParam,
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.completionDataConfig.getConsignUnits,
        method: 'GET',
        params,
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data
        }
        else {
          this.dataSource = []
        }
        this.loading = false
      })
    },
    showModal(projectId) {
      this.queryParam = {
        projectId,
      }
      this.getData()
      this.visible = true
    },
    handleOk() {
      this.handleCancel()
      this.callback(this.selectedRows)
    },
    handleCancel() {
      this.visible = false
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
