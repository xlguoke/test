<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-space>
          <a-input
            v-model:value="quickQry"
            placeholder="请输入化学名称、化学名称编号后回车即可"
            class="container-search-all"
            style="width: 280px"
            @press-enter="handleSearch()"
          />
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
          <a-button @click="advancedOpen">
            高级查询
          </a-button>
        </a-space>
        <div style="padding: 10px 0">
          <a-button v-permission="'namemanage::edit'" type="primary" @click="addEditRow()">
            新增
          </a-button>
          <a-button v-permission="'namemanage::customcolumn'" @click="customVisible = true">
            自定义字段配置
          </a-button>
          <a-button @click="columnScreen">
            列筛选
          </a-button>
          <!-- <a-upload
              :showUploadList="false"
              name="file"
              :multiple="false"
              :action="importUrl"
              @change="handleChange"
            > -->
          <a-button v-permission="'namemanage::import'" @click="openImport">
            化学名称导入
          </a-button>
          <!-- </a-upload> -->

          <a-button v-permission="'namemanage::export'" @click="onExport">
            导出
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :columns="tableColumns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
          :scroll="{ x: 'max-content' }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'amount'">
              <span> {{ text }} {{ record.amountUnit }} </span>
            </template>
            <template v-if="column.dataIndex === 'blended'">
              <span v-if="record.blended == null"> /</span>
              <span v-else> {{ record.blended ? '是' : '否' }} </span>
            </template>
            <template v-if="column.dataIndex === 'autonomousConfect'">
              <span> {{ record.autonomousConfect ? '是' : '否' }} </span>
            </template>
            <template v-if="column.dataIndex === 'keepers'">
              <span> {{ record.keepers }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a v-permission="'namemanage::edit'" @click="(e) => addEditRow(e, record.id)">编辑</a>
                <a v-permission="'namemanage::delete'" style="color: red" @click="(e) => deleteRow(e, record)">删除</a>
                <a v-permission="'namemanage::detail'" @click="(e) => addEditRow(e, record.id, true)">详情</a>
                <!-- <a @click="(e) => viewLog(e, record)">日志</a> -->
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <ht-modal
      :open="customVisible"
      width="50%"
      title="自定义字段配置"
      :mask-closable="false"
      :closable="false"
      :destroy-on-close="true"
    >
      <CustomProperty customize-type="chemicalCategory" />
      <template #footer>
        <div class="modal-footer" style="height: 30px">
          <a-button type="primary" @click="customOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>

    <!-- <ht-modal
        v-model="propertyProfileVisible"
        title="自定义信息项配置"
        :maskClosable="false"
        @ok="handleProfile"
      >
        <CustomProperty customize-type="equipBuyPlanEdit" />
      </ht-modal> -->
    <AddEditComponent ref="AddEditComponentRef" :key="new Date().getTime()" :callback="getData" />

    <!-- <SubmitPage ref="SubmitPage" :callback="getSubmit" /> -->
    <Logs ref="Logs" />
    <Import ref="importRef" />
    <AdvancedQuery2 ref="advancedQueryRef" @ok="advancedQueryCB" />
    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import Logs from '~/providers/components/logs.vue'
import AddEditComponent from './components/addEdit.vue'
import AdvancedQuery2 from './components/advancedQuery.vue'
import Import from './components/import.vue'

export default {
  components: {
    AddEditComponent,
    Logs,
    AdvancedQuery2,
    CustomColumn,
    CustomProperty,
    Import,
  },
  data() {
    return {
      importUrl: `/rest/chemical/category/import`,
      getColumnUrl: 'rest/common/chosen-columns?type=chemicalCategory',
      dayjs,
      customVisible: false,
      visible: false,
      data: [],
      tableColumns: [],
      propertyProfileVisible: false,
      customFields: [],
      quickQry: '',
      spinning: false,
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
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.initFun()
  },
  methods: {
    customOk() {
      this.customVisible = false
    },
    initFun() {
      this.getColumn().then(() => {
        this.getData()
      })
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'chemicalCategory',
        '自定义列配置',
        false,
      )
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        const res = info.file.response
        if (res.code === 20000 && res.succeed) {
          window.$oAntdMessage.success('导入成功')
          this.getData()
        }
        else {
          res.data.failRows.forEach((it) => {
            // window.$oAntdModal.warning(window.$oMsgTips.info(it.failReason));
            window.$oAntdMessage.warning(it.failReason)
          })
        }
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 文件上传失败`))
      }
    },
    async onExport() {
      const a = document.createElement('a')
      const params = {
        page: this.page,
        size: this.size,
        quickQry: this.quickQry || '',
        ...this.query,
      }
      let href = `/ilis2/rest/chemical/category/export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },
    // 获取自定义列
    getColumn() {
      return new Promise((r, j) => {
        window.$oAjax.get(this.getColumnUrl).then((res) => {
          if (res.code === 20000 && res.data.length > 0) {
            const list = res.data.map((item) => {
              item.title = item.columnName
              item.key = item.columnKey
              item.dataIndex = item.key
              if (item.columnKey == 'appointedReturnDuration') {
                item.title = `${item.title}(小时)`
              }
              if (item.columnKey == 'validityPeriod') {
                item.title = `${item.title}(天)`
              }

              if (item.columnKey == 'blended') {
                item.scopedSlots = { customRender: 'blended' }
              }

              if (item.columnKey == 'autonomousConfect') {
                item.scopedSlots = { customRender: 'autonomousConfect' }
              }

              return item
            })
            list.push({
              title: '操作',
              dataIndex: 'operation',
              fixed: 'right',
            })

            this.tableColumns = list

            r(list)
          }
          else {
            j(res)
            window.$oAntdMessage.warning(res.message || res.msg || '请求错误')
          }
        })
      })
    },

    advancedQueryCB(data) {
      this.query = { ...data }
      this.quickQry = ''
      this.page = 1
      this.getData()
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    clearSelRowClass() {
      if (this.selectedRowKeys.length > 0) {
        $(
          `#tableBox tr[data-row-key="${this.selectedRowKeys[0]}"]`,
        ).removeClass('hitek-tableRow-active')
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },
    getCustomFields(flag) {
      this.visible = false
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'equipBuyPlanEdit',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    getData(flag) {
      this.visible = false
      this.spinning = true
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        size,
        quickQry: this.quickQry || '',
        ...this.query,
      }
      window.$oAjax
        .get(`/rest/chemical/category/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows.map((it) => {
              if (it.customValues && it.customValues.length) {
                it.customValues.forEach((cit) => {
                  it[cit.columnId] = cit.columnValue
                })
              }
              return it
            })

            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          this.clearSelRowClass()
          this.spinning = false
        })
    },
    addEditRow(e, recordId, isDetail) {
      this.$refs.AddEditComponentRef.openModel(recordId, isDetail)
    },
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          self.spinning = true
          window.$oAjax
            .delete('rest/chemical/category/del', {
              params: {
                id: record.id,
              },
            })
            .then((res) => {
              self.spinning = false
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.getData()
              }
              else {
                window.$oAntdMessage.warning(res.message)
              }
            })
        },
        onCancel() {},
      })
    },

    advancedOpen() {
      this.$refs.advancedQueryRef.showModal()
    },
    openImport() {
      this.$refs.importRef.openModal()
    },
    handleSearch() {
      this.getData(true)
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '11')
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
