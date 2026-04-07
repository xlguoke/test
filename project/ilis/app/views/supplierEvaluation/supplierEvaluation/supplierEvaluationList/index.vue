<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div
    class="custom-table"
  >
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <span style="margin-right: 20px">
            <span class="label">评价日期：</span>
            <a-range-picker
              v-model:value="queryDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 220px"
            />
            <!-- <a-date-picker
                v-model="queryDate"
                style="width: 195px;"
                valueFormat="YYYY-MM-DD"
              /> -->
          </span>

          <span style="margin-right: 20px">
            <span class="label">数据状态：</span>
            <a-select v-model:value="queryForm.status" style="width: 200px">
              <a-select-option value="">全部 </a-select-option>
              <a-select-option value="10">填写中 </a-select-option>
              <a-select-option value="20">审批中 </a-select-option>
              <a-select-option value="30">审批通过 </a-select-option>
              <a-select-option value="40">审批不通过 </a-select-option>
            </a-select>
          </span>
          <a-input
            v-model:value="queryForm.queryCode"
            placeholder="请输入供应商名称，联系人后回车"
            style="width: 200px"
            class="container-search-all"
            @press-enter="handleSearch()"
          />
          <a-button @click="handleSearch">
            查询
          </a-button>

          <!-- <a-button @click="advancedOpen">高级查询</a-button> -->
        </div>
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            新增
          </a-button>
          <a-button @click="onExport">
            导出
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :columns="tableColumns"
          :pagination="data.length > 0 ? pagination : false"
          :data-source="data"
          bordered
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <span> {{ statusEnum[text] }}</span>
            </template>

            <template v-if="column.dataIndex === 'supplierType'">
              <span> {{ dictionaryEnum[text] }}</span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a
                  v-if="'10,40'.includes(record.status)"
                  @click="(e) => addEditRow(e, record.id)"
                >编辑</a>
                <a
                  v-if="'10,40'.includes(record.status)"
                  @click="(e) => submitRow(e, record)"
                >提交</a>
                <a
                  v-if="'10,40'.includes(record.status)"
                  style="color: red"
                  @click="(e) => deleteRow(e, record)"
                >删除</a>
                <a @click="(e) => addEditRow(e, record.id, true)">详情</a>
                <a @click="onPrint(record)">打印</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <!-- <ht-modal
      :open="customVisible"
      width="50%"
      title="自定义字段配置"
      :mask-closable="false"
      :closable="false"
      :destroy-on-close="true"
    >
      <custom-property customize-type="chemicalCategory" />
      <template #footer>
        <div class="modal-footer" style="height: 30px">
          <a-button type="primary" @click="customOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal> -->

    <!-- <ht-modal
        v-model="propertyProfileVisible"
        title="自定义信息项配置"
        :maskClosable="false"
        @ok="handleProfile"
      >
        <CustomProperty customize-type="equipBuyPlanEdit" />
      </ht-modal> -->
    <AddEditComponent ref="AddEditRef" :callback="getData" />
    <SubmitPage ref="SubmitPage" :callback="getSubmit" />
    <!-- <SubmitPage ref="SubmitPage" :callback="getSubmit" /> -->
    <Logs ref="Logs" />

    <!-- <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn> -->
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import qs from 'qs'
// import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import SubmitPage from '~/providers/components/equip/submitPage.vue'
import Logs from '~/providers/components/logs.vue'
import AddEditComponent from './components/addEdit.vue'

export default {
  components: {
    AddEditComponent,
    Logs,
    // CustomColumn,
    SubmitPage,
  },
  data() {
    return {
      dictionaryEnum: {},
      statusEnum: {
        10: '填写中',
        20: '审批中',
        30: '审批通过',
        40: '审批不通过',
      },
      queryDataType: '1',
      queryDate: [],
      queryForm: {
        assessTimeStart: '',
        assessTimeEnd: '',
        status: '',
      },
      importUrl: `/rest/chemical/category/import`,
      getColumnUrl: 'rest/common/chosen-columns?type=chemicalCategory',
      dayjs,
      customVisible: false,
      visible: false,
      data: [],
      tableColumns: [
        {
          title: '供应商名称',
          dataIndex: 'supplierName',
        },
        {
          title: '供应商类型',
          dataIndex: 'supplierType',
          scopedSlots: { customRender: 'supplierType' },
        },
        {
          title: '联系人',
          dataIndex: 'supplierContacts',
        },
        {
          title: '联系电话',
          dataIndex: 'contactsTel',
        },
        {
          title: '评价结果',
          dataIndex: 'assessResult',
        },
        {
          title: '评价结论',
          dataIndex: 'assessOpinion',
          width: '200px',
          elipsis: true,
        },
        {
          title: '评价人',
          dataIndex: 'assessUserName',
        },
        {
          title: '操作时间',
          dataIndex: 'assessTime',
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 160,
          scopedSlots: { customRender: 'operation' },
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
        queryCode: '',
      },
      queryCode: '',
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
    }
  },
  computed: {},
  async created() {
    await this.getSupplierTypeByDict()

    this.initFun()
  },
  methods: {
    onPrint(record) {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint([record.id], 'EquipmentSupplierAssess')
    },
    async onExport() {
      if (this.pagination.total == 0) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const a = document.createElement('a')
      const params = {
        ...this.queryForm,
      }
      let href = `/ilis2/rest/supplier/assess/export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(
          (key, index) =>
            (href += `${index === 0 ? '?' : '&'}${key}=${params[key]}`),
        )

      a.href = href
      a.click()
    },

    // 获取供应商类型字典
    async getSupplierTypeByDict() {
      await window.$oAjax
        .get(
          '/dictionaryController.do?getListByGroupId&dictGroupId=a85c02db699e11ee920650ebf6ecba75',
        )
        .then((res) => {
          if (res.success) {
            res.obj.forEach((it) => {
              this.dictionaryEnum[it.typecode] = it.typename
            })
          }
        })
    },

    getSubmit(data) {
      window.$oAjax({
        method: 'POST',
        url: 'rest/supplier/assess/submit/audit',
        data: qs.stringify(data),
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.$refs.SubmitPage.handleCancel()
          this.getData()
        }
        else {
          this.$refs.SubmitPage.spinning = false
          this.$refs.SubmitPage.confirmLoading = false
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    submitRow(e, record) {
      this.$refs.SubmitPage.showModal(record, '200')
    },
    setDataValue() {},
    customOk() {
      this.customVisible = false
    },
    initFun() {
      this.getData()
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

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
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
      this.queryForm.assessTimeStart = ''
      this.queryForm.assessTimeEnd = ''
      if (this?.queryDate?.length) {
        const s = this.queryDate[0]
        const e = this.queryDate[1]
        this.queryForm.assessTimeStart = s
        this.queryForm.assessTimeEnd = e
      }
      const { page, size } = this
      const params = {
        page,
        size,
        ...this.queryForm,
      }
      window.$oAjax
        .get(`/rest/supplier/assess/page`, {
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
            this.pagination.total = 0
            this.data = []
          }
          this.spinning = false
        })
    },
    addEditRow(e, id, isDetail) {
      this.$refs.AddEditRef.openModel(id, isDetail)
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
            .delete(`rest/supplier/assess/${record.id}`, {})
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
*{
  word-break: break-all;
}
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
.hitek-add-modal .ant-modal-body {
  max-height: 750px !important;
}
</style>
