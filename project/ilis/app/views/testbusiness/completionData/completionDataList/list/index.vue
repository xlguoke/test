<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div>
      <div style="padding: 10px 0">
        <a-input
          v-model:value="query"
          placeholder="输入工程项目名称或项目编号回车即可查询"
          class="contractTestReport-search-all !w-[300px]"
          @press-enter="searchFun"
        />
        <a-button @click="searchFun">
          查询
        </a-button>
      </div>

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
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div class="table-handle">
              <a href="#" @click="(e) => viewLog(e, record)">打开</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <Logs ref="Logs" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Logs from '~/providers/components/logs.vue'

const columns = [
  {
    title: '工程项目名称',
    dataIndex: 'name',
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
  },
  {
    title: '已签发数量',
    dataIndex: 'signed',
  },
  {
    title: '已上报数量',
    dataIndex: 'reported',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Logs,
  },
  data() {
    return {
      dayjs,
      dataSource: [],
      columns,
      loading: false,
      query: '',
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
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    searchFun() {
      this.queryParam = {
        query: this.query,
      }
      this.getData(true)
    },
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      this.selectedRowKeys = []
      this.selectedRows = []
      const { page, size } = this
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.completionDataList.list,
        method: 'get',
        params,
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data.rows
          this.pagination.total = res.data.count || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.dataSource = []
        }
        this.loading = false
      })
    },
    // 打开
    viewLog(e, data) {
      e.stopPropagation()
      e.preventDefault()

      top.addTabs
      && top.addTabs({
        id: data.id,
        title: '上报详情',
        close: false,
        // "url": `itemController.do?goTab&id=${data.id}&status=${data.isCompleted || 0}&name=${data.name ? encodeURI(data.name) : ""}&description=${data.description ? encodeURI(data.description) : ""}`
        url: `documentsReportController/goCompletionDataDetail.do?&id=${data.id}`,
      })
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
@import './index.less';
</style>
