<template>
  <div>
    <a-spin :spinning="spinning">
      <a-tabs
        v-model:active-key="currentTab"
        default-active-key="TEST"
        @change="getData()"
      >
        <a-tab-pane key="TEST" tab="检测设备打包">
        </a-tab-pane>
        <a-tab-pane key="EGRESS" tab="外带设备打包" force-render>
        </a-tab-pane>
      </a-tabs>
      <div class="spin-content">
        <div class="equipmentOutgo-search">
          <div layout="inline" class="searchBox">
            <a-input
              v-model:value="searchString"
              style="width: 300px"
              placeholder="请输入名称后回车即可查询"
              @keyup.enter="queryData"
            />
            <a-button class="ml-2" @click="queryData">
              查询
            </a-button>
          </div>
        </div>
        <div style="padding-bottom: 10px">
          <a-button type="primary" @click="add">
            新增
          </a-button>
          <a-button :loading="batchDelLoading" @click="batchDel">
            删除
          </a-button>
          <template v-if="currentTab === 'EGRESS'">
            <a-button @click="onDownloadTemplate">
              下载Excel导入模板
            </a-button>
            <a-upload
              :show-upload-list="false"
              name="file"
              accept=".xls, .xlsx"
              :custom-request="customRequest"
            >
              <a-button>
                Excel导入
              </a-button>
            </a-upload>
          </template>
        </div>
        <a-table
          :row-selection="rowSelection"
          :columns="columns"
          :pagination="data.length ? pagination : false"
          :data-source="data"
          bordered
          :row-class-name="rowClassName"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'eqName'">
              <div
                v-if="
                  currentTab === 'TEST' && record.eqList && record.eqList.length
                "
              >
                {{
                  record.eqList
                    .map((i) => `${i.name}（${i.equipmentSn}）`)
                    .join(',')
                }}
              </div>
              <div
                v-else-if="
                  currentTab === 'EGRESS' && record.eqList && record.eqList.length
                "
              >
                <b>{{
                  record.eqList.find((i) => i.eqType === 'CHIEF')
                    && `${record.eqList.find((i) => i.eqType === 'CHIEF').name}（${
                      record.eqList.find((i) => i.eqType === 'CHIEF').equipmentSn
                    }）`
                }}</b>
                <span
                  v-if="
                    record.eqList.filter((i) => i.eqType === 'ACCESSORY').length
                  "
                >,{{
                  record.eqList
                    && record.eqList
                      .filter((i) => i.eqType === 'ACCESSORY')
                      .map((i) => `${i.name}（${i.equipmentSn}）`)
                      .join(',')
                }}</span>
              </div>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-space>
                <a class="text-blue-500" @click="editRow(record)">编辑</a>
                <a class="text-blue-500" @click="editRow(record, true)">详情</a>
                <a class="text-blue-500" @click="deleteRow(record)">删除</a>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <Add ref="Add" :key="addKey" :callback="getData" />
  </div>
</template>

<script>
import { message, Modal, Table } from 'ant-design-vue'
import dayjs from 'dayjs'
import sseRequestProgress from '~/components/sseRequestProgress/index.js'
import Add from './components/add.vue'
import BatchDispose from './components/batchDispose.vue'
import Detail from './components/detail.vue'
import Dispose from './components/dispose.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const egressStatusData = [
  { name: '库存', value: 10 },
  { name: '外出待确认', value: 20 },
  { name: '外出被拒绝', value: 30 },
  { name: '外出', value: 40 },
  { name: '归还待确认', value: 50 },
  { name: '归还被拒绝', value: 60 },
]

