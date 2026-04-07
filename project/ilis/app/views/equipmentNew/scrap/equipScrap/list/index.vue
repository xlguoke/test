<template>
  <div>
    <div>
      <a-form ref="formRef" style="width: 520px" :model="formState">
        <a-form-item
          label="查询内容"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="formState.quickQryParam"
            placeholder="请输入设备编号、设备名称、报废原因"
          />
        </a-form-item>
        <a-form-item
          label="报废时间"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-range-picker v-model:value="formState.commonDate" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
        <a-form-item
          label="经办部门"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-tree-select
            v-model:value="formState.departName"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
            placeholder="请选择经办部门"
            allow-clear
            :tree-data="departmentData"
            tree-default-expand-all
            show-search
          />
        </a-form-item>
        <a-form-item
          label="申请人"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input v-model:value="formState.userName" placeholder="请输入" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 5 }">
          <a-button @click="searchFun">
            查询
          </a-button>
          <a-button style="margin-left: 10px" @click="resetForm">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      <div style="padding: 10px 0">
        <a-button type="primary" @click="addEditRow">
          新增报废
        </a-button>
        <a-button @click="printFun">
          打印
        </a-button>
        <a-button @click="onExport">
          导出
        </a-button>
      </div>
      <!-- :rowSelection="rowSelection" -->
      <a-table
        id="tableBox"
        :columns="columns"
        :pagination="data.length > 0 ? pagination : false"
        :data-source="data"
        :loading="loading"
        bordered
        :custom-row="customRow"
        row-key="id"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'applyStatus'">
            <span>
              {{ applyStatusObj[record.applyStatus] }}
            </span>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="table-handle">
              <a
                v-if="record.applyStatus !== '20'"
                @click="(e) => deleteRow(e, record)"
              >删除</a>
              <template
                v-if="
                  record.applyStatus === '10'
                    || record.applyStatus === '30'
                    || record.applyStatus === '50'
                "
              >
                <a @click="(e) => addEditRow(e, record.id)">编辑</a>
                <a @click="(e) => submitRow(e, record)">提交</a>
              </template>
              <a @click="(e) => addEditRow(e, record.id, true)">详情</a>
              <a @click="(e) => viewLog(e, record)">日志</a>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="600px"
      @cancel="handleCancel"
    >
      <Add ref="Add" :callback="getData" :department-data="departmentData" />
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <SubmitPage ref="SubmitPage" :callback="getSubmit" />
    <Logs ref="Logs" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { checkProcessModel } from '~/providers/common/preSubmit.js'
import SubmitPage from '~/providers/components/equip/submitPage.vue'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import Add from './components/addEdit.vue'

const columns = [
  {
    title: '报废单号',
    dataIndex: 'scrapSn',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
  },
  {
    title: '设备类别',
    dataIndex: 'type',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '报废时间',
    dataIndex: 'scrapTime',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '经办部门',
    dataIndex: 'operationDepart',
  },
  {
    title: '报废原因',
    dataIndex: 'reason',
  },
  {
    title: '申请人',
    dataIndex: 'createName',
  },
  {
    title: '状态',
    dataIndex: 'applyStatus',
    scopedSlots: { customRender: 'applyStatus' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Add,
    SubmitPage,
    Logs,
  },
  data() {
    return {
      dayjs,
      visible: false,
      isDetail: false,
      data: [],
      departmentData: [],
      columns,
      loading: false,
      formState: {},
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      queryParam: null,
      page: 1,
      size: 10,
      addEditTitle: '新增报废',
      applyStatusObj: {
        10: '填写中',
        20: '审批中',
        30: '审批拒绝',
        40: '审批通过',
        50: '申请被驳回',
      },
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
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
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
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.getData()
    this.getLaboratoryData()
  },
  methods: {
    async onExport() {
      await this.getData(true)
      if (this.data.length < 1) {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
        return
      }
      const a = document.createElement('a')
      const params = {
        ...this.queryParam,
      }
      let href = `${rootUrl}/eqScrapController.do?export`

      Object.keys(params)
        .filter(key => !!params[key])
        .map(key => (href += `&${key}=${params[key]}`))

      a.href = href
      a.click()
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        if (res && res.length > 0) {
          res.shift()
          this.departmentData = this.formatDepartmentData(res)
        }
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.text,
          value: item.text,
          key: item.id,
          children,
        })
      })
      return arr
    },
    searchFun() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.formState }
        const commonDate = fieldsValue.commonDate
        if (commonDate && commonDate.length > 0) {
          fieldsValue.commonDateBegin = `${commonDate[0]} 00:00:00`
          fieldsValue.commonDateEnd = `${commonDate[1]} 23:59:59`
          delete fieldsValue.commonDate
        }
        this.queryParam = {
          ...fieldsValue,
        }
        this.getData(true)
      })
    },
    resetForm() {
      this.queryParam = null
      this.formState = {}
      this.getData(true)
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
    async getData(flag) {
      this.visible = false
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const { page, size } = this
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.loading = true
      await window.$oAjax({
        url: window.$oApi.equipScrap.list,
        method: 'POST',
        data: qs.stringify(params),
      }).then((res) => {
        if (res && res.total >= 0) {
          this.data = res.rows
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
        this.clearSelRowClass()
        this.loading = false
      })
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '21')
    },
    submitRow(e, record) {
      checkProcessModel(160, record.id, (res) => {
        if (res) {
          this.$refs.SubmitPage.showModal(record, '160')
        }
        else {
          this.searchFun()
        }
      })
    },
    getSubmit(data) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.equipScrap.submitUrl,
        data: qs.stringify(data),
      }).then((res) => {
        if (res.success) {
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
    deleteRow(e, record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'get',
            url: window.$oApi.equipScrap.delById,
            params: { id: record.id },
          }).then((res) => {
            if (res.success) {
              this.page = 1
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        },
      })
    },
    addEditRow(e, recordId, isDetail) {
      this.visible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      recordId = recordId || ''
      this.isDetail = !!isDetail
      if (recordId) {
        this.addEditTitle = '编辑报废'
      }
      else {
        this.addEditTitle = '新增报废'
      }
      if (this.isDetail) {
        this.addEditTitle = '查看报废'
      }

      if (this.$refs.Add) {
        this.$refs.Add.showModal(recordId, this.isDetail)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.Add) {
            clearInterval(timer)
            timer = null
            self.$refs.Add.showModal(recordId, self.isDetail)
          }
        }, 100)
      }
    },
    handleOk() {
      this.$refs.Add.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.Add.handleCancel()
    },
    // 打印
    printFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint(this.selectedRowKeys, 'EquipmentScrap', {
        jsonParam: '',
      })
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
@import './index.less';
</style>
