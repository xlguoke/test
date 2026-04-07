<template>
  <div class="archiving hitek-height-full">
    <a-spin :spinning="spinning" class="hitek-height-full">
      <div class="spin-content hitek-height-full">
        <a-layout class="hitek-height-full">
          <a-layout style="background-color: var(--colorBgContainer);">
            <a-layout-sider
              width="320"
              :style="{
                overflow: 'auto',
                padding: '10px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                backgroundColor: 'var(--colorBgContainer)',
                borderRight: '1px solid var(--colorBorder)',
              }"
            >
              <a-tree
                :tree-data="treeData"
                show-icon
                :selected-keys="selectedKeys"
                @select="onSelect"
              >
                <template #sampleCategory>
                  <BookOutlined />
                </template>
              </a-tree>
              <p v-if="isShowTree">
                暂无数据
              </p>
            </a-layout-sider>
            <a-layout
              :style="{
                marginLeft: '320px',
                padding: '0px 10px',
                backgroundColor: 'var(--colorBgContainer)',
              }"
            >
              <a-layout-content
                :style="{
                  backgroundColor: 'var(--colorBgContainer)',
                  padding: '10px',
                  margin: 0,
                  minHeight: '280px',
                  overflow: 'initial',
                  backgroundColor: 'var(--colorBgContainer)',
                }"
              >
                <div class="dataCollection-search">
                  <AddEditComponent ref="AddEditComponent" />
                  <div>
                    <a-button @click="getData(true)">
                      生成台账
                    </a-button>
                    <a-button @click="exportFun">
                      导出Excel
                    </a-button>
                  </div>
                </div>
                <!-- :rowSelection="false" -->
                <a-table
                  :columns="columns"
                  :data-source="data"
                  row-key="id"
                  :scroll="scroll"
                  :locale="locale"
                  :pagination="data && data.length ? pagination : false"
                  :custom-row="customRow"
                  :row-class-name="rowClassName"
                >
                  <template #bodyCell="{ column, text }">
                    <template v-if="column.dataIndex === 'name'">
                      <a href="javascript:;">{{ text }}</a>
                    </template>

                    <template v-if="column.dataIndex === 'operation'">
                    </template>
                  </template>
                </a-table>
              </a-layout-content>
            </a-layout>
          </a-layout>
        </a-layout>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { BookOutlined } from '@ant-design/icons-vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import AddEditComponent from './components/addEdit.vue'

