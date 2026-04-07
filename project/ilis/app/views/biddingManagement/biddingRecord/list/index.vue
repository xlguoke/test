<template>
  <div class="disqualification">
    <div class="disqualification-search">
      <div>
        <a-input
          v-model:value="queryParam"
          placeholder="输入项目名称/招标单位回车即可查询"
          class="disqualification-search-all"
          @press-enter="search"
        />
        <a-button @click="search">
          查询
        </a-button>
        <a-button

          v-permission="'biddingRecordEdit'"

          @click="add"
        >
          新增
        </a-button>
      </div>
    </div>
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :scroll="scroll"
      :row-class-name="rowClassName"
      :pagination="pagination"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'projectName'">
          <span>
            {{ text }}
            <span
              v-if="record.biddingStatus == '0'"
              style="
                display: inline-block;
                border: solid 1px green;
                background: rgba(0, 128, 0, 0.2);
                color: green;
                padding: 0 4px;
                border-radius: 3px;
              "
            >中标</span>
            <span
              v-if="record.biddingStatus == '1'"
              style="
                display: inline-block;
                border: solid 1px red;
                background: rgba(255, 0, 0, 0.3);
                color: red;
                padding: 0 4px;
                border-radius: 3px;
              "
            >未中标</span>
            <span
              v-if="record.biddingStatus == '2'"
              style="
                display: inline-block;
                border: solid 1px #ff5722;
                background: rgba(255, 87, 34, 0.3);
                color: #ff5722;
                padding: 0 4px;
                border-radius: 3px;
              "
            >未确定中标单位</span>
          </span>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="table-handle">
            <a
              href="javascript:;"
              title="查看"
              style="margin-right: 5px"
              @click="viewDetail(record)"
            >
              查看
            </a>
            <a
              v-permission="'biddingRecordEdit'"
              href="javascript:;"
              title="编辑"

              style="margin-right: 5px"
              @click="editRow(record)"
            >
              编辑
            </a>
            <a
              v-permission="'biddingRecordDel'"
              href="javascript:;"
              title="删除"

              style="margin-right: 5px"
              @click="deleteRow(record)"
            >
              删除
            </a>
          </div>
        </template>
      </template>
    </a-table>

    <EditModal ref="EditModal" :callback="search" />
    <CustomInfo :callback="search" />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import CustomInfo from './components/customInfo.vue'
import EditModal from './components/editModal.vue'

export default {
  components: {
    EditModal,
    CustomInfo,
  },
  data() {
    return {
      rootUrl,
      data: [],
      queryParam: '',
      loading: false,
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
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      query: {},
      scroll: {},
      columns: [
        {
          title: '项目名称',
          dataIndex: 'projectName',
          width: '30%',
        },
        { title: '招标单位', dataIndex: 'bidUnit', width: '25%' },
        { title: '招标公告时间', dataIndex: 'announcementTime', width: '15%' },
        { title: '开标时间', dataIndex: 'bidTime', width: '15%' },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '15%',
        },
      ],
    }
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
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.biddingRecord.list, {
          params: {
            page,
            size,
            ...query,
          },
        })
        .then((res) => {
          if (res.success) {
            this.data = res.obj.rows
            // eslint-disable-next-line array-callback-return
            this.data.map((data) => {
              if (
                data.biddingCustomizeValueEntities
                && data.biddingCustomizeValueEntities.length > 0
              ) {
                // eslint-disable-next-line array-callback-return
                data.biddingCustomizeValueEntities.map((item) => {
                  data[item.customColumnId] = item.customColumnValue
                })
              }
            })

            this.pagination.total = res.obj.count
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            message.error(res.msg || res.message)
          }
          this.loading = false
        })
    },
    // 搜索
    search() {
      const data = {}
      data.queryParam = this.queryParam.trim()
      this.query = data
      this.getData(true)
    },
    viewDetail() {},
    add() {
      this.$refs.EditModal.showModal()
    },
    editRow(record) {
      this.$refs.EditModal.showModal(record)
    },
    deleteRow(record) {
      Modal.confirm({
        title: '删除',
        content: `确认删除项目 ${record.projectName} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingRecord.delete, { params: { id: record.id } })
            .then((res) => {
              if (res && res.success) {
                message.success(res.msg || res.message)
                this.getData(true)
              }
              else {
                message.error(res.msg || res.message)
              }
            })
        },
      })
    },
    // 打开tab
    viewDetail(data) {
      top.addTabs
      && top.addTabs({
        id: data.id,
        title: '投标记录详情',
        close: false,
        url: `biddingController.do?biddingRecordDetail&id=${data.id}`,
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
