<template>
  <div>
    <a-spin :spinning="loading">
      <DataQueryForm @query="queryData" />
      <a-table
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        :row-class-name="rowClassName"
        :pagination="pagination"
        @change="changeTable"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'costsCount'">
            发送条数
            <a-tooltip placement="bottom">
              <template #title>
                普通短信70字/条，长短信64字/条
              </template>
              <QuestionCircleOutlined
                style="color: var(--colorPrimary); font-size: 12px; cursor: pointer"
              />
            </a-tooltip>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="showDetail(record)">
              详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-spin>

    <ht-modal
      v-model:open="visible"
      title="发送详情"
      :mask-closable="false"
      :keyboard="false"
      width="600px"
    >
      <div style="padding: 0 10px; max-height: 70vh; overflow-y: auto">
        <a-row>
          <a-col :span="6">
            手机号码：
          </a-col>
          <a-col :span="18">
            {{ detailObj.phone || '-' }}
          </a-col>
          <a-col :span="6">
            短信内容：
          </a-col>
          <a-col :span="18">
            {{ detailObj.content || '-' }}
          </a-col>
          <a-col :span="6">
            字数：
          </a-col>
          <a-col :span="18">
            {{ detailObj.wordCount || 0 }}
          </a-col>
          <a-col :span="6">
            发送条数：
          </a-col>
          <a-col :span="18">
            {{ detailObj.costsCount || 0 }}
          </a-col>
          <a-col :span="6">
            发送时间：
          </a-col>
          <a-col :span="18">
            {{
              detailObj.sendTime
                ? dayjs(detailObj.sendTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
            }}
          </a-col>
          <a-col :span="6">
            发送状态：
          </a-col>
          <a-col :span="18">
            {{
              statusTxt[detailObj.status] || '发送失败'
            }}
          </a-col>
          <a-col :span="6">
            失败原因：
          </a-col>
          <a-col :span="18">
            {{ detailObj.failReason || '-' }}
          </a-col>
          <a-col :span="6">
            是否被发送量统计：
          </a-col>
          <a-col :span="18">
            {{ detailObj.payed ? '是' : '否' }}
          </a-col>
        </a-row>
      </div>
      <template #footer>
        <div class="clearfix">
          <a-button class="clearfix" @click="visible = false">
            关闭
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import DataQueryForm from './DataQueryForm.vue'

const statusTxt = {
  SUCCESS: '发送成功',
  FAIL: '发送失败',
}
const columns = [
  {
    title: '手机号码',
    dataIndex: 'phone',
    width: '10%',
  },
  {
    title: '发送时间',
    dataIndex: 'sendTime',
    sorter: true,
    customRender: ({ text }) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    width: '14%',
  },
  {
    title: '短信内容',
    dataIndex: 'content',
    ellipsis: true,
  },
  {
    title: '字数',
    dataIndex: 'wordCount',
    width: 60,
  },
  {
    dataIndex: 'costsCount',
    width: 100,
    slots: { title: 'costsCount' },
  },
  {
    title: '发送状态',
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => statusTxt[text],
  },
  {
    title: '失败原因',
    dataIndex: 'failReason',
    width: '15%',
    ellipsis: true,
  },
  {
    title: '是否被发送量统计',
    dataIndex: 'payed',
    width: 120,
    customRender: ({ text }) => (text ? '是' : '否'),
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 70,
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    DataQueryForm,
    QuestionCircleOutlined,
  },
  data() {
    return {
      loading: false,
      statusTxt,
      dayjs,
      columns,
      tableData: [],
      query: {},
      sortOrder: {},
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
      detailObj: {},
      visible: false,
    }
  },
  methods: {
    rowClassName(record, index) {
      return index % 2 === 1 ? 'dark-row' : 'light-row'
    },
    queryData(param) {
      this.pagination.current = 1
      this.query = param || {}
      this.getData()
    },
    getData() {
      this.loading = true
      window.$oAjax
        .get('/rest/sms/history/pagination', {
          params: {
            ...this.query,
            ...this.sortOrder,
            page: this.pagination.current,
            size: this.pagination.pageSize,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            window.$oErrorAlert(res.message)
            return
          }

          this.tableData = res.data.rows || []
          this.pagination.total = res.data.count
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    // 修改排序
    changeTable(pagination, filters, sorter) {
      if (!sorter.field)
        return
      let order = ''
      switch (sorter.order) {
        case 'ascend':
          order = 'asc'
          break
        case 'descend':
          order = 'desc'
          break
        default:
          order = ''
          break
      }
      this.sortOrder = {
        order,
        orderBy: order ? sorter.field : '',
      }
      this.getData()
    },
    showDetail(row) {
      this.visible = true
      this.detailObj = row
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-table-body) {
  min-height: 196px;
}
:deep(.ant-table-placeholder) {
  position: absolute;
  top: 39px;
  left: 0;
  right: 0;
}
.ant-col-6 {
  padding-right: 8px;
  text-align: right;
  color: #aaa;
  line-height: 24px;
}
.ant-col-18 {
  padding: 4px 0;
  min-height: 24px;
  line-height: 16px;
}
</style>
