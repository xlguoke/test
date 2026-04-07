<template>
  <div>
    <div>
      <div>
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
      <div style="padding: 10px 0">
        <!--        <a-button type="primary" @click="systemConfig">系统配置</a-button> -->
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
              <a @click="(e) => addEditRow(e, record.id)">配置</a>
              <a @click="(e) => deleteRow(e, record)">删除</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <!--     <SysConfigList ref="SysConfigList" :callback="getData" /> -->
    <ConfigRow ref="ConfigRow" :callback="getData" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ConfigRow from './components/configRow.vue'
import SysConfigList from './components/sysConfigList.vue'

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
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    SysConfigList,
    ConfigRow,
  },
  data() {
    return {
      dayjs,
      dataSource: [],
      columns,
      loading: false,
      query: '',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
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
        url: window.$oApi.completionDataConfig.projectsList,
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
    deleteRow(e, record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'DELETE',
            url: `${window.$oApi.completionDataConfig.delProjectProfile}/${record.id}`,
            // params: {id: record.id},
          }).then((res) => {
            if (res.success) {
              this.page = 1
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        },
      })
    },
    systemConfig() {
      this.$refs.SysConfigList.showModal(true)
    },
    addEditRow(e, recordId) {
      this.$refs.ConfigRow.showModal(recordId)
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