export default {
  components: {
    Add,
    // eslint-disable-next-line vue/no-unused-components
    Dispose,
    // eslint-disable-next-line vue/no-unused-components
    BatchDispose,
    // eslint-disable-next-line vue/no-unused-components
    Detail,
  },
  data() {
    return {
      dayjs,
      batchDelLoading: false,
      searchString: '',
      data: [],
      // columns: getColumns.bind(this)(),
      selectedRowKeys: [],
      selectedRows: [],
      confirmVisible: false,
      rollbackRecord: {
        id: null,
        comment: null,
      },
      rollbackVisible: false,
      formLayout: 'horizontal',
      spinning: false,
      page: 1,
      size: 10,
      isAdd: false,
      addKey: '',
      queryParams: null,
      currentTab: 'TEST',
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
    }
  },
  computed: {
    columns() {
      return [
        {
          title: this.currentTab === 'TEST' ? '设备组名称' : '名称',
          dataIndex: 'name',
          width: '9%',
        },
        {
          title: this.currentTab === 'TEST' ? '设备详情' : '关联设备',
          dataIndex: 'eqName',
          scopedSlots: { customRender: 'eqName' },
        },
        {
          title: '创建人',
          dataIndex: 'createName',
        },
        {
          title: '创建时间',
          dataIndex: 'createDate',
          customRender: ({ text: time }) =>
            time ? dayjs(time).format('YYYY-MM-DD') : '',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
        },
      ]
    },
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
    onDownloadTemplate() {
      downloader.excute('rest/equipment/pack?downloadTemplate')
    },
    // 导入
    customRequest(file) {
      sseRequestProgress.show({
        api: 'rest/equipment/pack/import',
        method: 'postForm',
        data: {
          file: file.file,
        },
        onComplete: (res) => {
          if (res && res.length) {
            Modal.error({
              title: '导入失败',
              width: '640px',
              content: h('div', {}, [
                h('div', {}, '导入模板中存在以下问题，请编辑模板文件后重新导入！'),
                h(Table, {
                  class: 'mt-2',
                  bordered: true,
                  columns: [{
                    title: '行号',
                    dataIndex: 'rowNum',
                    width: '60px',
                  }, {
                    title: '问题内容',
                    dataIndex: 'errorMsg',
                  }],
                  dataSource: res,
                  pagination: false,
                  size: 'small',
                  scroll: { y: 420 },
                }, ''),
              ]),
              centered: true,
              okText: '确定',
            })
          }
          else {
            message.success('导入成功')
            this.getData()
          }
        },
      })
    },
    queryData() {
      this.page = 1
      this.getData()
    },
    async getData() {
      const { page, size } = this
      this.spinning = true
      await window.$oAjax
        .get(`/rest/equipment/pack/page`, {
          params: {
            page,
            rows: size,
            quickQryParam: this.searchString,
            type: this.currentTab,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'paramsIsTrim': true,
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.total || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
            this.spinning = false
          }
        })
    },
    add() {
      this.isAdd = true
      this.addKey = new Date().getTime()
      window.$oNextTick(() => {
        this.$refs.Add.showModal({ editType: this.currentTab })
      })
    },
    batchDel() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warn('请勾选要删除的数据！')
        return
      }

      window.$oAntdConfirm({
        title: this.currentTab === 'TEST' ? '您正在删除设备组！' : '删除',
        content:
          this.currentTab === 'TEST'
            ? '您确定要删除已选择的设备组吗？'
            : '您确定要删除已选择数据吗？',
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.batchDelLoading = true
          Promise.all(
            this.selectedRowKeys.map(key =>
              window.$oAjax({
                method: 'DELETE',
                url: `/rest/equipment/pack/${key}`,
              }),
            ),
          )
            .then(() => {
              this.getData()
              window.$oAntdMessage.success('操作成功')
            })
            .finally(() => {
              this.batchDelLoading = false
            })
        },
      })
    },
    deleteRow(row) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: this.currentTab === 'TEST' ? '您正在删除设备组！' : '删除',
        content:
          this.currentTab === 'TEST'
            ? '您确定要删除当前设备组吗？'
            : '确认删除吗？',
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'DELETE',
            url: `/rest/equipment/pack/${row.id}`,
          }).then((res) => {
            if (res.code === 20000) {
              _this.getData()
              window.$oAntdMessage.success('操作成功')
            }
            else {
              window.$oAntdMessage.error(res.message)
            }
          })
        },
      })
    },
    editRow(row, isDetail) {
      window.$oNextTick(() => {
        this.$refs.Add.showModal({ row, isDetail, editType: this.currentTab })
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
