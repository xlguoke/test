<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="publist-box">
    <div>
      <div class="publist-box-search">
        <a-select
          v-model:value="isRead"
          style="width: 120px; vertical-align: middle"
          allow-clear
          @change="handleChange"
        >
          <a-select-option value="">
            全部
          </a-select-option>
          <a-select-option value="1">
            已读
          </a-select-option>
          <a-select-option value="0">
            未读
          </a-select-option>
        </a-select>
        <a-range-picker
          v-model:value="time"
          format="YYYY-MM-DD HH:mm:ss"
          style="width: 400px; vertical-align: middle"
          :show-time="{
            defaultValue: [
              dayjs('00:00:00', 'HH:mm:ss'),
              dayjs('23:59:59', 'HH:mm:ss'),
            ],
          }"
        />
        <a-button type="primary" @click="search">
          查询
        </a-button>
      </div>
      <div style="margin: 10px 0">
        <a-button
          :disabled="!(selectedRows && selectedRows.length)"
          @click="markRead()"
        >
          <PaperClipOutlined style="font-size: 18px" />
          标记为已读
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="data"
        bordered
        :scroll="{ y: tableHeight }"
        :pagination="{
          total,
          pageSize: rows,
          current: page,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) =>
            `${page == 1 ? 1 : (page - 1) * (rows + 1)}-${
              rows * page < total ? rows * page : total
            } 共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
          change: changePagination,
        }"
        :loading="loading"
        row-key="id"
        :row-selection="rowSelection"
        class="publist-box-table"
        @change="sorterChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'createTime'">
            <span>
              {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
            </span>
          </template>

          <template v-if="column.dataIndex === 'noticeTitle'">
            <div>
              <span :class="record.isRead == '0' ? 'fontWeight' : ''">{{
                record.noticeTitle
              }}</span>
            </div>
          </template>

          <template v-if="column.dataIndex === 'isRead'">
            <span v-if="record.isRead == '0'">
              <span class="mark_no"></span>未读
            </span>
            <span v-else-if="record.isRead == '1'">
              <span class="mark_yes"></span> 已读
            </span>
            <span v-else>
              <span>--</span>
            </span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a
                href="javascript:;"
                title="查看"
                @click="viewDetail(record, index)"
              >
                查看
              </a>
              <a
                v-if="record.isRead !== '1'"
                href="javascript:;"
                @click="markRead([record])"
              >
                标记为已读
              </a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <ht-modal
      title="通知公告详情"
      :open="visible"
      width="90%"
      @cancel="visible = false"
    >
      <template #footer>
        <div class="clearfix">
          <a-button @click="visible = false">
            关闭
          </a-button>
        </div>
      </template>
      <Model
        :id="detailId"
        ref="model"
        :key="detailId"
        style="height: calc(100vh - 280px); overflow-y: auto"
      ></Model>
    </ht-modal>
  </div>
</template>

<script>
import { PaperClipOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import {
  getList,
  noticeControllermarkRead,
  updateNoticeRead,
} from '../api/list'
import Model from './model.vue'

const columns = [
  {
    title: '公告时间',
    dataIndex: 'createTime',
    sorter: true,
    scopedSlots: { customRender: 'createTime' },
  },
  {
    title: '公告标题',
    sorter: true,
    dataIndex: 'noticeTitle',
    scopedSlots: { customRender: 'noticeTitle' },
  },
  {
    title: '消息状态',
    dataIndex: 'isRead',
    sorter: true,
    scopedSlots: { customRender: 'isRead' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    Model,
    PaperClipOutlined,
  },
  data() {
    return {
      isRead: '',
      data: [],
      columns,
      page: 1,
      rows: 10,
      time: null,
      loading: false,
      visible: false,
      detailId: '',
      dayjs,
      query: {},
      sort: '',
      order: 'desc',
      selectedRowKeys: [],
      selectedRows: [],
      total: 0,
      tableHeight: 300,
    }
  },
  computed: {
    rowSelection() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          that.selectedRowKeys = selectedRowKeys
          that.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
  },
  mounted() {
    this.tableHeight
      = (document.body.clientHeight || document.documentElement.clientHeight)
        - 200
  },
  methods: {
    handleChange() {
      this.page = 1
      this.getData()
    },
    async getData() {
      this.loading = true
      const { page, rows, isRead, query, sort, order } = this
      try {
        const result = await getList({
          page,
          rows,
          isRead,
          sort,
          order,
          ...query,
        })
        if (result && result.rows) {
          this.data = result.rows || []
          this.total = result.total || 0
        }
      }
      finally {
        this.loading = false
      }
    },
    async viewDetail(record) {
      if (record.isRead != '1') {
        updateNoticeRead(record.id)
      }
      const isLayer = getQueryVariable('isLayer')
      if (isLayer === '1') {
        // 列表在layer中打开，详情也使用layer打开

        window.parent.InitObj
        && window.parent.InitObj.noticeShow(record.id, record.isRead)
      }
      else {
        this.detailId = record.id
        this.visible = true
      }
    },
    singleMarkRead(record) {
      const ids = [record.id]
      this.handleIsRead(ids)
    },
    handleIsRead(ids) {
      this.loading = true
      noticeControllermarkRead(ids)
        .then((res) => {
          this.selectedRowKeys = []
          this.selectedRows = []
          if (res.code === 20000) {
            this.loading = false
            window.$oAntdMessage.success('操作成功')
            this.getData()
          }
          else {
            window.$oAntdMessage.warning('操作失败')
          }
        })
        .catch(() => {
          window.$oAntdMessage.warning('操作失败')
          this.loading = false
        })
    },
    markRead(arr = this.selectedRows) {
      if (arr.length == 0) {
        return window.$oAntdMessage.warning('请选择要标记已读的消息')
      }
      const ids = arr.map((it) => {
        return it.id
      })
      this.handleIsRead(ids)
    },
    // 设为已读
    setRead(record) {
      window.$oAjax
        .get(window.$oApi.weChatNotice.markRead, {
          params: {
            msgId: record.id,
          },
        })
        .then(() => {
          this.getData()
        })
    },
    search() {
      if (this.time && Array.isArray(this.time) && this.time.length > 0) {
        this.page = 1
        this.query = {
          createTimeStart: dayjs(this.time[0]).format('YYYY-MM-DD HH:mm:ss'),
          createTimeEnd: dayjs(this.time[1]).format('YYYY-MM-DD HH:mm:ss'),
        }
        this.getData()
      }
      else {
        this.query = {}
        this.getData()
      }
    },
    // 修改分页
    changePagination(page, pageSize) {
      this.page = page
      this.rows = pageSize
    },
    // 排序
    sorterChange(pagination, filters, sorter) {
      this.page = pagination.current
      this.rows = pagination.pageSize
      if (sorter && Object.keys(sorter).length) {
        this.sort = sorter.field
        if (sorter.order === 'descend') {
          this.order = 'desc'
        }
        else if (sorter.order === 'ascend') {
          this.order = 'asc'
        }
        else {
          this.order = ''
          this.sort = ''
        }
        this.search()
      }
      else {
        this.getData()
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
