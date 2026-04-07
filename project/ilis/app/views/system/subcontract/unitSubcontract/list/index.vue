<template>
  <div class="disqualification">
    <div>
      <a-input
        v-model:value.trim="queryCode"
        placeholder="输入单位名称后回车即可查询"
        style="width: 300px; vertical-align: middle"
        class="mr-2"
        @press-enter="search"
      />
      <a-button
        class="toolBtn-bar"
        style="vertical-align: middle"
        type="primary"
        @click="search"
      >
        查询
      </a-button>
    </div>
    <div
      v-if="onlySelect"
      style="
        margin-top: 10px;
        margin-bottom: 10px;
      "
    ></div>
    <div
      v-if="!onlySelect"
      style="
        padding-bottom: 10px;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px #e2e2e2;
      "
    >
      <a-button

        style="vertical-align: middle"
        type="primary"
        @click="add"
      >
        新增
      </a-button>
      <!-- <a-button @click="edit" style="vertical-align:middle;">编辑</a-button> -->
      <!-- <a-button @click="folderManage" style="vertical-align:middle;">附件管理</a-button> -->
      <a-button
        class="toolBtn-bar"

        style="vertical-align: middle"
        @click="deleteRow"
      >
        删除
      </a-button>
      <a-button
        class="toolBtn-bar"

        style="vertical-align: middle"
        @click="() => (propertyProfileVisible = true)"
      >
        自定义项配置
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :pagination="data.length > 0 ? pagination : false"
      row-key="id"
      :row-class-name="rowClassName"
      :scroll="scroll"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              href="javascript:"
              title="编辑"
              style="margin-right: 5px"
              @click="edit(record, false)"
            >
              编辑
            </a>
            <a
              href="javascript:"
              title="查看"
              style="margin-right: 5px"
              @click="edit(record, true)"
            >
              查看
            </a>
            <a
              href="javascript:"
              title="附件管理"
              style="margin-right: 5px"
              @click="folderManage(record)"
            >
              附件管理
            </a>
          </span>
        </template>
      </template>
    </a-table>
    <EditModal ref="EditModal" :callback="getCustomFields" />
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="自定义项配置"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="subcontract-unit" />
    </ht-modal>
    <ht-modal
      v-model:open="visible"
      title="附件管理"
      :mask-closable="false"
      width="80%"
      :centered="true"
      class="biddingPerformance-folder"
      @cancel="cancelModal"
    >
      <template #footer>
        <a-button style="display: none" @click="cancelModal"></a-button>
        <a-button @click="cancelModal">
          取消
        </a-button>
      </template>
      <FolderManage ref="FolderManage" />
    </ht-modal>
  </div>
</template>

<script>
import CustomProperty from '~/providers/components/CustomProperty.vue'
import FolderManage from '~/providers/components/folderManage/folderList.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import EditModal from './components/editModal.vue'

export default {
  components: {
    EditModal,
    FolderManage,
    CustomProperty,
  },
  data() {
    return {
      rootUrl,
      data: [],
      queryCode: '',
      selectPage: 'checkbox',
      loading: false,
      visible: false,
      page: 1,
      size: 10,
      onlySelect: false,
      scroll: { y: true },
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getCustomFields()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getCustomFields()
        },
      },
      fields: [
        { title: '单位名称', dataIndex: 'unitName' },
        { title: '联系人', dataIndex: 'contactPerson' },
        { title: '联系电话', dataIndex: 'contactNumber' },
        { title: '联系地址', dataIndex: 'contactAddr' },
        { title: '资质等级', dataIndex: 'qualificationLevel' },
      ],
      columns: [],
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
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
                if (!record.children) {
                  this.selectedRowKeys.push(record.id)
                  this.selectedRows.push(record)
                }
              }
            }
          },
        }
      },
      propertyProfileVisible: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getCustomFields()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getCustomFields(flag) {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'subcontract-unit',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const { page, size, queryCode } = this
      this.loading = true
      window.$oAjax({
        url: window.$oApi.unitSubcontract.listUrl,
        params: {
          page,
          size,
          queryCode,
        },
      }).then((res) => {
        this.data = []
        this.selectedRowKeys = []
        this.selectedRows = []
        if (res.code === 20000) {
          if (
            res.data
            && Array.isArray(res.data.rows)
            && res.data.rows.length > 0
          ) {
            this.columns = this.fields.map(item => ({
              title: item.title,
              dataIndex: item.dataIndex,
            }))
            // eslint-disable-next-line array-callback-return
            this.customFields.map((item) => {
              this.columns.push({
                title: item.columnName,
                dataIndex: item.id,
              })
            })
            if (!this.onlySelect) {
              this.columns.push({
                title: '操作',
                dataIndex: 'operation',
                width: '15%',
                scopedSlots: { customRender: 'operation' },
              })
            }

            const width = `${100 / this.columns.length}%`
            this.columns = this.columns.map(item => ({
              ...item,
              width,
            }))
            this.data = res.data.rows
            // eslint-disable-next-line array-callback-return
            this.data.map((data) => {
              if (data.customValues && data.customValues.length > 0) {
                // eslint-disable-next-line array-callback-return
                data.customValues.map((item) => {
                  data[item.columnId] = item.columnValue
                })
              }
            })
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          this.loading = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          this.loading = false
        }
      })
    },
    // 搜索
    search(e) {
      e.preventDefault()
      this.getCustomFields(true)
    },
    reset() {
      this.queryCode = ''
      this.getCustomFields(true)
    },
    add() {
      this.$refs.EditModal.showModal('', '新增分包单位', false)
    },
    edit(record, isDetail) {
      const addEditTitle = isDetail ? '分包单位详情' : '分包单位编辑'
      this.$refs.EditModal.showModal(record.id, addEditTitle, isDetail)
    },
    deleteRow() {
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要删除的数据！'))
        return
      }
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            url: window.$oApi.unitSubcontract.delUrl,
            method: 'delete',
            data: this.selectedRowKeys,
            headers: { 'Content-Type': 'application/json' },
          }).then((res) => {
            if (res.code === 20000) {
              this.getCustomFields()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
    async folderManage(record) {
      this.visible = true
      await window.$oNextTick()

      this.$refs.FolderManage.showModal(record.id)
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getCustomFields(true)
    },
    // 附件关闭
    cancelModal() {
      this.visible = false
      this.$refs.FolderManage.cancelModal()
    },
    // 选择分包单位
    showModal(onlySelect) {
      // eslint-disable-next-line ts/no-unused-expressions
      onlySelect ? (this.onlySelect = true) : ''
      this.selectPage = 'radio'
      this.scroll = { y: 260 }
    },
    handleOk() {
      return this.selectedRows
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
