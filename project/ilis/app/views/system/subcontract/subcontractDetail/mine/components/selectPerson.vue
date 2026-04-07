<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择人员"
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
        placeholder="请输入人员姓名"
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
        { title: '姓名', dataIndex: 'personName', width: '10%' },
        { title: '部门', dataIndex: 'department', width: '15%' },
        { title: '职称', dataIndex: 'jobTitle', width: '15%' },
        { title: '人员状态', dataIndex: 'personStatus', width: '15%' },
        { title: '专业', dataIndex: 'education', width: '15%' },
        { title: '持证专业', dataIndex: 'profession', width: '15%' },
        { title: '被引用次数（中标）', dataIndex: 'winQuoteNum', width: '15%' },
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
        .get(window.$oApi.biddingPerson.list, {
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