const queryData = [
  {
    type: 'input',
    field: 'consignUnit',
    title: '委托单位',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'inputNumber',
    field: 'consignProject',
    title: '工程项目',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'select',
    field: 'checkTypeId',
    title: '检测类别',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'radio',
    field: 'themeType',
    title: '是否分包',
    options: [
      { id: '是', name: '是' },
      { id: '否', name: '否' },
      { id: '全部', name: '全部' },
    ],
    default: '',
    col: '12',
    expend: {},
  },
  {
    type: 'datePicker',
    field: 'consignBigType',
    title: '委托数据来源',
    options: [],
    default: '',
    col: '12',
    expend: {},
  },
]
// const columns = [
//   { title: '台账名称', dataIndex: 'name', width: '30%' },
//   { title: '创建人', dataIndex: 'createName' },
//   {
//     title: '操作',
//     dataIndex: 'operation',
//     minWidth: 80,
//   },
// ]
export default {
  name: 'List',
  components: {
    AddEditComponent,
    BookOutlined,
  },
  data() {
    return {
      columns: [],
      queryParam: null,
      selectedKeys: [],
      groupSel: [],
      isShowTree: false,
      treeData: [],
      data: [],
      scroll: { x: false },
      locale: { emptyText: '当前无数据，请填写查询条件，并单击生成台账按钮' },
      queryData,
      selectedRowKeys: [],
      selectedRows: [],
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
      submitParams: null,
      spinning: false,
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
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getTreeData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.selectedRowKeys = []
      this.selectedRows = []
      if (info.selected) {
        const treeRow = info.selectedNodes[0]
        this.pages = 1
        this.groupSel = [{ ...treeRow }]
        this.getConditionFun()
      }
      else {
        this.groupSel = []
      }
    },
    renderTreeNodes(data, defaultChecke) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.renderTreeNodes(data[i].children, false)
        }
        if (i === 0 && defaultChecke) {
          if (this.groupSel.length > 0) {
            this.selectedKeys.push(this.groupSel[0].id)
          }
          else {
            this.groupSel = [{ ...data[i] }]
            this.selectedKeys.push(data[i].id)
          }
          this.getConditionFun()
        }
        const obj = {
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          key: data[i].id,
          children,
        }
        if (obj.ledger) {
          obj.slots = {
            icon: 'sampleCategory',
          }
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    async getTreeData() {
      const data = {
        page: 1,
        size: 9999,
      }
      await window.$oAjax({
        url: window.$oApi.ledgerManagement.getTree,
        params: {
          ...data,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.selectedKeys = []
          this.isShowTree = false
          this.treeData = this.renderTreeNodes(res.data, true)
        }
        else {
          this.treeData = []
          this.isShowTree = true
        }
      })
    },
    async getConditionFun() {
      let categoryId
      if (this.groupSel.length && !this.groupSel[0].ledger) {
        return
      }
      this.columns = []
      this.data = []
      // eslint-disable-next-line prefer-const
      categoryId = this.groupSel[0].id
      let queryData = []
      this.spinning = true
      const res = await window.$oAjax({
        method: 'get',
        url: `${window.$oApi.ledgerManagement.getCondition}/${categoryId}`,
      })
      if (res.code === 20000) {
        if (res.data.conditions && Array.isArray(res.data.conditions)) {
          queryData = res.data.conditions
        }
      }
      else {
        queryData = []
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
      const params = {}
      const objType = {
        100: 'input',
        110: 'inputNumber',
        200: 'select',
        300: 'datePicker',
        400: 'radio',
      }
      this.queryData = queryData.map((item, index) => {
        const itemObj = {
          type: objType[item.type],
          field: item.id,
          title: item.name,
          default: '',
          col: '8',
          expend: {},
          rules: true,
          sortNum: index + 1,
        }
        if (item.type - 0 === 400) {
          itemObj.options = [
            { id: '是', name: '是' },
            { id: '否', name: '否' },
            { id: '全部', name: '全部' },
          ]
        }
        else {
          itemObj.options = []
        }
        return itemObj
      })
      this.$refs.AddEditComponent.showModal(this.queryData, params)
      this.spinning = false
    },
    async dataRequired() {
      if (this.groupSel.length && !this.groupSel[0].ledger) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择台账'))
        return false
      }
      const { showData } = await this.$refs.AddEditComponent.handleOk()
      if (!showData) {
        return false
      }
      const conditions = showData.map(item => item.value).join(',')
      let categoryId
      // eslint-disable-next-line prefer-const
      categoryId = this.groupSel[0].id
      this.submitParams = { conditions, categoryId }
      return true
    },
    async getData(flag) {
      const { page, size } = this
      if (flag)
        this.page = 1

      if (!await this.dataRequired() || !this.submitParams) {
        return
      }
      const obj = this.submitParams
      this.spinning = true
      this.selectedRowKeys = []
      this.selectedRows = []
      window.$oAjax({
        method: 'get',
        url: `${window.$oApi.ledgerManagement.resultUrl}/${obj.categoryId}/result`,
        params: {
          page,
          size,
          conditions: obj.conditions,
        },
      }).then((res) => {
        const arr = []
        if (res.code === 20000) {
          this.pagination.pageSize = size
          this.pagination.current = page
          this.pagination.total = res.data.total
          if (res.data.rows && Array.isArray(res.data.rows)) {
            if (res.data.rows.length > 0) {
              const item = res.data.rows[0]
              for (const key in item) {
                arr.push({
                  title: key,
                  dataIndex: key,
                  width: 200,
                })
              }
            }
            this.data = res.data.rows.map((item, index) => ({
              id: index + 1,
              ...item,
            }))
          }
        }
        else {
          this.data = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.columns = arr
        this.scroll.x = arr.length * 200
        this.submitParams = null
        this.spinning = false
      })
    },
    async exportFun() {
      if (!this.data || this.data.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先生成台账'))
        return
      }

      if (!await this.dataRequired() || !this.submitParams) {
        return
      }
      const obj = this.submitParams
      this.spinning = true
      const url
        = `${rootUrl
        + window.$oApi.ledgerManagement.exportUrl
        }/${obj.categoryId}/document?conditions=${obj.conditions}`
      window.open(url)
      this.submitParams = null
      this.spinning = false
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
