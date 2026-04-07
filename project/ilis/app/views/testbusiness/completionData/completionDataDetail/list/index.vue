<template>
  <div class="testReport">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="testReport-left">
          <TreeComponent
            :tree-select="treeSelect"
            @set-tree-report="setTreeReport"
          />
        </div>
        <div class="testReport-right">
          <div class="testReport-search">
            <a-input
              v-model:value="searchText"
              placeholder="输入编号或样品名称后回车即可查询"
              class="testReport-search-all"
              @press-enter="getData(true)"
            />
            <a-button @click="getData(true)">
              查询
            </a-button>
            <a-button type="primary" @click="setBatchReport()">
              上报
            </a-button>
          </div>
          <a-table
            :row-selection="rowSelection"
            :custom-row="customRow"
            :columns="columns"
            :pagination="pagination"
            :data-source="data"
            :loading="loading"
            bordered
            row-key="id"
            :row-class-name="rowClassName"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'reported'">
                <a-spin v-if="record.reporting" size="small" />
                <span v-else>{{ text === 1 ? '√' : '×' }}</span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button size="small" @click="handleTaskLog(record)">
                  上报日志
                </a-button>
              </template>
            </template>
          </a-table>
          <Logs ref="Logs" />
          <ht-modal
            title="上报情况"
            centered
            :open="visible"
            :mask-closable="false"
            class="hitek-add-modal"
            width="600px"
            @cancel="handleCancel"
          >
            <div v-for="(item, index) of reportsArr" :key="index">
              <p style="line-height: 24px">
                {{ item }}
              </p>
            </div>
            <template #footer>
              <div>
                <a-button type="primary" @click="handleCancel">
                  确定
                </a-button>
                <div style="clear: both"></div>
              </div>
            </template>
          </ht-modal>
        </div>
      </div>
    </a-spin>
    <ht-modal v-model:open="responseVisible" title="上报结果">
      <template #footer>
        <a-button
          key="submit"
          type="primary"
          @click="() => (responseVisible = false)"
        >
          确定
        </a-button>
        <div style="clear: both"></div>
      </template>
      <a-table :columns="reportResults" :data-source="reportsArr">
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'succeed'">
            <span>
              <a-tag :color="text ? 'green' : 'volcano'">
                {{ succeed ? '上报成功' : '上报失败' }}
              </a-tag>
            </span>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import Logs from './components/logs.vue'
import TreeComponent from './components/tree.vue'

// import Logs from "~/providers/components/logs.vue";

export default {
  components: {
    TreeComponent,
    Logs,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      data: [],
      rootUrl,
      spinning: false,
      columns: [
        {
          title: '任务编号',
          dataIndex: 'taskCode',
          fixed: 'left',
          width: 150,
        },
        {
          title: '报告编号',
          dataIndex: 'reportCode',
        },
        {
          title: '记录编号',
          dataIndex: 'recordCode',
        },
        {
          title: '样品名称',
          dataIndex: 'sampleName',
        },
        {
          title: '委托单位',
          dataIndex: 'consignUnitName',
        },
        {
          title: '是否已上报',
          dataIndex: 'reported',
          scopedSlots: { customRender: 'reported' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 70,
          align: 'center',
          key: 'x',
          fixed: 'right',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      searchText: '',
      loading: false,
      visible: false,
      page: 1,
      size: 10,
      selectedRowKeys: [],
      selectedRows: [],
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
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
      selectedId: '',
      selData: [],
      reportsArr: [],
      responseVisible: false,
      reportResults: [
        {
          title: '类型编码',
          dataIndex: 'objectName',
          width: 70,
          align: 'center',
        },
        {
          title: '是否成功',
          dataIndex: 'succeed',
          customRender: ({ text }) => {
            return text ? '√' : '×'
          },
        },
        {
          title: '上报结果',
          dataIndex: 'response',
        },
      ],
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        columnWidth: 40,
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
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(flag) {
      const { page, size } = this
      if (flag) {
        this.page = 1
      }
      const data = {
        query: this.searchText,
      }
      const params = {
        page,
        size,
        projectId: this.id,
        ...data,
      }
      params.belongsId = this.selectedId
      this.loading = true
      window.$oAjax
        .get(window.$oApi.completionDataDetail.list, {
          params,
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows.map((item, index) => ({
              id: index,
              ...item,
            }))
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    treeSelect(keys, data) {
      const { type, oid } = data.node.dataRef
      this.selData = data.node.dataRef
      if (data.selected) {
        if (type > 0) {
          this.selectedId = oid
        }
        else {
          this.selectedId = ''
        }
      }
      this.getData(true)
    },
    setTreeReport(record, single) {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.completionDataDetail.treeReport,
        method: 'POST',
        timeout: 60 * 10000,
        params: { unitProjectId: record.oid, single },
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res.code === 20000) {
            const succeed = res.data.every(l => l.succeed)
            if (succeed) {
              window.$oAntdMessage.success('上报成功')
            }
            else {
              this.reportsArr = res.data
              this.responseVisible = true
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || '上报失败'))
          }
          this.spinning = false
        })
        .catch((err) => {
          console.error(err)
          window.$oAntdModal.warning(window.$oMsgTips.info('上报失败，请联系管理员'))
          this.spinning = false
        })
    },
    handleSubmit() {
      this.$refs.SelTree.handleSubmit()
    },
    handleTaskLog(record) {
      this.$refs.Logs.showModal(record.reportId, record.taskCode)
    },
    async setBatchReport() {
      if (!this.selectedId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先在左侧选择具体上报的工程划分'))
        return
      }
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请勾选需要上报的数据'))
        return
      }
      const data = {
        unitProjectId: this.selectedId,
        projectId: this.id,
      }
      window.$oAntdMessage.info('正在上报，请稍候')
      for (const row of this.selectedRows) {
        data.reportId = row.reportId
        data.consignUnitId = row.consignUnitId
        data.consignUnitName = row.consignUnitName
        row.reporting = true
        const succeed = await this.reportDocument(data)
        row.reporting = false
        if (succeed) {
          row.reported = 1
        }
      }
    },
    async reportDocument(data) {
      let succeed = false
      try {
        const res = await window.$oAjax({
          url: window.$oApi.completionDataDetail.tableReport,
          method: 'POST',
          data,
          headers: { 'Content-Type': 'application/json' },
          // timeout: 120 * 1000
        })
        if (res.code === 20000) {
          succeed = true
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      }
      catch (e) {
        console.error(e)
      }
      return succeed
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.text_ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
}
.selTree :deep(.ant-modal-body) {
  height: 450px;
  overflow: hidden;
  overflow-y: auto;
}
@import './index.less';
</style>
