<template>
  <a-spin :spinning="loading">
    <a-form layout="inline" class="search-form">
      <a-form-item>
        <a-range-picker v-model:value="searchForm.errorTime" />
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value="searchForm.q"
          allow-clear
          placeholder="请输入用户描述或上报人后回车查询"
          @press-enter="search"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="search">
          查询
        </a-button>
        <a-button @click="resetForm">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <a-table
      row-key="id"
      bordered
      :columns="columns"
      :data-source="data"
      :row-class-name="rowClassName"
      :pagination="pagination"
      :scroll="{ y: tableHeight }"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'errorTime'">
          {{ text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '' }}
        </template>

        <template v-if="column.dataIndex === 'uploadTime'">
          {{ text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '' }}
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <a-button type="link" @click.stop="downloadLog(record)">
            下载
          </a-button>
        </template>
      </template>
    </a-table>
  </a-spin>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

const columns = [
  {
    title: '错误/异常时间',
    dataIndex: 'errorTime',
    sorter: true,
    width: 150,
  },
  {
    title: '错误类型',
    dataIndex: 'type',
  },
  {
    title: '用户描述',
    dataIndex: 'description',
  },
  {
    title: 'IMEI',
    dataIndex: 'imei',
  },
  {
    title: '上报人',
    width: 110,
    dataIndex: 'uploadUserName',
  },
  {
    title: '上报时间',
    dataIndex: 'uploadTime',
    sorter: true,
    width: 150,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    width: 120,
  },
]

export default {
  data() {
    return {
      data: [],
      tableHeight: 300,
      searchForm: {},
      sortParams: {},
      columns,
      loading: false,
      page: '',
      formatTime,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.pagination.current = page
          this.pagination.pageSize = size
          this.getData()
        },
      },
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    this.initTableHeight()
    window.onresize = () => {
      this.initTableHeight()
    }
  },
  methods: {
    initTableHeight() {
      this.tableHeight = document.body.clientHeight - 160
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 排序
    sorterChange(pagination, filters, sorter) {
      if (sorter.order) {
        this.sortParams = {
          orderBy: sorter.field,
          asc: sorter.order == 'ascend',
        }
      }
      else {
        this.sortParams = {}
      }
      this.getData()
    },
    getData() {
      const { current, pageSize } = this.pagination
      const form = { ...this.searchForm, seeAll: this.seeAll }
      if (form.errorTime && form.errorTime.length > 0) {
        form.errorTimeStart
          = `${formatTime(form.errorTime[0], 'YYYY-MM-DD')} 00:00:00`
        form.errorTimeEnd
          = `${formatTime(form.errorTime[1], 'YYYY-MM-DD')} 23:59:59`
        delete form.errorTime
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.offlineDataManage.offlineLog,
        method: 'GET',
        params: {
          page: current,
          size: pageSize,
          ...form,
          ...this.sortParams,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message))
            this.loading = false
          }
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdModal.warning(window.$oMsgTips.info(err.message))
        })
    },
    // 搜索
    search() {
      this.pagination.current = 1
      this.getData()
    },
    resetForm() {
      this.pagination.current = 1
      this.searchForm = {}
      if (this.page === 'testTaskDetail') {
        this.searchForm.status = '10'
      }
      this.getData()
    },
    downloadLog(row) {
      window.open(
        `/ilis2${window.$oApi.offlineDataManage.downloadLog}&accessoryId=${row.errorLogAttachmentId}`,
        '_blank',
      )
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
