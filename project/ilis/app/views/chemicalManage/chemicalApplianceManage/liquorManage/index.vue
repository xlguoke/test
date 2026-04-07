<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <span style="margin-right: 20px">
            <a-select v-model:value="queryDataType" class="mr-2" style="width: 130px">
              <a-select-option value="1">配置日期: </a-select-option>
              <a-select-option value="2">失效日期: </a-select-option>
            </a-select>
            <a-range-picker
              v-model:value="queryDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 220px"
            />
            <!-- <a-date-picker
                v-model="queryDate"
                style="width: 195px;"
                value-format="YYYY-MM-DD"
              /> -->
          </span>

          <span style="margin-right: 20px">
            <span class="label">数据状态：</span>
            <a-select v-model:value="queryForm.status" style="width: 200px">
              <a-select-option value="">全部 </a-select-option>
              <a-select-option value="创建中">创建中 </a-select-option>
              <a-select-option value="已入库">已入库 </a-select-option>
              <a-select-option value="已领取">已领取 </a-select-option>
            </a-select>
          </span>
          <a-input
            v-model:value="queryForm.quickQry"
            placeholder="请输入配置溶液名称、溶液编号后回车即可"
            style="width: 200px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button @click="handleSearch">
            查询
          </a-button>

          <!-- <a-button @click="advancedOpen">高级查询</a-button> -->
        </div>
        <a-space style="padding: 10px 0">
          <a-button v-permission="'chemicalSolution:add'" type="primary" @click="addEditRow">
            新增
          </a-button>
          <a-button v-permission="'chemicalSolution:columnScreen'" @click="columnScreen">
            列筛选
          </a-button>
          <CustomAttribute
            v-permission="'chemicalSolution:customize'"
            customize-type="chemicalSolution"
            @save="getData()"
          />

          <!-- <a-upload
              :showUploadList="false"
              name="file"
              :multiple="false"
              :action="importUrl"
              @change="handleChange"
            >
              <a-button>导出</a-button>
            </a-upload> -->

          <a-button v-permission="'chemicalSolution:export'" @click="onExport">
            导出
          </a-button>
          <a-button v-permission="'chemicalSolution:print'" @click="handlePrint">
            打印
          </a-button>
        </a-space>
        <a-table
          id="tableBox"
          row-key="id"
          bordered
          :data-source="data"
          :custom-row="customRow"
          :columns="tableColumns"
          :row-class-name="rowClassName"
          :row-selection="rowSelection"
          :pagination="data.length > 0 ? pagination : false"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'solutionBlendedVOs'">
              <span v-for="it in record.solutionBlendedVOs" :key="it.id">{{
                `${it.name}(${it.totalAmount || 0}${it.unit})   ` + `  `
              }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  v-if="record.status == '创建中'"
                  v-permission="'chemicalSolution:add'"
                  @click="(e) => addEditRow(e, record.id)"
                >编辑</a>
                <a v-permission="'chemicalSolution::delete'" style="color: red" @click="(e) => deleteRow(e, record)">删除</a>
                <a @click="(e) => addEditRow(e, record.id, true)">查看</a>
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
    <AddEditComponent ref="AddEditComponentRef" :callback="getData" />

    <!-- <SubmitPage ref="SubmitPage" :callback="getSubmit" /> -->
    <Logs ref="Logs" />

    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import { CustomAttribute } from '~/components/customAttribute'
import { formatTime } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import Logs from '~/providers/components/logs.vue'
import AddEditComponent from './components/addEdit.vue'

export default {
  components: {
    AddEditComponent,
    Logs,
    CustomColumn,
    CustomProperty,
    CustomAttribute,
  },
  data() {
    return {
      queryDataType: '1',
      queryDate: [],
      queryForm: {
        confectDateStart: '',
        overdueDateStart: '',
        status: '',
      },
      importUrl: `/rest/chemical/category/import`,
      getColumnUrl: 'rest/common/chosen-columns?type=solution',
      dayjs,
      customVisible: false,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '状态',
          dataIndex: 'status',
          width: 80,
        },
        {
          title: '溶液编号',
          dataIndex: 'sn',
          width: 120,
        },
        {
          title: '配置溶液名称',
          dataIndex: 'name',
          width: 120,
        },
        {
          title: '品类名称',
          dataIndex: 'categoryName',
          width: 120,
        },
        {
          title: '溶液浓度',
          dataIndex: 'concentration',
          width: 120,
        },
        {
          title: '配置数量',
          dataIndex: 'confectAmount',
          width: 120,
        },
        {
          title: '配置依据',
          dataIndex: 'confectAccordance',
          width: 120,
        },
        {
          title: '介质',
          dataIndex: 'confectMedium',
          width: 120,
        },
        {
          title: '配置用化学品',
          dataIndex: 'solutionBlendedVOs',
          width: 120,
        },
        {
          title: '配置日期',
          dataIndex: 'confectDate',
          customRender({ text }) {
            return formatTime(text, 'YYYY-MM-DD')
          },
          width: 120,
        },
        {
          title: '失效日期',
          dataIndex: 'overdueDate',
          customRender({ text }) {
            return formatTime(text, 'YYYY-MM-DD')
          },
          width: 120,
        },
        {
          title: '配置人',
          dataIndex: 'personNames',
          width: 120,
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: 120,
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 125,
        },
      ],
      propertyProfileVisible: false,
      customFields: [],
      queryForm: {
        confectDateStart: '',
        confectDateEnd: '',

        overdueDateStart: '',
        overdueDateEnd: '',

        status: '',
        quickQry: '',
      },
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
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.type === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
              if (this.selectedRowKeys.includes(record.id)) {
                this.selectedRowKeys = this.selectedRowKeys.filter(
                  item => item !== record.id,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
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
    this.initFun()
  },
  methods: {
    handlePrint() {
      IlisPrintUdr.commonPrint(this.selectedRowKeys, 'ChemicalSolution')
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal('solution', '自定义列配置', false)
    },
    getColumn() {
      return new Promise((r, j) => {
        window.$oAjax.get(this.getColumnUrl).then((res) => {
          if (res.code === 20000 && res.data.length > 0) {
            const list = res.data.map((item) => {
              item.title = item.columnName
              item.key = item.columnKey
              item.dataIndex = item.key
              item.width = 140
              if (item.columnKey == 'solutionBlendedVOs') {
                item.scopedSlots = { customRender: 'solutionBlendedVOs' }
              }

              if (
                item.columnKey == 'confectDate'
                || item.columnKey == 'overdueDate'
              ) {
                item.customRender = function ({ text }) {
                  return formatTime(text, 'YYYY-MM-DD')
                }
              }

              return item
            })
            list.push({
              title: '操作',
              dataIndex: 'operation',
              width: 125,
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
    setDataValue() {
      // let s=v+" 24:00:00"
      // let e=v+" 23:59:59"
      //   this.queryForm.overdueDateStart=""
      //   this.queryForm.overdueDateEnd=""
      //   this.queryForm.confectDateStart=""
      //   this.queryForm.confectDateEnd=""
      // if(this.queryDataType==1){
      //   this.queryForm.confectDateStart=s
      //   this.queryForm.confectDateEnd=e
      // }else{
      //   this.queryForm.overdueDateStart=s
      //   this.queryForm.overdueDateEnd=e
      // }
    },
    customOk() {
      this.customVisible = false
    },
    initFun() {
      this.getColumn().then(() => {
        this.getData()
      })
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
      if (this.queryDate && this.queryDate.length) {
        const s = this.queryDate[0]
        const e = this.queryDate[1]
        this.queryForm.overdueDateStart = ''
        this.queryForm.overdueDateEnd = ''
        this.queryForm.confectDateStart = ''
        this.queryForm.confectDateEnd = ''
        if (this.queryDataType == 1) {
          this.queryForm.confectDateStart = s
          this.queryForm.confectDateEnd = e
        }
        else {
          this.queryForm.overdueDateStart = s
          this.queryForm.overdueDateEnd = e
        }
      }

      const a = document.createElement('a')
      const params = {
        page: this.page,
        size: this.size,
        ...this.queryForm,
        ...(this.selectedRowKeys && this.selectedRowKeys.length
          ? { ids: this.selectedRowKeys.join(',') }
          : {}),
      }
      let href = `/ilis2/rest/chemical/solution/export`
      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )
      a.href = href
      a.click()
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
      this.queryForm.overdueDateStart = ''
      this.queryForm.overdueDateEnd = ''
      this.queryForm.confectDateStart = ''
      this.queryForm.confectDateEnd = ''
      if (this.queryDate && this.queryDate.length) {
        const s = this.queryDate[0]
        const e = this.queryDate[1]
        if (this.queryDataType == 1) {
          this.queryForm.confectDateStart = s
          this.queryForm.confectDateEnd = e
        }
        else {
          this.queryForm.overdueDateStart = s
          this.queryForm.overdueDateEnd = e
        }
      }

      const { page, size } = this
      const params = {
        page,
        size,
        ...this.queryForm,
      }
      window.$oAjax
        .get(`/rest/chemical/solution/pagination`, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.data = res.data.rows
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          // this.clearSelRowClass();
          this.spinning = false
        })
    },
    addEditRow(e, id, isDetail) {
      this.$refs.AddEditComponentRef.openModel(id, isDetail)
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
            .delete('rest/chemical/solution/del', {
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
