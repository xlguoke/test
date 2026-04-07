<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择业绩"
      centered
      width="90%"
      class="otherAchievement-uploadModal"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-input
        v-model:value="queryParam"
        style="width: 300px"
        placeholder="请输入业绩名称"
        @press-enter="search"
      />
      <a-button @click="search">
        搜索
      </a-button>
      <a-table
        style="margin-top: 10px"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        :pagination="pagination"
        row-key="id"
      >
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'

export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      loading: false,
      columns: [
        { title: '业绩名称', dataIndex: 'performanceName', width: '25%' },
        { title: '业绩类型', dataIndex: 'performanceType', width: '15%' },
        { title: '合同金额', dataIndex: 'performanceAmount', width: '15%' },
        { title: '等级', dataIndex: 'grade', width: '15%' },
        { title: '时间年限', dataIndex: 'yearLimit', width: '15%' },
        { title: '地区', dataIndex: 'area', width: '15%' },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      data: [],
      page: 1,
      size: 5,
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
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
      query: {},
      queryParam: '',
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
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.biddingPerformance.getData, {
          params: {
            page,
            size,
            ...query,
          },
        })
        .then((res) => {
          if (res.success) {
            this.data = res.obj.rows
            this.pagination.total = res.obj.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
          }
          else {
            message.error(res.msg || res.message)
          }
          this.loading = false
        })
    },
    showModal() {
      this.getData()
      this.visible = true
    },
    handleSubmit() {
      this.callback(this.selectedRows)
      this.cancelModal()
    },
    cancelModal() {
      this.visible = false
      this.selectedRowKeys = []
      this.selectedRows = []
      this.page = 1
      this.size = 10
      this.queryParam = ''
      this.query = {}
    },
    // 搜索
    search() {
      const data = {}
      data.queryParam = this.queryParam.trim()
      this.query = data
      this.getData(true)
    },
  },
}
</script>

<style></style>
