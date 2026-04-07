<template>
  <div class="weChatNotice">
    <div class="weChatNotice-search">
      <a-space>
        <a-select
          v-model:value="selState"
          style="width: 120px; vertical-align: middle"
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
      </a-space>
    </div>

    <div style="margin-bottom: 10px">
      <a-button @click="markRead()">
        标记为已读
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :row-class-name="rowClassName"
      :loading="loading"
      row-key="id"
      :row-selection="rowSelection"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'content'">
          <span v-if="record.beenRead === '0'" style="font-weight: 900">
            {{ record.content }}
          </span>
          <span v-else>
            {{ record.content }}
          </span>
        </template>

        <template v-if="column.dataIndex === 'beenRead'">
          <span v-if="record.beenRead === '0'">
            <span class="mark_no"></span>未读
          </span>
          <span v-else> <span class="mark_yes"></span> 已读 </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              href="javascript:;"
              style="font-size: 12px"
              @click="viewDetail(record)"
            >
              查看
            </a>
            <a
              v-if="record.beenRead === '0'"
              href="javascript:;"
              style="font-size: 12px"
              @click="markRead([record])"
            >
              标记为已读
            </a>
          </span>
        </template>
      </template>
    </a-table>
    <Detail ref="Detail" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Detail from './components/detail.vue'

const columns = [
  {
    title: '通知时间',
    dataIndex: 'createTime',
    width: '20%',
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: '20%',
  },
  {
    title: '内容',
    dataIndex: 'content',
    width: '40%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '消息状态',
    dataIndex: 'beenRead',
    width: '10%',
    scopedSlots: { customRender: 'beenRead' },
    // customRender: ({ text }) => {
    //   return text === '0' ? '否' : '是'
    // }
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
    Detail,
  },
  data() {
    return {
      selState: '',
      data: [],
      columns,
      page: 1,
      size: 10,
      time: null,
      loading: false,
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
      dayjs,
      query: {},
      sort: 'beenRead',
      order: 'desc',

      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
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
    handleChange() {
      this.page = 1
      this.getData()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { page, size, query, selState } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.weChatNotice.list, {
          params: {
            page,
            size,
            beenRead: selState,
            ...query,
            orderBy: this.sort,
            order: this.order,
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
        })
    },
    viewDetail(record) {
      this.$refs.Detail.showModal(record.id)
      if (record.beenRead == '0') {
        this.setRead(record)
      }
    },
    markRead(arr = this.selectedRows) {
      if (arr.length == 0) {
        return window.$oAntdMessage.warning('请选择要标记已读的消息')
      }
      const ids = arr
        .map((it) => {
          return it.id
        })
        .join(',')

      this.loading = true
      window.$oAjax
        .get(window.$oApi.weChatNotice.markRead, {
          params: {
            msgId: ids,
          },
        })
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
          msgDateStart: dayjs(this.time[0]).format('YYYY-MM-DD HH:mm:ss'),
          msgDateEnd: dayjs(this.time[1]).format('YYYY-MM-DD HH:mm:ss'),
        }
        this.getData()
      }
      else {
        this.query = {}
        this.getData()
      }
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        this.sort = 'beenRead'
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
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
