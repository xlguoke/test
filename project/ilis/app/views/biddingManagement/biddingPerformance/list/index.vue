<template>
  <div class="disqualification">
    <a-space>
      <a-input
        v-model:value="queryParam"
        placeholder="输入业绩名称后回车即可查询"
        style="width: 300px; vertical-align: middle"
        @press-enter="search"
      />
      <a-button style="vertical-align: middle" @click="search">
        查询
      </a-button>
    </a-space>
    <div
      style="
        padding-bottom: 10px;
        padding-top: 10px;
        margin-top: 10px;
        border-top: solid 1px var(--colorSplit);
      "
    >
      <a-button

        v-permission="'biddingPerformanceEdit'"

        style="vertical-align: middle"
        @click="add"
      >
        新增
      </a-button>
      <a-button

        v-permission="'biddingPerformanceEdit'"

        style="vertical-align: middle"
        @click="edit"
      >
        编辑
      </a-button>
      <a-button

        v-permission="'biddingPerformanceFile'"

        style="vertical-align: middle"
        @click="folderManage"
      >
        附件管理
      </a-button>
      <a-button

        v-permission="'biddingPerformanceDel'"

        style="vertical-align: middle"
        @click="deleteRow"
      >
        删除
      </a-button>
      <a-button

        v-permission="'biddingPerformanceConfig'"

        style="vertical-align: middle"
        @click="() => (propertyProfileVisible = true)"
      >
        业绩信息项配置
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :custom-row="customRow"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :pagination="pagination"
      row-key="id"
      :row-class-name="rowClassName"
    />
    <EditModal ref="EditModal" :is-add="isAdd" :callback="getCustomFields" />
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="业绩信息项配置"
      :mask-closable="false"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="performance-property" />
    </ht-modal>
    <FolderManage ref="FolderManage" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message, Modal } from 'ant-design-vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import EditModal from './components/editModal.vue'
import FolderManage from './components/folderManage.vue'

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
      queryParam: '',
      loading: false,
      page: 1,
      size: 10,
      isAdd: true,
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
        { title: '业绩名称', dataIndex: 'performanceName' },
        { title: '业绩类型', dataIndex: 'performanceType' },
        { title: '合同金额', dataIndex: 'performanceAmount' },
        { title: '等级', dataIndex: 'grade' },
        { title: '时间年限', dataIndex: 'yearLimit' },
        { title: '地区', dataIndex: 'area' },
      ],
      columns: [],
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
      propertyProfileVisible: false,
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
            customizeType: 'performance-property',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, queryParam } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.biddingPerformance.getData, {
          params: {
            page,
            size,
            queryParam,
          },
        })
        .then((res) => {
          this.columns = this.fields.map((item) => {
            if (item.dataIndex == 'performanceAmount') {
              return {
                title: item.title,
                dataIndex: item.dataIndex,
                customRender: ({ text }) => (text ? `${text}元` : ''),
              }
            }
            else {
              return {
                title: item.title,
                dataIndex: item.dataIndex,
              }
            }
          })

          // eslint-disable-next-line array-callback-return
          this.customFields.map((item) => {
            this.columns.push({
              title: item.columnName,
              dataIndex: item.id,
            })
          })

          const width = `${100 / this.columns.length}%`
          this.columns = this.columns.map(item => ({
            ...item,
            width,
          }))

          this.data = res.obj.rows

          // eslint-disable-next-line array-callback-return
          this.data.map((data) => {
            if (
              data.biddingCustomizeValueEntities
              && data.biddingCustomizeValueEntities.length > 0
            ) {
              // eslint-disable-next-line array-callback-return
              data.biddingCustomizeValueEntities.map((item) => {
                data[item.columnId] = item.columnValue
              })
            }
          })

          this.pagination.total = res.obj.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.selectedRows = []
          this.loading = false
        })
    },
    // 搜索
    search(e) {
      e.preventDefault()
      const data = {}
      data.queryParam = this.queryParam.trim()

      this.getCustomFields(true)
    },
    reset() {
      this.queryParam = ''
      this.getCustomFields(true)
    },
    add() {
      this.isAdd = true
      this.$refs.EditModal.showModal()
    },
    edit() {
      if (this.selectedRows.length == 0) {
        message.warn('请选择需要编辑的数据！')
        return
      }
      this.isAdd = false
      this.$refs.EditModal.showModal(this.selectedRows[0])
    },
    folderManage() {
      if (this.selectedRowKeys.length == 0) {
        message.warn('请选择一条数据！')
        return
      }
      this.$refs.FolderManage.showModal(this.selectedRowKeys[0])
    },
    settingInfo() {
      this.$refs.ConfigModal.showModal()
    },
    deleteRow() {
      if (this.selectedRows.length == 0) {
        message.warn('请选择需要删除的数据！')
        return
      }

      Modal.confirm({
        title: '删除',
        content: `确认删除 ${this.selectedRows[0].performanceName} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingPerformance.delete, {
              params: { id: this.selectedRowKeys[0] },
            })
            .then((res) => {
              if (res && res.success) {
                message.success(res.msg || res.message)
                this.getCustomFields()
              }
              else {
                message.error(res.msg || res.message)
              }
            })
        },
      })
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getCustomFields(true)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
