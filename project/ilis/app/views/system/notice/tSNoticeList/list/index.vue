<template>
  <div class="tSNoticeList-box">
    <!-- 操作类型的按钮 -->
    <div>
      <a-button type="primary" @click="add">
        新增
      </a-button>
      <a-button
        type="danger"
        :disabled="!(selectedRowKeys && selectedRowKeys.length)"
        @click="deleteMoreData"
      >
        批量删除
      </a-button>
    </div>
    <!-- 表格数据 -->
    <div class="table">
      <a-table
        :columns="columns"
        row-key="id"
        bordered
        :data-source="data"
        :row-selection="rowSelection"
        :loading="loading"
        :scroll="{ y: tableHeight }"
        :pagination="{
          total,
          pageSize: rows,
          current: page,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) =>
            `${page == 1 ? 1 : (page - 1) * rows + 1}-${
              rows * page < total ? rows * page : total
            } 共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: (p) => {
            page = p
            getData()
          },
          onShowSizeChange: (page, size) => {
            page = 1
            rows = size
            getData()
          },
        }"
        @change="sorterChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 类型名称 -->
          <template v-if="column.dataIndex === 'noticeType'">
            <div v-if="record.noticeType == '1'">
              通知
            </div>
            <div v-if="record.noticeType == '2'" type="link">
              公告
            </div>
          </template>

          <!-- 授权级别 -->
          <template v-if="column.dataIndex === 'noticeLevel'">
            <div v-if="record.noticeLevel == '1'">
              全员
            </div>
            <div v-if="record.noticeLevel == '2'" type="link">
              角色
            </div>
            <div v-if="record.noticeLevel == '3'" type="link">
              用户
            </div>
          </template>

          <template v-if="column.dataIndex === 'noticeTerm'">
            <div>
              {{ record.noticeTerm ? forMatTime(record.noticeTerm) : '' }}
            </div>
          </template>

          <template v-if="column.dataIndex === 'mustRead'">
            <div v-if="record.mustRead == 'false'">
              x
            </div>
            <div v-if="record.mustRead == 'true'">
              ✓
            </div>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <a-button type="link" @click="edit(record)">
              编辑
            </a-button>
            <a-button
              type="link"
              style="color: #ff4d4f"
              @click="handleDelete(record)"
            >
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </div>
    <AddUpdate v-if="isshow" ref="AddUpdateRef" @update="update"></AddUpdate>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { deleteData, getlist } from '../api/list'
import AddUpdate from './components/AddUpdate.vue'

const columns = [
  {
    title: '通知标题',
    dataIndex: 'noticeTitle',
    key: 'noticeTitle',
    sorter: true,
    align: 'center',
  },
  {
    title: '类型名称',
    dataIndex: 'noticeType',
    key: 'noticeType',
    align: 'center',
    sorter: true,
    scopedSlots: { customRender: 'noticeType' },
  },
  {
    title: '授权级别',
    dataIndex: 'noticeLevel',
    key: 'noticeLevel',
    align: 'center',
    sorter: true,
    scopedSlots: { customRender: 'noticeLevel' },
  },
  {
    title: '是否必读',
    dataIndex: 'mustRead',
    key: 'mustRead',
    align: 'center',
    sorter: true,
    scopedSlots: { customRender: 'mustRead' },
  },
  {
    title: '阅读期限',
    dataIndex: 'noticeTerm',
    key: 'noticeTerm',
    sorter: true,
    align: 'center',
    scopedSlots: { customRender: 'noticeTerm' },
  },
  {
    title: '操作 ',
    dataIndex: 'action',
    key: 'action',
    align: 'center',
    width: 120,
    scopedSlots: { customRender: 'action' },
  },
]

export default {
  components: {
    AddUpdate,
  },
  data() {
    return {
      selState: '',
      data: [],
      columns,
      page: 1,
      rows: 10,
      total: 0,
      sort: 'createTime',
      order: 'desc',
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      isshow: false,
      tableHeight: 300,
    }
  },
  computed: {
    rowSelection() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const { selectedRowKeys } = that
      return {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          that.selectedRowKeys = selectedRowKeys
          that.selectedRows = selectedRows
        },
      }
    },
  },
  mounted() {
    this.tableHeight
      = (document.documentElement.clientHeight || document.body.clientHeight)
        - 160
    this.getData()
  },
  methods: {
    // 获取数据
    async getData() {
      this.loading = true
      try {
        const result = await getlist({
          page: this.page,
          rows: this.rows,
          sort: this.sort,
          order: this.order,
        })
        this.data = result.rows || []
        this.total = result.total || 0
      }
      finally {
        this.loading = false
      }
    },
    update(bool) {
      if (bool) {
        this.getData()
      }
      this.isshow = false
    },
    // 删除
    handleDelete(record) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      $oAntdConfirm({
        title: '确认删除吗',
        content: `确认删除${record.noticeTitle}`,
        async onOk() {
          const result = await deleteData([record.id])
          if (result.code == 20000) {
            window.$oAntdMessage.success('操作成功')
            that.getData()
          }
          else {
            window.$oAntdMessage.error('操作失败')
          }
        },
        onCancel() {},
      })
    },
    // 批量删除
    deleteMoreData() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      if (this.selectedRowKeys && this.selectedRowKeys.length) {
        $oAntdConfirm({
          title: '确认删除吗',
          content: `你确定永久删除该数据吗?`,
          async onOk() {
            const result = await deleteData(that.selectedRowKeys)
            if (result.code == 20000) {
              window.$oAntdMessage.success('操作成功')
              that.getData()
              // 清空删除的数据
              that.selectedRowKeys = []
            }
            else {
              window.$oAntdMessage.error('操作失败')
            }
          },
          onCancel() {},
        })
      }
    },
    add() {
      this.isshow = true
      window.$oNextTick(() => {
        this.$refs.AddUpdateRef.showModal()
      })
    },
    edit(record) {
      this.isshow = true
      window.$oNextTick(() => {
        this.$refs.AddUpdateRef.showModal(record.id)
      })
    },
    // 排序
    sorterChange(pagination, filters, sorter) {
      if (sorter && sorter.order) {
        this.sort = sorter.field || this.sort
        if (sorter.order === 'descend') {
          this.order = 'desc'
        }
        else if (sorter.order === 'ascend') {
          this.order = 'asc'
        }
        else {
          // eslint-disable-next-line no-self-assign
          this.order = this.order
          // eslint-disable-next-line no-self-assign
          this.sort = this.sort
        }
        this.getData()
      }
    },
    forMatTime(noticeTerm) {
      return dayjs(noticeTerm).format('YYYY-MM-DD HH:mm:ss')
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
