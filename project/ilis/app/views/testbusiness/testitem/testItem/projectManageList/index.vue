<template>
  <div class="projectManageList">
    <div v-if="searchType == 1" class="projectManageList-search">
      <a-input v-model:value="projectName" placeholder="请输入项目名称" />
      <a-button type="primary" @click="search">
        查询
      </a-button>
      <a-button @click="reset">
        重置
      </a-button>
      <a-button @click="tabSearchType(2)">
        切换高级查询
      </a-button>
    </div>
    <div v-else-if="searchType == 2">
      <div class="projectManageList-input">
        <label>名称：</label>
        <a-input
          v-model:value="query.projectName"
          placeholder="请输入项目名称"
        ></a-input>
      </div>
      <div class="projectManageList-input">
        <label>项目编号：</label>
        <a-input
          v-model:value="query.projectCode"
          placeholder="请输入项目编号"
        ></a-input>
      </div>
      <div class="projectManageList-input">
        <label>状态：</label>
        <a-select
          v-model:value="query.projectStatus"
          allow-clear
          placeholder="请选择状态"
        >
          <a-select-option :value="1">
            已结束
          </a-select-option>
          <a-select-option :value="0">
            检测中
          </a-select-option>
        </a-select>
      </div>
      <div class="projectManageList-input">
        <label>创建人：</label>
        <a-input
          v-model:value="query.founder"
          placeholder="请输入创建人"
        ></a-input>
      </div>
      <div class="projectManageList-input">
        <label>创建时间：</label>
        <a-range-picker v-model:value="query.createTime" />
      </div>
      <div class="projectManageList-input">
        <label>所属部门：</label>
        <a-tree-select
          v-model:value="query.departmentId"
          :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
          placeholder="请选择所属部门"
          allow-clear
          :tree-data="departmentData"
          tree-default-expand-all
          show-search
        />
      </div>
      <a-button type="primary" @click="search">
        查询
      </a-button>
      <a-button @click="reset">
        重置
      </a-button>
      <a-button @click="tabSearchType(1)">
        切换普通查询
      </a-button>
    </div>
    <div class="projectManageList-btn">
      <a-button
        v-permission="'addSyntesisProject'"

        type="primary"
        @click="showModal"
      >
        新增
      </a-button>
      <a-button
        v-permission="'deleteSyntesisProject'"

        @click="deleteData"
      >
        删除
      </a-button>
      <a-button
        v-permission="'complete:project'"

        @click="closeServer"
      >
        结束服务
      </a-button>
      <a-button
        v-permission="'recover:project'"

        @click="recoverServer"
      >
        恢复服务
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      :custom-row="customRow"
      :row-class-name="rowClassName"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'percent'">
          <div class="projectManageList-percent">
            <div
              :class="`projectManageList-percent-bar ${
                text == 100 ? 'active' : ''
              }`"
              :style="`width:${text}%`"
            ></div>
          </div>
          <span v-if="(text || 0) < 100" style="vertical-align: middle">{{
            `${text || 0}%`
          }}</span>
          <span v-else style="vertical-align: middle">
            <CheckCircleOutlined />
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              v-if="record.isCompleted != 1"
              v-permission="'editSynthesisProject'"
              @click="(e) => editModal(e, record)"
            >编辑</a>
            <a @click="(e) => openTab(e, record)">打开</a>
          </span>
        </template>
      </template>
    </a-table>
    <AddModal ref="AddModal" :is-add="isAdd" :callback="search" />
  </div>
</template>

<script>
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import AddModal from './components/addModal.vue'

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    sorter: true,
    width: '16%',
  },
  {
    title: '项目编号',
    dataIndex: 'projectCode',
    sorter: true,
    width: '10%',
  },
  {
    title: '状态',
    dataIndex: 'isCompleted',
    width: '8%',
    sorter: true,
    customRender({ text }) {
      return text == 1 ? '已结束' : '检测中'
    },
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    width: '8%',
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    sorter: true,
    width: '8%',
  },
  {
    title: '进度',
    dataIndex: 'percent',
    width: '15%',
    scopedSlots: { customRender: 'percent' },
  },
  {
    title: '所属部门',
    dataIndex: 'departNames',
    width: '10%',
  },
  {
    title: '任务总数',
    dataIndex: 'taskCount',
    width: '8%',
  },
  {
    title: '未签发',
    dataIndex: 'unsignedCount',
    width: '6%',
  },
  {
    title: '已签发',
    dataIndex: 'signedCount',
    width: '6%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddModal,
    CheckCircleOutlined,
  },
  data() {
    return {
      data: [],
      sortParams: {},
      searchType: 1,
      query: {},
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      isAdd: true,
      page: 1,
      size: 10,
      projectName: '',
      loading: false,
      departmentData: [],
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
  created() {
    this.getLaboratoryData()
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        if (res && res.length > 0) {
          res.shift()
          this.departmentData = this.formatDepartmentData(res)
        }
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    // 切换查询类型 高级查询2 普通查询1
    tabSearchType(searchType) {
      if (searchType == 1) {
        this.query = {}
      }
      else if (searchType == 2) {
        this.projectName = ''
      }
      this.searchType = searchType
    },
    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.getData()
    },
    reset() {
      this.projectName = ''
      this.query = {}
      this.page = 1
      this.getData()
    },
    getData() {
      const { page, size, projectName } = this
      this.loading = true

      let params = {
        page,
        size,
        ...this.sortParams,
      }
      if (this.searchType === 2) {
        params = {
          ...params,
          ...this.query,
        }
        if (params.createTime && params.createTime[0] && params.createTime[1]) {
          const startUnix = dayjs(params.createTime[0]).startOf('day').valueOf()
          const endUnix = dayjs(params.createTime[1]).endOf('day').valueOf()
          params.createTime = `${startUnix},${endUnix}`
        }
      }
      else {
        params = {
          ...params,
          projectName,
        }
      }

      window.$oRest.get(window.$oApi.testItem.list, { params }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        }
      })
    },
    // 新增弹窗
    showModal() {
      this.isAdd = true
      this.$refs.AddModal.showModal()
    },
    // 编辑弹窗
    editModal(e, data) {
      e.stopPropagation()
      e.preventDefault()
      this.isAdd = false
      this.$refs.AddModal.showModal(data)
    },
    // 删除
    deleteData() {
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要删除的项目'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除 ${this.selectedRows[0].name} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .post(
              window.$oApi.testItem.deleteProject,
              qs.stringify({ id: this.selectedRowKeys[0] }),
            )
            .then((res) => {
              if (res && res.success) {
                window.$oAntdMessage.success(res.msg)
                this.selectedRowKeys = []
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
    recoverServer() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要恢复服务的项目'))
        return
      }
      if (
        !this.selectedRows[0].isCompleted
        || this.selectedRows[0].isCompleted === 0
      ) {
        window.$oAntdModal.warning(window.$oMsgTips.info('当前项目尚未结束服务'))
        return
      }
      window.$oAntdConfirm({
        title: '恢复服务',
        content: `确认恢复 ${this.selectedRows[0].name} 服务吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const data = this.selectedRows[0]
          data.isCompleted = 0

          window.$oRest
            .put(
              `${window.$oApi.testItem.recoverProject}/${this.selectedRows[0].id}`,
              qs.stringify(data),
            )
            .then((res) => {
              window.$oAntdMessage.success(res.message)
              this.getData()
            })
        },
      })
    },
    // 结束服务
    closeServer() {
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要结束服务的项目'))
        return
      }

      if (this.selectedRows[0].isCompleted === 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('当前项目已结束服务'))
        return
      }

      window.$oAntdConfirm({
        title: '结束服务',
        content: `确认结束 ${this.selectedRows[0].name} 服务吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          const data = this.selectedRows[0]
          data.isCompleted = 1

          window.$oRest
            .put(
              `${window.$oApi.testItem.completeProject}/${this.selectedRows[0].id}`,
              qs.stringify(data),
            )
            .then((res) => {
              window.$oAntdMessage.success(res.message)
              this.getData()
            })
        },
      })
    },
    // 打开tab
    openTab(e, data) {
      e.stopPropagation()
      e.preventDefault()
      const newName = data.name
        ? encodeURI(data.name.replace(/#/g, '_jinghao'))
        : ''
      const newDescription = data.description
        ? encodeURI(data.description.replace(/#/g, '_jinghao'))
        : ''

      top.addTabs && top.addTabs({
        id: data.id,
        title: '项目检测详情',
        close: false,
        // "url": `itemController.do?goTab&id=${data.id}&status=${data.isCompleted || 0}&name=${data.name ? encodeURI(data.name) : ""}&description=${data.description ? encodeURI(data.description) : ""}`
        url: `itemController.do?goTab&id=${data.id}&status=${
          data.isCompleted || 0
        }&name=${newName}&description=${newDescription}`,
      })
    },
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
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style lang="less" scoped>
.projectManageList {
  .projectManageList-input {
    display: flex;
    margin-bottom: 8px;

    label {
      width: 100px;
      text-align: right;
      display: block;
      padding-right: 8px;
      line-height: 28px;
      font-size: 12px;
    }

    .ant-calendar-picker,
    .ant-select,
    .ant-input {
      width: 340px;
    }
  }
}
</style>
