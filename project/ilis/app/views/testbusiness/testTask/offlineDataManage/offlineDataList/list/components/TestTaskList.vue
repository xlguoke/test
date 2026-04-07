<template>
  <ht-modal
    v-model:open="visible"
    width="80%"
    :mask-closable="false"
    :keyboard="false"
    title="选择试验任务"
    @ok="okBtn"
  >
    <a-spin :spinning="loading" style="min-height: 300px">
      <a-form layout="inline" class="search-form">
        <a-form-item>
          <QueryInput
            v-model:value="searchForm.projectName"
            :api-url="api.common.project"
            q-key="quickQryParam"
            placeholder="请输入项目名称"
            @press-enter="
              (d) => {
                projectId = d.id
                search()
              }
            "
          />
        </a-form-item>
        <a-form-item>
          <QueryInput
            v-model:value="searchForm.projectUnitName"
            :api-url="`/rest/synthesis/contracts?projectId=${projectId}`"
            q-local
            label="contractPartName"
            placeholder="请输入工程划分"
            @press-enter="search"
          />
        </a-form-item>
        <a-form-item>
          <a-select
            v-model:value="searchForm.testUserId"
            allow-clear
            placeholder="请选择检测人员"
          >
            <a-select-option v-for="(k, v) in uploadUsers" :key="v" :value="v">
              {{ k }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="searchForm.q"
            allow-clear
            placeholder="请输入任务编号、样品名称或检测参数"
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
        row-key="testTaskId"
        bordered
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        :row-selection="rowSelection"
        :custom-row="customRow"
        :scroll="{ y: tableHeight }"
      ></a-table>
    </a-spin>
  </ht-modal>
</template>

<script>
import QueryInput from '~/providers/components/queryInput/index.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  { title: '任务编号', dataIndex: 'testTaskCode' },
  { title: '记录编号', dataIndex: 'testRecordCode' },
  { title: '项目名称', dataIndex: 'projectName' },
  { title: '工程划分', dataIndex: 'unitProjectName' },
  { title: '样品名称', dataIndex: 'sampleDisplayName' },
  { title: '检测参数', dataIndex: 'paramsName' },
  { title: '检测人员', dataIndex: 'testUserName' },
]

export default {
  components: { QueryInput },
  emits: ['ok'],
  data() {
    return {
      visible: false,
      loading: false,
      tableHeight: 300,
      projectId: '',
      searchForm: {},
      data: [],
      columns,
      uploadUsers: {},
      selectedRowKeys: [],
      selectedRows: [],
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
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys[0] = record.testTaskId
            this.selectedRows[0] = record
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
    api() {
      return window.$oApi
    },
  },
  mounted() {
    this.tableHeight
      = (document.body.clientHeight || document.documentElement.clientHeight)
        - 500
  },
  methods: {
    showModal() {
      this.visible = true
      this.getData()
      this.getUploadUser()
    },
    getData() {
      const { current, pageSize } = this.pagination
      this.loading = true
      this.selectedRowKeys = []
      this.selectedRows = []
      window.$oAjax({
        url: window.$oApi.offlineDataManage.testTaskList,
        method: 'GET',
        params: {
          page: current,
          size: pageSize,
          ...this.searchForm,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.loading = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg))
          this.loading = false
        }
      })
    },
    getUploadUser() {
      window.$oAjax({
        url: window.$oApi.offlineDataManage.uploadUser,
        method: 'GET',
        params: {
          status: '10',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.uploadUsers = res.data || {}
        }
      })
    },
    // 搜索
    search() {
      this.pagination.current = 1
      this.getData()
    },
    // 重置
    resetForm() {
      this.pagination.current = 1
      this.searchForm = {}
      this.getData()
    },
    okBtn() {
      if (this.selectedRowKeys.length === 0) {
        return window.$oAntdMessage.warning('请选择数据')
      }
      this.visible = false
      $emit(this, 'ok', this.selectedRows)
    },
  },
}
</script>

<style lang="less" scoped>
.search-form {
  .ant-form-item {
    margin-bottom: 8px;
    margin-right: 5px;
  }

  :deep(.ant-calendar-picker) {
    width: 220px;
  }

  :deep(.ant-select) {
    width: 200px;
  }

  .ant-input-affix-wrapper {
    width: 260px;
  }

  .ant-btn {
    margin-right: 10px;
  }
}
</style>
